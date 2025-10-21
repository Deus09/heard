// Dosya Yolu: src/app/sitemap.ts

import { MetadataRoute } from 'next';
// Hatalı import düzeltildi: createClient -> createServerSupabaseClient
import { createServerSupabaseClient } from '@/lib/supabase/server'; // Dosya Yolu: src/app/sitemap.ts

import { MetadataRoute } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server'; 

const baseUrl = 'duyur.social'; 

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
    // DÜZELTME: Gereksiz 'as 'daily'' type assertion kaldırıldı.
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
        changeFrequency: 'weekly', // Burada zaten sorun yoktu
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
// cookies import'u kaldırıldı, artık gerekli değil.

// Alan adınızı buraya girin
const baseUrl = 'duyur.social'; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // cookies() ve cookieStore kaldırıldı.
  // Supabase istemcisi, dosyanızdaki fonksiyona göre 'await' ile çağrıldı.
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
    changeFrequency: 'daily' as 'daily',
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
