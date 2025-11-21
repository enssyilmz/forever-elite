-- Add DELETE policy for support_tickets table
-- Users can delete their own tickets, admin can delete any ticket

DROP POLICY IF EXISTS "Enable delete for users and admin" ON public.support_tickets;

CREATE POLICY "Enable delete for users and admin" ON public.support_tickets
  FOR DELETE
  USING (public.is_admin() OR auth.uid() = user_id);
