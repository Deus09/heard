const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase bilgileri eksik!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const businesses = [
  'Starbucks', 'Zara', 'A101', 'Migros', 'McDonald\'s', 'Burger King',
  'LC Waikiki', 'Koton', 'Defacto', 'Bershka', 'H&M', 'Mango',
  'Çiçek Sepeti', 'Yemek Sepeti', 'Trendyol', 'Hepsiburada',
  'CarrefourSA', 'ŞOK', 'BİM', 'Watsons', 'Rossmann', 'Gratis',
  'Cafe Nero', 'Kahve Dünyası', 'Gloria Jean\'s', 'Espresso Lab'
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

const experiences = [
  'Çok profesyonel bir ekip ile çalıştım. Yöneticiler anlayışlı ve destekleyici. İş ortamı çok pozitif.',
  'Mesai saatleri çok uzun, fazla mesai ücreti verilmiyor. Stresli bir ortam.',
  'İlk iş deneyimim için harika bir yerdi. Çok şey öğrendim ve kendimi geliştirdim.',
  'Maaşlar düşük, iş yoğunluğu çok fazla. Çalışan devir hızı yüksek.',
  'Harika bir takım ruhu var. Yöneticiler her zaman yanınızda. Önerebilirim.',
  'Esnek çalışma saatleri ve uzaktan çalışma imkanı var. Modern bir ofis ortamı.',
  'İş güvencesi yok gibi. Her an işten çıkarılabiliyorsunuz. Dikkatli olun.',
  'Kariyer gelişimi için fırsatlar sunuluyor. Eğitim programları mevcut.',
  'Müşteri ile iletişim zor, yönetim desteği yetersiz. Yorucu bir süreç.',
  'Sosyal haklar ve yan haklar çok iyi. Yemek, servis, sigorta hepsi tam.',
  'Genç ve dinamik bir ekip. Eğlenceli bir çalışma ortamı var.',
  'İş tanımı belirsiz, herkes her şeyi yapıyor. Organizasyon zayıf.',
  'Mükemmel bir deneyim yaşadım. İş-yaşam dengesi çok iyi korunuyor.',
  'Fiziksel olarak çok yorucu. Dinlenme molası bile verilmiyor bazen.',
  'Ücretler zamanında ödeniyor. Sigorta primi yatırılıyor. Güvenilir bir yer.',
  'Mobbing var, yönetim tarafından çalışanlara saygı gösterilmiyor.',
  'İlk günden itibaren ailenin bir parçası gibi hissettim. Sıcak bir ortam.',
  'Sürekli baskı altındasınız. Hedefler ulaşılamaz düzeyde yüksek.',
  'Güzel bir ekip çalışması var. Projelerde fikirleriniz dinleniyor.',
  'İşe alım sürecinde söylenenler gerçeği yansıtmıyor. Hayal kırıklığı yaşadım.',
  'Part-time çalışma için ideal. Öğrenciler için uygun bir yer.',
  'Terfi imkanları var ama kriterleri belirsiz. Kayırmacılık söz konusu.',
  'Çok iyi bir deneyimdi. Referans olarak gösterebileceğim bir yer.',
  'İşten eve yorgun ve bitkin geliyorsunuz. Emek sömürüsü var.',
  'Oryantasyon programı çok iyiydi. İşe adaptasyon kolaylaştı.',
  'Vardiya sistemi çok kötü organize edilmiş. Planlamalarınızı yapamazsınız.',
  'Ekip liderleri deneyimli ve yardımsever. Sorularınıza cevap bulabiliyorsunuz.',
  'Motivasyon sıfır. Kimse birbirine güvenmiyor. Toksik bir ortam.',
  'Prim sistemi adil ve şeffaf. Çalışınca karşılığını alıyorsunuz.',
  'İş sağlığı ve güvenliği konusunda eksiklikler var. Dikkatli olmak gerek.'
];

const usernames = [
  'denizci42', 'yildiz_88', 'firtina23', 'bulut_99', 'guneş_34',
  'aydin_67', 'kara_deniz', 'beyaz_gul', 'mavi_gok', 'yesil_orman',
  'kirmizi_elma', 'sari_cicek', 'mor_salkim', 'turuncu_gunes',
  'pembe_bulut', 'kahve_rengi', 'lacivert_deniz', 'bej_kum'
];

async function insertTestData() {
  console.log('🔄 30 test yorumu ekleniyor...\n');
  
  const testComments = [];
  
  for (let i = 0; i < 30; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const district = districts[city][Math.floor(Math.random() * districts[city].length)];
    const business = businesses[Math.floor(Math.random() * businesses.length)];
    const experience = experiences[Math.floor(Math.random() * experiences.length)];
    const username = usernames[Math.floor(Math.random() * usernames.length)];
    const rating = Math.floor(Math.random() * 5) + 1;
    
    testComments.push({
      username,
      business_name: business,
      city,
      district,
      experience,
      rating,
      anonymous: false,
      user_id: null
    });
  }
  
  const { data, error } = await supabase
    .from('comments')
    .insert(testComments)
    .select();
  
  if (error) {
    console.error('❌ Hata:', error.message);
    return;
  }
  
  console.log('✅ Başarıyla 30 test yorumu eklendi!');
  console.log(`📊 Eklenen yorumlar: ${data.length}`);
  console.log('\n📝 İlk 5 yorum:');
  data.slice(0, 5).forEach((comment, idx) => {
    console.log(`\n${idx + 1}. ${comment.business_name} (${comment.city})`);
    console.log(`   👤 ${comment.username}`);
    console.log(`   ⭐ ${comment.rating}/5`);
    console.log(`   💬 ${comment.experience.substring(0, 60)}...`);
  });
}

insertTestData();
