import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
    hasStripeWebhook: !!process.env.STRIPE_WEBHOOK_SECRET,
    hasResendApiKey: !!process.env.RESEND_API_KEY,
    hasResendFrom: !!process.env.RESEND_FROM,
    nodeEnv: process.env.NODE_ENV
  }

  return NextResponse.json({
    message: 'Environment variables check',
    envVars,
    timestamp: new Date().toISOString()
  })
}
