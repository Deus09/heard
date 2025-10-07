/**
 * @description Yaygın Türkçe küfür ve argo kelimelerin temel listesi.
 * Daha verimli arama ve benzersizlik için Set veri yapısı kullanılmıştır.
 * Bu liste, projenizin ihtiyaçlarına göre genişletilebilir.
 * Kökler ve yaygın ekler eklenerek tespit gücü artırılabilir (örn: 'göt' yerine 'got' de eklenmiştir).
 */
const PROFANITY_ROOT_WORDS = new Set([
  'amk', 'mk', 'aq', 'amcik', 'amcık', 'amina', 'amına', 'sik', 'siktir', 'sikerim',
  'göt', 'got', 'götü', 'orospu', 'piç', 'pezevenk', 'kahpe', 'sürtük', 'fahişe',
  'it', 'köpek', 'eşek', 'salak', 'mal', 'gerizekali', 'gerizekalı', 'aptal',
  'dangalak', 'serefsiz', 'şerefsiz', 'namussuz', 'yavsak', 'yavşak'
  // Daha fazla kelime ve varyasyon eklenebilir.
]);

/**
 * @description Karakter normalleştirme haritası.
 * Leetspeak (ör: 4 -> a), Türkçe karakterler ve diğer varyasyonları tek bir formata indirger.
 */
const NORMALIZATION_MAP: { [key: string]: string } = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't',
  '@': 'a', '$': 's',
  'ş': 's', 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ü': 'u',
};

// Regex nesnesini sadece bir kere oluşturup hafızada tutmak için (memoization).
let profanityRegex: RegExp | null = null;

/**
 * Küfür listesinden performansı yüksek, tek bir birleşik RegExp oluşturur.
 * Örneğin: /\b(amk|mk|aq|sik|...)\b/gi
 * @returns {RegExp} Oluşturulan veya hafızadan alınan RegExp nesnesi.
 */
const buildProfanityRegex = (): RegExp => {
  if (profanityRegex) {
    return profanityRegex;
  }
  // Set'teki tüm kelimeleri '|' (VEYA) ile birleştirerek regex desenini oluştur.
  const pattern = `\\b(${Array.from(PROFANITY_ROOT_WORDS).join('|')})\\b`;
  profanityRegex = new RegExp(pattern, 'gi');
  return profanityRegex;
};

/**
 * Metni küfür tespiti için standart bir formata getirir (normalize eder).
 * - Tüm harfleri küçük harfe çevirir (Türkçe karakter desteğiyle).
 * - Leetspeak ve özel karakterleri değiştirir.
 * - Harf olmayan karakterleri (nokta, virgül vb.) temizler.
 * - Tekrar eden harfleri tekilleştirir (örn: "siiiiik" -> "sik").
 * @param {string} text - Normalleştirilecek metin.
 * @returns {string} Normalize edilmiş metin.
 */
export const normalizeText = (text: string): string => {
  if (!text) return '';

  return text
    .toLocaleLowerCase('tr-TR') // Türkçe karakterleri doğru şekilde küçük harfe çevirir.
    .replace(/[013457@$şçğıöü]/g, char => NORMALIZATION_MAP[char] || char) // Harita kullanarak karakterleri dönüştürür.
    .replace(/[^a-z0-9\s]/g, '') // Harf, rakam ve boşluk dışındaki her şeyi siler (s.i.k -> sik).
    .replace(/(.)\1+/g, '$1') // Tekrar eden karakterleri tekilleştirir (cooool -> col).
    .trim();
};

/**
 * Verilen metinde herhangi bir küfür içerip içermediğini kontrol eder.
 * @param {string} text - Kontrol edilecek metin.
 * @returns {boolean} Küfür varsa true, yoksa false döner.
 */
export const containsProfanity = (text: string): boolean => {
  const normalizedText = normalizeText(text);
  if (!normalizedText) return false;

  const regex = buildProfanityRegex();
  // Regex'in en son eşleşme indeksini sıfırla, aynı regex nesnesi tekrar kullanıldığı için bu önemlidir.
  regex.lastIndex = 0; 
  return regex.test(normalizedText);
};

/**
 * Verilen metinde bulunan tüm küfür kelimelerini bir dizi olarak döner.
 * @param {string} text - Taranacak metin.
 * @returns {string[]} Bulunan benzersiz küfür kelimelerinin bir dizisi.
 */
export const getProfanityWords = (text: string): string[] => {
  const normalizedText = normalizeText(text);
  if (!normalizedText) return [];

  const regex = buildProfanityRegex();
  regex.lastIndex = 0;
  
  const matches = normalizedText.match(regex);
  
  // Eşleşme yoksa boş dizi dön. Varsa, Set kullanarak benzersiz sonuçları garantile.
  return matches ? [...new Set(matches)] : [];
};

/**
 * Metindeki küfürlü kelimeleri belirli bir karakterle sansürler.
 * @param {string} text - Sansürlenecek metin.
 * @param {string} [censorChar='*'] - Sansür için kullanılacak karakter.
 * @returns {string} Sansürlenmiş metin.
 */
export const censorProfanity = (text: string, censorChar: string = '*'): string => {
  if (!text) return '';

  const foundWords = getProfanityWords(text);
  if (foundWords.length === 0) {
    return text;
  }
  
  // Sadece bulunan küfürleri hedef alan bir RegExp oluştur.
  // Bu, metindeki orijinal (normalize edilmemiş) kelimeleri daha doğru hedeflemeyi sağlar.
  const censorRegex = new RegExp(`\\b(${foundWords.join('|')})\\b`, 'gi');
  
  return text.replace(censorRegex, match => censorChar.repeat(match.length));
};
