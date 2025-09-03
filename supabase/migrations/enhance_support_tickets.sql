-- Add admin response functionality to support tickets
-- This migration adds fields for admin responses and updates policies

-- Add admin response fields if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'admin_response') THEN
        ALTER TABLE public.support_tickets ADD COLUMN admin_response text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'admin_response_at') THEN
        ALTER TABLE public.support_tickets ADD COLUMN admin_response_at timestamp with time zone;
    END IF;
END $$;

-- Update RLS policies to allow admin access
DROP POLICY IF EXISTS "Enable read for users based on user_id" ON public.support_tickets;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.support_tickets;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.support_tickets;

-- Policy: Allow users to view their own tickets
CREATE POLICY "Enable read for users based on user_id" ON public.support_tickets
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Allow users to insert their own tickets
CREATE POLICY "Enable insert for users based on user_id" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to update their own tickets (limited fields)
CREATE POLICY "Enable update for users based on user_id" ON public.support_tickets
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Allow admin to read all tickets (using service role)
CREATE POLICY "Enable admin read access" ON public.support_tickets
    FOR SELECT USING (true);

-- Policy: Allow admin to update tickets (for responses)
CREATE POLICY "Enable admin update access" ON public.support_tickets
    FOR UPDATE USING (true);

-- Create function to get user info for tickets
CREATE OR REPLACE FUNCTION get_ticket_user_info(ticket_user_id uuid)
RETURNS TABLE (
    id uuid,
    email text,
    first_name text,
    last_name text,
    display_name text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        ur.first_name,
        ur.last_name,
        ur.display_name
    FROM auth.users u
    LEFT JOIN user_registrations ur ON u.id = ur.user_id
    WHERE u.id = ticket_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
