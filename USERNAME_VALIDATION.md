# Kullanıcı Adı Validasyon Kuralları

## Genel Bakış
Bu doküman, Duyur! platformunda kullanıcı adı oluşturma ve validasyon kurallarını açıklar.

## Kullanıcı Adı Kuralları

### Uzunluk Gereksinimleri
- **Minimum**: 4 karakter
- **Maksimum**: 20 karakter

### Format Kuralları

#### ✅ İzin Verilen Karakterler
- Küçük harfler (a-z)
- Büyük harfler (A-Z)
- Rakamlar (0-9)
- Alt çizgi (_)
- Tire (-)

#### ❌ İzin Verilmeyen Karakterler
- Boşluk
- Türkçe karakterler (ş, ğ, ü, ö, ç, ı)
- Özel karakterler (@, #, $, %, vb.)

### Yapısal Kurallar

1. **Başlangıç**: Kullanıcı adı bir harf ile başlamalıdır
   - ✅ `ahmet123`
   - ❌ `123ahmet`
   - ❌ `_ahmet`

2. **Bitiş**: Kullanıcı adı özel karakter ile bitemez
   - ✅ `ahmet_34`
   - ❌ `ahmet_`
   - ❌ `ahmet-`

3. **Ardışık Özel Karakterler**: İki veya daha fazla ardışık özel karakter kullanılamaz
   - ✅ `ahmet_mehmet`
   - ❌ `ahmet__mehmet`
   - ❌ `ahmet---mehmet`

### Yasaklı Kelimeler

Aşağıdaki kelimeler kullanıcı adında **hiçbir şekilde** kullanılamaz:

#### Sistem Kelimeleri
- admin
- administrator
- moderator
- mod
- root
- system

#### Genel Yasaklı Kelimeler
- anon
- anonim
- anonymous
- user
- guest
- test
- demo

#### Teknik Kelimeler
- null
- undefined
- deleted
- banned
- suspended

## Örnekler

### ✅ Geçerli Kullanıcı Adları
```
ahmet
mehmet_34
zeynep-yilmaz
user123
ali_veli
murat_42
```

### ❌ Geçersiz Kullanıcı Adları

| Kullanıcı Adı | Hata Nedeni |
|---------------|-------------|
| `ali` | Minimum 4 karakter gerekli |
| `ahmetmehmetaliveli123456` | Maksimum 20 karakter |
| `123ahmet` | Harf ile başlamalı |
| `ahmet!` | Özel karakter kullanılamaz |
| `ahmet mehmet` | Boşluk kullanılamaz |
| `ahmet_` | Özel karakter ile bitemez |
| `ahmet__veli` | Ardışık özel karakter |
| `admin123` | Yasaklı kelime içeriyor |
| `test_user` | Yasaklı kelime içeriyor |
| `şükrü` | Türkçe karakter kullanılamaz |

## Teknik Uygulama

### Frontend Validasyonu

Kullanıcı adı girişi sırasında:
1. Her tuş vuruşunda format kontrolü yapılır
2. 500ms debounce ile sunucu tarafı kontrol
3. Gerçek zamanlı geri bildirim gösterilir

```typescript
// src/lib/utils.ts
export function validateUsername(username: string): { 
  isValid: boolean; 
  error?: string 
}
```

### Backend Validasyonu

Kayıt sırasında:
1. Format validasyonu
2. Benzersizlik kontrolü
3. Yasaklı kelime kontrolü

```typescript
// src/services/auth.ts
async signUp(email: string, password: string, username: string) {
  const validation = validateUsername(username);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  // ...
}
```

## Kullanıcı Deneyimi

### Gerçek Zamanlı Geri Bildirim

Kullanıcı adı input alanında:
- 🔴 Kırmızı: Geçersiz format veya kullanılmış
- 🟢 Yeşil: Geçerli ve müsait
- ⚪ Gri: Kontrol ediliyor

### Hata Mesajları

Format hatalarında anlaşılır Türkçe mesajlar:
- "Kullanıcı adı en az 4 karakter olmalıdır"
- "Kullanıcı adı bir harf ile başlamalıdır"
- "Kullanıcı adı sadece harf, rakam, alt çizgi (_) ve tire (-) içerebilir"
- "Kullanıcı adı 'admin' kelimesini içeremez"

## Güvenlik Notları

1. **SQL Injection**: Sadece alfanumerik ve sınırlı özel karakterler
2. **XSS Prevention**: Özel karakterler engellenir
3. **Brute Force**: Rate limiting ile korunur
4. **Privacy**: Yasaklı kelimeler kimlik hırsızlığını önler

## Değişiklik Geçmişi

| Tarih | Versiyon | Değişiklik |
|-------|----------|------------|
| 09.10.2025 | 1.0.0 | İlk validasyon kuralları eklendi |

## İlgili Dosyalar

- `/src/lib/utils.ts` - Validasyon fonksiyonu
- `/src/services/auth.ts` - Backend validasyonu
- `/src/app/auth/page.tsx` - UI validasyonu
- `/supabase-schema.sql` - Veritabanı constraints
