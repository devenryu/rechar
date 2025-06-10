import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      charts: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          chart_type: string
          chart_data: any
          config: any
          insights: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          chart_type: string
          chart_data: any
          config: any
          insights?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          chart_type?: string
          chart_data?: any
          config?: any
          insights?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
