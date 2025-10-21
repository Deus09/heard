// Dosya Yolu: src/app/sitemap.ts

import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server'; // Sunucu taraflı Supabase istemcisi
import { cookies } from 'next/headers';

// Alan adınızı buraya girin
const baseUrl = 'duyur.social'; // CNAME dosyanıza ve projenin adına göre varsayılmıştır.

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Statik Sayfalar
  // Proje dosya yapınızdan çıkardığım statik sayfalar:
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
  // Henüz şehir veya işletme detay sayfalarınız (örn: /istanbul/işletme-adı)
  // olmasa da, gelecekte 'comments' tablosundaki verilere göre
  // dinamik sayfalar oluşturmak isteyebilirsiniz.
  // Bu kod, örnek olarak 'comments' tablosundaki tüm benzersiz şehirleri çeker
  // ve her biri için bir sitemap girişi oluşturur.
  
  let dynamicUrls: MetadataRoute.Sitemap = [];
  
  try {
    // Veritabanından benzersiz şehirleri çek (performans için optimize edilebilir)
    const { data: cities, error } = await supabase
      .from('comments')
      .select('city')
      .distinct(); // Sadece benzersiz şehirleri al

    if (error) {
      console.error('Sitemap: Şehirler çekilirken hata oluştu', error);
    }

    if (cities) {
      dynamicUrls = cities.map((item) => ({
        url: `${baseUrl}/?city=${encodeURIComponent(item.city)}`, // Ana sayfadaki filtreleme URL'si varsayılarak
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
