-- Allow admins (creators) to view programs, workouts and exercises they created
-- This complements existing user-specific SELECT RLS policies.

-- custom_programs: add SELECT policy for creator (admin)
CREATE POLICY "Admins can view programs they created" ON custom_programs
  FOR SELECT USING (auth.uid() = created_by);

-- custom_program_workouts: add SELECT policy for creator (admin)
CREATE POLICY "Admins can view workouts they created" ON custom_program_workouts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM custom_programs cp
      WHERE cp.id = program_id AND cp.created_by = auth.uid()
    )
  );

-- custom_program_exercises: add SELECT policy for creator (admin)
CREATE POLICY "Admins can view exercises they created" ON custom_program_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM custom_program_workouts cpw
      JOIN custom_programs cp ON cp.id = cpw.program_id
      WHERE cpw.id = workout_id AND cp.created_by = auth.uid()
    )
  );
