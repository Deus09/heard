import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Profile {
  id: string
  username: string
  created_at: string
}

export interface Comment {
  id: string
  user_id: string | null  // Anonim kullanıcılar için null olabilir
  username: string
  business_name: string
  city: string
  district: string
  experience: string
  rating: number
  anonymous: boolean
  created_at: string
}
