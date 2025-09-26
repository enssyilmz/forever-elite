import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Bu endpoint sadece geliştirme / kurtarma amaçlı.
// Webhook çalışmazsa (örn. localhost Stripe CLI dinlemesi yoksa) confirmation sayfası burayı çağırıp satın alımı DB'ye işler.

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    // Production'da bu endpoint'i kapat (güvenlik ve veri bütünlüğü için)
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
    }

    const { session_id } = await req.json()
    if (!session_id) {
      return NextResponse.json({ error: 'session_id gerekli' }, { status: 400 })
    }

    // Supabase service role client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Zaten var mı?
    const { data: existing, error: existingErr } = await supabase
      .from('purchases')
      .select('id')
      .eq('stripe_session_id', session_id)
      .maybeSingle()

    if (existingErr) {
      console.error('reconcile-purchase: existing check error', existingErr)
    }
    if (existing) {
      return NextResponse.json({ status: 'already_exists', purchase_id: existing.id })
    }

    // Stripe oturumunu al
    const session = await stripe.checkout.sessions.retrieve(session_id)
    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Session bulunamadı veya ödenmemiş', payment_status: session?.payment_status }, { status: 400 })
    }

    // Line items
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

    const rawEmail = (session as any).customer_email || session.customer_details?.email || null
    const normalizedEmail = rawEmail ? rawEmail.toLowerCase().trim() : 'unknown'

    let insertedIds: string[] = []
    for (const item of lineItems.data) {
      const packageName = item.description || 'Unknown Package'
      const amountValue = (item as any).amount_total ?? (item as any).amount_subtotal ?? 0

      const { data: inserted, error: insertError } = await supabase
        .from('purchases')
        .insert({
          user_email: normalizedEmail,
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
        console.error('reconcile-purchase: insert error', insertError)
        return NextResponse.json({ error: 'Insert failed', details: insertError.message }, { status: 500 })
      }
      if (inserted?.id) insertedIds.push(inserted.id)
    }

    return NextResponse.json({ status: 'reconciled', inserted: insertedIds })
  } catch (e: any) {
    console.error('reconcile-purchase: fatal error', e)
    return NextResponse.json({ error: 'Unexpected error', details: e.message }, { status: 500 })
  }
}
