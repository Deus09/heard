import { supabase } from '@/lib/supabaseClient'
import { validateUsername } from '@/lib/utils'

export const authService = {
  // Kullanıcı adının müsait olup olmadığını kontrol et
  async checkUsernameAvailability(username: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle()
    
    if (error) {
      console.error('Username check error:', error)
      return false
    }
    
    // Eğer data null ise, username müsait demektir
    return data === null
  },

  // Kayıt ol
  async signUp(email: string, password: string, username: string) {
    // Kullanıcı adı formatını kontrol et
    const validation = validateUsername(username);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Geçersiz kullanıcı adı');
    }

    // Önce username'in kullanılıp kullanılmadığını kontrol et
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()

    if (existingProfile) {
      throw new Error('Bu kullanıcı adı zaten kullanılıyor')
    }

    // Kullanıcıyı kaydet (e-posta doğrulaması olmadan otomatik giriş yap)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
        emailRedirectTo: undefined // E-posta doğrulaması yok
      }
    })
    
    if (error) {
      // E-posta zaten kayıtlı hatası için Türkçe mesaj
      if (error.message.includes('User already registered')) {
        throw new Error('Bu e-posta adresi daha önce alınmış')
      }
      throw error
    }
    return data
  },

  // Giriş yap
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      // Yanlış e-posta veya şifre hatası için Türkçe mesaj
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('E-posta adresi veya şifre hatalı')
      }
      throw error
    }
    return data
  },

  // Çıkış yap
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Mevcut kullanıcıyı al
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Kullanıcı profili al
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  // Auth state değişikliklerini dinle
  onAuthStateChange(callback: import('@/types').AuthStateChangeCallback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
