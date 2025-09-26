-- Create suggestions table for user feedback
CREATE TABLE IF NOT EXISTS suggestions (
    id SERIAL PRIMARY KEY,
    package_id INTEGER NOT NULL,
    package_title VARCHAR(255) NOT NULL,
    suggestions TEXT[] NOT NULL,
    user_id UUID,
    user_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_suggestions_package_id ON suggestions(package_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_user_id ON suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_created_at ON suggestions(created_at);

-- Enable RLS
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Anyone can insert suggestions
CREATE POLICY "Anyone can submit suggestions" ON suggestions
    FOR INSERT WITH CHECK (true);

-- Only admins can view suggestions
CREATE POLICY "Admins can view all suggestions" ON suggestions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'yozdzhansyonmez@gmail.com'
        )
    );
