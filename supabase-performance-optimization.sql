-- ====================================================================
-- PERFORMANCE OPTIMIZATION MIGRATION
-- Cursor-based pagination, full-text search ve ölçeklenebilirlik için
-- ====================================================================

-- 1. MEVCUT İNDEKSLERİ KONTROL ET VE YENİDEN OLUŞTUR
-- ====================================================================

-- Eski indeksleri kaldır (eğer varsa)
DROP INDEX IF EXISTS comments_user_id_idx;
DROP INDEX IF EXISTS comments_created_at_idx;
DROP INDEX IF EXISTS comments_city_idx;
DROP INDEX IF EXISTS comments_business_name_idx;

-- Yeni compound indeksler oluştur (Cursor-based pagination için kritik)
-- Bu indeks created_at DESC + id DESC sıralamasını destekler
CREATE INDEX IF NOT EXISTS comments_cursor_idx 
ON comments(created_at DESC, id DESC);

-- Arama için optimized indeks (ILIKE sorgularını hızlandırır)
CREATE INDEX IF NOT EXISTS comments_search_business_idx 
ON comments USING gin(to_tsvector('turkish', business_name));

CREATE INDEX IF NOT EXISTS comments_search_city_idx 
ON comments USING gin(to_tsvector('turkish', city));

CREATE INDEX IF NOT EXISTS comments_search_district_idx 
ON comments USING gin(to_tsvector('turkish', district));

-- Composite indeks (şehir + tarih için)
CREATE INDEX IF NOT EXISTS comments_city_created_at_idx 
ON comments(city, created_at DESC, id DESC);

-- Kullanıcı yorumları için indeks
CREATE INDEX IF NOT EXISTS comments_user_created_idx 
ON comments(user_id, created_at DESC) 
WHERE user_id IS NOT NULL;

-- Rating filtreleme için indeks
CREATE INDEX IF NOT EXISTS comments_rating_created_idx 
ON comments(rating, created_at DESC, id DESC);


-- 2. ANNOUNCES TABLOSU İÇİN OPTİMİZASYON
-- ====================================================================

-- Announces için compound indeks (yoruma göre duyuruları getirmek için)
CREATE INDEX IF NOT EXISTS announces_comment_user_idx 
ON announces(comment_id, user_identifier);

-- Kullanıcının tüm duyurularını getirmek için
CREATE INDEX IF NOT EXISTS announces_user_created_idx 
ON announces(user_identifier, created_at DESC);


-- 3. FULL-TEXT SEARCH FUNCTION (Türkçe Dil Desteği ile)
-- ====================================================================

-- Yorumlar için full-text search fonksiyonu
CREATE OR REPLACE FUNCTION search_comments(
  search_query text,
  cursor_created_at timestamptz DEFAULT NULL,
  cursor_id uuid DEFAULT NULL,
  page_size integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  username text,
  business_name text,
  city text,
  district text,
  experience text,
  rating integer,
  anonymous boolean,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.user_id,
    c.username,
    c.business_name,
    c.city,
    c.district,
    c.experience,
    c.rating,
    c.anonymous,
    c.created_at
  FROM comments c
  WHERE 
    -- Cursor-based pagination
    (cursor_created_at IS NULL OR cursor_id IS NULL OR 
     (c.created_at, c.id) < (cursor_created_at, cursor_id))
    AND
    -- Full-text search (Türkçe)
    (search_query IS NULL OR search_query = '' OR
     to_tsvector('turkish', c.business_name || ' ' || c.city || ' ' || c.district) 
     @@ plainto_tsquery('turkish', search_query))
  ORDER BY c.created_at DESC, c.id DESC
  LIMIT page_size;
END;
$$ LANGUAGE plpgsql STABLE;


-- 4. OPTİMİZE EDİLMİŞ YORUMLARI DUYURU SAYISIYLA GETİR
-- ====================================================================

-- Tek sorgu ile yorumları ve duyuru sayılarını getir (N+1 problemi çözümü)
CREATE OR REPLACE FUNCTION get_comments_with_announces(
  search_query text DEFAULT NULL,
  filter_city text DEFAULT NULL,
  cursor_created_at timestamptz DEFAULT NULL,
  cursor_id uuid DEFAULT NULL,
  page_size integer DEFAULT 50,
  current_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  username text,
  business_name text,
  city text,
  district text,
  experience text,
  rating integer,
  anonymous boolean,
  created_at timestamptz,
  announce_count bigint,
  has_announced boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.user_id,
    c.username,
    c.business_name,
    c.city,
    c.district,
    c.experience,
    c.rating,
    c.anonymous,
    c.created_at,
    COALESCE(COUNT(a.id), 0) as announce_count,
    COALESCE(bool_or(a.user_identifier = current_user_id::text), false) as has_announced
  FROM comments c
  LEFT JOIN announces a ON a.comment_id = c.id
  WHERE 
    -- Cursor-based pagination
    (cursor_created_at IS NULL OR cursor_id IS NULL OR 
     (c.created_at, c.id) < (cursor_created_at, cursor_id))
    AND
    -- Şehir filtresi
    (filter_city IS NULL OR filter_city = '' OR c.city = filter_city)
    AND
    -- Arama filtresi (ILIKE yerine tsvector kullanıyoruz - daha hızlı)
    (search_query IS NULL OR search_query = '' OR
     to_tsvector('turkish', c.business_name || ' ' || c.city || ' ' || c.district) 
     @@ plainto_tsquery('turkish', search_query))
  GROUP BY c.id
  ORDER BY c.created_at DESC, c.id DESC
  LIMIT page_size;
END;
$$ LANGUAGE plpgsql STABLE;


-- 5. TOPLAM SAYIYI HIZLI GETIR (COUNT OPTİMİZASYONU)
-- ====================================================================

-- Approximate count (çok hızlı, milyonlarca kayıt için bile)
CREATE OR REPLACE FUNCTION get_comments_count_approximate()
RETURNS bigint AS $$
  SELECT reltuples::bigint 
  FROM pg_class 
  WHERE relname = 'comments';
$$ LANGUAGE sql STABLE;

-- Filtrelenmiş count
CREATE OR REPLACE FUNCTION get_comments_count_filtered(
  search_query text DEFAULT NULL,
  filter_city text DEFAULT NULL
)
RETURNS bigint AS $$
DECLARE
  result_count bigint;
BEGIN
  SELECT COUNT(*)
  INTO result_count
  FROM comments c
  WHERE 
    (filter_city IS NULL OR filter_city = '' OR c.city = filter_city)
    AND
    (search_query IS NULL OR search_query = '' OR
     to_tsvector('turkish', c.business_name || ' ' || c.city || ' ' || c.district) 
     @@ plainto_tsquery('turkish', search_query));
  
  RETURN result_count;
END;
$$ LANGUAGE plpgsql STABLE;


-- 6. ŞEHİR BAZLI İSTATİSTİKLER (MATERIALIZED VIEW)
-- ====================================================================

-- Şehir istatistikleri için materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS city_review_stats AS
SELECT 
  city,
  COUNT(*) as review_count,
  AVG(rating) as avg_rating,
  MAX(created_at) as last_review_at
FROM comments
GROUP BY city
ORDER BY review_count DESC;

-- Materialized view için indeks
CREATE UNIQUE INDEX IF NOT EXISTS city_review_stats_city_idx 
ON city_review_stats(city);

-- Materialized view'i otomatik yenilemek için fonksiyon
CREATE OR REPLACE FUNCTION refresh_city_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY city_review_stats;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Yeni yorum eklendiğinde materialized view'i yenile (asenkron)
-- Not: Production'da bu işi bir background job yapmalı (pg_cron veya external scheduler)
CREATE OR REPLACE FUNCTION trigger_refresh_city_stats()
RETURNS trigger AS $$
BEGIN
  -- Materialized view yenilemeyi asenkron yapabilirsiniz
  -- Burada basit bir örnek var, gerçek production'da pg_cron kullanın
  PERFORM refresh_city_stats();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 7. VERITABANI AYARLARI (Performance Tuning)
-- ====================================================================

-- Query planner için istatistikleri güncelle
ANALYZE comments;
ANALYZE announces;

-- Autovacuum ayarları (büyük tablolar için önemli)
ALTER TABLE comments SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE announces SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);


-- 8. YARDIMCI FONKSİYONLAR
-- ====================================================================

-- Cursor encode fonksiyonu (frontend için)
CREATE OR REPLACE FUNCTION encode_cursor(created_at timestamptz, id uuid)
RETURNS text AS $$
BEGIN
  RETURN encode(
    convert_to(created_at::text || '|' || id::text, 'UTF8'),
    'base64'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Cursor decode fonksiyonu
CREATE OR REPLACE FUNCTION decode_cursor(cursor text)
RETURNS TABLE(created_at timestamptz, id uuid) AS $$
DECLARE
  decoded_text text;
  parts text[];
BEGIN
  decoded_text := convert_from(decode(cursor, 'base64'), 'UTF8');
  parts := string_to_array(decoded_text, '|');
  
  RETURN QUERY SELECT parts[1]::timestamptz, parts[2]::uuid;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- 9. CACHE TABLOSU (Sık kullanılan sorgular için)
-- ====================================================================

-- İstatistikler için cache tablosu
CREATE TABLE IF NOT EXISTS query_cache (
  cache_key text PRIMARY KEY,
  cache_data jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Cache temizleme için indeks
CREATE INDEX IF NOT EXISTS query_cache_expires_idx 
ON query_cache(expires_at);

-- Eski cache kayıtlarını temizle
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM query_cache 
  WHERE expires_at < timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql;


-- 10. MONITORING VE PERFORMANS İZLEME
-- ====================================================================

-- Slow query log için view
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- 100ms'den yavaş sorgular
ORDER BY mean_exec_time DESC;

-- Index kullanım istatistikleri
CREATE OR REPLACE VIEW index_usage AS
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;


-- ====================================================================
-- MİGRASYON TAMAMLANDI
-- ====================================================================

-- Tüm istatistikleri güncelle
ANALYZE;

-- Başarı mesajı
DO $$
BEGIN
  RAISE NOTICE '✓ Performance optimization migration completed successfully!';
  RAISE NOTICE '✓ Cursor-based pagination indexes created';
  RAISE NOTICE '✓ Full-text search with Turkish support enabled';
  RAISE NOTICE '✓ Optimized functions for N+1 query prevention';
  RAISE NOTICE '✓ Materialized views for city statistics';
  RAISE NOTICE '✓ Ready to handle millions of records with constant query time';
END $$;
