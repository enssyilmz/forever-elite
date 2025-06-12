-- Create a secure function to get user's last sign in time
create or replace function public.get_user_last_sign_in(user_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  return (
    select json_build_object(
      'last_sign_in_at', au.last_sign_in_at
    )
    from auth.users au
    where au.id = user_id
    and (
      -- Only allow users to see their own last sign in time
      auth.uid() = user_id
      -- Or allow service role to access
      or auth.role() = 'service_role'
    )
  );
end;
$$; 