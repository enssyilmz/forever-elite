-- Create custom programs table for personalized workout programs
CREATE TABLE custom_programs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_by UUID NOT NULL REFERENCES auth.users(id), -- admin who created the program
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    program_type VARCHAR(50) DEFAULT 'custom', -- 'custom', 'template', etc.
    difficulty_level VARCHAR(20) DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
    duration_weeks INTEGER DEFAULT 4,
    notes TEXT
);

-- Create custom program workouts table
CREATE TABLE custom_program_workouts (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL REFERENCES custom_programs(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL, -- 1-7 for days of the week
    week_number INTEGER NOT NULL DEFAULT 1,
    workout_name VARCHAR(255) NOT NULL,
    description TEXT,
    rest_time_seconds INTEGER DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create custom program exercises table
CREATE TABLE custom_program_exercises (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER NOT NULL REFERENCES custom_program_workouts(id) ON DELETE CASCADE,
    exercise_name VARCHAR(255) NOT NULL,
    sets INTEGER NOT NULL,
    reps VARCHAR(50), -- can be "8-12", "10", "failure", etc.
    weight VARCHAR(50), -- can be "body weight", "12kg", "progressive", etc.
    rest_time_seconds INTEGER DEFAULT 60,
    notes TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_custom_programs_user_id ON custom_programs(user_id);
CREATE INDEX idx_custom_programs_created_by ON custom_programs(created_by);
CREATE INDEX idx_custom_program_workouts_program_id ON custom_program_workouts(program_id);
CREATE INDEX idx_custom_program_exercises_workout_id ON custom_program_exercises(workout_id);

-- Create RLS policies
ALTER TABLE custom_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_program_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_program_exercises ENABLE ROW LEVEL SECURITY;

-- Users can only see their own programs
CREATE POLICY "Users can view their own programs" ON custom_programs
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can create programs for users
CREATE POLICY "Admins can create programs" ON custom_programs
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Admins can update programs they created
CREATE POLICY "Admins can update their created programs" ON custom_programs
    FOR UPDATE USING (auth.uid() = created_by);

-- Admins can delete programs they created
CREATE POLICY "Admins can delete their created programs" ON custom_programs
    FOR DELETE USING (auth.uid() = created_by);

-- Workout policies
CREATE POLICY "Users can view workouts of their programs" ON custom_program_workouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM custom_programs cp 
            WHERE cp.id = program_id AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage workouts" ON custom_program_workouts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM custom_programs cp 
            WHERE cp.id = program_id AND cp.created_by = auth.uid()
        )
    );

-- Exercise policies
CREATE POLICY "Users can view exercises of their programs" ON custom_program_exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM custom_program_workouts cpw
            JOIN custom_programs cp ON cp.id = cpw.program_id
            WHERE cpw.id = workout_id AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage exercises" ON custom_program_exercises
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM custom_program_workouts cpw
            JOIN custom_programs cp ON cp.id = cpw.program_id
            WHERE cpw.id = workout_id AND cp.created_by = auth.uid()
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_custom_programs_updated_at 
    BEFORE UPDATE ON custom_programs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 