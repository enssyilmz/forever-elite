-- Ensure FK from support_tickets.user_id to auth.users(id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'support_tickets_user_id_fkey'
      AND table_schema = 'public'
      AND table_name = 'support_tickets'
  ) THEN
    ALTER TABLE public.support_tickets
      ADD CONSTRAINT support_tickets_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Admin-only RPC to list tickets with user email via security definer join to auth.users
CREATE OR REPLACE FUNCTION public.admin_get_support_tickets()
RETURNS TABLE (
  id bigint,
  user_id uuid,
  email text,
  subject varchar,
  content text,
  status varchar,
  priority varchar,
  created_at timestamptz,
  updated_at timestamptz,
  admin_response text,
  admin_response_at timestamptz
) AS $$
  SELECT st.id,
         st.user_id,
         u.email,
         st.subject,
         st.content,
         st.status,
         st.priority,
         st.created_at,
         st.updated_at,
         st.admin_response,
         st.admin_response_at
  FROM public.support_tickets st
  LEFT JOIN auth.users u ON u.id = st.user_id
  WHERE EXISTS (
    SELECT 1
    FROM auth.users me
    WHERE me.id = auth.uid()
      AND lower(me.email) = lower('yozdzhansyonmez@gmail.com')
  )
  ORDER BY st.created_at DESC;
$$ LANGUAGE sql SECURITY DEFINER
SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION public.admin_get_support_tickets() TO authenticated;

