import { supabase } from '@/lib/supabase'
import { Comment } from '@/lib/supabase'

export const commentsService = {
  // Tüm yorumları al
  async getComments() {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })
    
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

  // Yorum ekle
  async addComment(
    businessName: string,
    city: string,
    district: string,
    experience: string,
    rating: number,
    anonymous: boolean = false
  ) {
    const user = await supabase.auth.getUser()
    if (!user.data.user) throw new Error('Giriş yapmalısınız')

    const profile = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.data.user.id)
      .single()

    if (!profile.data) throw new Error('Profil bulunamadı')

    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: user.data.user.id,
        username: anonymous ? 'Anonim' : profile.data.username,
        business_name: businessName,
        city,
        district,
        experience,
        rating,
        anonymous
      })
      .select()
      .single()
    
    if (error) throw error
    return data as Comment
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
