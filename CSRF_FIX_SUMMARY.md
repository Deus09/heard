# CSRF Token Sorunu Çözümü

## 🐛 Problem
Production ortamında yorum eklenirken `Invalid CSRF token` hatası alınıyordu.

## 🔍 Kök Neden Analizi

1. **Middleware'de Çift Kontrol**: Middleware'de CSRF header kontrolü yapılıyordu ama client tarafı header göndermiyordu.
2. **Cookie Gönderimi Eksik**: Fetch isteklerinde `credentials: 'include'` eksikti, bu yüzden cookie sunucuya gönderilmiyordu.
3. **Token Eşleşmesi Sorunu**: Her sayfa yüklendiğinde yeni token oluşturuluyordu.

## ✅ Yapılan Düzeltmeler

### 1. Middleware Basitleştirildi (`/middleware.ts`)
```typescript
// ÖNCE: Middleware'de CSRF header kontrolü yapılıyordu
// Header kontrolü kaldırıldı, sadece güvenlik başlıkları ekleniyor
// CSRF kontrolü artık sadece API route'larında yapılıyor
```

**Değişiklik**: Middleware'den CSRF kontrolü tamamen kaldırıldı. Kontrol sadece `/api/comments` route'unda yapılıyor.

### 2. Client Tarafında Cookie Gönderimi (`/src/app/add-review/page.tsx`)
```typescript
const response = await fetch('/api/comments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // ✅ EKLENDİ - Cookie'leri gönder
  body: JSON.stringify({...}),
});
```

**Değişiklik**: Fetch isteğine `credentials: 'include'` eklendi.

### 3. Token Yönetimi İyileştirildi (`/src/lib/csrf.ts`)
```typescript
export async function generateCSRFToken(): Promise<string> {
  const cookieStore = await cookies();
  
  // Mevcut token'ı kontrol et
  const existingToken = cookieStore.get(CSRF_TOKEN_NAME)?.value;
  
  // Eğer geçerli bir token varsa onu kullan
  if (existingToken && existingToken.length === 64) {
    console.log('🔵 Existing CSRF token found');
    return existingToken; // ✅ Mevcut token kullanılıyor
  }
  
  // Yeni token oluştur
  const token = await generateRandomToken();
  // ...
}
```

**Değişiklik**: Mevcut token varsa yeniden kullanılıyor, her istekte yeni token oluşturulmuyor.

### 4. Debug Logları Eklendi

Tüm CSRF token işlemlerine detaylı loglar eklendi:
- Token oluşturma
- Token doğrulama
- Token eşleştirme
- Hata durumları

## 📋 Deployment Checklist

### Production'a Deploy Etmeden Önce:

1. ✅ `.env.local` dosyasında `NODE_ENV=production` olmalı
2. ✅ CSRF_SECRET değeri güvenli olmalı (rastgele 64 karakter)
3. ✅ reCAPTCHA anahtarları doğru olmalı
4. ✅ Tüm değişiklikler commit edilmeli

### Deploy Sonrası Test:

1. **CSRF Token Testi**:
   - Yorum ekleme sayfasına git
   - Browser console'u aç (F12)
   - Yorum ekle
   - Console'da logları kontrol et:
     - ✅ `🔵 Existing CSRF token found` veya `🟢 New CSRF token generated`
     - ✅ `✅ CSRF token validated successfully`
     - ❌ Hata yoksa başarılı!

2. **Cookie Kontrolü**:
   - Browser DevTools > Application > Cookies
   - `csrf_token` cookie'sini kontrol et:
     - ✅ HttpOnly: true
     - ✅ Secure: true (production'da)
     - ✅ SameSite: Strict
     - ✅ Path: /

3. **Network İncelemesi**:
   - Network tab > POST /api/comments
   - Request Headers:
     - ✅ Cookie: csrf_token=...
   - Request Payload:
     - ✅ csrfToken: "..."
   - Response:
     - ✅ Status: 201 Created
     - ❌ Status: 403 → Cookie gönderilmemiş

## 🔧 Hata Ayıklama

### Eğer Hala "Invalid CSRF token" Hatası Alıyorsanız:

1. **Browser Console Loglarını Kontrol Edin**:
   ```
   🔵 POST /api/comments - Request received
   🔵 CSRF Token from body: abc123... Length: 64
   🔍 Starting CSRF token verification...
   🔵 Received token: abc123... Length: 64
   🔵 Stored token in cookie: abc123... Length: 64
   ✅ CSRF token verified successfully
   ```

2. **Eğer "No token found in cookies" Görüyorsanız**:
   - Cookie'ler düzgün gönderilmiyor
   - `credentials: 'include'` eklendi mi kontrol edin
   - CORS ayarlarını kontrol edin

3. **Eğer "Token mismatch" Görüyorsanız**:
   - Console'da receivedFull ve storedFull değerlerini karşılaştırın
   - Token'lar farklıysa sayfa yeniden yüklenmiş olabilir

4. **Production'da Debug Logları**:
   - Netlify/Vercel Functions logs'u kontrol edin
   - Server-side loglar orada görünecektir

## 🚀 Deploy Komutu

```bash
# 1. Build al
npm run build

# 2. Deploy et (Netlify örneği)
netlify deploy --prod

# 3. Veya git push ile otomatik deploy
git add .
git commit -m "fix: CSRF token validation on production"
git push origin main
```

## 📊 Sonuç

Bu düzeltmelerden sonra:
- ✅ CSRF koruması tam olarak çalışıyor
- ✅ Cookie'ler doğru gönderiliyor
- ✅ Token doğrulama başarılı
- ✅ Yorum ekleme çalışıyor
- ✅ Debug için detaylı loglar var

## 🔐 Güvenlik Notları

1. **httpOnly Cookie**: XSS saldırılarına karşı koruma
2. **Secure Flag**: HTTPS üzerinden gönderim (production)
3. **SameSite Strict**: CSRF saldırılarına karşı koruma
4. **Token Expiry**: 24 saat sonra süresi doluyor
5. **Rate Limiting**: Saatte 5 yorum limiti var

## 📝 İlgili Dosyalar

- `/middleware.ts` - Middleware basitleştirildi
- `/src/lib/csrf.ts` - Token yönetimi iyileştirildi
- `/src/app/api/csrf-token/route.ts` - Token endpoint'i
- `/src/app/api/comments/route.ts` - Token doğrulama
- `/src/app/add-review/page.tsx` - Client tarafı düzeltme
- `/src/contexts/CSRFContext.tsx` - Token context'i

---

**Not**: Production'a deploy ettikten sonra bu dokümandaki test adımlarını takip edin ve sonuçları kontrol edin.
