-- Fix RLS policies for admin user
-- Admin UID: 18591c1e-6372-4e41-9944-61a61727d9c2

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can create programs" ON custom_programs;
DROP POLICY IF EXISTS "Admins can update their created programs" ON custom_programs;
DROP POLICY IF EXISTS "Admins can delete their created programs" ON custom_programs;
DROP POLICY IF EXISTS "Admins can manage workouts" ON custom_program_workouts;
DROP POLICY IF EXISTS "Admins can manage exercises" ON custom_program_exercises;

-- Create new policies with specific admin UID
CREATE POLICY "Admins can create programs" ON custom_programs
    FOR INSERT WITH CHECK (
        auth.uid() = '18591c1e-6372-4e41-9944-61a61727d9c2'::uuid
    );

CREATE POLICY "Admins can update their created programs" ON custom_programs
    FOR UPDATE USING (
        auth.uid() = '18591c1e-6372-4e41-9944-61a61727d9c2'::uuid AND
        auth.uid() = created_by
    );

CREATE POLICY "Admins can delete their created programs" ON custom_programs
    FOR DELETE USING (
        auth.uid() = '18591c1e-6372-4e41-9944-61a61727d9c2'::uuid AND
        auth.uid() = created_by
    );

CREATE POLICY "Admins can view all programs" ON custom_programs
    FOR SELECT USING (
        auth.uid() = '18591c1e-6372-4e41-9944-61a61727d9c2'::uuid OR
        auth.uid() = user_id
    );

-- Workout policies
CREATE POLICY "Admins can manage workouts" ON custom_program_workouts
    FOR ALL USING (
        auth.uid() = '18591c1e-6372-4e41-9944-61a61727d9c2'::uuid OR
        EXISTS (
            SELECT 1 FROM custom_programs cp 
            WHERE cp.id = program_id AND cp.created_by = auth.uid()
        )
    );

-- Exercise policies
CREATE POLICY "Admins can manage exercises" ON custom_program_exercises
    FOR ALL USING (
        auth.uid() = '18591c1e-6372-4e41-9944-61a61727d9c2'::uuid OR
        EXISTS (
            SELECT 1 FROM custom_program_workouts cpw
            JOIN custom_programs cp ON cp.id = cpw.program_id
            WHERE cpw.id = workout_id AND cp.created_by = auth.uid()
        )
    ); 