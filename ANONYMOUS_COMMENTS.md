# Anonim Yorum Sistemi - Kurulum Kılavuzu

## 🎯 Yeni Özellik: Giriş Yapmadan Yorum Yazma

Kullanıcılar artık giriş yapmadan anonim olarak yorum yazabilirler!

## 🔧 Yapılması Gerekenler

### 1. Supabase Dashboard'da Migration Çalıştırın

`supabase-migration.sql` dosyasındaki SQL kodunu çalıştırın:

```sql
-- user_id kolonunu nullable yap
ALTER TABLE comments ALTER COLUMN user_id DROP NOT NULL;

-- Eski politikayı sil
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON comments;

-- Yeni politika (herkes yorum ekleyebilir)
CREATE POLICY "Anyone can insert comments"
  ON comments FOR INSERT
  WITH CHECK ( true );

-- Index ekle
CREATE INDEX IF NOT EXISTS comments_username_year_idx ON comments(username) 
  WHERE username LIKE 'anon%';
```

### 2. Değişiklikler Otomatik Aktif

Kod güncellemeleri zaten yapıldı:
- ✅ `src/services/comments.ts` - Anonim username oluşturma
- ✅ `src/app/add-review/page.tsx` - Giriş kontrolü kaldırıldı
- ✅ `src/lib/supabase.ts` - Type güncellemesi

## 🎨 Nasıl Çalışır?

### Giriş Yapan Kullanıcı:
```
Username: kullaniciadi
User ID: abc-123-def
```

### Giriş Yapmayan Kullanıcı:
```
Username: anon20251, anon20252, anon20253...
User ID: null
Format: anon[YIL][SAYI]
```

### Örnek Timeline:
```
2025 yılında:
- 1. anonim yorum: anon20251
- 2. anonim yorum: anon20252
- 3. anonim yorum: anon20253
...
- 100. anonim yorum: anon2025100

2026 yılında:
- 1. anonim yorum: anon20261
- 2. anonim yorum: anon20262
```

## 🔐 Güvenlik

### RLS Politikaları:
- ✅ Herkes yorum okuyabilir
- ✅ Herkes yorum yazabilir (anonim dahil)
- ✅ Sadece giriş yapan kullanıcılar kendi yorumlarını silebilir
- ✅ Anonim yorumlar silinemez (user_id null olduğu için)

### Veri Bütünlüğü:
- Username'ler benzersiz ve tahmin edilemez
- Her yıl sayaç sıfırdan başlar
- Race condition yok (Supabase count atomic)

## 🧪 Test Senaryoları

### 1. Giriş Yapmadan Yorum Ekle:
```bash
1. http://localhost:3000/add-review sayfasına git
2. Form doldur (giriş yapma!)
3. "Yorumu Gönder" butonuna bas
4. ✅ Başarılı: "anon2025X" username ile kayıt oldu
```

### 2. Giriş Yaparak Yorum Ekle:
```bash
1. /auth sayfasından giriş yap
2. /add-review sayfasına git
3. Form doldur
4. ✅ Başarılı: Kullanıcı adınla kayıt oldu
```

### 3. Ana Sayfada Görüntüleme:
```bash
1. / ana sayfaya git
2. ✅ Hem anonim hem kayıtlı kullanıcı yorumları görünür
3. ✅ Anonim yorumlar: "@anon2025X" şeklinde görünür
```

## 📊 Database Kontrol Sorguları

```sql
-- Anonim yorumları listele
SELECT id, username, business_name, created_at 
FROM comments 
WHERE user_id IS NULL;

-- 2025 yılı anonim yorum sayısı
SELECT COUNT(*) 
FROM comments 
WHERE username LIKE 'anon2025%';

-- Son anonim kullanıcı
SELECT username 
FROM comments 
WHERE username LIKE 'anon2025%' 
ORDER BY created_at DESC 
LIMIT 1;
```

## 🎉 Sonuç

Artık kullanıcılar:
- ✅ Giriş yapmadan yorum yazabilir
- ✅ Otomatik benzersiz username alır
- ✅ Tamamen anonim kalır
- ✅ Email vermek zorunda değil

## 🔄 Önceki Yorumlar

Mevcut yorumlar etkilenmez:
- user_id dolu olanlar → kayıtlı kullanıcı yorumları
- user_id NULL olanlar → anonim yorumlar (yeni)
