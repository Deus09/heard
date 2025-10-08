-- Supabase Dashboard > SQL Editor'de çalıştırılacak
-- Bu script tüm test verilerini temizler ve gerçek kullanıcılara hazır hale getirir

-- 1. Tüm announces (duyurular) verilerini sil
DELETE FROM announces;

-- 2. Tüm yorumları sil
DELETE FROM comments;

-- 3. Test kullanıcılarının profillerini sil (opsiyonel - auth kullanıcıları kalır)
-- DELETE FROM profiles WHERE username LIKE 'anon%';

-- 4. Sequence'leri sıfırla (ID'ler 1'den başlasın)
ALTER SEQUENCE comments_id_seq RESTART WITH 1;
ALTER SEQUENCE announces_id_seq RESTART WITH 1;

-- 5. Kontrol sorguları (sonuçları doğrula)
SELECT COUNT(*) as total_comments FROM comments;
SELECT COUNT(*) as total_announces FROM announces;

-- Beklenen sonuç: Her iki sayaç da 0 olmalı
