import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const ADMIN_EMAIL = 'yozdzhansyonmez@gmail.com'

// Service role key gerekebilir - environment variable olarak eklenecek
const supabaseUrl = 'https://blzvfjwymkobljnxudei.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: Request) {
  try {
    // Request body'den subject ve body al
    const { subject, body } = await request.json()

    if (!subject || !body) {
      return NextResponse.json(
        { error: 'Subject and body are required' },
        { status: 400 }
      )
    }

    // Auth kontrolü
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Admin yetkisi kontrolü
    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    // Tüm kullanıcıları çek
    const { data: users, error: usersError } = await supabase.rpc('get_all_users')
    
    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`)
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        { message: 'No users found to send email to' },
        { status: 200 }
      )
    }

    // Email listesini hazırla
    const emailList = users
      .filter((user: { email?: string }) => user.email && user.email.includes('@'))
      .map((user: { 
        email: string; 
        display_name?: string; 
        first_name?: string; 
        last_name?: string 
      }) => ({
        email: user.email,
        name: user.display_name || 
               (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}`.trim() : '') ||
               user.first_name || 
               user.last_name || 
               'User'
      }))

    // Supabase Edge Function çağrısı
    if (supabaseServiceKey) {
      const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey)
      
      const { data: functionResponse, error: functionError } = await serviceSupabase.functions.invoke('send-bulk-email', {
        body: {
          subject,
          body,
          recipients: emailList
        }
      })

      if (functionError) {
        console.error('Supabase function error:', functionError)
        // Fallback: Log the email details for manual processing
        console.log('Email would be sent to:', emailList.length, 'recipients')
        console.log('Subject:', subject)
        console.log('Body:', body)
        
        return NextResponse.json({
          message: `Email sending initiated for ${emailList.length} recipients. Function error occurred, check logs.`,
          recipientCount: emailList.length,
          success: false,
          error: functionError.message
        })
      }

      return NextResponse.json({
        message: `Bulk email sent successfully to ${emailList.length} recipients`,
        recipientCount: emailList.length,
        success: true,
        functionResponse
      })
    } else {
      // Service key yoksa, email detaylarını logla (geliştirme amaçlı)
      console.log('=== BULK EMAIL SIMULATION ===')
      console.log('Subject:', subject)
      console.log('Body:', body)
      console.log('Recipients:', emailList.length)
             console.log('Email list:', emailList.map((u: { email: string }) => u.email).join(', '))
      console.log('==============================')

      return NextResponse.json({
        message: `Email simulation completed for ${emailList.length} recipients. Check server logs for details.`,
        recipientCount: emailList.length,
        success: true,
        simulation: true
      })
    }

  } catch (error) {
    console.error('Error in send-bulk-mail API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 