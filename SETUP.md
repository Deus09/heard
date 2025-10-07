# Heard - İş Deneyimi Paylaşım Platformu

Heard, kullanıcıların iş deneyimlerini anonim olarak paylaşabildikleri bir Next.js platformudur. Supabase ile desteklenmektedir.

## 🚀 Kurulum

### 1. Gerekli Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Supabase Projesi Oluşturun

1. [Supabase Dashboard](https://supabase.com) adresine gidin
2. "New Project" oluşturun
3. Proje ayarlarından aşağıdaki bilgileri alın:
   - Project URL
   - Anon/Public Key

### 3. Veritabanı Şemasını Oluşturun

1. Supabase Dashboard > SQL Editor'e gidin
2. `supabase-schema.sql` dosyasındaki SQL kodunu çalıştırın
3. Bu işlem şunları oluşturacaktır:
   - `profiles` tablosu (kullanıcı profilleri)
   - `comments` tablosu (yorumlar)
   - Row Level Security (RLS) politikaları
   - Otomatik profil oluşturma trigger'ı

### 4. Environment Variables Ayarlayın

`.env.local` dosyasını açın ve Supabase bilgilerinizi ekleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Önemli:** Bu değerleri Supabase Dashboard > Settings > API bölümünden bulabilirsiniz.

### 5. Email Authentication'ı Aktifleştirin

1. Supabase Dashboard > Authentication > Settings
2. "Enable Email Provider" seçeneğini aktif edin
3. (Opsiyonel) Email confirmation'ı devre dışı bırakabilirsiniz (geliştirme için)

### 6. Uygulamayı Çalıştırın

```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışmaya başlayacaktır.

## 📋 Özellikler

### ✅ Tamamlanan (1. Aşama)

- **Kullanıcı Kaydı**: Email ve şifre ile kayıt
- **Giriş/Çıkış**: Güvenli authentication
- **Anonim Yorum**: Giriş yapmadan yorum ekleme (otomatik username: anon2025X)
- **Yorum Ekleme**: İş deneyimlerini paylaşma
- **Yorumları Görüntüleme**: Tüm yorumları listeleme
- **Kullanıcı-Yorum İlişkisi**: Her yorum bir kullanıcıya ait (veya anonim)
- **Profil Yönetimi**: Otomatik profil oluşturma
- **Güvenlik**: Row Level Security (RLS) ile veri koruması

### 🔜 Gelecek Özellikler (2. Aşama)

- Like/Dislike sistemi
- Yorum yanıtlama
- Gerçek zamanlı güncellemeler
- Gelişmiş arama ve filtreleme
- Harita görünümü

## 🏗️ Mimari

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

### Backend
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime (hazır)

### Veritabanı Yapısı

#### Profiles Tablosu
```sql
- id (uuid, primary key)
- username (text, unique)
- created_at (timestamp)
```

#### Comments Tablosu
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key, nullable - anonim kullanıcılar için)
- username (text)
- business_name (text)
- city (text)
- district (text)
- experience (text)
- rating (integer, 1-5)
- anonymous (boolean)
- created_at (timestamp)
```

## 🔒 Güvenlik

- Row Level Security (RLS) aktif
- Kullanıcılar sadece kendi yorumlarını silebilir
- Email doğrulama (opsiyonel)
- Şifre minimum 6 karakter
- Küfür filtresi aktif

## 🛠️ Geliştirme

### Servisler

**Auth Service** (`src/services/auth.ts`):
- `signUp(email, password, username)`
- `signIn(email, password)`
- `signOut()`
- `getCurrentUser()`
- `getProfile(userId)`

**Comments Service** (`src/services/comments.ts`):
- `getComments()` - Tüm yorumları al
- `getUserComments(userId)` - Kullanıcının yorumlarını al
- `addComment(...)` - Yorum ekle
- `deleteComment(commentId)` - Yorum sil

### Test Kullanıcısı Oluşturma

```bash
# Uygulamayı çalıştırın
npm run dev

# /auth sayfasına gidin
# "Kayıt Ol" sekmesine geçin
# Email, kullanıcı adı ve şifre girin
# Kayıt olun
```

## 📝 Notlar

- **Anonim Yorum**: Giriş yapmadan yorum eklenebilir (otomatik username: anon2025X formatında)
- Email doğrulama zorunlu değil (geliştirme için)
- Aynı email ile tekrar kayıt olunamaz
- Kullanıcı adları benzersiz olmalıdır
- Yorumlar minimum 20 karakter olmalıdır
- Küfür içeren yorumlar engellenir
- Anonim yorumlar silinemez (user_id null olduğu için)

## 🐛 Sorun Giderme

### "Invalid API credentials" hatası
- `.env.local` dosyasındaki Supabase URL ve key'i kontrol edin
- Değişkenlerin `NEXT_PUBLIC_` ile başladığından emin olun

### Database hatası
- `supabase-schema.sql` dosyasını çalıştırdığınızdan emin olun
- Supabase Dashboard > Database > Tables'da tabloları kontrol edin

### Auth çalışmıyor
- Supabase Dashboard > Authentication > Settings'de Email provider'ın aktif olduğundan emin olun

## 📄 Lisans

MIT
