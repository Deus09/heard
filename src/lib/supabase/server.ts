import { createClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client
 * Server Component'ler için kullanılır
 */
export async function createServerSupabaseClient() {
  // Server-side'da service role key kullanmıyoruz, anon key yeterli
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false, // Server-side'da session persist etmiyoruz
        autoRefreshToken: false,
      },
    }
  )
}
