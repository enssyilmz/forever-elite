import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { checkAdminAuth } from '@/lib/adminAuth'

export async function GET() {
  try {
    const authResult = await checkAdminAuth()
    if (authResult.error) return authResult.error
    
    const supabase = createRouteHandlerClient({ cookies })

    // Try with join first
    const { data: ticketsWithUser, error: joinError } = await supabase
      .from('support_tickets')
      .select(`
        *,
        user:user_id(
          id,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (!joinError) {
      return NextResponse.json({ tickets: ticketsWithUser || [] })
    }

    // Fallback without join to diagnose join-related RLS issues
    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tickets (no join):', error)
      return NextResponse.json({ 
        error: `Failed to fetch tickets: ${error.message || 'unknown error'}`,
        details: error
      }, { status: 500 })
    }

    console.error('Join failed, returning tickets without user join:', joinError)
    return NextResponse.json({ 
      tickets: tickets || [],
      warning: 'Join to auth.users failed due to RLS/permissions; returned without user field.',
      joinError
    })
  } catch (error: any) {
    console.error('Error in GET /api/admin/support-tickets:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const authResult = await checkAdminAuth()
    if (authResult.error) return authResult.error
    
    const supabase = createRouteHandlerClient({ cookies })

    const { ticketId, adminResponse, status } = await request.json()
    if (!ticketId || !adminResponse) {
      return NextResponse.json({ error: 'Ticket ID and admin response are required' }, { status: 400 })
    }

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .update({
        admin_response: adminResponse,
        admin_response_at: new Date().toISOString(),
        status: status || 'in_progress'
      })
      .eq('id', ticketId)
      .select()
      .single()

    if (error) {
      console.error('Error updating ticket:', error)
      return NextResponse.json({ error: `Failed to update ticket: ${error.message || 'unknown error'}`, details: error }, { status: 500 })
    }

    return NextResponse.json({ ticket })
  } catch (error: any) {
    console.error('Error in PUT /api/admin/support-tickets:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
