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
      // Packages table
      packages: {
        Row: {
          id: number
          title: string
          body_fat_range: string
          description: string
          long_description: string | null
          features: string[]
          image_url: string | null
          price_usd: number
          price_gbp: number
          discounted_price_gbp: number | null
          discount_percentage: number
          emoji: string
          specifications: string[]
          recommendations: string[]
          duration_weeks: number | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          body_fat_range: string
          description: string
          long_description?: string | null
          features?: string[]
          image_url?: string | null
          price_usd: number
          price_gbp: number
          discounted_price_gbp?: number | null
          discount_percentage?: number
          emoji: string
          specifications?: string[]
          recommendations?: string[]
          duration_weeks?: number | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          body_fat_range?: string
          description?: string
          long_description?: string | null
          features?: string[]
          image_url?: string | null
          price_usd?: number
          price_gbp?: number
          discounted_price_gbp?: number | null
          discount_percentage?: number
          emoji?: string
          specifications?: string[]
          recommendations?: string[]
          duration_weeks?: number | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      // Purchases table
      purchases: {
        Row: {
          id: string
          user_email: string
          user_name: string | null
          package_name: string
          amount: number
          currency: string
          status: string
          stripe_session_id: string
          stripe_payment_intent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_email: string
          user_name?: string | null
          package_name: string
          amount: number
          currency?: string
          status?: string
          stripe_session_id: string
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_email?: string
          user_name?: string | null
          package_name?: string
          amount?: number
          currency?: string
          status?: string
          stripe_session_id?: string
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
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

export interface Package {
  id: number
  title: string
  body_fat_range: string
  description: string
  long_description: string | null
  features: string[]
  image_url: string | null
  price_usd: number
  price_gbp: number
  discounted_price_gbp: number | null
  discount_percentage: number
  emoji: string
  specifications: string[]
  recommendations: string[]
  duration_weeks: number | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Purchase {
  id: string
  user_email: string
  user_name: string | null
  package_name: string
  amount: number
  currency: string
  status: string
  stripe_session_id: string
  stripe_payment_intent_id: string | null
  created_at: string
  updated_at: string
}