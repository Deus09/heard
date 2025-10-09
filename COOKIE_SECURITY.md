# Cookie Security - SameSite Ayarları

Bu dokümantasyon, Heard platformunda kullanılan cookie'lerin güvenlik ayarlarını açıklar.

## 🍪 Cookie Tipleri

### 1. CSRF Token Cookie

**İsim:** `csrf_token`  
**Amaç:** Cross-Site Request Forgery (CSRF) saldırılarına karşı koruma  
**Lokasyon:** `src/lib/csrf.ts`

```typescript
{
  httpOnly: true,              // JavaScript erişimi engellenir (XSS koruması)
  secure: true,                // Sadece HTTPS üzerinden gönderilir (production)
  sameSite: 'strict',          // Cross-site isteklerde gönderilmez
  maxAge: 60 * 60 * 24,       // 24 saat
  path: '/'                    // Tüm path'lerde geçerli
}
```

**SameSite: Strict**
- En güvenli seviye
- Cookie sadece aynı site'dan gelen isteklerde gönderilir
- Üçüncü parti sitelerden gelen isteklerde cookie gönderilmez
- CSRF saldırılarına karşı maksimum koruma sağlar

### 2. Supabase Auth Session

**İsim:** `heard-auth` (localStorage key)  
**Amaç:** Kullanıcı kimlik doğrulama session'ı  
**Lokasyon:** `src/lib/supabase.ts` ve `src/lib/supabaseClient.ts`

```typescript
{
  storageKey: 'heard-auth',    // LocalStorage anahtarı
  autoRefreshToken: true,      // Token otomatik yenilenir
  persistSession: true,        // Session kalıcı olarak saklanır
  detectSessionInUrl: true,    // URL'den session algılanır
  flowType: 'pkce',           // PKCE (Proof Key for Code Exchange) güvenlik akışı
}
```

**Not:** Supabase auth bilgileri localStorage'da saklanır ve HTTP cookie olarak gönderilmez. Bu, Supabase'in önerilen yaklaşımıdır.

## 🔒 Güvenlik Seviyeleri

### SameSite Özellikleri

1. **Strict** (Mevcut Kullanım - CSRF token)
   - ✅ En yüksek güvenlik
   - ✅ CSRF'ye karşı tam koruma
   - ❌ Dış linklerden gelindiğinde oturum kaybı
   - **Kullanım Durumu:** CSRF token gibi kritik güvenlik cookie'leri

2. **Lax** (Alternatif)
   - ✅ İyi güvenlik
   - ✅ GET istekleri için dış linklerden çalışır
   - ✅ Kullanıcı deneyimi daha iyi
   - ❌ Bazı CSRF saldırılarına karşı hassas olabilir
   - **Kullanım Durumu:** Session cookie'leri, auth token'ları

3. **None**
   - ❌ Düşük güvenlik
   - ✅ Tüm cross-site isteklerde çalışır
   - ⚠️ Secure attribute zorunlu
   - **Kullanım Durumu:** Üçüncü parti entegrasyonlar, iframe'ler

## 🛡️ Mevcut Korumalar

### CSRF Koruması

1. **Double Submit Cookie Pattern**
   - Cookie'de token saklanır
   - Header'da token gönderilir
   - Middleware her ikisini karşılaştırır

2. **SameSite=Strict**
   - Cross-site isteklerde cookie gönderilmez
   - Double Submit pattern ile birlikte maksimum güvenlik

3. **HttpOnly Flag**
   - JavaScript ile cookie erişimi engellenir
   - XSS saldırılarına karşı koruma

### XSS Koruması

- HttpOnly cookie'ler
- Content Security Policy (CSP) - gerekirse eklenebilir
- Input sanitization (küfür filtresi aktif)
- React'in built-in XSS koruması

### HTTPS Zorunluluğu

```typescript
secure: process.env.NODE_ENV === 'production'
```

Production ortamında tüm cookie'ler sadece HTTPS üzerinden gönderilir.

## 📋 Best Practices Checklist

### Cookie Güvenliği
- [x] CSRF token için SameSite=Strict
- [x] HttpOnly flag aktif
- [x] Secure flag (production)
- [x] Explicit path tanımı
- [x] Makul maxAge değeri (24 saat)
- [x] PKCE flow kullanımı (Supabase auth)
- [x] Token rotation (auto refresh)
- [ ] Cookie prefix kullanımı (__Host- / __Secure-) - opsiyonel

### HTTP Güvenlik Başlıkları
- [x] Content-Security-Policy (CSP)
- [x] X-Frame-Options
- [x] X-Content-Type-Options
- [x] Referrer-Policy
- [x] Permissions-Policy
- [x] Strict-Transport-Security (HSTS)
- [x] X-DNS-Prefetch-Control
- [x] X-XSS-Protection

## 🔄 Token Yönetimi

### CSRF Token Lifecycle

1. **Oluşturma**: `/api/csrf-token` GET isteği
2. **Saklama**: HttpOnly cookie + localStorage
3. **Kullanım**: Her POST/PUT/DELETE isteğinde header'da
4. **Doğrulama**: Middleware seviyesinde
5. **Yenileme**: 24 saatte bir otomatik

### Supabase Session Lifecycle

1. **Login**: Kullanıcı giriş yapar
2. **Saklama**: LocalStorage'da saklanır
3. **Refresh**: Token süresi dolmadan otomatik yenilenir
4. **Logout**: LocalStorage temizlenir

## 🌐 Cross-Origin Considerations

### Mevcut Ayarlar

- **Same-Origin Only**: Tüm cookie'ler aynı domain'den çalışır
- **credentials: 'include'**: Fetch isteklerinde cookie'ler gönderilir

### Farklı Domain Kullanımı İçin

Eğer API ve frontend farklı domain'lerde olsaydı:

```typescript
// SameSite=None ve Secure gerekli
{
  sameSite: 'none',
  secure: true,
  // CORS yapılandırması
}
```

## 🧪 Test Senaryoları

### CSRF Koruması Testi

```bash
# Cookie olmadan istek
curl -X POST https://heard.app/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"review": "test"}'
# Sonuç: 403 Forbidden

# Yanlış token ile istek
curl -X POST https://heard.app/api/reviews \
  -H "X-CSRF-Token: wrong-token" \
  -H "Cookie: csrf_token=correct-token" \
  -d '{"review": "test"}'
# Sonuç: 403 Forbidden

# Doğru token ile istek
curl -X POST https://heard.app/api/reviews \
  -H "X-CSRF-Token: correct-token" \
  -H "Cookie: csrf_token=correct-token" \
  -d '{"review": "test"}'
# Sonuç: 200 OK
```

### SameSite Testi

1. Farklı bir domain'den iframe içinde açma
2. Cross-site link'ten gelme
3. Form submit'i farklı domain'den

**Beklenen Sonuç:** Cookie'ler gönderilmemeli

## 📚 Referanslar

- [MDN - SameSite cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [OWASP - CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js Cookies](https://nextjs.org/docs/app/api-reference/functions/cookies)

## �️ HTTP Güvenlik Başlıkları

### Content-Security-Policy (CSP)

**Lokasyon:** `next.config.ts`

CSP, sayfanın hangi kaynaklardan içerik yükleyebileceğini kontrol eder.

```typescript
"default-src 'self'" // Varsayılan: sadece kendi domain
"script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net" // Script kaynakları
"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com" // CSS kaynakları
"font-src 'self' https://fonts.gstatic.com" // Font kaynakları
"img-src 'self' data: blob: https:" // Resim kaynakları
"connect-src 'self' https://*.supabase.co wss://*.supabase.co" // API bağlantıları
"frame-ancestors 'none'" // iframe içine alınamaz
"base-uri 'self'" // <base> tag'i sadece kendi domain
"form-action 'self'" // Form submit sadece kendi domain
```

**Koruma:**
- XSS saldırılarını engeller
- Code injection'ı önler
- Güvenilmeyen kaynaklardan içerik yüklemeyi engeller

### X-Frame-Options

**Değer:** `DENY`

Sayfanın iframe içinde gösterilmesini tamamen engeller.

**Koruma:**
- Clickjacking saldırılarını önler
- Frame-based saldırıları engeller

**Alternatifler:**
- `SAMEORIGIN`: Sadece aynı domain'den iframe edilebilir
- `ALLOW-FROM uri`: Belirli bir domain'den iframe edilebilir (deprecated)

### X-Content-Type-Options

**Değer:** `nosniff`

Tarayıcının MIME type sniffing yapmasını engeller.

**Koruma:**
- MIME type confusion saldırılarını önler
- Dosyaların yanlış tipte yorumlanmasını engeller
- XSS saldırı vektörlerini azaltır

### Referrer-Policy

**Değer:** `strict-origin-when-cross-origin`

Referrer bilgisinin ne kadar paylaşılacağını kontrol eder.

**Davranış:**
- Aynı origin: Tam URL gönderilir
- Cross-origin (HTTPS→HTTPS): Sadece origin gönderilir
- Cross-origin (HTTPS→HTTP): Referrer gönderilmez

**Koruma:**
- Kullanıcı gizliliği
- Hassas URL parametrelerinin sızmasını önler

### Permissions-Policy

**Değer:** `camera=(), microphone=(), geolocation=(), interest-cohort=()`

Tarayıcı özelliklerinin kullanımını kısıtlar.

**Kısıtlanan Özellikler:**
- `camera`: Kamera erişimi devre dışı
- `microphone`: Mikrofon erişimi devre dışı
- `geolocation`: Konum erişimi devre dışı
- `interest-cohort`: FLoC tracking devre dışı

**Koruma:**
- İzinsiz feature kullanımını önler
- Tracking'i engeller
- Privacy korur

### Strict-Transport-Security (HSTS)

**Değer:** `max-age=31536000; includeSubDomains`

Tarayıcıya HTTPS kullanımını zorlar.

**Parametreler:**
- `max-age=31536000`: 1 yıl boyunca HTTPS zorunlu
- `includeSubDomains`: Alt domain'ler için de geçerli

**Koruma:**
- Man-in-the-middle saldırılarını önler
- SSL stripping saldırılarını engeller
- HTTPS downgrade'ini önler

### X-DNS-Prefetch-Control

**Değer:** `on`

DNS prefetching'i kontrol eder.

**Koruma:**
- Performans optimizasyonu
- DNS çözümleme süresini azaltır

### X-XSS-Protection

**Değer:** `1; mode=block`

Tarayıcının XSS filtresini aktif eder (eski tarayıcılar için).

**Parametreler:**
- `1`: XSS filtresi aktif
- `mode=block`: XSS tespit edilirse sayfayı yükleme

**Not:** Modern tarayıcılarda CSP tercih edilir, ancak geriye dönük uyumluluk için tutulur.

## 🔧 Yapılandırma Dosyaları

### next.config.ts

Statik güvenlik başlıkları burada tanımlanır:

```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        // Tüm güvenlik başlıkları
      ],
    },
  ];
}
```

### middleware.ts

Runtime güvenlik kontrolleri burada yapılır:

```typescript
export async function middleware(request: NextRequest) {
  // CSRF kontrolü
  // Runtime güvenlik başlıkları
  const response = NextResponse.next();
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  return response;
}
```

## 🧪 Güvenlik Başlıklarını Test Etme

### Online Araçlar

1. **Security Headers**: https://securityheaders.com
2. **Mozilla Observatory**: https://observatory.mozilla.org
3. **SSL Labs**: https://www.ssllabs.com/ssltest/

### Manuel Test

```bash
# Tüm başlıkları görüntüle
curl -I https://heard.app

# Belirli bir başlığı kontrol et
curl -I https://heard.app | grep -i content-security-policy
```

### Tarayıcı DevTools

1. Network sekmesini aç
2. Herhangi bir isteği seç
3. Headers sekmesinde Response Headers'a bak

## 📊 Güvenlik Skoru Hedefleri

### SecurityHeaders.com

- **A+**: Mükemmel (Hedef)
- **A**: Çok iyi
- **B**: İyi
- **C-F**: İyileştirme gerekli

### Beklenen Skor

Mevcut yapılandırma ile **A veya A+** skoru beklenir.

**Eksik olabilecek özellikler:**
- `preload` direktifi (HSTS)
- Daha katı CSP kuralları
- `__Host-` cookie prefix

## �🔄 Güncelleme Geçmişi

### 2025-10-09 (v2)
- ✅ Content-Security-Policy (CSP) eklendi
- ✅ X-Frame-Options eklendi
- ✅ X-Content-Type-Options eklendi
- ✅ Referrer-Policy eklendi
- ✅ Permissions-Policy eklendi
- ✅ Strict-Transport-Security (HSTS) eklendi
- ✅ X-DNS-Prefetch-Control eklendi
- ✅ X-XSS-Protection eklendi
- ✅ next.config.ts güvenlik başlıkları yapılandırması
- ✅ middleware.ts runtime başlıkları

### 2025-10-09 (v1)
- ✅ CSRF token için SameSite=Strict ayarlandı
- ✅ Supabase auth yapılandırması eklendi
- ✅ PKCE flow aktif edildi
- ✅ Cookie security dokümantasyonu oluşturuldu
