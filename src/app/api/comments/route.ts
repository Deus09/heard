import { NextResponse } from 'next/server';
import { commentsService } from '@/services/comments';
import { withRateLimit, RateLimitPresets } from '@/lib/rateLimit';
import { verifyCSRFToken } from '@/lib/csrf';
import { verifyRecaptcha, RecaptchaActions } from '@/lib/recaptcha';
import { containsProfanity, getProfanityWords } from '@/lib/profanityFilter';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Comment } from '@/lib/supabaseClient';

/**
 * Server-side için auth destekli Supabase client oluştur
 */
async function createServerClientWithAuth() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value
  const refreshToken = cookieStore.get('sb-refresh-token')?.value
  
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
  
  // Eğer token varsa session'ı set et
  if (accessToken && refreshToken) {
    await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
  }
  
  return client
}

/**
 * Server-side için basit Supabase client
 */
function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}

/**
 * Anonim kullanıcı için benzersiz username oluştur
 */
async function generateAnonymousUsername(): Promise<string> {
  const currentYear = new Date().getFullYear()
  const serverSupabase = createServerClient()
  
  // Bu yıl oluşturulan anonim yorumları say
  const { count, error } = await serverSupabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .like('username', `anon${currentYear}%`)
  
  if (error) throw error
  
  const commentCount = (count || 0) + 1
  return `anon${currentYear}${commentCount}`
}

/**
 * İş yeri adı için ek validasyon
 */
function validateBusinessName(businessName: string): { valid: boolean; error?: string } {
  // Trim edilmiş hali
  const trimmed = businessName.trim();
  
  // Boşluk kontrolü
  if (!trimmed || trimmed.length === 0) {
    return { valid: false, error: 'İş yeri adı boş olamaz' };
  }
  
  // Uzunluk kontrolleri
  if (trimmed.length < 3) {
    return { valid: false, error: 'İş yeri adı en az 3 karakter olmalıdır' };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, error: 'İş yeri adı en fazla 100 karakter olabilir' };
  }
  
  // Küfür kontrolü
  if (containsProfanity(trimmed)) {
    const badWords = getProfanityWords(trimmed);
    return { 
      valid: false, 
      error: `İş yeri adı uygunsuz kelimeler içeriyor: ${badWords.join(', ')}` 
    };
  }
  
  // Sadece sayılardan oluşması kontrolü
  if (/^\d+$/.test(trimmed)) {
    return { valid: false, error: 'İş yeri adı sadece sayılardan oluşamaz' };
  }
  
  // Aşırı tekrar kontrolü (aynı karakterin 5'ten fazla tekrarı)
  if (/(.)\1{5,}/.test(trimmed)) {
    return { valid: false, error: 'İş yeri adı aşırı tekrarlı karakterler içeriyor' };
  }
  
  // Sadece özel karakterlerden oluşması kontrolü (en az 1 harf veya rakam olmalı)
  if (!/[a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]/.test(trimmed)) {
    return { valid: false, error: 'İş yeri adı en az bir harf veya rakam içermelidir' };
  }
  
  return { valid: true };
}

/**
 * Tecrübe ekleme handler fonksiyonu
 */
async function addCommentHandler(
  businessName: string,
  city: string,
  district: string,
  experience: string,
  rating: number,
  anonymous: boolean = false,
  request: Request
): Promise<Comment> {
  // İş yeri adı validasyonu
  const businessNameValidation = validateBusinessName(businessName);
  if (!businessNameValidation.valid) {
    throw new Error(businessNameValidation.error);
  }
  
  // Deneyim validasyonu
  if (!experience || experience.trim().length === 0) {
    throw new Error('Deneyim açıklaması boş olamaz')
  }
  if (experience.length > 500) {
    throw new Error('Deneyim açıklaması en fazla 500 karakter olabilir')
  }
  if (experience.trim().length < 20) {
    throw new Error('Deneyim açıklaması en az 20 karakter olmalıdır')
  }
  
  // Deneyimde küfür kontrolü
  if (containsProfanity(experience)) {
    const badWords = getProfanityWords(experience);
    throw new Error(`Deneyim açıklaması uygunsuz kelimeler içeriyor: ${badWords.join(', ')}`);
  }
  
  // Puan validasyonu
  if (rating < 1 || rating > 5) {
    throw new Error('Puan 1 ile 5 arasında olmalıdır')
  }
  
  // Server-side client oluştur (auth destekli)
  const serverSupabase = await createServerClientWithAuth()
  
  const { data: userData, error: userError } = await serverSupabase.auth.getUser()
  
  let userId: string | null = null
  let username: string

  if (userData?.user) {
    // Kullanıcı giriş yapmış
    userId = userData.user.id

    const { data: profile, error: profileError } = await serverSupabase
      .from('profiles')
      .select('username')
      .eq('id', userData.user.id)
      .single()

    if (profileError || !profile) throw new Error('Profil bulunamadı')
    username = anonymous ? 'Anonim' : profile.username
  } else {
    // Kullanıcı giriş yapmamış - rastgele username oluştur
    username = await generateAnonymousUsername()
  }

  const { data, error } = await serverSupabase
    .from('comments')
    .insert({
      user_id: userId,
      username,
      business_name: businessName,
      city,
      district,
      experience,
      rating,
      anonymous: !userData?.user ? true : anonymous
    })
    .select()
    .single()
  
  if (error) throw error
  return data as Comment
}

/**
 * Tecrübe ekleme endpoint'i
 * POST /api/comments - Yeni Tecrübe oluşturur
 * Rate limit: Saatte 5 Tecrübe
 * CSRF korumalı
 */
export async function POST(request: Request) {
  try {
    console.log('🔵 POST /api/comments - Request received');
    
    // 1. Rate limiting kontrolü
    const rateLimit = await withRateLimit(request, RateLimitPresets.addComment);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Çok fazla Tecrübe eklemeye çalıştınız',
          message: `Lütfen ${Math.ceil(rateLimit.retryAfter! / 60)} dakika sonra tekrar deneyin`,
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RateLimitPresets.addComment.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toISOString(),
            'Retry-After': rateLimit.retryAfter!.toString(),
          },
        }
      );
    }

    // 2. Request body'yi parse et
    const body = await request.json();
    const { businessName, city, district, experience, rating, anonymous, csrfToken, recaptchaToken } = body;

    console.log('🔵 CSRF Token from body:', csrfToken?.substring(0, 10) + '...', 'Length:', csrfToken?.length);

    // 3. CSRF token kontrolü
    if (!csrfToken) {
      console.error('❌ CSRF token missing in request');
      return NextResponse.json(
        { error: 'Güvenlik tokeni bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.' },
        { status: 403 }
      );
    }

    const csrfValid = await verifyCSRFToken(csrfToken);
    if (!csrfValid) {
      console.error('❌ CSRF token validation failed', { 
        receivedToken: csrfToken?.substring(0, 10) + '...',
        tokenLength: csrfToken?.length 
      });
      return NextResponse.json(
        { error: 'Geçersiz güvenlik tokeni. Lütfen sayfayı yenileyip tekrar deneyin.' },
        { status: 403 }
      );
    }

    console.log('✅ CSRF token validated successfully');

    // 4. reCAPTCHA doğrulaması (Production'da opsiyonel ama önerilir)
    const isProduction = process.env.NODE_ENV === 'production';
    const recaptchaEnabled = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && process.env.RECAPTCHA_SECRET_KEY;
    
    // reCAPTCHA kontrolü - token varsa doğrula, yoksa devam et (rate limit zaten var)
    if (recaptchaEnabled && recaptchaToken) {
      console.log('🔍 Verifying reCAPTCHA token...');
      const captchaResult = await verifyRecaptcha(
        recaptchaToken,
        RecaptchaActions.SUBMIT_COMMENT
      );

      console.log('🔍 reCAPTCHA result:', {
        success: captchaResult.success,
        score: captchaResult.score,
        message: captchaResult.message
      });

      if (!captchaResult.success) {
        console.error('❌ CAPTCHA verification failed:', {
          message: captchaResult.message,
          score: captchaResult.score,
          token: recaptchaToken?.substring(0, 20) + '...'
        });
        
        // GEÇİCİ: Google Protected mode nedeniyle tüm başarısız doğrulamaları kabul et
        // Sadece Google API hatalarında reddet (token invalid, expired, etc.)
        if (captchaResult.message?.includes('verification failed') || 
            captchaResult.message?.includes('error')) {
          // Gerçek bir API hatası - token geçersiz, süresi dolmuş, vb.
          return NextResponse.json(
            { 
              error: 'Güvenlik doğrulaması başarısız oldu. Lütfen tekrar deneyin.',
              message: 'reCAPTCHA token geçersiz veya süresi dolmuş.',
              debug: process.env.NODE_ENV === 'development' ? {
                score: captchaResult.score,
                reason: captchaResult.message
              } : undefined
            },
            { status: 403 }
          );
        }
        
        // Score 0 veya düşük skor - Google Protected mode etkisi
        // Token geçerli ama score düşük - izin ver
        console.warn('⚠️ reCAPTCHA score is low but allowing (Google Protected mode):', captchaResult.score);
        console.warn('⚠️ Recommendation: Adjust Google Cloud reCAPTCHA settings');
      } else {
        console.log('✅ reCAPTCHA verified successfully, score:', captchaResult.score);
      }

      // Düşük skor uyarısı (loglama için)
      if (captchaResult.score < 0.5) {
        console.warn(`⚠️ Low reCAPTCHA score: ${captchaResult.score}`);
      }
    } else if (!recaptchaToken && recaptchaEnabled) {
      console.warn('⚠️ reCAPTCHA enabled but no token provided');
    } else if (!isProduction) {
      console.log('🔧 Development mode: reCAPTCHA check skipped');
    }

    // 5. Validasyon
    if (!businessName || !city || !experience) {
      return NextResponse.json(
        { error: 'İş yeri adı, şehir ve deneyim alanları doldurulmalıdır' },
        { status: 400 }
      );
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Geçersiz puan değeri' },
        { status: 400 }
      );
    }

    // 6. Yorumu ekle (doğrudan API route'ta)
    const comment = await addCommentHandler(
      businessName,
      city,
      district,
      experience,
      rating,
      anonymous,
      request
    );

    // 7. Başarılı yanıt
    return NextResponse.json(
      {
        success: true,
        comment,
        message: 'Yorumunuz başarıyla eklendi',
      },
      {
        status: 201,
        headers: {
          'X-RateLimit-Limit': RateLimitPresets.addComment.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toISOString(),
        },
      }
    );
  } catch (error: any) {
    console.error('Tecrübe ekleme hatası:', error);
    
    // Kullanıcı dostu hata mesajları
    let errorMessage = 'Tecrübe eklenirken bir hata oluştu';
    let statusCode = 500;

    if (error.message) {
      errorMessage = error.message;
      
      // Validasyon hatalarını 400 olarak dön
      if (
        error.message.includes('boş olamaz') ||
        error.message.includes('en fazla') ||
        error.message.includes('en az') ||
        error.message.includes('olmalıdır')
      ) {
        statusCode = 400;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

/**
 * Yorumları getir (Cursor-based pagination ile)
 * GET /api/comments?cursor=base64EncodedCursor&pageSize=50&search=keyword&city=Istanbul
 * 
 * Query Parameters:
 * - cursor: Base64 encoded pagination cursor (optional, ilk sayfa için null)
 * - pageSize: Sayfa başına Tecrübe sayısı (default: 50, max: 100)
 * - search: Arama terimi (optional)
 * - city: Şehir filtresi (optional)
 * 
 * Response Headers:
 * - X-Next-Cursor: Sonraki sayfa için cursor
 * - X-Has-Next-Page: Sonraki sayfa var mı (true/false)
 * - X-RateLimit-*: Rate limit bilgileri
 */
export async function GET(request: Request) {
  try {
    // Rate limiting - genel API limiti
    const rateLimit = await withRateLimit(request, RateLimitPresets.general);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Çok fazla istek gönderdiniz',
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.retryAfter!.toString(),
          },
        }
      );
    }

    // Query parametrelerini al ve parse et
    const { searchParams } = new URL(request.url);
    
    // Cursor parse et (base64 encoded olarak gelir)
    let cursor = null;
    const cursorParam = searchParams.get('cursor');
    if (cursorParam) {
      try {
        const decoded = Buffer.from(cursorParam, 'base64').toString('utf-8');
        cursor = JSON.parse(decoded);
      } catch (e) {
        return NextResponse.json(
          { error: 'Geçersiz cursor formatı' },
          { status: 400 }
        );
      }
    }

    // Sayfa boyutu (max 100 ile sınırla)
    const pageSize = Math.min(
      parseInt(searchParams.get('pageSize') || '50'),
      100
    );

    // Filtreler
    const search = searchParams.get('search') || undefined;
    const city = searchParams.get('city') || undefined;

    // Kullanıcı ID'sini cookie'den al (server-side)
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    
    let userId: string | null = null
    
    if (accessToken) {
      try {
        const serverSupabase = await createServerClientWithAuth()
        const { data: userData } = await serverSupabase.auth.getUser()
        userId = userData?.user?.id || null
      } catch (error) {
        console.warn('Kullanıcı bilgisi alınamadı:', error)
        // Hata olsa bile devam et
      }
    }

    // Yorumları getir (Server-side client ile direkt veritabanı sorgusu)
    const serverSupabase = createServerClient()
    
    // Base query oluştur
    let query = serverSupabase
      .from('comments')
      .select('*')

    // Cursor-based filtering
    if (cursor) {
      query = query.or(
        `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`
      )
    }

    // Şehir filtresi
    if (city && city.trim()) {
      query = query.eq('city', city.trim())
    }

    // Arama filtresi
    if (search && search.trim()) {
      const term = `%${search.trim()}%`
      query = query.or(`business_name.ilike.${term},city.ilike.${term},district.ilike.${term}`)
    }

    // Sıralama ve limit
    query = query
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(pageSize + 1) // +1 ile hasNextPage kontrolü

    const { data: comments, error: commentsError } = await query

    if (commentsError) throw commentsError
    
    if (!comments || comments.length === 0) {
      const result = {
        data: [],
        pagination: {
          nextCursor: null,
          prevCursor: null,
          hasNextPage: false,
          hasPrevPage: !!cursor,
        }
      }
      
      return NextResponse.json(result, { 
        headers: {
          'X-RateLimit-Limit': RateLimitPresets.general.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toISOString(),
          'X-Has-Next-Page': 'false',
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        }
      });
    }

    // HasNextPage kontrolü
    const hasNextPage = comments.length > pageSize
    const dataToReturn = hasNextPage ? comments.slice(0, pageSize) : comments
    
    // Next cursor oluştur
    const nextCursor = hasNextPage
      ? {
          created_at: dataToReturn[dataToReturn.length - 1].created_at,
          id: dataToReturn[dataToReturn.length - 1].id,
        }
      : null

    // Announces bilgilerini paralel olarak getir
    const commentIds = dataToReturn.map((c: any) => c.id)
    const { data: announces } = await serverSupabase
      .from('announces')
      .select('comment_id, user_identifier')
      .in('comment_id', commentIds)

    // Duyuruları comment_id'ye göre grupla
    const announcesByCommentId = (announces || []).reduce((acc: any, announce: any) => {
      if (!acc[announce.comment_id]) {
        acc[announce.comment_id] = []
      }
      acc[announce.comment_id].push(announce)
      return acc
    }, {} as Record<string, any[]>)

    // Veriyi birleştir
    const transformedData = dataToReturn.map((comment: any) => {
      const commentAnnounces = announcesByCommentId[comment.id] || []
      const announceCount = commentAnnounces.length
      const hasAnnounced = userId 
        ? commentAnnounces.some((a: any) => a.user_identifier === userId) 
        : false

      return {
        ...comment,
        announceCount,
        hasAnnounced
      }
    })

    const result = {
      data: transformedData,
      pagination: {
        nextCursor,
        prevCursor: cursor,
        hasNextPage,
        hasPrevPage: !!cursor,
      }
    };

    // Next cursor'ı base64 encode et
    const nextCursorEncoded = nextCursor
      ? Buffer.from(JSON.stringify(nextCursor)).toString('base64')
      : null;

    // Response headers
    const headers: Record<string, string> = {
      'X-RateLimit-Limit': RateLimitPresets.general.maxRequests.toString(),
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': rateLimit.resetTime.toISOString(),
      'X-Has-Next-Page': hasNextPage.toString(),
      'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30', // 10 saniye cache
    };

    if (nextCursorEncoded) {
      headers['X-Next-Cursor'] = nextCursorEncoded;
    }

    return NextResponse.json(result, { headers });
  } catch (error) {
    console.error('Yorumlar getirme hatası:', error);
    return NextResponse.json(
      { error: 'Yorumlar yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
