import { NextResponse } from 'next/server';
import { commentsService } from '@/services/comments';
import { withRateLimit, RateLimitPresets } from '@/lib/rateLimit';
import { verifyCSRFToken } from '@/lib/csrf';

/**
 * Duyuru ekleme/kaldırma endpoint'i
 * POST /api/announces - Yorumu duyurur
 * DELETE /api/announces - Duyuruyu kaldırır
 * Rate limit: Dakikada 20 işlem
 * CSRF korumalı
 */
export async function POST(request: Request) {
  try {
    // 1. Rate limiting kontrolü
    const rateLimit = await withRateLimit(request, RateLimitPresets.announce);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Çok fazla işlem yaptınız',
          message: 'Lütfen bir süre bekleyip tekrar deneyin',
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RateLimitPresets.announce.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toISOString(),
            'Retry-After': rateLimit.retryAfter!.toString(),
          },
        }
      );
    }

    // 2. Request body'yi parse et
    const body = await request.json();
    const { commentId, csrfToken } = body;

    // 3. CSRF token kontrolü
    const csrfValid = await verifyCSRFToken(csrfToken);
    if (!csrfValid) {
      return NextResponse.json(
        { error: 'Geçersiz güvenlik tokeni. Lütfen sayfayı yenileyip tekrar deneyin.' },
        { status: 403 }
      );
    }

    // 4. Validasyon
    if (!commentId) {
      return NextResponse.json(
        { error: 'Tecrübe ID gereklidir' },
        { status: 400 }
      );
    }

    // 5. Yorumu duyur
    await commentsService.announceComment(commentId);

    // 6. Yeni duyuru sayısını al
    const announceCount = await commentsService.getAnnounceCount(commentId);

    // 7. Başarılı yanıt
    return NextResponse.json(
      {
        success: true,
        announceCount,
        message: 'Tecrübe duyuruldu',
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': RateLimitPresets.announce.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toISOString(),
        },
      }
    );
  } catch (error: any) {
    console.error('Duyuru ekleme hatası:', error);
    
    let errorMessage = 'Duyuru eklenirken bir hata oluştu';
    let statusCode = 500;

    if (error.message) {
      errorMessage = error.message;
      
      if (error.message.includes('Giriş yapmalısınız')) {
        statusCode = 401;
      } else if (error.message.includes('zaten duyurdunuz')) {
        statusCode = 409;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

/**
 * Duyuruyu kaldır
 * DELETE /api/announces
 */
export async function DELETE(request: Request) {
  try {
    // 1. Rate limiting kontrolü
    const rateLimit = await withRateLimit(request, RateLimitPresets.announce);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Çok fazla işlem yaptınız',
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

    // 2. Request body'yi parse et
    const body = await request.json();
    const { commentId, csrfToken } = body;

    // 3. CSRF token kontrolü
    const csrfValid = await verifyCSRFToken(csrfToken);
    if (!csrfValid) {
      return NextResponse.json(
        { error: 'Geçersiz güvenlik tokeni' },
        { status: 403 }
      );
    }

    // 4. Validasyon
    if (!commentId) {
      return NextResponse.json(
        { error: 'Tecrübe ID gereklidir' },
        { status: 400 }
      );
    }

    // 5. Duyuruyu kaldır
    await commentsService.unannounceComment(commentId);

    // 6. Yeni duyuru sayısını al
    const announceCount = await commentsService.getAnnounceCount(commentId);

    // 7. Başarılı yanıt
    return NextResponse.json(
      {
        success: true,
        announceCount,
        message: 'Duyuru kaldırıldı',
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': RateLimitPresets.announce.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toISOString(),
        },
      }
    );
  } catch (error: any) {
    console.error('Duyuru kaldırma hatası:', error);
    
    let errorMessage = 'Duyuru kaldırılırken bir hata oluştu';
    let statusCode = 500;

    if (error.message && error.message.includes('Giriş yapmalısınız')) {
      errorMessage = error.message;
      statusCode = 401;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
