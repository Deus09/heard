# Username Validasyon Test Senaryoları

## Test Kategorileri

### 1. Uzunluk Testleri

| Test Case | Input | Beklenen Sonuç | Hata Mesajı |
|-----------|-------|----------------|-------------|
| Çok kısa (3 karakter) | `abc` | ❌ Geçersiz | "Kullanıcı adı en az 4 karakter olmalıdır" |
| Minimum geçerli (4 karakter) | `abcd` | ✅ Geçerli | - |
| Normal uzunluk | `ahmet123` | ✅ Geçerli | - |
| Maksimum geçerli (20 karakter) | `ahmetmehmetaliveli1` | ✅ Geçerli | - |
| Çok uzun (21 karakter) | `ahmetmehmetaliveli12` | ❌ Geçersiz | "Kullanıcı adı en fazla 20 karakter olabilir" |

### 2. Başlangıç Karakteri Testleri

| Test Case | Input | Beklenen Sonuç | Hata Mesajı |
|-----------|-------|----------------|-------------|
| Harf ile başlar | `ahmet` | ✅ Geçerli | - |
| Rakam ile başlar | `1ahmet` | ❌ Geçersiz | "Kullanıcı adı bir harf ile başlamalıdır" |
| Alt çizgi ile başlar | `_ahmet` | ❌ Geçersiz | "Kullanıcı adı bir harf ile başlamalıdır" |
| Tire ile başlar | `-ahmet` | ❌ Geçersiz | "Kullanıcı adı bir harf ile başlamalıdır" |
| Büyük harf ile başlar | `Ahmet` | ✅ Geçerli | - |

### 3. Bitiş Karakteri Testleri

| Test Case | Input | Beklenen Sonuç | Hata Mesajı |
|-----------|-------|----------------|-------------|
| Harf ile biter | `ahmet` | ✅ Geçerli | - |
| Rakam ile biter | `ahmet1` | ✅ Geçerli | - |
| Alt çizgi ile biter | `ahmet_` | ❌ Geçersiz | "Kullanıcı adı özel karakter ile bitemez" |
| Tire ile biter | `ahmet-` | ❌ Geçersiz | "Kullanıcı adı özel karakter ile bitemez" |

### 4. Özel Karakter Testleri

| Test Case | Input | Beklenen Sonuç | Hata Mesajı |
|-----------|-------|----------------|-------------|
| Tek alt çizgi | `ahmet_mehmet` | ✅ Geçerli | - |
| Tek tire | `ahmet-mehmet` | ✅ Geçerli | - |
| Çift alt çizgi | `ahmet__mehmet` | ❌ Geçersiz | "Kullanıcı adı ardışık özel karakterler içeremez" |
| Çift tire | `ahmet--mehmet` | ❌ Geçersiz | "Kullanıcı adı ardışık özel karakterler içeremez" |
| Üçlü alt çizgi | `ahmet___mehmet` | ❌ Geçersiz | "Kullanıcı adı ardışık özel karakterler içeremez" |
| Boşluk | `ahmet mehmet` | ❌ Geçersiz | "Kullanıcı adı sadece harf, rakam, alt çizgi (_) ve tire (-) içerebilir" |
| Nokta | `ahmet.mehmet` | ❌ Geçersiz | "Kullanıcı adı sadece harf, rakam, alt çizgi (_) ve tire (-) içerebilir" |
| @ işareti | `ahmet@mehmet` | ❌ Geçersiz | "Kullanıcı adı sadece harf, rakam, alt çizgi (_) ve tire (-) içerebilir" |

### 5. Türkçe Karakter Testleri

| Test Case | Input | Beklenen Sonuç | Hata Mesajı |
|-----------|-------|----------------|-------------|
| ş harfi | `şükrü` | ❌ Geçersiz | "Kullanıcı adı sadece harf, rakam, alt çizgi (_) ve tire (-) içerebilir" |
| ğ harfi | `çağlar` | ❌ Geçersiz | "Kullanıcı adı sadece harf, rakam, alt çizgi (_) ve tire (-) içerebilir" |
| ü harfi | `gülşen` | ❌ Geçersiz | "Kullanıcı adı sadece harf, rakam, alt çizgi (_) ve tire (-) içerebilir" |
| ö harfi | `özlem` | ❌ Geçersiz | "Kullanıcı adı sadece harf, rakam, alt çizgi (_) ve tire (-) içerebilir" |
| ç harfi | `çınar` | ❌ Geçersiz | "Kullanıcı adı sadece harf, rakam, alt çizgi (_) ve tire (-) içerebilir" |
| ı harfi | `ayşıl` | ❌ Geçersiz | "Kullanıcı adı sadece harf, rakam, alt çizgi (_) ve tire (-) içerebilir" |

### 6. Yasaklı Kelime Testleri

| Test Case | Input | Beklenen Sonuç | Hata Mesajı |
|-----------|-------|----------------|-------------|
| admin | `admin` | ❌ Geçersiz | "Kullanıcı adı 'admin' kelimesini içeremez" |
| admin ile başlar | `admin123` | ❌ Geçersiz | "Kullanıcı adı 'admin' kelimesini içeremez" |
| admin ile biter | `user_admin` | ❌ Geçersiz | "Kullanıcı adı 'admin' kelimesini içeremez" |
| admin ortada | `my_admin_name` | ❌ Geçersiz | "Kullanıcı adı 'admin' kelimesini içeremez" |
| ADMIN (büyük harf) | `ADMIN` | ❌ Geçersiz | "Kullanıcı adı 'admin' kelimesini içeremez" |
| Administrator | `administrator` | ❌ Geçersiz | "Kullanıcı adı 'administrator' kelimesini içeremez" |
| moderator | `moderator` | ❌ Geçersiz | "Kullanıcı adı 'moderator' kelimesini içeremez" |
| mod | `mod123` | ❌ Geçersiz | "Kullanıcı adı 'mod' kelimesini içeremez" |
| root | `root_user` | ❌ Geçersiz | "Kullanıcı adı 'root' kelimesini içeremez" |
| system | `system` | ❌ Geçersiz | "Kullanıcı adı 'system' kelimesini içeremez" |
| anon | `anon123` | ❌ Geçersiz | "Kullanıcı adı 'anon' kelimesini içeremez" |
| anonymous | `anonymous_user` | ❌ Geçersiz | "Kullanıcı adı 'anonymous' kelimesini içeremez" |
| test | `test_user` | ❌ Geçersiz | "Kullanıcı adı 'test' kelimesini içeremez" |
| user | `user123` | ❌ Geçersiz | "Kullanıcı adı 'user' kelimesini içeremez" |
| guest | `guest` | ❌ Geçersiz | "Kullanıcı adı 'guest' kelimesini içeremez" |

### 7. Karmaşık Geçerli Örnekler

| Test Case | Input | Beklenen Sonuç |
|-----------|-------|----------------|
| Harf + rakam | `ahmet123` | ✅ Geçerli |
| Harf + alt çizgi + rakam | `ahmet_123` | ✅ Geçerli |
| Harf + tire + rakam | `ahmet-123` | ✅ Geçerli |
| Büyük + küçük harf | `AhmetMehmet` | ✅ Geçerli |
| Uzun geçerli kombinasyon | `Ali_Veli_42` | ✅ Geçerli |
| Alt çizgi ve tire kombine | `ahmet_veli-123` | ✅ Geçerli |

### 8. Edge Cases

| Test Case | Input | Beklenen Sonuç | Hata Mesajı |
|-----------|-------|----------------|-------------|
| Boş string | `` | ❌ Geçersiz | "Kullanıcı adı gereklidir" |
| Sadece boşluklar | `    ` | ❌ Geçersiz | "Kullanıcı adı gereklidir" |
| Tek karakter | `a` | ❌ Geçersiz | "Kullanıcı adı en az 4 karakter olmalıdır" |
| İki karakter | `ab` | ❌ Geçersiz | "Kullanıcı adı en az 4 karakter olmalıdır" |
| Tam 4 karakter | `abcd` | ✅ Geçerli | - |
| Tam 20 karakter | `abcdefghij1234567890` | ✅ Geçerli | - |
| Tam 21 karakter | `abcdefghij12345678901` | ❌ Geçersiz | "Kullanıcı adı en fazla 20 karakter olabilir" |

## Manuel Test Adımları

### Test 1: Minimum Uzunluk
1. Auth sayfasını aç (`/auth`)
2. "Kayıt Ol" sekmesinde ol
3. Kullanıcı adı: `abc` gir
4. Beklenen: Kırmızı border + "Kullanıcı adı en az 4 karakter olmalıdır"

### Test 2: Rakam ile Başlama
1. Kullanıcı adı: `1ahmet` gir
2. Beklenen: Kırmızı border + "Kullanıcı adı bir harf ile başlamalıdır"

### Test 3: Yasaklı Kelime
1. Kullanıcı adı: `admin123` gir
2. Beklenen: Kırmızı border + "Kullanıcı adı 'admin' kelimesini içeremez"

### Test 4: Geçerli Kullanıcı Adı
1. Kullanıcı adı: `ahmet_123` gir
2. Beklenen: 
   - Gri border + "Kontrol ediliyor..."
   - Sonra yeşil border + "✓ Kullanıcı adı müsait"

### Test 5: Kullanılmış Kullanıcı Adı
1. Kullanıcı adı: Daha önce kaydedilmiş bir kullanıcı adı gir
2. Beklenen: Kırmızı border + "✗ Bu kullanıcı adı daha önce alınmış"

## Otomatik Test Önerileri

```typescript
// tests/username-validation.test.ts

describe('Username Validation', () => {
  describe('Length Validation', () => {
    it('should reject username shorter than 4 characters', () => {
      const result = validateUsername('abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('en az 4 karakter');
    });

    it('should accept username with exactly 4 characters', () => {
      const result = validateUsername('abcd');
      expect(result.isValid).toBe(true);
    });

    it('should reject username longer than 20 characters', () => {
      const result = validateUsername('abcdefghij12345678901');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('en fazla 20 karakter');
    });
  });

  describe('Starting Character Validation', () => {
    it('should reject username starting with number', () => {
      const result = validateUsername('1ahmet');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('harf ile başlamalıdır');
    });

    it('should accept username starting with letter', () => {
      const result = validateUsername('ahmet');
      expect(result.isValid).toBe(true);
    });
  });

  describe('Forbidden Words Validation', () => {
    const forbiddenWords = ['admin', 'moderator', 'anon', 'test'];
    
    forbiddenWords.forEach(word => {
      it(`should reject username containing '${word}'`, () => {
        const result = validateUsername(`${word}123`);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain(word);
      });
    });
  });
});
```

## Test Sonuçları

| Tarih | Test Edilen | Başarılı | Başarısız | Notlar |
|-------|-------------|----------|-----------|--------|
| 09.10.2025 | Manuel testler | - | - | Implementasyon tamamlandı |

## Bilinen Sorunlar

- Yok

## Gelecek İyileştirmeler

1. Unicode karakterler için daha gelişmiş kontrol
2. Rate limiting testi
3. Performans testi (1000+ eşzamanlı istek)
4. A/B testi için alternatif kurallar
