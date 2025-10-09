# reCAPTCHA 401 Unauthorized Hatası - Çözüm

## 🚨 Problem
Google reCAPTCHA API'si **401 Unauthorized** hatası veriyor.

```
Request URL: https://www.google.com/recaptcha/api2/pat?k=6LcOrOMrAAAAAA4rHWoAibPjCdTKIJZhpS5fvHHP
Status Code: 401 Unauthorized
www-authenticate: PrivateToken challenge
```

## 🔍 Tespit Edilen Sorunlar

### 1. Domain/Origin Kayıt Hatası
- **Sorun**: reCAPTCHA Admin Console'da kayıtlı domain'ler eksik veya yanlış
- **Belirti**: `co=aHR0cHM6Ly9kdXl1ci5zb2NpYWw6NDQz` (base64: `https://duyur.social:443`)
- **Çözüm**: Admin Console'da domain kayıtlarını kontrol et

### 2. Google Cloud Protected Mode
- **Sorun**: Google Cloud Console'daki güvenlik ayarları çok katı
- **Belirti**: Tüm istekler 401 ile reddediliyor
- **Çözüm**: Protected mode'u kapatmak veya ayarlamak

### 3. Cookie/Session Problemi
- **Sorun**: reCAPTCHA session cookie'leri düzgün çalışmıyor
- **Belirti**: Her istekte yeni session başlatılıyor
- **Çözüm**: Cookie ayarlarını kontrol et

## ✅ Çözüm Adımları

### Adım 1: reCAPTCHA Admin Console Kontrolü

1. **https://www.google.com/recaptcha/admin** adresine git
2. Site key: `6LcOrOMrAAAAAA4rHWoAibPjCdTKIJZhpS5fvHHP` için ayarlara gir
3. **Domains** bölümünde şunları kontrol et:

```
✅ Kayıtlı olması gerekenler:
- duyur.social
- www.duyur.social  
- localhost (development için)
- 127.0.0.1 (development için)

❌ YANLIŞ kayıtlar:
- duyur.social:443 (port numarası olmamalı)
- https://duyur.social (protokol olmamalı)
```

4. Domain'leri güncelle ve kaydet

### Adım 2: Google Cloud Console - Protected Mode Ayarı

1. **https://console.cloud.google.com/security/recaptcha** adresine git
2. Site key'i seç
3. **Security Settings** veya **Protected Mode** ayarlarına git
4. Şu seçenekleri dene:

**Seçenek A: Protected Mode'u Kapat (Önerilen)**
```
Protected Mode: OFF
```

**Seçenek B: Challenge Threshold Ayarla**
```
Protected Mode: ON
Challenge Threshold: 0.1 (en düşük seviye)
```

**Seçenek C: Allowlist Ekle**
```
Protected Mode: ON
Allowlisted IPs/Origins:
- duyur.social
- Your deployment IP addresses
```

### Adım 3: Yeni reCAPTCHA Keys Oluştur (Acil Çözüm)

Eğer yukarıdaki adımlar işe yaramazsa, yeni keys oluştur:

1. **https://www.google.com/recaptcha/admin/create** adresine git
2. Yeni site oluştur:
   - **Label**: duyur-social-v2
   - **reCAPTCHA type**: v3
   - **Domains**:
     ```
     duyur.social
     localhost
     ```
3. **Advanced Settings**:
   - ✅ Accept all domains (geçici olarak, sonra kaldırabilirsin)
   - ✅ Allow use of v2 fallback
   
4. Yeni keys'i `.env.local` dosyasına ekle:
   ```bash
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=yeni_site_key
   RECAPTCHA_SECRET_KEY=yeni_secret_key
   ```

### Adım 4: Development Mode İçin Geçici Bypass

Geliştirme sırasında reCAPTCHA sorunlarından kaçınmak için:

**.env.local** dosyasına ekle:
```bash
# Development'ta reCAPTCHA'yı devre dışı bırak
NEXT_PUBLIC_DISABLE_RECAPTCHA=true
```

Kod güncellemesi yapılacak (aşağıda)

## 🔧 Kod Güncellemeleri

### 1. reCAPTCHA'yı Development'ta Devre Dışı Bırakma

**src/contexts/RecaptchaContext.tsx**
```tsx
export const executeRecaptcha = useCallback(async (action: string) => {
  // Development'ta reCAPTCHA'yı bypass et
  if (process.env.NEXT_PUBLIC_DISABLE_RECAPTCHA === 'true') {
    console.log('🔵 reCAPTCHA disabled in development mode');
    return 'dev_bypass_token';
  }

  // ... mevcut kod
}, []);
```

**src/lib/recaptcha.ts**
```typescript
export async function verifyRecaptcha(
  token: string,
  expectedAction?: string
): Promise<{ success: boolean; score: number; message?: string }> {
  // Development bypass
  if (token === 'dev_bypass_token') {
    console.log('🔵 reCAPTCHA verification bypassed in development');
    return { success: true, score: 1.0 };
  }

  // ... mevcut kod
}
```

### 2. Daha İyi Hata Yakalama

**src/contexts/RecaptchaContext.tsx** - geliştirilmiş error handling:

```tsx
window.grecaptcha.execute(siteKey, { action })
  .then((token: string) => {
    console.log('✅ reCAPTCHA token received:', {
      length: token?.length,
      action,
      siteKey: siteKey.substring(0, 20) + '...'
    });
    resolve(token);
  })
  .catch((error: Error) => {
    console.error('❌ reCAPTCHA execution error:', {
      message: error.message,
      action,
      siteKey: siteKey.substring(0, 20) + '...',
      stack: error.stack
    });
    // 401 hatası detaylarını logla
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      console.error('🚨 401 UNAUTHORIZED - Domain kayıtlarını kontrol et!');
      console.error('📝 Admin Console: https://www.google.com/recaptcha/admin');
      console.error('📝 Kayıtlı domain: duyur.social');
    }
    resolve(undefined);
  });
```

## 🧪 Test Adımları

1. **Console Kontrolleri**:
   ```bash
   # Browser Console'da (F12)
   # reCAPTCHA debug info
   console.log(window.grecaptcha);
   ```

2. **Network Tab Kontrolleri**:
   - Status: 200 OK olmalı (401 değil)
   - Response: `{"success": true, "score": 0.9}` benzeri

3. **Functional Test**:
   - Yorum eklemeyi dene
   - Console'da token alındığını kontrol et
   - API response'un başarılı olduğunu kontrol et

## 📊 Monitoring ve Debugging

### Browser Console'da Debug

```javascript
// reCAPTCHA durumunu kontrol et
if (window.grecaptcha) {
  console.log('✅ reCAPTCHA loaded');
  
  // Manual token test
  window.grecaptcha.ready(() => {
    window.grecaptcha.execute('6LcOrOMrAAAAAA4rHWoAibPjCdTKIJZhpS5fvHHP', {
      action: 'test'
    }).then(token => {
      console.log('Token:', token);
      
      // Token'ı backend'de test et
      fetch('/api/test-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'test' })
      }).then(r => r.json()).then(console.log);
    }).catch(console.error);
  });
} else {
  console.log('❌ reCAPTCHA not loaded');
}
```

### Backend Test Endpoint Oluştur

**src/app/api/test-recaptcha/route.ts** (yeni dosya)
```typescript
import { NextResponse } from 'next/server';
import { verifyRecaptcha } from '@/lib/recaptcha';

export async function POST(request: Request) {
  try {
    const { token, action } = await request.json();
    
    console.log('🧪 Testing reCAPTCHA verification:', { action });
    
    const result = await verifyRecaptcha(token, action);
    
    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: String(error) },
      { status: 500 }
    );
  }
}
```

## 🎯 En Muhtemel Çözüm

**401 hatası genellikle domain kayıt sorunudur.** İşte hızlı kontrol listesi:

### ✅ Hemen Yapılacaklar (5 dakika)

1. **reCAPTCHA Admin Console**
   - URL: https://www.google.com/recaptcha/admin
   - Site key bulup domain'leri kontrol et
   - Eksikse ekle: `duyur.social`, `localhost`

2. **Google Cloud Console**
   - URL: https://console.cloud.google.com/security/recaptcha
   - Protected mode'u kapat veya threshold'u düşür

3. **Tarayıcı Cache Temizle**
   - Hard refresh: Ctrl+Shift+R (veya Cmd+Shift+R)
   - Browser'ı yeniden başlat

4. **Test Et**
   - Yorum eklemeyi dene
   - Network tab'da status 200 olmalı

## 📞 Hala Çalışmıyorsa

1. **Yeni keys oluştur** (Adım 3'e dön)
2. **Geçici bypass kullan** (Development için - Adım 4)
3. **reCAPTCHA versiyonunu değiştir** (v3 → v2 invisible)

## 🔗 Faydalı Linkler

- reCAPTCHA Admin: https://www.google.com/recaptcha/admin
- Google Cloud Console: https://console.cloud.google.com/security/recaptcha
- reCAPTCHA Docs: https://developers.google.com/recaptcha/docs/v3
- Common Errors: https://developers.google.com/recaptcha/docs/faq#im-getting-a-401-unauthorized-error

## ⚠️ Kritik Notlar

- **Domain'lerde port numarası kullanma** (`:443`, `:3000` vb.)
- **Protokol kullanma** (`https://`, `http://` vb.)
- **Sadece base domain** kullan (`duyur.social`)
- **Wildcard destekleniyor**: `*.duyur.social` (tüm subdomain'ler için)

---

**En son güncelleme**: 2025-10-09
**Durum**: 🔴 Kritik - 401 Unauthorized
**Öncelik**: P0 - Acil çözüm gerekli
