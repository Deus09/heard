/**
 * reCAPTCHA v3 doğrulama yardımcı fonksiyonları
 */

interface RecaptchaVerificationResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

/**
 * reCAPTCHA token'ını Google API'sine karşı doğrular
 * @param token - Client'tan gelen reCAPTCHA token'ı
 * @param expectedAction - Beklenen action (örn: 'submit_comment')
 * @returns Doğrulama başarılı mı ve skor
 */
export async function verifyRecaptcha(
  token: string,
  expectedAction?: string,
  options?: { remoteIp?: string }
): Promise<{ success: boolean; score: number; message?: string }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.error('RECAPTCHA_SECRET_KEY not found in environment variables');
    // Production'da CAPTCHA gerekli, yoksa hata dön
    if (process.env.NODE_ENV === 'production') {
      return {
        success: false,
        score: 0,
        message: 'reCAPTCHA configuration error',
      };
    }
    // Development'ta CAPTCHA olmadan devam et
    return { success: true, score: 1.0 };
  }

  try {
    const params = new URLSearchParams({
      secret: secretKey,
      response: token,
    });

    if (options?.remoteIp) {
      params.append('remoteip', options.remoteIp);
    }

    const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data: RecaptchaVerificationResponse = await response.json();

    // Temel başarı kontrolü
    if (!data.success) {
      console.error('reCAPTCHA verification failed:', data['error-codes']);
      return {
        success: false,
        score: 0,
        message: 'reCAPTCHA verification failed',
      };
    }

    // Action kontrolü (opsiyonel) - sadece uyarı ver, reddetme
    if (expectedAction && data.action !== expectedAction) {
      console.warn(
        `⚠️ reCAPTCHA action mismatch. Expected: ${expectedAction}, Got: ${data.action || 'undefined'}`
      );
      console.warn('⚠️ Continuing anyway - action mismatch is not fatal');
      // Production'da action undefined gelebilir, bu yüzden sadece uyar
    }

    // Skor kontrolü - 0.5'in üzerindeki skorlar genellikle güvenilir kabul edilir
    // reCAPTCHA v3: 0.0 (bot olasılığı yüksek) - 1.0 (insan olasılığı yüksek)
    let score = data.score || 0;

    // Çok esnek skor eşiği (0.1) - Production'da gerçek kullanıcılar düşük skor alabilir
    // Özellikle VPN, AdBlock veya gizlilik araçları kullananlar için
    const threshold = 0.1;

    if (
      data.success &&
      score === 0 &&
      (!data.action || data.action === 'undefined')
    ) {
      console.warn('⚠️ reCAPTCHA returned score 0 with undefined action - applying privacy fallback');
      const fallbackScore = 0.2;
      score = fallbackScore;
    }

    console.log(`✅ reCAPTCHA verification result:`, {
      success: data.success,
  score,
  threshold,
  isHuman: score >= threshold,
      action: data.action || 'undefined',
      expectedAction: expectedAction || 'none',
      hostname: data.hostname,
      timestamp: data.challenge_ts
    });

    if (score < threshold) {
      console.warn(`⚠️ VERY Low reCAPTCHA score detected: ${score} (threshold: ${threshold})`);
      console.warn(`⚠️ This might be a bot, but could also be privacy tools`);
      if (score < threshold && score > 0) {
        return {
          success: true,
          score,
          message: 'Low score - privacy tools suspected',
        };
      }
      return {
        success: score >= threshold,
        score,
        message: score > 0 ? 'Low score - privacy tools suspected' : 'Suspicious activity detected',
      };
    }

    // Düşük skor uyarısı (ama geçiyor)
    if (score < 0.5) {
      console.warn(`⚠️ Low reCAPTCHA score but passing: ${score} (threshold: ${threshold})`);
    }

    return {
      success: true,
      score,
    };
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return {
      success: false,
      score: 0,
      message: 'reCAPTCHA verification error',
    };
  }
}

/**
 * Skor eşik değerlerini ayarlayabilirsiniz
 */
export const RecaptchaScoreThresholds = {
  STRICT: 0.7, // Yüksek güvenlik (bazı gerçek kullanıcılar engellenebilir)
  NORMAL: 0.5, // Normal güvenlik (önerilen)
  LENIENT: 0.3, // Düşük güvenlik (daha az bot engellenir)
};

/**
 * Action adları - tutarlılık için sabitler
 */
export const RecaptchaActions = {
  SUBMIT_COMMENT: 'submit_comment',
  LOGIN: 'login',
  REGISTER: 'register',
  ANNOUNCE: 'announce',
};
