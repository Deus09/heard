# CSRF Koruması Implementasyonu

Bu proje artık CSRF (Cross-Site Request Forgery) saldırılarına karşı korunmaktadır.

## Nasıl Çalışır?

### 1. Token Oluşturma
- Kullanıcı uygulamayı açtığında otomatik olarak bir CSRF token oluşturulur
- Token httpOnly cookie olarak saklanır (XSS saldırılarına karşı korunmuş)
- Token aynı zamanda client-side'da kullanılmak üzere döndürülür

### 2. Token Doğrulama
- Tüm POST, PUT, DELETE, PATCH isteklerinde `X-CSRF-Token` header'ı kontrol edilir
- Header'daki token, cookie'deki token ile karşılaştırılır
- Eşleşme yoksa istek reddedilir (403 Forbidden)

### 3. Otomatik Entegrasyon
- Supabase client özel bir fetch fonksiyonu kullanır
- Her istek otomatik olarak CSRF token'ı header'a ekler
- Manuel işlem gerektirmez

## Kullanım

### Client-Side

CSRF token'ı React Context üzerinden kullanabilirsiniz:

```tsx
import { useCSRF } from '@/contexts/CSRFContext';

function MyComponent() {
  const { csrfToken, isLoading, refreshToken } = useCSRF();
  
  // Token otomatik olarak tüm Supabase isteklerine eklenir
  // Manuel kullanım gerekirse:
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    headers: {
      'X-CSRF-Token': csrfToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}
```

### Server-Side (API Routes)

API route'larınız otomatik olarak korunur. Yeni API route eklediğinizde:

```typescript
// /app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // CSRF doğrulaması otomatik olarak yapılır
  // Buraya ulaşan istekler zaten doğrulanmıştır
  
  const body = await request.json();
  // İşlemlerinizi yapın
  
  return NextResponse.json({ success: true });
}
```

## Konfigürasyon

`.env.local` dosyasında CSRF secret'ı ayarlayın:

```bash
# Güçlü bir random secret oluşturun
CSRF_SECRET=your-random-32-byte-hex-string

# Terminal'de oluşturmak için:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Güvenlik Notları

1. **Production'da mutlaka güçlü bir CSRF_SECRET kullanın**
2. Token'lar httpOnly cookie olarak saklanır (XSS'e karşı korunmuş)
3. SameSite=Strict cookie ayarı kullanılır
4. Token'lar 24 saat geçerlidir
5. Timing attack'lara karşı güvenli karşılaştırma kullanılır

## Test Etme

CSRF korumasını test etmek için:

```bash
# Geçerli token ile (başarılı)
curl -X POST http://localhost:3000/api/test \
  -H "X-CSRF-Token: valid-token" \
  -H "Cookie: csrf_token=valid-token" \
  -H "Content-Type: application/json" \
  -d '{"data": "test"}'

# Token olmadan (hata)
curl -X POST http://localhost:3000/api/test \
  -H "Content-Type: application/json" \
  -d '{"data": "test"}'
```

## Dosya Yapısı

```
src/
├── lib/
│   ├── csrf.ts                    # CSRF token yönetim fonksiyonları (Node.js runtime)
│   ├── supabaseClient.ts          # CSRF korumalı Supabase client
│   └── supabase.ts                # Eski client (deprecated)
├── contexts/
│   └── CSRFContext.tsx            # React context provider
├── app/
│   ├── layout.tsx                 # CSRFProvider wrapper
│   └── api/
│       └── csrf-token/
│           └── route.ts           # Token endpoint (Node.js runtime)
└── middleware.ts                   # Next.js middleware (Edge Runtime - basit header kontrolü)
```

## Teknik Detaylar

### Edge Runtime vs Node.js Runtime

Next.js middleware Edge Runtime'da çalışır ve Node.js `crypto` modülünü desteklemez. Bu nedenle:

1. **Middleware (Edge Runtime)**: Basit string karşılaştırması ile header ve cookie'yi kontrol eder
2. **API Routes (Node.js Runtime)**: Güvenli token oluşturma ve timing-safe karşılaştırma yapar

Bu yaklaşım hem performans hem de güvenlik açısından optimal bir dengedir.

## Hata Ayıklama

CSRF hatası alıyorsanız:

1. Browser console'da CSRF token'ın yüklendiğini kontrol edin
2. Network tab'de `X-CSRF-Token` header'ının gönderildiğini doğrulayın
3. Cookie'de `csrf_token`'ın mevcut olduğunu kontrol edin
4. `.env.local` dosyasında `CSRF_SECRET` ayarlandığını doğrulayın

## Daha Fazla Bilgi

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
