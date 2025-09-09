import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

// GET - Get specific program
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const programId = parseInt(id)
    
    const { data: program, error } = await supabase
      .from('custom_programs')
      .select(`
        *,
        custom_program_workouts (
          *,
          custom_program_exercises (*)
        )
      `)
      .eq('id', programId)
      .single()

    if (error) {
      console.error('Error fetching program:', error)
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    return NextResponse.json({ program })
  } catch (error) {
    console.error('Error in GET /api/custom-programs/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update program
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const isAdmin = user.email === 'yozdzhansyonmez@gmail.com'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const programId = parseInt(id)
    const body = await request.json()
    
    const {
      title,
      description,
      program_type,
      difficulty_level,
      duration_weeks,
      notes,
      workouts
    } = body

    // Update the program
    const { data: program, error: programError } = await supabase
      .from('custom_programs')
      .update({
        title,
        description,
        program_type,
        difficulty_level,
        duration_weeks: parseInt(duration_weeks),
        notes
      })
      .eq('id', programId)
      .eq('created_by', user.id)
      .select()
      .single()

    if (programError) {
      console.error('Error updating program:', programError)
      return NextResponse.json({ error: 'Failed to update program' }, { status: 500 })
    }

    // If workouts are provided, update them
    if (workouts) {
      // Delete existing workouts and exercises
      await supabase
        .from('custom_program_workouts')
        .delete()
        .eq('program_id', programId)

      // Create new workouts
      if (workouts.length > 0) {
        const workoutPromises = workouts.map(async (workout: any) => {
          const { data: workoutData, error: workoutError } = await supabase
            .from('custom_program_workouts')
            .insert({
              program_id: programId,
              day_number: parseInt(workout.day_number),
              week_number: parseInt(workout.week_number) || 1,
              workout_name: workout.workout_name,
              description: workout.description,
              rest_time_seconds: parseInt(workout.rest_time_seconds) || 60
            })
            .select()
            .single()

          if (workoutError) {
            console.error('Error creating workout:', workoutError)
            return null
          }

          // Create exercises for this workout
          if (workout.exercises && workout.exercises.length > 0) {
            const exercisePromises = workout.exercises.map((exercise: any, index: number) => {
              return supabase
                .from('custom_program_exercises')
                .insert({
                  workout_id: workoutData.id,
                  exercise_name: exercise.exercise_name,
                  sets: parseInt(exercise.sets),
                  reps: exercise.reps,
                  weight: exercise.weight,
                  rest_time_seconds: parseInt(exercise.rest_time_seconds) || 60,
                  notes: exercise.notes,
                  order_index: index
                })
            })

            await Promise.all(exercisePromises)
          }

          return workoutData
        })

        await Promise.all(workoutPromises)
      }
    }

    return NextResponse.json({ 
      success: true, 
      program,
      message: 'Program updated successfully'
    })
  } catch (error) {
    console.error('Error in PUT /api/custom-programs/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete program
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const isAdmin = user.email === 'yozdzhansyonmez@gmail.com'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const programId = parseInt(id)
    
    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('custom_programs')
      .update({ is_active: false })
      .eq('id', programId)
      .eq('created_by', user.id)

    if (error) {
      console.error('Error deleting program:', error)
      return NextResponse.json({ error: 'Failed to delete program' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Program deleted successfully'
    })
  } catch (error) {
    console.error('Error in DELETE /api/custom-programs/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}