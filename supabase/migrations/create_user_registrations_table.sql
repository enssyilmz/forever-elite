-- Create user_registrations table and fix RLS policies
-- This table stores additional user information beyond auth.users

-- Create the user_registrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_registrations (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    birthdate DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'none')),
    height DECIMAL(5,2), -- Height in cm (e.g., 175.50)
    weight DECIMAL(5,2), -- Weight in kg (e.g., 70.25)  
    body_fat DECIMAL(4,2), -- Body fat percentage (e.g., 15.50)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add comments for clarity
COMMENT ON TABLE public.user_registrations IS 'Stores additional user registration information.';
COMMENT ON COLUMN public.user_registrations.height IS 'User height in cm';
COMMENT ON COLUMN public.user_registrations.weight IS 'User weight in kg';
COMMENT ON COLUMN public.user_registrations.body_fat IS 'User body fat percentage';

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own registration" ON public.user_registrations;
DROP POLICY IF EXISTS "Users can insert their own registration" ON public.user_registrations;
DROP POLICY IF EXISTS "Users can update their own registration" ON public.user_registrations;
DROP POLICY IF EXISTS "Admin can view all registrations" ON public.user_registrations;

-- Policy: Allow users to view their own registration data
CREATE POLICY "Users can view their own registration" ON public.user_registrations
    FOR SELECT USING (auth.uid() = id);

-- Policy: Allow users to insert their own registration data
CREATE POLICY "Users can insert their own registration" ON public.user_registrations
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Allow users to update their own registration data
CREATE POLICY "Users can update their own registration" ON public.user_registrations
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Allow admin to view all registrations
CREATE POLICY "Admin can view all registrations" ON public.user_registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND lower(auth.users.email) = lower('yozdzhansyonmez@gmail.com')
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_registrations_email ON public.user_registrations(email);
CREATE INDEX IF NOT EXISTS idx_user_registrations_created_at ON public.user_registrations(created_at);

-- Create function to update updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_registrations_updated_at ON public.user_registrations;
CREATE TRIGGER update_user_registrations_updated_at 
    BEFORE UPDATE ON public.user_registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle user registration on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_registrations (
        id,
        email,
        first_name,
        last_name,
        phone,
        birthdate,
        gender,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        CASE 
            WHEN NEW.raw_user_meta_data->>'birthdate' IS NOT NULL AND NEW.raw_user_meta_data->>'birthdate' != ''
            THEN (NEW.raw_user_meta_data->>'birthdate')::DATE
            ELSE NULL
        END,
        COALESCE(NEW.raw_user_meta_data->>'gender', ''),
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user_registrations entry on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
