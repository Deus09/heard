import { commentsService } from "@/services/comments";
import HomeClient from "@/components/HomeClient";
import type { InitialCommentsData } from "@/types";

/**
 * Ana sayfa - Server Component
 * İlk 50 yorumu SSR ile yükleyerek anında görüntüleme sağlar
 */
export default async function Home() {
  // SSR: İlk yorumları server-side yükle
  const initialData = await loadInitialComments();

  return <HomeClient initialData={initialData} />;
}

/**
 * İlk yorumları yükler (Server-side)
 * @returns İlk 50 Tecrübe ve pagination metadata
 */
async function loadInitialComments(): Promise<InitialCommentsData> {
  try {
    // SSR için özel fonksiyonu kullan (auth.getUser() kullanmaz)
    const result = await commentsService.getCommentsWithAnnouncesOptimizedSSR(
      null, // cursor
      50,   // pageSize
      undefined, // searchTerm
      undefined  // cityFilter
    );

    return {
      comments: result.data,
      nextCursor: result.pagination.nextCursor,
      hasMore: result.pagination.hasNextPage,
      totalCount: 0, // Approximate count kullanılabilir, şimdilik 0
    };
  } catch (error) {
    console.error('SSR: İlk yorumlar yüklenirken hata:', error);
    
    // Hata durumunda boş data dön (sayfa kırılmasın)
    return {
      comments: [],
      nextCursor: null,
      hasMore: false,
      totalCount: 0,
    };
  }
}

/**
 * Metadata için dynamic configuration
 * SSR ile her istekte yeni data çekilsin
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Her istekte yeniden oluştur