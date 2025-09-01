import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  try {
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

    const supabase = createRouteHandlerClient({ cookies })

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.payment_status === 'paid') {
          // Get line items to extract package information
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
          
          for (const item of lineItems.data) {
            // Extract package name from description or use a default
            const packageName = item.description || 'Unknown Package'
            
            // Insert purchase record into database
            const { error } = await supabase
              .from('purchases')
              .insert({
                user_email: session.customer_email || session.customer_details?.email || 'unknown',
                user_name: session.customer_details?.name || null,
                package_name: packageName,
                amount: item.amount_total || 0,
                currency: session.currency || 'gbp',
                status: 'completed',
                stripe_session_id: session.id,
                stripe_payment_intent_id: session.payment_intent as string
              })

            if (error) {
              console.error('stripe-webhook: Error inserting purchase record:', error)
            } else {
              console.log('stripe-webhook: Purchase record inserted successfully:', {
                session_id: session.id,
                package: packageName,
                amount: item.amount_total
              })
              
              // TODO: Send custom welcome email here if needed
              // You can add Resend integration here later
            }
          }
        }
        break

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

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('stripe-webhook: Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
