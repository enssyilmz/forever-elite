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