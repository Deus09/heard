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

- [x] CSRF token için SameSite=Strict
- [x] HttpOnly flag aktif
- [x] Secure flag (production)
- [x] Explicit path tanımı
- [x] Makul maxAge değeri (24 saat)
- [x] PKCE flow kullanımı (Supabase auth)
- [x] Token rotation (auto refresh)
- [ ] Content Security Policy (CSP) - opsiyonel
- [ ] Cookie prefix kullanımı (__Host- / __Secure-) - opsiyonel

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

## 🔄 Güncelleme Geçmişi

### 2025-10-09
- ✅ CSRF token için SameSite=Strict ayarlandı
- ✅ Supabase auth yapılandırması eklendi
- ✅ PKCE flow aktif edildi
- ✅ Cookie security dokümantasyonu oluşturuldu
