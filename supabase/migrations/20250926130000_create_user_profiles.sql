-- Create user_profiles table to replace removed user_registrations
-- Stores basic body metrics and latest body fat percentage

CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  height numeric(5,2), -- cm
  weight numeric(5,2), -- kg
  body_fat numeric(5,2), -- percentage
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.user_profiles IS 'User profile & latest body metrics (replaces user_registrations)';
COMMENT ON COLUMN public.user_profiles.body_fat IS 'Latest body fat percentage';

-- Helpful index for lookups by email (optional if unique constraint already creates it)
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies: each user can manage only their own row
CREATE POLICY "Users can select own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Maintain updated_at automatically
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
