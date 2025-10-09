-- Rate limiting tablosu
-- IP bazlı istek sınırlama için kullanılır

CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier TEXT NOT NULL, -- IP adresi veya kullanıcı kimliği
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_created_at ON rate_limits(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_created_at ON rate_limits(identifier, created_at);

-- Otomatik temizleme: 24 saatten eski kayıtları sil
-- Bu cron job'ı Supabase dashboard'dan pg_cron ile kurabilirsiniz
-- Veya manuel olarak periyodik bir temizleme scripti çalıştırabilirsiniz
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM rate_limits 
    WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) politikaları
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Sadece servis rolü erişebilir
CREATE POLICY "Service role can manage rate limits"
    ON rate_limits
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Kullanıcılar okuma/yazma yapamaz (güvenlik için)
CREATE POLICY "Users cannot access rate limits"
    ON rate_limits
    FOR ALL
    TO authenticated, anon
    USING (false)
    WITH CHECK (false);

-- Otomatik temizleme için trigger (opsiyonel - daha performanslı)
-- Bu, her INSERT işleminde %1 ihtimalle eski kayıtları temizler
CREATE OR REPLACE FUNCTION auto_cleanup_rate_limits()
RETURNS TRIGGER AS $$
BEGIN
    -- %1 ihtimalle temizleme yap
    IF random() < 0.01 THEN
        DELETE FROM rate_limits 
        WHERE created_at < NOW() - INTERVAL '24 hours';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_cleanup_rate_limits
    AFTER INSERT ON rate_limits
    FOR EACH STATEMENT
    EXECUTE FUNCTION auto_cleanup_rate_limits();

-- Test sorguları (opsiyonel)
-- SELECT * FROM rate_limits WHERE identifier = '192.168.1.1' AND created_at > NOW() - INTERVAL '1 hour';
-- SELECT cleanup_old_rate_limits();
