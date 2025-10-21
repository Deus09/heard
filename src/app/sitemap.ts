// Dosya Yolu: src/app/sitemap.ts
// Lütfen dosyanın içeriğinin SADECE bu koddan oluştuğundan emin olun.

import { MetadataRoute } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server'; 

// CNAME ve önceki loglara göre alan adınız.
const baseUrl = 'https://duyur.social'; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerSupabaseClient();

  // 1. Statik Sayfalar
  const staticRoutes = [
    '/',
    '/auth',
    '/add-review',
    '/account/reviews',
    '/duyduy',
  ];

  const staticUrls = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily', 
    priority: route === '/' ? 1.0 : 0.8,
  }));

  // 2. Dinamik Sayfalar (Veritabanından)
  let dynamicUrls: MetadataRoute.Sitemap = [];
  
  try {
    // --- DÜZELTME BAŞLANGICI ---
    // .distinct() kaldırıldı, çünkü bu hataya neden oluyordu.
    const { data: cityComments, error } = await supabase
      .from('comments')
      .select('city'); 

    if (error) {
      console.error('Sitemap: Şehirler çekilirken hata oluştu', error);
    }

    if (cityComments) {
      // Gelen tüm şehir listesini JavaScript kullanarak benzersiz hale getiriyoruz.
      const uniqueCities = [...new Set(cityComments.map(item => item.city))];

      // Artık benzersiz şehir listesiyle URL'leri oluşturabiliriz
      dynamicUrls = uniqueCities.map((city) => ({
        url: `${baseUrl}/?city=${encodeURIComponent(city)}`, 
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.6,
      }));
    }
    // --- DÜZELTME SONU ---
  } catch (e) {
    console.error('Sitemap: Dinamik URL hatası', e);
  }

  // 3. Tüm URL'leri birleştir
  return [
    ...staticUrls,
    ...dynamicUrls,
  ];
}
