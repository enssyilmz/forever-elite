-- Fix purchases RLS to avoid referencing auth.users in SELECT policy
-- This uses email from JWT and an is_admin() helper for admin access

-- Helper function: checks if current user is admin by email
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT lower(current_setting('request.jwt.claims', true)::json->>'email') = lower('yozdzhansyonmez@gmail.com');
$$;

-- Ensure table exists and RLS is enabled
ALTER TABLE IF EXISTS public.purchases ENABLE ROW LEVEL SECURITY;

-- Drop old SELECT policies to replace them safely
DROP POLICY IF EXISTS "Admin can view all purchases" ON public.purchases;
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.purchases;

-- New SELECT policy: admin full access
CREATE POLICY "purchases_select_admin" ON public.purchases
  FOR SELECT
  USING (public.is_admin());

-- New SELECT policy: users can read rows where their email matches user_email
CREATE POLICY "purchases_select_own_email" ON public.purchases
  FOR SELECT
  USING (
    lower(user_email) = lower(current_setting('request.jwt.claims', true)::json->>'email')
  );


