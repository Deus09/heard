import { NextResponse } from 'next/server';
import { commentsService } from '@/services/comments';
import { withRateLimit, RateLimitPresets } from '@/lib/rateLimit';
import { verifyCSRFToken } from '@/lib/csrf';
import { verifyRecaptcha, RecaptchaActions } from '@/lib/recaptcha';

/**
 * Yorum ekleme endpoint'i
 * POST /api/comments - Yeni yorum oluşturur
 * Rate limit: Saatte 5 yorum
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
          error: 'Çok fazla yorum eklemeye çalıştınız',
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

    // 4. reCAPTCHA doğrulaması (Production'da zorunlu, development'ta opsiyonel)
    const isProduction = process.env.NODE_ENV === 'production';
    const recaptchaEnabled = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && process.env.RECAPTCHA_SECRET_KEY;
    
    if (isProduction && recaptchaEnabled) {
      if (!recaptchaToken) {
        return NextResponse.json(
          { error: 'reCAPTCHA doğrulaması gereklidir' },
          { status: 400 }
        );
      }

      const captchaResult = await verifyRecaptcha(
        recaptchaToken,
        RecaptchaActions.SUBMIT_COMMENT
      );

      if (!captchaResult.success) {
        console.warn('CAPTCHA verification failed:', captchaResult.message, 'Score:', captchaResult.score);
        return NextResponse.json(
          { 
            error: 'Bot tespiti başarısız oldu. Lütfen tekrar deneyin.',
            message: 'Sistem şüpheli aktivite tespit etti. Gerçek bir insan olduğunuzu doğrulayamadık.',
          },
          { status: 403 }
        );
      }

      // Düşük skor uyarısı (loglama için)
      if (captchaResult.score < 0.7) {
        console.log(`Low reCAPTCHA score but passing: ${captchaResult.score}`);
      }
    } else if (!isProduction) {
      console.log('🔧 Development mode: reCAPTCHA check skipped');
    }

    // 5. Validasyon
    if (!businessName || !city || !district || !experience) {
      return NextResponse.json(
        { error: 'Tüm alanlar doldurulmalıdır' },
        { status: 400 }
      );
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Geçersiz puan değeri' },
        { status: 400 }
      );
    }

    // 6. Yorumu ekle
    const comment = await commentsService.addComment(
      businessName,
      city,
      district,
      experience,
      rating,
      anonymous
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
    console.error('Yorum ekleme hatası:', error);
    
    // Kullanıcı dostu hata mesajları
    let errorMessage = 'Yorum eklenirken bir hata oluştu';
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
 * - pageSize: Sayfa başına yorum sayısı (default: 50, max: 100)
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

    // Yorumları getir (Optimize edilmiş RPC fonksiyonu ile)
    const result = await commentsService.getCommentsWithAnnouncesOptimized(
      cursor,
      pageSize,
      search,
      city
    );

    // Next cursor'ı base64 encode et
    const nextCursorEncoded = result.pagination.nextCursor
      ? Buffer.from(JSON.stringify(result.pagination.nextCursor)).toString('base64')
      : null;

    // Response headers
    const headers: Record<string, string> = {
      'X-RateLimit-Limit': RateLimitPresets.general.maxRequests.toString(),
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': rateLimit.resetTime.toISOString(),
      'X-Has-Next-Page': result.pagination.hasNextPage.toString(),
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
