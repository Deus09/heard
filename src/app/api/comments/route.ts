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

    // 3. CSRF token kontrolü
    const csrfValid = await verifyCSRFToken(csrfToken);
    if (!csrfValid) {
      return NextResponse.json(
        { error: 'Geçersiz güvenlik tokeni. Lütfen sayfayı yenileyip tekrar deneyin.' },
        { status: 403 }
      );
    }

    // 4. reCAPTCHA doğrulaması (Production'da zorunlu)
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
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
 * Yorumları getir (opsiyonel - sayfalama ile)
 * GET /api/comments?page=0&pageSize=12&search=keyword
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

    // Query parametrelerini al
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');
    const search = searchParams.get('search') || undefined;

    // Yorumları getir
    const result = await commentsService.getCommentsPaginatedWithAnnounces(
      page,
      pageSize,
      search
    );

    return NextResponse.json(result, {
      headers: {
        'X-RateLimit-Limit': RateLimitPresets.general.maxRequests.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toISOString(),
      },
    });
  } catch (error) {
    console.error('Yorumlar getirme hatası:', error);
    return NextResponse.json(
      { error: 'Yorumlar yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
