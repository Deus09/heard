import { supabase } from '@/lib/supabase'
import { Comment } from '@/lib/supabase'

export const commentsService = {
  // Tüm yorumları al (opsiyonel arama terimi ile)
  async getComments(searchTerm?: string) {
    let query = supabase
      .from('comments')
      .select('*')
    
    // Arama terimi varsa filtreleme uygula
    if (searchTerm && searchTerm.trim()) {
      const term = `%${searchTerm.trim()}%`
      query = query.or(`business_name.ilike.${term},city.ilike.${term},district.ilike.${term}`)
    }
    
    query = query.order('created_at', { ascending: false })
    
    const { data, error } = await query
    
    if (error) throw error
    return data as Comment[]
  },

  // Kullanıcının yorumlarını al
  async getUserComments(userId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Comment[]
  },

  // Yorum ekle (giriş yapmadan da eklenebilir)
  async addComment(
    businessName: string,
    city: string,
    district: string,
    experience: string,
    rating: number,
    anonymous: boolean = false
  ) {
    const user = await supabase.auth.getUser()
    
    let userId: string | null = null
    let username: string

    if (user.data.user) {
      // Kullanıcı giriş yapmış
      userId = user.data.user.id

      const profile = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.data.user.id)
        .single()

      if (!profile.data) throw new Error('Profil bulunamadı')
      username = anonymous ? 'Anonim' : profile.data.username
    } else {
      // Kullanıcı giriş yapmamış - rastgele username oluştur
      username = await this.generateAnonymousUsername()
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        username,
        business_name: businessName,
        city,
        district,
        experience,
        rating,
        anonymous: !user.data.user ? true : anonymous
      })
      .select()
      .single()
    
    if (error) throw error
    return data as Comment
  },

  // Anonim kullanıcı için benzersiz username oluştur
  async generateAnonymousUsername() {
    const currentYear = new Date().getFullYear()
    
    // Bu yıl oluşturulan anonim yorumları say
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .like('username', `anon${currentYear}%`)
    
    if (error) throw error
    
    const commentCount = (count || 0) + 1
    return `anon${currentYear}${commentCount}`
  },

  // Yorumu sil (sadece kendi yorumunu silebilir)
  async deleteComment(commentId: string) {
    const user = await supabase.auth.getUser()
    if (!user.data.user) throw new Error('Giriş yapmalısınız')

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.data.user.id) // Sadece kendi yorumunu silebilir
    
    if (error) throw error
  },

  // Gerçek zamanlı güncellemeler için abone ol
  subscribeToComments(callback: (payload: any) => void) {
    return supabase
      .channel('comments')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'comments' },
        callback
      )
      .subscribe()
  }
}
