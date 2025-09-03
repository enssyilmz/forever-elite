-- Limit regular users to own rows; allow admin (by email) full access

-- Create helper function to check admin by email
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = auth.uid()
      AND lower(u.email) = lower('yozdzhansyonmez@gmail.com')
  );
$$;

-- Recreate policies safely
DROP POLICY IF EXISTS "Enable admin read access" ON public.support_tickets;
DROP POLICY IF EXISTS "Enable admin update access" ON public.support_tickets;

-- Admin can read all rows
CREATE POLICY "Enable admin read access" ON public.support_tickets
  FOR SELECT
  USING (public.is_admin() OR auth.uid() = user_id);

-- Admin can update all rows
CREATE POLICY "Enable admin update access" ON public.support_tickets
  FOR UPDATE
  USING (public.is_admin() OR auth.uid() = user_id)
  WITH CHECK (public.is_admin() OR auth.uid() = user_id);
