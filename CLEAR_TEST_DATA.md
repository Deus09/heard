# Test Verilerini Temizleme Talimatları

## Adım 1: Supabase Veritabanını Temizle

1. Supabase Dashboard'a git: https://app.supabase.com
2. Projeyi seç
3. Sol menüden **SQL Editor** seçeneğine tıkla
4. **New Query** butonuna tıkla
5. `clear-test-data.sql` dosyasının içeriğini kopyala ve yapıştır
6. **Run** butonuna tıkla

## Adım 2: LocalStorage Cache'ini ve Tarayıcı Cache'ini Temizle

### Otomatik Yöntem (Önerilen):
1. Tarayıcıda `/clear-cache` sayfasına git
2. Sayfa otomatik olarak cache'i temizleyecek

### Manuel Yöntem:
1. F12 tuşuna basarak Developer Tools'u aç
2. **Console** sekmesine git
3. Şu komutu çalıştır:
   ```javascript
   localStorage.removeItem('cached_comments')
   ```
4. **Hard Refresh** yap (önemli!):
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`
   - Veya: F12 açıkken → Yenile butonuna sağ tıkla → "Empty Cache and Hard Reload"

## Adım 3: Doğrulama

- Ana sayfada artık "Merhaba! İlk yorumu sen yapmak ister misin?" mesajını görmelisin
- Hiçbir eski yorum görünmemeli
- İlk gerçek yorumu eklemek için "İlk Yorumu Yap" butonuna tıklayabilirsin

## Notlar

- Bu işlem geri alınamaz!
- Tüm yorumlar ve duyurular kalıcı olarak silinecek
- Kullanıcı hesapları (profiles) etkilenmez
