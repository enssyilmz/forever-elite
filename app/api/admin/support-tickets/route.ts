import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { checkAdminAuth } from '@/lib/adminAuth'

export async function GET() {
  try {
    const authResult = await checkAdminAuth()
    if (authResult.error) return authResult.error
    
    const supabase = await createSupabaseServerClient()


    // Use admin RPC to include user emails safely
    const { data: tickets, error } = await supabase
      .rpc('admin_get_support_tickets')

    if (error) {
      console.error('Error fetching tickets via RPC:', error)
      return NextResponse.json({ error: 'Failed to fetch tickets', details: error }, { status: 500 })
    }

    return NextResponse.json({ tickets: tickets || [] })
  } catch (error: any) {
    console.error('Error in GET /api/admin/support-tickets:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const authResult = await checkAdminAuth()
    if (authResult.error) return authResult.error
    
    const supabase = await createSupabaseServerClient()

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
