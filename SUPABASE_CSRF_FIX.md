# Supabase Client CSRF Sonsuz Döngü Sorunu - ÇÖZÜLDÜ

## Sorun
```
Error: Cannot read properties of undefined (reading 'getUser')
```

## Kök Neden
`src/lib/supabaseClient.ts` dosyasında **customFetch** fonksiyonu tanımlanmıştı. Bu fonksiyon:

1. Her Supabase API çağrısında tetikleniyordu
2. CSRF token almak için `/api/csrf-token` endpoint'ine istek atıyordu
3. Bu da başka Supabase çağrılarını tetikliyordu
4. **Sonsuz döngü** oluşuyordu
5. Supabase client제대로 initialize olamıyordu

## Yanlış Kod (ESKİ)
```typescript
const customFetch: typeof fetch = async (input, init) => {
  // CSRF token'ı cookie'den al
  const response = await fetch('/api/csrf-token', {
    credentials: 'include',
  });
  
  let csrfToken = '';
  if (response.ok) {
    const data = await response.json();
    csrfToken = data.csrfToken;
  }

  // Header'ları güncelle
  const headers = new Headers(init?.headers);
  if (csrfToken && init?.method && !['GET', 'HEAD', 'OPTIONS'].includes(init.method)) {
    headers.set('X-CSRF-Token', csrfToken);
  }

  return fetch(input, { ...init, headers });
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch, // ❌ YANLIŞ!
  },
  // ...
});
```

## Doğru Kod (YENİ)
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'heard-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
```

## Neden Yanlıştı?
- **CSRF koruması SADECE kendi API route'larımız için gerekli**
- Supabase API'sine (*.supabase.co) giden istekler için CSRF token gerekmez
- Supabase'in kendi authentication mekanizması var
- Custom fetch sonsuz döngü oluşturuyordu

## Doğru CSRF Kullanımı
CSRF token'ı **sadece kendi API route'larımıza** istek atarken kullanmalıyız:

```typescript
// ✅ DOĞRU: Kendi API'mize CSRF ile istek
const response = await fetch('/api/comments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    ...data,
    csrfToken, // CSRF token buraya ekleniyor
  }),
});
```

```typescript
// ✅ DOĞRU: Supabase'e direkt istek (CSRF gereksiz)
const { data, error } = await supabase
  .from('comments')
  .select('*');
```

## Sonuç
- ✅ Supabase client artık düzgün çalışıyor
- ✅ `getUser()` fonksiyonu hata vermiyor
- ✅ CSRF koruması hala aktif (kendi API'miz için)
- ✅ Yorum ekleme çalışıyor

## İlgili Dosyalar
- `/src/lib/supabaseClient.ts` - Düzeltildi
- `/src/app/add-review/page.tsx` - CSRF token doğru kullanılıyor
- `/src/app/api/comments/route.ts` - CSRF doğrulaması yapılıyor
