// Dosya Yolu: src/app/sitemap.ts
// Lütfen bu dosyanın içeriğinin TAMAMEN bu koddan oluştuğundan emin olun.

import { MetadataRoute } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server'; 

// Alan adınız hata günlüklerinizde 'duyur.social' olarak görünüyordu.
// Eğer 'duy-duy.com' ise lütfen bu satırı düzeltin.
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
    // Bir önceki ESLint hatası (as 'daily') burada düzeltilmiştir
    changeFrequency: 'daily', 
    priority: route === '/' ? 1.0 : 0.8,
  }));

  // 2. Dinamik Sayfalar (Veritabanından)
  let dynamicUrls: MetadataRoute.Sitemap = [];
  
  try {
    const { data: cities, error } = await supabase
      .from('comments')
      .select('city')
      .distinct(); 

    if (error) {
      console.error('Sitemap: Şehirler çekilirken hata oluştu', error);
    }

    if (cities) {
      dynamicUrls = cities.map((item) => ({
        url: `${baseUrl}/?city=${encodeURIComponent(item.city)}`, 
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.6,
      }));
    }
  } catch (e) {
    console.error('Sitemap: Dinamik URL hatası', e);
  }

  // 3. Tüm URL'leri birleştir
  return [
    ...staticUrls,
    ...dynamicUrls,
  ];
}
