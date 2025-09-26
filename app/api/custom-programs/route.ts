import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { createSupabaseAdminClient } from '@/lib/supabaseAdminServer'

// GET - List custom programs
export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')
  const scope = searchParams.get('scope') // 'admin' only when called explicitly from admin panel
    const isAdmin = user.email === 'yozdzhansyonmez@gmail.com'

    let programs
    let error

    if (isAdmin && scope === 'admin') {
      // Use service role client to bypass RLS deliberately (admin only)
      const adminClient = createSupabaseAdminClient()
      let adminQuery = adminClient
        .from('custom_programs')
        .select(`
          *,
          workouts:custom_program_workouts (
            *,
            exercises:custom_program_exercises (*)
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .order('day_number', { ascending: true, foreignTable: 'custom_program_workouts' })
        .order('order_index', { ascending: true, foreignTable: 'custom_program_workouts.custom_program_exercises' })

      if (userId) {
        adminQuery = adminQuery.eq('user_id', userId)
      }

      const adminResult = await adminQuery
      programs = adminResult.data
      error = adminResult.error
    } else {
      // Normal user path (RLS enforced)
      const userQuery = supabase
        .from('custom_programs')
        .select(`
          *,
          workouts:custom_program_workouts (
            *,
            exercises:custom_program_exercises (*)
          )
        `)
        .eq('is_active', true)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .order('day_number', { ascending: true, foreignTable: 'custom_program_workouts' })
        .order('order_index', { ascending: true, foreignTable: 'custom_program_workouts.custom_program_exercises' })

      const userResult = await userQuery
      programs = userResult.data
      error = userResult.error
    }

    if (error) {
      console.error('Error fetching custom programs:', error)
      return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 })
    }

    return NextResponse.json({ programs })
  } catch (error) {
    console.error('Error in GET /api/custom-programs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new custom program
export async function POST(request: Request) {
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

    const body = await request.json()
    const { 
      title, 
      description, 
      user_id, 
      program_type = 'custom',
      difficulty_level = 'beginner',
      duration_weeks = 4,
      notes,
      workouts = []
    } = body

    if (!title || !user_id) {
      return NextResponse.json({ error: 'Title and user_id are required' }, { status: 400 })
    }

    // Create the program
    const { data: program, error: programError } = await supabase
      .from('custom_programs')
      .insert({
        title,
        description,
        user_id,
        created_by: user.id,
        program_type,
        difficulty_level,
        duration_weeks: parseInt(duration_weeks),
        notes
      })
      .select()
      .single()

    if (programError) {
      console.error('Error creating program:', programError)
      return NextResponse.json({ error: 'Failed to create program' }, { status: 500 })
    }

        // Create workouts if provided
    if (workouts.length > 0) {
      const workoutPromises = workouts.map(async (workout: any) => {
        const { data: workoutData, error: workoutError } = await supabase
          .from('custom_program_workouts')
          .insert({
            program_id: program.id,
            day_number: parseInt(workout.day_number),
            week_number: parseInt(workout.week_number),
            workout_name: workout.workout_name,
            description: workout.description,
            rest_time_seconds: parseInt(workout.rest_time_seconds)
          })
          .select()
          .single()

        if (workoutError) {
          console.error('Error creating workout:', workoutError)
          return null
        }

        // Create exercises if provided
        if (workout.exercises && workout.exercises.length > 0) {
          const exercisePromises = workout.exercises.map(async (exercise: any, index: number) => {
            const { error: exError } = await supabase
              .from('custom_program_exercises')
              .insert({
                workout_id: workoutData.id,
                exercise_name: exercise.exercise_name,
                sets: parseInt(exercise.sets),
                reps: exercise.reps,
                weight: exercise.weight,
                rest_time_seconds: exercise.rest_time_seconds ? parseInt(exercise.rest_time_seconds) : 60,
                notes: exercise.notes,
                order_index: index
              })

            if (exError) {
              console.error('Error creating exercise:', exError)
            }
          })

          await Promise.all(exercisePromises)
        }

        return workoutData
      })

      await Promise.all(workoutPromises)
    }

    return NextResponse.json({ 
      success: true, 
      program,
      message: 'Program created successfully'
    })
  } catch (error) {
    console.error('Error in POST /api/custom-programs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 