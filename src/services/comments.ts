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

  // Sayfalı yorumları al (infinite scroll için)
  async getCommentsPaginated(page: number = 0, pageSize: number = 12, searchTerm?: string) {
    const from = page * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('comments')
      .select('*', { count: 'exact' })
    
    // Arama terimi varsa filtreleme uygula
    if (searchTerm && searchTerm.trim()) {
      const term = `%${searchTerm.trim()}%`
      query = query.or(`business_name.ilike.${term},city.ilike.${term},district.ilike.${term}`)
    }
    
    query = query
      .order('created_at', { ascending: false })
      .range(from, to)
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    return {
      data: data as Comment[],
      count: count || 0,
      hasMore: count ? (from + pageSize) < count : false
    }
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
  },

  // Kullanıcı için benzersiz identifier oluştur (giriş yapmamışlar için)
  getUserIdentifier() {
    // LocalStorage'dan identifier al veya oluştur
    if (typeof window === 'undefined') return 'server-side'
    
    let identifier = localStorage.getItem('user_identifier')
    if (!identifier) {
      identifier = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('user_identifier', identifier)
    }
    return identifier
  },

  // Yorumu duyur (sadece giriş yapmış kullanıcılar)
  async announceComment(commentId: string) {
    const user = await supabase.auth.getUser()
    
    if (!user.data.user) {
      throw new Error('Giriş yapmalısınız')
    }
    
    const userId = user.data.user.id

    const { data, error } = await supabase
      .from('announces')
      .insert({
        comment_id: commentId,
        user_id: userId,
        user_identifier: userId // user_id ile aynı değer
      })
      .select()
      .single()
    
    if (error) {
      // Eğer zaten duyurmuşsa
      if (error.code === '23505') {
        throw new Error('Bu yorumu zaten duyurdunuz')
      }
      throw error
    }
    return data
  },

  // Duyuruyu geri al (sadece giriş yapmış kullanıcılar)
  async unannounceComment(commentId: string) {
    const user = await supabase.auth.getUser()
    
    if (!user.data.user) {
      throw new Error('Giriş yapmalısınız')
    }
    
    const userId = user.data.user.id

    const { error } = await supabase
      .from('announces')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_identifier', userId)
    
    if (error) throw error
  },

  // Yorumun duyuru sayısını al
  async getAnnounceCount(commentId: string) {
    const { count, error } = await supabase
      .from('announces')
      .select('*', { count: 'exact', head: true })
      .eq('comment_id', commentId)
    
    if (error) throw error
    return count || 0
  },

  // Kullanıcının belirli bir yorumu duyurup duyurmadığını kontrol et
  async hasUserAnnounced(commentId: string) {
    const user = await supabase.auth.getUser()
    
    // Giriş yapmamışsa false dön
    if (!user.data.user) {
      return false
    }
    
    const userId = user.data.user.id

    const { data, error } = await supabase
      .from('announces')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_identifier', userId)
      .maybeSingle()
    
    if (error) throw error
    return !!data
  },

  // Yorumları duyuru sayılarıyla birlikte al
  async getCommentsWithAnnounces(searchTerm?: string) {
    const comments = await this.getComments(searchTerm)
    
    // Her yorum için duyuru sayısını al
    const commentsWithAnnounces = await Promise.all(
      comments.map(async (comment) => {
        const announceCount = await this.getAnnounceCount(comment.id)
        const hasAnnounced = await this.hasUserAnnounced(comment.id)
        return {
          ...comment,
          announceCount,
          hasAnnounced
        }
      })
    )
    
    return commentsWithAnnounces
  },

  // Sayfalı yorumları duyuru sayılarıyla birlikte al
  async getCommentsPaginatedWithAnnounces(page: number = 0, pageSize: number = 12, searchTerm?: string) {
    const result = await this.getCommentsPaginated(page, pageSize, searchTerm)
    
    // Her yorum için duyuru sayısını ve kullanıcının duyurup duyurmadığını al
    const commentsWithAnnounces = await Promise.all(
      result.data.map(async (comment) => {
        const announceCount = await this.getAnnounceCount(comment.id)
        const hasAnnounced = await this.hasUserAnnounced(comment.id)
        return {
          ...comment,
          announceCount,
          hasAnnounced
        }
      })
    )
    
    return {
      data: commentsWithAnnounces,
      count: result.count,
      hasMore: result.hasMore
    }
  }
}
