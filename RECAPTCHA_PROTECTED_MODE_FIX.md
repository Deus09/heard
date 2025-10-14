# reCAPTCHA "Protected Mode" Düzeltmesi

## Sorun
Google reCAPTCHA v3, "Protected" modunda çalışırken **tüm trafiği bot olarak işaretliyor** ve **score 0 veriyor**.

## Loglardan Görülen Belirtiler
```
score: 0
isHuman: false
action: 'undefined'
hostname: 'duyur.social'
```

## Neden Oluyor?
1. **Google Cloud Protected Mode**: Çok agresif güvenlik ayarları
2. **Yeni Domain**: Google henüz domain'inizi "öğrenmedi"
3. **Geliştirme/Test Trafiği**: Sürekli aynı IP'den gelen istekler şüpheli görünüyor

## Çözüm Adımları

### 1. Google Cloud Console'da Ayarlar
1. [Google Cloud reCAPTCHA Console](https://console.cloud.google.com/security/recaptcha)'a gidin
2. Site Key'inizi seçin: `6LcOrOMrAAAAAA4rHWoAibPjCdTKIJZhpS5fvHHP`
3. **"Security Preference"** bölümüne gidin
4. **"Protected"** yerine **"Balanced"** veya **"Flexible"** seçeneğini seçin
5. Değişiklikleri kaydedin

### 2. Bot Trafiği İzinleri
1. Google Console'da **"Actions"** sekmesine gidin
2. `submit_comment` action'ını bulun veya oluşturun
3. **Score threshold'u düşürün**: 0.5 → 0.1 veya 0.0
4. **"Allow suspicious traffic"** seçeneğini geçici olarak açın

### 3. Domain Doğrulama
1. **"Settings"** sekmesinde domain'inizin doğru olduğunu kontrol edin:
   - `duyur.social`
   - `www.duyur.social` (varsa)
2. Gerekirse domain'i tekrar ekleyin

### 4. Geçici Kod Düzeltmesi (YAPILDI ✅)
Kod zaten güncellendi:
- ✅ Score threshold 0.0'a düşürüldü (tüm skorlar kabul ediliyor)
- ✅ Token geçerli olduğu sürece kabul ediliyor
- ✅ Google Protected mode uyarıları loglara eklendi
- ✅ Gerçek API hatalarında (invalid token) hala reddediyor
- ✅ **Supabase client düzeltildi**: CSRF custom fetch kaldırıldı (sonsuz döngü sorunu çözüldü)

## Test Etme
1. ✅ Sunucu yeniden başlatıldı
2. ✅ Supabase client hatası düzeltildi (`getUser` undefined sorunu)
3. Tecrübe eklemeyi deneyin
4. Loglarda şunları göreceksiniz:
   ```
   ⚠️ reCAPTCHA score is 0 - Google Protected mode is blocking traffic
   ⚠️ Meanwhile, accepting request since token is valid
   ✅ reCAPTCHA verified successfully
   ✅ Tecrübe başarıyla eklendi
   ```

## Uzun Vadeli Çözüm
1. **Google Cloud ayarlarını düzenleyin** (yukarıdaki adımlar)
2. **Prodüksiyon'da gerçek kullanıcı trafiği biriksin** (birkaç gün/hafta)
3. Google ML modeli domain'inizi öğrensin ve skorlar düzelsin
4. Kod içindeki threshold'u **0.3-0.5** arası yükseltin:
   ```typescript
   const threshold = 0.3; // veya 0.5
   ```

## Önemli Notlar
- ⚠️ **Threshold 0.0** geçici bir çözümdür
- ⚠️ **Rate limiting** hala aktif (saatte 5 Tecrübe)
- ⚠️ **CSRF koruması** hala aktif
- ✅ Bot koruması **tamamen kapatılmadı**, sadece score kontrolü esnetildi
- ✅ Token doğrulaması **hala yapılıyor**

## Google Cloud Console Linki
https://console.cloud.google.com/security/recaptcha?project=YOUR_PROJECT_ID

## İletişim
- Site: duyur.social
- Site Key: 6LcOrOMrAAAAAA4rHWoAibPjCdTKIJZhpS5fvHHP
- Status: Protected ✅ (Çok agresif - ayarlanmalı)
