# 🛡️ Güvenlik Güncellemesi - Rate Limiting ve CAPTCHA

## Yapılan Değişiklikler

Anonim yorum sistemine **çok katmanlı güvenlik** sistemi eklendi:

### ✅ 1. Rate Limiting (Hız Sınırlama)
- **IP bazlı** istek takibi
- **Supabase** veritabanında kayıt
- **Otomatik temizleme** (24 saat)
- **Farklı endpoint'ler** için özelleştirilmiş limitler

### ✅ 2. reCAPTCHA v3 Entegrasyonu
- **Görünmez bot koruması** (kullanıcı dostu)
- **Skor bazlı filtreleme** (0.0-1.0)
- **Action tracking** ile detaylı izleme
- **Google'ın gelişmiş ML algoritmaları**

## 📦 Yeni Dosyalar

### Kütüphaneler
- `/src/lib/rateLimit.ts` - Rate limiting sistemi
- `/src/lib/recaptcha.ts` - reCAPTCHA doğrulama

### API Routes
- `/src/app/api/comments/route.ts` - Yorum ekleme API (rate limit + CAPTCHA)
- `/src/app/api/announces/route.ts` - Duyuru API (rate limit)

### Contexts
- `/src/contexts/RecaptchaContext.tsx` - reCAPTCHA Provider

### Database
- `/supabase-rate-limit-migration.sql` - Rate limit tablosu

### Dokümantasyon
- `/RATE_LIMITING_AND_CAPTCHA.md` - Detaylı kullanım kılavuzu
- `/.env.example` - Güncellenmiş örnek konfigürasyon

## 🚀 Kurulum Adımları

### 1. Bağımlılıkları Yükleyin

```bash
npm install
# Veya
yarn install
```

Yeni bağımlılık: `react-google-recaptcha-v3`

### 2. Supabase Tablosunu Oluşturun

Supabase Dashboard > SQL Editor'de çalıştırın:

```bash
# SQL dosyasının içeriğini kopyalayıp yapıştırın
cat supabase-rate-limit-migration.sql
```

Veya doğrudan dosyayı import edin.

### 3. Environment Variables Ekleyin

`.env.local` dosyası oluşturun (`.env.example`'dan kopyalayın):

```bash
cp .env.example .env.local
```

Gerekli değerleri doldurun:

```bash
# reCAPTCHA v3 (https://www.google.com/recaptcha/admin)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key
```

**reCAPTCHA Kayıt:**
1. [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin) adresine gidin
2. Yeni site ekleyin (reCAPTCHA v3 seçin)
3. Domain'inizi ekleyin (localhost için de ekleyebilirsiniz)
4. Site Key ve Secret Key'i alın

### 4. Uygulamayı Başlatın

```bash
npm run dev
```

## 📊 Limitler

| İşlem | Limit | Süre |
|-------|-------|------|
| 💬 Yorum Ekleme | 5 istek | Saat |
| 📢 Duyuru/Duyuru Kaldır | 20 istek | Dakika |
| 👤 Kayıt Olma | 3 istek | Gün |
| 🔐 Giriş Yapma | 10 istek | Saat |
| 🌐 Genel API | 60 istek | Dakika |

## 🧪 Test

### Development Modunda Test

```bash
# 1. Dev server'ı başlatın
npm run dev

# 2. Yorum formunu açın
http://localhost:3000/add-review

# 3. 5'ten fazla yorum ekleyin (saatte)
# 6. istekte rate limit hatası almalısınız
```

### Rate Limit Test (CLI)

```bash
# 6 ardışık istek gönder
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/comments \
    -H "Content-Type: application/json" \
    -d '{
      "businessName": "Test Cafe",
      "city": "İstanbul",
      "district": "Kadıköy",
      "experience": "Test için oluşturulmuş bir yorum. En az 20 karakter olmalı.",
      "rating": 5,
      "csrfToken": "test"
    }'
  echo -e "\n---Request $i completed---\n"
  sleep 1
done
```

6. istekte 429 hatası almalısınız.

## 🔍 Monitoring

### Rate Limit İstatistikleri

Supabase Dashboard'da SQL çalıştırın:

```sql
-- En aktif IP'ler
SELECT 
  identifier, 
  COUNT(*) as request_count
FROM rate_limits
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY identifier
ORDER BY request_count DESC;
```

### CAPTCHA Skorları

Server loglarında (Vercel/Netlify):

```
[LOG] Low reCAPTCHA score but passing: 0.6
[WARN] CAPTCHA verification failed. Score: 0.3
```

## ⚙️ Özelleştirme

### Rate Limit Değerlerini Değiştirme

`src/lib/rateLimit.ts`:

```typescript
export const RateLimitPresets = {
  addComment: {
    maxRequests: 10,  // Daha yüksek limit
    windowMs: 60 * 60 * 1000,
  },
};
```

### CAPTCHA Eşik Değerini Değiştirme

`src/lib/recaptcha.ts`:

```typescript
export const RecaptchaScoreThresholds = {
  STRICT: 0.7,   // Katı
  NORMAL: 0.5,   // Normal (mevcut) ⭐
  LENIENT: 0.3,  // Esnek
};
```

## 🚨 Sorun Giderme

### "Rate limit table not found" Hatası

```sql
-- Supabase'de tabloyu kontrol edin
SELECT * FROM rate_limits LIMIT 1;
```

Tablo yoksa `supabase-rate-limit-migration.sql` dosyasını çalıştırın.

### "reCAPTCHA not configured" Hatası

```bash
# Environment variable'ları kontrol edin
echo $NEXT_PUBLIC_RECAPTCHA_SITE_KEY
echo $RECAPTCHA_SECRET_KEY
```

Eksikse `.env.local` dosyasına ekleyin ve server'ı yeniden başlatın.

### CAPTCHA Test Anahtarları

Development için Google'ın test anahtarları:

```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

⚠️ **Sadece test için!** Production'da gerçek anahtarlar kullanın.

## 📚 Detaylı Dokümantasyon

Daha fazla bilgi için bakınız: [`RATE_LIMITING_AND_CAPTCHA.md`](./RATE_LIMITING_AND_CAPTCHA.md)

## ✨ Özellikler

- ✅ IP bazlı rate limiting
- ✅ reCAPTCHA v3 (görünmez)
- ✅ Supabase entegrasyonu
- ✅ Otomatik temizleme
- ✅ Özelleştirilebilir limitler
- ✅ CSRF koruması (mevcut)
- ✅ Profanity filter (mevcut)
- ✅ Response header'ları
- ✅ Action tracking
- ✅ Skor bazlı filtreleme

## 🔒 Güvenlik Notları

- **Production'da mutlaka** gerçek reCAPTCHA anahtarları kullanın
- **Secret key'leri asla** client-side'a göndermeyin
- **Rate limit loglarını** düzenli inceleyin
- **DDoS koruması** için CDN kullanın (Cloudflare/Vercel)
- **VPN/Proxy kullanıcıları** için false positive olabilir

## 🤝 Katkıda Bulunma

Güvenlik açığı bulursanız:
1. Public issue açmayın
2. Direkt iletişime geçin
3. Sorumlu açıklama (responsible disclosure) yapın

## 📝 Changelog

### v2.0.0 - 2025-10-09

#### Added
- IP bazlı rate limiting sistemi
- reCAPTCHA v3 entegrasyonu
- Supabase rate_limits tablosu
- API route korumaları
- Detaylı dokümantasyon

#### Changed
- Yorum ekleme artık API üzerinden
- CSRF koruması artırıldı

#### Security
- Bot saldırılarına karşı koruma
- Spam önleme mekanizması
- Otomatik istek filtreleme

## 📞 Destek

Sorun yaşarsanız:
1. [`RATE_LIMITING_AND_CAPTCHA.md`](./RATE_LIMITING_AND_CAPTCHA.md) dokümantasyonunu okuyun
2. Logları kontrol edin
3. Environment variable'ları doğrulayın
4. GitHub Issues'da sorun açın

---

**NOT**: Bu güvenlik güncellemesi production'a deploy edilmeden önce **mutlaka test edilmelidir**!
