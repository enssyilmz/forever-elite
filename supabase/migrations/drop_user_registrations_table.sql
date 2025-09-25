-- Drop user_registrations table and all its dependencies
-- This migration removes the user_registrations table and fixes dependent objects

-- First, drop any functions that depend on user_registrations
DROP FUNCTION IF EXISTS get_ticket_user_info(uuid);

-- Drop policies on purchases table that might reference user_registrations
DROP POLICY IF EXISTS "Admin can read all purchases" ON purchases;
DROP POLICY IF EXISTS "Users can read their own purchases" ON purchases;

-- Recreate purchases policies without user_registrations dependency
CREATE POLICY "Admin can read all purchases" ON purchases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'yozdzhansyonmez@gmail.com'
    )
  );

CREATE POLICY "Users can read their own purchases" ON purchases
  FOR SELECT USING (
    user_email = (
      SELECT email FROM auth.users WHERE auth.users.id = auth.uid()
    )
  );

-- Drop the triggers specific to user_registrations
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_registrations_updated_at ON public.user_registrations;

-- Drop the function that's specific to user_registrations only
-- Note: We keep update_updated_at_column() as it's used by other tables
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop all policies specific to user_registrations
DROP POLICY IF EXISTS "Users can view their own registration" ON public.user_registrations;
DROP POLICY IF EXISTS "Users can insert their own registration" ON public.user_registrations;
DROP POLICY IF EXISTS "Users can update their own registration" ON public.user_registrations;
DROP POLICY IF EXISTS "Admin can view all registrations" ON public.user_registrations;

-- Drop indexes specific to user_registrations
DROP INDEX IF EXISTS idx_user_registrations_email;
DROP INDEX IF EXISTS idx_user_registrations_created_at;

-- Finally, drop the table
DROP TABLE IF EXISTS public.user_registrations;

-- Create a simplified version of get_ticket_user_info without user_registrations dependency
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
        COALESCE(u.raw_user_meta_data->>'first_name', '')::text as first_name,
        COALESCE(u.raw_user_meta_data->>'last_name', '')::text as last_name,
        COALESCE(u.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(u.raw_user_meta_data->>'last_name', '') as display_name
    FROM auth.users u
    WHERE u.id = ticket_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
