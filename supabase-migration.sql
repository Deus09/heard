-- Supabase Dashboard > SQL Editor'de çalıştırılacak MIGRATION
-- Bu dosya, mevcut tabloyu güncellemek için kullanılır

-- 1. user_id kolonunu nullable yap
ALTER TABLE comments ALTER COLUMN user_id DROP NOT NULL;

-- 2. Eski RLS politikalarını sil
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON comments;

-- 3. Yeni RLS politikası oluştur (herkes Tecrübe ekleyebilir)
CREATE POLICY "Anyone can insert comments"
  ON comments FOR INSERT
  WITH CHECK ( true );

-- 4. Index ekle (performans için)
CREATE INDEX IF NOT EXISTS comments_username_year_idx ON comments(username) 
  WHERE username LIKE 'anon%';

-- Kontrol sorguları:
-- SELECT user_id, username FROM comments WHERE user_id IS NULL; -- Anonim yorumları gösterir
-- SELECT COUNT(*) FROM comments WHERE username LIKE 'anon2025%'; -- 2025 yılı anonim Tecrübe sayısı
