# Rate Limiting ve CAPTCHA Güvenlik Entegrasyonu

Bu dokümantasyon, anonim yorum sistemine eklenen rate limiting ve CAPTCHA güvenlik özelliklerini açıklamaktadır.

## 📋 Genel Bakış

Anonim yorum sisteminde spam ve otomatik saldırılara karşı iki katmanlı güvenlik sistemi uygulanmıştır:

1. **Rate Limiting (Hız Sınırlama)** - IP bazlı istek sınırlama
2. **reCAPTCHA v3** - Google'ın görünmez bot koruma sistemi

## 🛡️ Rate Limiting

### Özellikler

- **IP Bazlı Takip**: Her kullanıcının IP adresi izlenir
- **Supabase Tabanlı**: Veriler Supabase PostgreSQL'de saklanır
- **Otomatik Temizleme**: 24 saatten eski kayıtlar otomatik silinir
- **Farklı Limitler**: Endpoint'e göre özelleştirilebilir limitler

### Limitler

| Endpoint | Limit | Zaman Aralığı |
|----------|-------|---------------|
| Yorum Ekleme | 5 istek | Saat başına |
| Duyuru/Duyuru Kaldır | 20 istek | Dakika başına |
| Kayıt Olma | 3 istek | Günlük |
| Giriş Yapma | 10 istek | Saat başına |
| Genel API | 60 istek | Dakika başına |

### Kurulum

#### 1. Supabase Tablosunu Oluşturun

```sql
-- supabase-rate-limit-migration.sql dosyasını çalıştırın
psql -h your-supabase-host -d your-database -f supabase-rate-limit-migration.sql
```

Veya Supabase Dashboard > SQL Editor'de şu komutu çalıştırın:

```sql
-- Rate limiting tablosu
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_created_at ON rate_limits(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_created_at ON rate_limits(identifier, created_at);
```

#### 2. API Route'larında Kullanım

```typescript
import { withRateLimit, RateLimitPresets } from '@/lib/rateLimit';

export async function POST(request: Request) {
  // Rate limiting kontrolü
  const rateLimit = await withRateLimit(request, RateLimitPresets.addComment);
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Çok fazla istek',
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

  // İşlemi gerçekleştir...
}
```

### Response Headers

Rate limiting aktif olduğunda şu header'lar döner:

```
X-RateLimit-Limit: 5           # Maksimum istek sayısı
X-RateLimit-Remaining: 3       # Kalan istek hakkı
X-RateLimit-Reset: 2025-10-09T15:30:00Z  # Sıfırlama zamanı
Retry-After: 3600              # Tekrar deneme süresi (saniye)
```

## 🤖 reCAPTCHA v3 Entegrasyonu

### Özellikler

- **Görünmez Doğrulama**: Kullanıcı deneyimini bozmaz
- **Skor Bazlı**: 0.0 (bot) ile 1.0 (insan) arası skor
- **Action Tracking**: Her işlem için farklı action adı
- **Esnek Eşik Değerleri**: İhtiyaca göre ayarlanabilir

### Kurulum

#### 1. Google reCAPTCHA Kayıt

1. [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)'a gidin
2. Yeni site kaydedin (reCAPTCHA v3)
3. Site Key ve Secret Key'i alın

#### 2. Environment Variables

`.env.local` dosyasına ekleyin:

```bash
# reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

⚠️ **ÖNEMLİ**: 
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - Client-side için (public)
- `RECAPTCHA_SECRET_KEY` - Server-side için (private, asla expose etmeyin!)

#### 3. Kullanım

Frontend'de (React Component):

```tsx
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

function MyForm() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async () => {
    if (!executeRecaptcha) {
      console.log('reCAPTCHA henüz hazır değil');
      return;
    }

    const token = await executeRecaptcha('submit_comment');
    
    // API'ye token ile istek gönder
    const response = await fetch('/api/comments', {
      method: 'POST',
      body: JSON.stringify({
        // ... diğer veriler
        recaptchaToken: token,
      }),
    });
  };
}
```

Backend'de (API Route):

```typescript
import { verifyRecaptcha, RecaptchaActions } from '@/lib/recaptcha';

export async function POST(request: Request) {
  const { recaptchaToken } = await request.json();

  const result = await verifyRecaptcha(
    recaptchaToken,
    RecaptchaActions.SUBMIT_COMMENT
  );

  if (!result.success) {
    return NextResponse.json(
      { error: 'Bot tespiti başarısız' },
      { status: 403 }
    );
  }

  // İşlemi gerçekleştir...
}
```

### Skor Eşikleri

```typescript
export const RecaptchaScoreThresholds = {
  STRICT: 0.7,   // Yüksek güvenlik (bazı gerçek kullanıcılar engellenebilir)
  NORMAL: 0.5,   // Normal güvenlik (önerilen) ⭐
  LENIENT: 0.3,  // Düşük güvenlik (daha az bot engellenir)
};
```

Mevcut implementasyonda **0.5 (NORMAL)** eşik değeri kullanılmaktadır.

### Action Adları

```typescript
export const RecaptchaActions = {
  SUBMIT_COMMENT: 'submit_comment',
  LOGIN: 'login',
  REGISTER: 'register',
  ANNOUNCE: 'announce',
};
```

## 🔄 API Endpoints

### POST /api/comments

Yeni yorum oluşturur.

**Rate Limit**: 5 istek/saat  
**CAPTCHA**: Gerekli (production)

**Request Body**:
```json
{
  "businessName": "string",
  "city": "string",
  "district": "string",
  "experience": "string",
  "rating": 1-5,
  "anonymous": boolean,
  "csrfToken": "string",
  "recaptchaToken": "string"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "comment": { /* comment object */ },
  "message": "Yorumunuz başarıyla eklendi"
}
```

**Response (Rate Limited)**:
```json
{
  "error": "Çok fazla yorum eklemeye çalıştınız",
  "message": "Lütfen 60 dakika sonra tekrar deneyin",
  "retryAfter": 3600
}
```

**Response (CAPTCHA Failed)**:
```json
{
  "error": "Bot tespiti başarısız oldu",
  "message": "Sistem şüpheli aktivite tespit etti"
}
```

### POST /api/announces

Yorumu duyurur.

**Rate Limit**: 20 istek/dakika  
**CAPTCHA**: Yok  
**Auth**: Gerekli

### DELETE /api/announces

Duyuruyu kaldırır.

**Rate Limit**: 20 istek/dakika  
**CAPTCHA**: Yok  
**Auth**: Gerekli

## 🧪 Test

### Development Modunda

Development modunda CAPTCHA zorunlu değildir:

```typescript
// .env.local
# CAPTCHA'yı test etmek için:
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_test_key
RECAPTCHA_SECRET_KEY=your_test_secret

# CAPTCHA'yı devre dışı bırakmak için:
# (environment variable'ları kaldırın veya comment out yapın)
```

### Rate Limiting Test

```bash
# Aynı endpoint'e ardışık 6 istek gönderin
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/comments \
    -H "Content-Type: application/json" \
    -d '{"businessName":"Test","city":"İstanbul","district":"Kadıköy","experience":"Test deneyimi","rating":5,"csrfToken":"test"}'
  echo ""
done
```

6. istekte 429 (Too Many Requests) hatası almalısınız.

## 📊 Monitoring

### Rate Limit İstatistikleri

Supabase Dashboard'da:

```sql
-- En çok istek gönderen IP'ler (son 24 saat)
SELECT 
  identifier, 
  COUNT(*) as request_count,
  MAX(created_at) as last_request
FROM rate_limits
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY identifier
ORDER BY request_count DESC
LIMIT 10;

-- Saatlik istek dağılımı
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as request_count
FROM rate_limits
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

### CAPTCHA Skorları

API loglarında düşük skorları izleyin:

```bash
# Vercel/Netlify logs
# Şu mesajları arayın:
"Low reCAPTCHA score but passing: 0.6"
"CAPTCHA verification failed: Suspicious activity detected Score: 0.3"
```

## 🔧 Özelleştirme

### Rate Limit Değerlerini Değiştirme

`src/lib/rateLimit.ts`:

```typescript
export const RateLimitPresets = {
  addComment: {
    maxRequests: 10,  // 5'ten 10'a çıkardık
    windowMs: 60 * 60 * 1000, // 1 saat
  },
  // ...
};
```

### CAPTCHA Eşik Değerini Değiştirme

`src/app/api/comments/route.ts`:

```typescript
// Mevcut: 0.5
const isHuman = score >= 0.5;

// Daha katı: 0.7
const isHuman = score >= 0.7;

// Daha esnek: 0.3
const isHuman = score >= 0.3;
```

## 🚨 Sorun Giderme

### Rate Limit Çalışmıyor

1. Supabase tablosunun oluşturulduğunu kontrol edin
2. RLS (Row Level Security) politikalarını kontrol edin
3. Supabase service role key'in doğru olduğunu kontrol edin

```sql
-- Tablo var mı?
SELECT * FROM rate_limits LIMIT 1;

-- RLS aktif mi?
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'rate_limits';
```

### CAPTCHA Çalışmıyor

1. Environment variable'ların doğru olduğunu kontrol edin:
   ```bash
   echo $NEXT_PUBLIC_RECAPTCHA_SITE_KEY
   echo $RECAPTCHA_SECRET_KEY
   ```

2. Google reCAPTCHA Admin Console'da domain'in eklendiğini kontrol edin

3. Browser console'da hata var mı kontrol edin

4. Test için Google'ın test key'lerini kullanın:
   - Site key: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
   - Secret key: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

### "Too Many Requests" Hatası

Normal bir kullanıcı için fazla mı sıkı?

```typescript
// Limiti artırın veya
// Manuel olarak temizleyin:
import { RateLimiter } from '@/lib/rateLimit';
await RateLimiter.resetIdentifier('192.168.1.1');
```

## 📝 Best Practices

1. **Production'da her zaman CAPTCHA kullanın**
2. **Rate limit değerlerini kullanıcı davranışına göre ayarlayın**
3. **Logları düzenli inceleyin** (şüpheli IP'ler, düşük CAPTCHA skorları)
4. **Eski rate limit kayıtlarını temizleyin** (otomatik trigger aktif)
5. **CAPTCHA secret key'i asla client-side'a göndermeyin**
6. **Rate limit header'larını frontend'de gösterin** (kullanıcı deneyimi için)

## 🔒 Güvenlik Notları

- ✅ CSRF koruması aktif
- ✅ Rate limiting IP bazlı
- ✅ reCAPTCHA v3 görünmez
- ✅ SQL Injection koruması (Supabase ORM)
- ✅ Input validasyonu
- ✅ Profanity filter
- ⚠️ DDoS koruması için CDN/WAF kullanın (Cloudflare, Vercel)
- ⚠️ VPN/Proxy kullanıcıları için rate limit sorunları olabilir

## 📚 Kaynaklar

- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/v3)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## 📞 Destek

Sorun yaşarsanız:
1. Logları kontrol edin
2. Environment variable'ları doğrulayın
3. Supabase bağlantısını test edin
4. GitHub Issues'da sorun açın
