require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase bilgileri eksik!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const businesses = [
  'Starbucks', 'Zara', 'A101', 'Migros', "McDonald's", 'Burger King',
  'LC Waikiki', 'Koton', 'Defacto', 'Bershka', 'H&M', 'Mango',
  'Çiçek Sepeti', 'Yemek Sepeti', 'Trendyol', 'Hepsiburada',
  'CarrefourSA', 'ŞOK', 'BİM', 'Watsons', 'Rossmann', 'Gratis',
  'Cafe Nero', 'Kahve Dünyası', "Gloria Jean's", 'Espresso Lab'
];

const cities = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana',
  'Gaziantep', 'Konya', 'Mersin', 'Kayseri'
];

const districts = {
  'İstanbul': ['Kadıköy', 'Beşiktaş', 'Şişli', 'Beyoğlu', 'Sarıyer', 'Üsküdar', 'Bakırköy'],
  'Ankara': ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Etimesgut'],
  'İzmir': ['Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Çiğli'],
  'Bursa': ['Osmangazi', 'Nilüfer', 'Yıldırım', 'Mudanya'],
  'Antalya': ['Muratpaşa', 'Kepez', 'Konyaaltı', 'Alanya'],
  'Adana': ['Seyhan', 'Yüreğir', 'Çukurova', 'Sarıçam'],
  'Gaziantep': ['Şahinbey', 'Şehitkamil', 'Oğuzeli'],
  'Konya': ['Selçuklu', 'Meram', 'Karatay'],
  'Mersin': ['Akdeniz', 'Toroslar', 'Yenişehir', 'Mezitli'],
  'Kayseri': ['Melikgazi', 'Kocasinan', 'Talas']
};

const usernames = [
  'denizci42', 'yildiz_88', 'firtina23', 'bulut_99', 'guneş_34',
  'aydin_67', 'kara_deniz', 'beyaz_gul', 'mavi_gok', 'yesil_orman',
  'kirmizi_elma', 'anon202502', 'mor_salkim', 'turuncu_gunes',
  'pembe_bulut', 'kahve_rengi', 'lacivert_deniz', 'anon202501'
];

// --- PUANA GÖRE AYRILMIŞ GÜNCEL DENEYİM METİNLERİ (experiences) ---

const experiencesByRating = {
  // 1-2 Puan: Çok Kötü, Kızgın/Öfkeli, Olumsuz, Uzun şikayetler
  BAD: [
    'Mesai saatleri çok uzun, fazla mesai ücreti verilmiyor. Stresli ve **toksik bir ortam**. Kimse birbirine güvenmiyor. Çalışan devir hızı inanılmaz yüksek. Kesinlikle tavsiye etmiyorum!',
    'Maaşlar düşük, iş yoğunluğu aşırı fazla. **Yönetimden sürekli baskı var**, mobbingin aleni yapıldığı bir yer. İş sağlığı ve güvenliği konusunda ciddi eksiklikler mevcut. İşe alım sürecinde söylenenler gerçeği yansıtmıyor.',
    "İş güvencesi yok gibi. Her an, en ufak bir hatada bile işten çıkarılabiliyorsunuz. **Hayal kırıklığı ve emek sömürüsü** yaşadım. İşten eve yorgun ve bitkin geliyorsunuz. Bu iş yerinden uzak durulmalı.",
    'Vardiya sistemi felaket organize edilmiş. Planlama yapmak imkansız. Dinlenme molası bile verilmiyor bazen. Fiziksel olarak çok yorucu. Bu kadar kötü bir çalışma düzeni görmedim.',
    'İş tanımı belirsiz, herkes her şeyi yapıyor ve organizasyon zayıf. Müşteri ile iletişim zor ve yönetim desteği yetersiz. Yorucu, yıpratıcı ve **tükenmiş hissettiren** bir süreçti. Motivasyon sıfır.',
    'Sürekli baskı altındasınız. Hedefler ulaşılamaz düzeyde yüksek. Yönetim tarafından çalışanlara saygı gösterilmiyor. İnanılmaz kötü bir deneyimdi.'
  ],
  // 3-4 Puan: Nötr, Karışık, Bazı Artılar/Eksiler Var
  MIXED: [
    'İlk iş deneyimim için fena sayılmazdı. Çok şey öğrendim ama maaş beklentimin altındaydı. Ekip iyiydi, ancak terfi imkanları ve kriterleri belirsiz, biraz kayırmacılık söz konusu olabiliyor.',
    'Part-time çalışma için ideal. Öğrenciler için uygun bir yer. Ücretler zamanında ödeniyor. Ancak sosyal haklar çok sınırlı ve çalışma saatleri esnek değil.',
    'Ekip liderleri deneyimli ve yardımsever. Oryantasyon programı iyiydi. İşe adaptasyon kolaylaştı. Ne yazık ki ofis ortamı biraz eski ve iş-yaşam dengesi bazı dönemlerde bozuluyor.',
    'Ücretler zamanında ödeniyor. Sigorta primi yatırılıyor. Güvenilir bir yer. Ancak kariyer gelişimi için sunulan fırsatlar yeterli değil.',
    'Güzel bir ekip çalışması var. Projelerde fikirleriniz dinleniyor. Müşteri ile iletişim zor, yönetim desteği yetersiz kalabiliyor.',
    'Genç ve dinamik bir ekip. Eğlenceli bir çalışma ortamı var. Ama iş yoğunluğu çok fazla, bu da motivasyonu düşürüyor.'
  ],
  // 5 Puan: Çok İyi, Pozitif, Önerilir
  GOOD: [
    'Çok profesyonel ve **destekleyici bir ekip** ile çalıştım. Yöneticiler anlayışlı ve her zaman yanınızda. İş ortamı çok pozitif ve dinamik. Harika bir takım ruhu var.',
    'Kariyer gelişimi için müthiş fırsatlar sunuluyor. Düzenli eğitim programları ve mentorluk mevcut. Burada gerçekten kendimi geliştirdim ve tecrübelerime değer verildiğini hissettim. **Kesinlikle öneririm**.',
    'Sosyal haklar ve yan haklar (yemek, servis, özel sağlık sigortası) çok iyi. Prim sistemi adil ve şeffaf. Çalışınca karşılığını fazlasıyla alıyorsunuz. **Mükemmel bir deneyimdi!**',
    'Esnek çalışma saatleri ve uzaktan çalışma imkanı sunuluyor. Modern bir ofis ortamı ve genç/dinamik bir ekip var. İletişim açık ve fikirleriniz dinleniyor. **İş-yaşam dengesi çok iyi korunuyor**.',
    'İlk günden itibaren ailenin bir parçası gibi hissettim. Sıcak, samimi ve saygılı bir ortam var. Çok iyi bir deneyimdi. Referans olarak gösterebileceğim bir yer.'
  ]
};

// Puan üretirken daha gerçekçi bir dağılım için yardımcı fonksiyon
function generateRealisticRating() {
    const r = Math.random();
    // %35 Kötü (1 veya 2)
    if (r < 0.35) return Math.floor(Math.random() * 2) + 1;
    // %45 Karışık/İyi (3 veya 4)
    if (r < 0.80) return Math.floor(Math.random() * 2) + 3; 
    // %20 Mükemmel (5)
    return 5; 
}

// Üretilen puana uygun yorum metnini seçen yardımcı fonksiyon
function getExperienceText(rating) {
    if (rating <= 2) {
        return experiencesByRating.BAD[Math.floor(Math.random() * experiencesByRating.BAD.length)];
    } else if (rating <= 4) {
        return experiencesByRating.MIXED[Math.floor(Math.random() * experiencesByRating.MIXED.length)];
    } else { // rating == 5
        return experiencesByRating.GOOD[Math.floor(Math.random() * experiencesByRating.GOOD.length)];
    }
}

// --- ANA FONKSİYON: İSİM VE YAPISI KORUNMUŞTUR ---
async function insertTestData() {
  console.log('🔄 30 adet daha gerçekçi test yorumu ekleniyor...\n');

  const testComments = [];

  for (let i = 0; i < 30; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const district = districts[city][Math.floor(Math.random() * districts[city].length)];
    const business = businesses[Math.floor(Math.random() * businesses.length)];
    const username = usernames[Math.floor(Math.random() * usernames.length)];
    
    // YENİ MANTIK: Gerçekçi puan üret ve puana uygun yorumu seç
    const rating = generateRealisticRating();
    const experience = getExperienceText(rating);

    testComments.push({
      username,
      business_name: business,
      city,
      district,
      experience, // Puana uygun yorum
      rating,     // Gerçekçi puan
      anonymous: Math.random() < 0.35, // ~%35 anonim yorum olasılığı
      user_id: null
    });
  }
  
  // Supabase'e ekleme işlemi
  const { data, error } = await supabase
    .from('comments')
    .insert(testComments)
    .select();

  if (error) {
    console.error('❌ Hata:', error.message);
    return;
  }
  
  console.log('✅ Başarıyla 30 gerçekçi test yorumu eklendi!');
  console.log(`📊 Eklenen yorumlar: ${data.length}`);
  console.log('\n📝 İlk 5 yorum:');
  data.slice(0, 5).forEach((comment, idx) => {
    const anon = comment.anonymous ? '(Anonim)' : '';
    console.log(`\n${idx + 1}. ${comment.business_name} (${comment.city}) ${anon}`);
    console.log(`   👤 ${comment.username}`);
    console.log(`   ⭐ ${comment.rating}/5`);
    console.log(`   💬 ${comment.experience.substring(0, 70)}...`);
  });
}

insertTestData();