# Duyur Özelliği

## Genel Bakış
Review (yorum) kartlarına "Duyur" özelliği eklendi. Bu özellik, kullanıcıların beğendikleri yorumları duyurarak diğer kullanıcıların dikkatini çekmesini sağlar.

## Özellikler

### 1. Duyur Butonu
- Review kartlarının sağ üst köşesinde sitenin favicon'u (Duyur! logosu) ile gösterilir
- Duyurulmamış yorumlarda buton gri tonlamalıdır (grayscale)
- Duyurulmuş yorumlarda buton kırmızı renge döner (CSS filter ile)
- Hover efekti ile butona yaklaşıldığında büyür (scale-110)

### 2. Duyuru Sayacı
- Butonun altında kaç kişinin bu yorumu duyurduğu gösterilir
- Duyurulmamış yorumlarda sayı gri renktedir
- Kullanıcı duyurduğunda sayı kırmızı renkte gösterilir
- Sayı 0 ise gösterilmez

### 3. Toggle Mekanizması
- Bir kez tıklandığında duyurulur (kırmızıya döner, sayı artar)
- Tekrar tıklandığında duyuru geri alınır (griye döner, sayı azalır)
- Like/beğeni butonuna benzer çalışır

### 4. Anonim Kullanıcı Desteği
- Giriş yapmamış kullanıcılar da duyurabilir
- Her kullanıcıya benzersiz bir identifier atanır (localStorage)
- Aynı kullanıcı bir yorumu sadece bir kez duyurabilir

## Teknik Detaylar

### Veritabanı Yapısı
```sql
create table announces (
  id uuid default gen_random_uuid() primary key,
  comment_id uuid references comments(id) on delete cascade not null,
  user_id uuid references auth.users on delete cascade,
  user_identifier text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(comment_id, user_identifier)
);
```

### API Fonksiyonları (`src/services/comments.ts`)
- `announceComment(commentId)` - Yorumu duyur
- `unannounceComment(commentId)` - Duyuruyu geri al
- `getAnnounceCount(commentId)` - Duyuru sayısını getir
- `hasUserAnnounced(commentId)` - Kullanıcının duyurup duyurmadığını kontrol et
- `getCommentsPaginatedWithAnnounces()` - Yorumları duyuru verileriyle birlikte getir
- `getUserIdentifier()` - Anonim kullanıcı için benzersiz ID oluştur

### Component Güncellemeleri

#### ReviewCard (`src/app/page.tsx`)
- `commentId`, `announceCount`, `hasAnnounced` props eklendi
- `handleAnnounceClick` fonksiyonu ile duyuru toggle işlemi
- State yönetimi: `announced`, `count`, `isProcessing`
- Favicon ile duyur butonu ve CSS filter ile renk değişimi

#### ReviewDetailModal (`src/components/ReviewDetailModal.tsx`)
- Modal içinde de duyur butonu eklendi
- Aynı toggle mekanizması ve state yönetimi
- Daha büyük buton boyutu (32x32px)

## Kurulum

### 1. Veritabanı Migration
Supabase Dashboard > SQL Editor'de aşağıdaki dosyayı çalıştırın:
```bash
supabase-announces-migration.sql
```

### 2. Bağımlılıklar
Tüm gerekli bağımlılıklar mevcut package.json'da mevcut.

### 3. Test
```bash
npm run dev
```
- Bir yorumun sağ üst köşesindeki Duyur! logosuna tıklayın
- Butonun kırmızıya döndüğünü ve sayacın artmayı doğrulayın
- Tekrar tıklayarak duyuruyu geri alın

## CSS Filtreleri

Kırmızı renk efekti için kullanılan CSS:
```css
/* Duyurulmamış */
filter: grayscale(100%)

/* Duyurulmuş */
filter: brightness(0.5) saturate(100%) hue-rotate(330deg)
```

Bu filter kombinasyonu favicon'u kırmızı renge dönüştürür.

## Kullanıcı Deneyimi

1. **İlk Duyuru**: Kullanıcı butona tıkladığında logo kırmızıya döner ve altında "1" yazar
2. **Duyuru Geri Alma**: Tekrar tıkladığında logo griye döner ve sayı azalır
3. **Çoklu Duyuru**: Farklı kullanıcılar duyurdukça sayı artar
4. **Duplicate Engelleme**: Aynı kullanıcı birden fazla duyurduğunda hata mesajı gösterilir

## Güvenlik

- Row Level Security (RLS) politikaları ile korunur
- Herkes okuyabilir ve duyurabilir
- Kullanıcılar sadece kendi duyurularını silebilir
- Unique constraint ile duplicate duyurular engellenir

## Performans

- Indexler ile hızlı sorgu performansı
- Pagination desteği ile büyük veri setlerinde verimli çalışır
- Optimistic UI güncellemeleri ile anlık geri bildirim
