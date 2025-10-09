import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

const getSupabase = async () => {
  if (!supabaseInstance) {
    supabaseInstance = await createServerSupabaseClient();
  }
  return supabaseInstance;
};

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

/**
 * Rate limiting sistemi - IP bazlı istek sınırlama
 * Supabase veritabanı kullanarak rate limit verilerini saklar
 */
export class RateLimiter {
  private config: RateLimitConfig;
  private identifier: string;

  constructor(identifier: string, config: RateLimitConfig) {
    this.identifier = identifier;
    this.config = config;
  }

  /**
   * İsteğin rate limit'e takılıp takılmadığını kontrol eder
   */
  async checkLimit(): Promise<RateLimitResult> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - this.config.windowMs);
    const supabase = await getSupabase();

    try {
      // Mevcut pencere içindeki istekleri say
      const { data: existingRecords, error: countError } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('identifier', this.identifier)
        .gte('created_at', windowStart.toISOString())
        .order('created_at', { ascending: false });

      if (countError) {
        console.error('Rate limit kontrolü hatası:', countError);
        // Hata durumunda izin ver (fail-open)
        return {
          allowed: true,
          remaining: this.config.maxRequests,
          resetTime: new Date(now.getTime() + this.config.windowMs),
        };
      }

      const requestCount = existingRecords?.length || 0;

      // Limit aşıldı mı?
      if (requestCount >= this.config.maxRequests) {
        const oldestRecord = existingRecords[existingRecords.length - 1];
        const resetTime = new Date(
          new Date(oldestRecord.created_at).getTime() + this.config.windowMs
        );
        const retryAfter = Math.ceil((resetTime.getTime() - now.getTime()) / 1000);

        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter,
        };
      }

      // Yeni istek kaydı ekle
      await supabase.from('rate_limits').insert({
        identifier: this.identifier,
        created_at: now.toISOString(),
      });

      // Eski kayıtları temizle (performans için)
      await this.cleanup(windowStart);

      return {
        allowed: true,
        remaining: this.config.maxRequests - requestCount - 1,
        resetTime: new Date(now.getTime() + this.config.windowMs),
      };
    } catch (error) {
      console.error('Rate limit kontrolü beklenmeyen hata:', error);
      // Beklenmeyen hatalarda izin ver (fail-open)
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: new Date(now.getTime() + this.config.windowMs),
      };
    }
  }

  /**
   * Zaman aşımına uğramış rate limit kayıtlarını temizler
   */
  private async cleanup(windowStart: Date): Promise<void> {
    const supabase = await getSupabase();
    try {
      await supabase
        .from('rate_limits')
        .delete()
        .eq('identifier', this.identifier)
        .lt('created_at', windowStart.toISOString());
    } catch (error) {
      console.error('Rate limit temizleme hatası:', error);
    }
  }

  /**
   * Belirli bir identifier için tüm rate limit kayıtlarını temizler
   */
  static async resetIdentifier(identifier: string): Promise<void> {
    const supabase = await getSupabase();
    try {
      await supabase.from('rate_limits').delete().eq('identifier', identifier);
    } catch (error) {
      console.error('Rate limit reset hatası:', error);
    }
  }
}

/**
 * Rate limit presets - Farklı endpoint'ler için farklı limitler
 */
export const RateLimitPresets = {
  // Yorum ekleme: Saatte 5 yorum
  addComment: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 saat
  },
  
  // Kayıt olma: Günde 3 kayıt denemesi
  register: {
    maxRequests: 3,
    windowMs: 24 * 60 * 60 * 1000, // 24 saat
  },
  
  // Giriş yapma: Saatte 10 giriş denemesi
  login: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 saat
  },
  
  // Duyur/Duyuru Kaldır: Dakikada 20 işlem
  announce: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 dakika
  },
  
  // API genel: Dakikada 60 istek
  general: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 1 dakika
  },
};

/**
 * IP adresini request'ten çıkarır
 */
export function getClientIP(request: Request): string {
  // Cloudflare, Vercel vb. için proxy headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  return 'unknown';
}

/**
 * Rate limit middleware fonksiyonu
 * Next.js API route'larında kullanılmak üzere
 */
export async function withRateLimit(
  request: Request,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const clientIP = getClientIP(request);
  const limiter = new RateLimiter(clientIP, config);
  return await limiter.checkLimit();
}
