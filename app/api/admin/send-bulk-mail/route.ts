import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: Request) {
  try {
    const { subject, html, recipients } = await request.json()

    // If recipients passed from client, use them directly.
    // Only require Supabase service role when we need to fetch all users.
    let emails: string[] = Array.isArray(recipients) ? recipients : []
    if (emails.length === 0) {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ ok: false, error: 'Supabase env missing' }, { status: 500 })
      }
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
      const { data, error } = await supabase.rpc('get_all_users')
      if (error) throw error
      emails = (data || []).map((u: any) => u.email).filter(Boolean)
    }

    if (!emails.length) {
      return NextResponse.json({ ok: true, sent: 0 })
    }

    const fromAddress = process.env.RESEND_FROM
    if (!fromAddress) {
      return NextResponse.json({ ok: false, error: 'RESEND_FROM not set' }, { status: 500 })
    }

    const chunk = <T,>(arr: T[], size = 50) =>
      Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size))

    let totalSent = 0
    for (const batch of chunk(emails, 50)) {
      const res = await resend.emails.send({
        from: fromAddress,
        to: batch.map((e) => String(e).trim()).filter(Boolean),
        subject,
        html
      })
      if ((res as any)?.error) {
        return NextResponse.json({ ok: false, error: (res as any).error?.message || 'Resend send error' }, { status: 500 })
      }
      totalSent += batch.length
    }

    return NextResponse.json({ ok: true, sent: totalSent })
  } catch (e: any) {
    console.error('send-bulk-mail error:', e)
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}


