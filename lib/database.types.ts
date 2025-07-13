export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Custom programs table
      custom_programs: {
        Row: {
          id: number
          title: string
          description: string | null
          user_id: string
          created_by: string
          created_at: string
          updated_at: string
          is_active: boolean
          program_type: string
          difficulty_level: string
          duration_weeks: number
          notes: string | null
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          user_id: string
          created_by: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          program_type?: string
          difficulty_level?: string
          duration_weeks?: number
          notes?: string | null
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          user_id?: string
          created_by?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          program_type?: string
          difficulty_level?: string
          duration_weeks?: number
          notes?: string | null
        }
      }
      // Custom program workouts table
      custom_program_workouts: {
        Row: {
          id: number
          program_id: number
          day_number: number
          week_number: number
          workout_name: string
          description: string | null
          rest_time_seconds: number
          created_at: string
        }
        Insert: {
          id?: number
          program_id: number
          day_number: number
          week_number?: number
          workout_name: string
          description?: string | null
          rest_time_seconds?: number
          created_at?: string
        }
        Update: {
          id?: number
          program_id?: number
          day_number?: number
          week_number?: number
          workout_name?: string
          description?: string | null
          rest_time_seconds?: number
          created_at?: string
        }
      }
      // Custom program exercises table
      custom_program_exercises: {
        Row: {
          id: number
          workout_id: number
          exercise_name: string
          sets: number
          reps: string | null
          weight: string | null
          rest_time_seconds: number
          notes: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: number
          workout_id: number
          exercise_name: string
          sets: number
          reps?: string | null
          weight?: string | null
          rest_time_seconds?: number
          notes?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: number
          workout_id?: number
          exercise_name?: string
          sets?: number
          reps?: string | null
          weight?: string | null
          rest_time_seconds?: number
          notes?: string | null
          order_index?: number
          created_at?: string
        }
      }
      // ... existing tables ...
      reviews: {
        Row: {
          id: number
          user_id: string
          program_id: number
          rating: number
          comment: string
          created_at: string
          user_name: string
        }
        Insert: {
          id?: number
          user_id: string
          program_id: number
          rating: number
          comment: string
          created_at?: string
          user_name: string
        }
        Update: {
          id?: number
          user_id?: string
          program_id?: number
          rating?: number
          comment?: string
          created_at?: string
          user_name?: string
        }
      }
    }
  }
} 

// Custom types for frontend usage
export interface CustomProgram {
  id: number
  title: string
  description: string | null
  user_id: string
  created_by: string
  created_at: string
  updated_at: string
  is_active: boolean
  program_type: string
  difficulty_level: string
  duration_weeks: number
  notes: string | null
  workouts?: CustomWorkout[]
}

export interface CustomWorkout {
  id: number
  program_id: number
  day_number: number
  week_number: number
  workout_name: string
  description: string | null
  rest_time_seconds: number
  created_at: string
  exercises?: CustomExercise[]
}

export interface CustomExercise {
  id: number
  workout_id: number
  exercise_name: string
  sets: number
  reps: string | null
  weight: string | null
  rest_time_seconds: number
  notes: string | null
  order_index: number
  created_at: string
} 