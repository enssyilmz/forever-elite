import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  try {
    const startTs = Date.now()
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      )
    }

  let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('stripe-webhook: Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Use service-role client to bypass RLS for server-side webhook inserts
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('stripe-webhook: received event', {
      id: event.id,
      type: event.type,
      created: event.created,
      bodyLength: body.length
    })

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('stripe-webhook: MISSING SUPABASE_SERVICE_ROLE_KEY environment variable')
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('stripe-webhook: MISSING NEXT_PUBLIC_SUPABASE_URL environment variable')
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('stripe-webhook: session.completed payload snapshot', {
          session_id: session.id,
          payment_status: session.payment_status,
          currency: session.currency,
          email_primary: session.customer_email,
          email_details: session.customer_details?.email,
          amount_total: (session as any).amount_total,
          mode: session.mode,
          customer: session.customer
        })

        if (session.payment_status !== 'paid') {
          console.log('stripe-webhook: session not paid yet, skipping insert', session.id)
          break
        }

        let lineItems: Stripe.ApiList<Stripe.LineItem>
        try {
          lineItems = await stripe.checkout.sessions.listLineItems(session.id)
        } catch (e) {
          console.error('stripe-webhook: failed to list line items for session', session.id, e)
          break
        }
        console.log('stripe-webhook: line items fetched', { count: lineItems.data.length, session: session.id })

        const rawEmail = session.customer_email || session.customer_details?.email || null
        const derivedEmail = rawEmail ? rawEmail.trim() : null
        const normalizedEmail = derivedEmail ? derivedEmail.toLowerCase() : null
        if (!normalizedEmail) {
          console.warn('stripe-webhook: NO EMAIL FOUND - inserting with unknown placeholder', session.id)
        }

        for (const item of lineItems.data) {
          const packageName = item.description || 'Unknown Package'
          const amountValue = (item as any).amount_total ?? (item as any).amount_subtotal ?? 0

          console.log('stripe-webhook: processing item', {
            session: session.id,
            packageName,
            amountValue,
            lineItemId: item.id,
            currency: session.currency,
            email_final: normalizedEmail
          })

          const { data: existingPurchase, error: existingCheckError } = await supabase
            .from('purchases')
            .select('id')
            .eq('stripe_session_id', session.id)
            .maybeSingle()

          if (existingCheckError) {
            console.error('stripe-webhook: existing purchase check error', existingCheckError)
          }
          if (existingPurchase) {
            console.log('stripe-webhook: purchase already exists for session (idempotent skip)', session.id)
            continue
          }

            // Insert (returning id for log)
          const { data: inserted, error: insertError } = await supabase
            .from('purchases')
            .insert({
              user_email: normalizedEmail || 'unknown',
              user_name: session.customer_details?.name || null,
              package_name: packageName,
              amount: amountValue,
              currency: session.currency || 'gbp',
              status: 'completed',
              stripe_session_id: session.id,
              stripe_payment_intent_id: session.payment_intent as string
            })
            .select('id')
            .maybeSingle()

          if (insertError) {
            console.error('stripe-webhook: INSERT FAILED', {
              session: session.id,
              error: insertError,
              packageName,
              amountValue
            })
          } else {
            console.log('stripe-webhook: INSERT OK', {
              session: session.id,
              purchase_id: inserted?.id,
              packageName,
              amountValue
            })
          }
        }
        break
      }

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('stripe-webhook: Payment succeeded:', paymentIntent.id)
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        console.log('stripe-webhook: Payment failed:', failedPayment.id)
        break

      default:
        console.log(`stripe-webhook: Unhandled event type: ${event.type}`)
    }
    const ms = Date.now() - startTs
    console.log('stripe-webhook: completed processing', { event: event.type, duration_ms: ms })
    return NextResponse.json({ received: true, duration_ms: ms })
  } catch (error) {
    console.error('stripe-webhook: Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
