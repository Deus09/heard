"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";
import ReviewCardSkeleton from "@/components/ReviewCardSkeleton";
import ReviewCard from "@/components/ReviewCard";

// Yenile butonu bileşeni
function RefreshButton({ onRefresh }: { onRefresh?: () => void }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [canClick, setCanClick] = useState(true);

  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setTimeout(() => {
        setRemainingTime(remainingTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (remainingTime === 0 && !canClick) {
      setCanClick(true);
    }
  }, [remainingTime, canClick]);

  const handleClick = () => {
    if (!canClick || !onRefresh) return;

    setIsRefreshing(true);
    setCanClick(false);
    setRemainingTime(30);
    
    onRefresh();
    
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={!canClick}
      className={`relative bg-red-600 text-white p-3 rounded-full transition-all ${
        canClick 
          ? 'hover:bg-red-700 cursor-pointer' 
          : 'opacity-50 cursor-not-allowed'
      }`}
      title={canClick ? 'Yeni yorumları kontrol et' : `${remainingTime} saniye sonra tekrar deneyin`}
    >
      <RefreshCw 
        className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} 
      />
      {remainingTime > 0 && (
        <span className="absolute -top-1 -right-1 bg-white text-red-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-red-600">
          {remainingTime}
        </span>
      )}
    </button>
  );
}

interface ReviewsContainerProps {
  searchTerm: string;
  showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
  selectedCity: string | null;
  onClearCitySelection?: () => void;
  onRefresh?: () => void;
  lastRefreshTime?: number;
  initialData?: import('@/types').InitialCommentsData;
  onAnnounceChange?: () => void; // Duyuru değişikliği callback'i
}

export default function ReviewsContainer({ 
  searchTerm, 
  showToast, 
  selectedCity, 
  onClearCitySelection, 
  onRefresh, 
  lastRefreshTime,
  initialData,
  onAnnounceChange
}: ReviewsContainerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [comments, setComments] = useState<import('@/types').CommentWithAnnounces[]>(
      initialData?.comments || []
    );
    const [loading, setLoading] = useState(!initialData); // SSR varsa loading false
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<import('@/types').PaginationCursor | null>(
      initialData?.nextCursor || null
    );
    const [hasMore, setHasMore] = useState(initialData?.hasMore ?? true);
    const observerTarget = useRef<HTMLDivElement>(null);
    const [latestCommentTime, setLatestCommentTime] = useState<string | null>(
      initialData?.comments[0]?.created_at || null
    );
    
    const PAGE_SIZE = 50; // Daha büyük sayfa boyutu ile daha az istek
    
    const categories = [
      "Kafe Tecrübeleri",
      "Ofis Tecrübeleri",
      "Restoran Tecrübeleri",
      "Market Tecrübeleri",
      "Mağaza Tecrübeleri",
      "Fabrika Tecrübeleri",
      "Memuriyet Tecrübeleri",
    ];
  
    useEffect(() => {
      const interval = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % categories.length);
          setIsAnimating(false);
        }, 300);
      }, 2000); // 2 saniyede bir değişir
  
      return () => clearInterval(interval);
    }, [categories.length]);
  
    // searchTerm veya selectedCity değiştiğinde listeyi sıfırla ve ilk sayfayı yükle
    useEffect(() => {
      // SSR'dan gelen initial data ile başlıyorsa ve ilk render ise atla
      if (initialData && !searchTerm && !selectedCity) {
        return;
      }
      
      // Arama veya filtre değiştiğinde yeniden yükle
      setComments([]);
      setNextCursor(null);
      setHasMore(true);
      loadComments(null, true);
    }, [searchTerm, selectedCity]);
  
    // Infinite scroll için Intersection Observer
    useEffect(() => {
      if (!hasMore || loading || loadingMore) return;
      
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && nextCursor) {
            loadMoreComments();
          }
        },
        { threshold: 0.1, rootMargin: '200px' } // Daha erken tetikle
      );
  
      const currentTarget = observerTarget.current;
      if (currentTarget) {
        observer.observe(currentTarget);
      }
  
      return () => {
        if (currentTarget) {
          observer.unobserve(currentTarget);
        }
      };
    }, [hasMore, loading, loadingMore, nextCursor]);
  
    /**
     * Yorumları cursor-based pagination ile yükler
     * @param cursor - Pagination cursor (null = ilk sayfa)
     * @param isInitial - İlk yükleme mi?
     */
    const loadComments = async (
      cursor: import('@/types').PaginationCursor | null, 
      isInitial: boolean = false
    ) => {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      try {
        // API endpoint'i kullanarak yorumları getir
        const cursorParam = cursor 
          ? `&cursor=${Buffer.from(JSON.stringify(cursor)).toString('base64')}`
          : '';
        
        const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
        const cityParam = selectedCity ? `&city=${encodeURIComponent(selectedCity)}` : '';
        
        const response = await fetch(
          `/api/comments?pageSize=${PAGE_SIZE}${cursorParam}${searchParam}${cityParam}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!response.ok) {
          throw new Error('Yorumlar yüklenirken hata oluştu');
        }
        
        const result: import('@/types').CursorPaginatedCommentsWithAnnouncesResponse = 
          await response.json();
        
        if (isInitial) {
          setComments(result.data);
          
          // En yeni yorumun zamanını kaydet
          if (result.data.length > 0) {
            setLatestCommentTime(result.data[0].created_at);
          }
        } else {
          setComments(prev => [...prev, ...result.data]);
        }
        
        setNextCursor(result.pagination.nextCursor);
        setHasMore(result.pagination.hasNextPage);
      } catch (error) {
        console.error('Yorumlar yüklenirken hata:', error);
        showToast('Yorumlar yüklenirken bir hata oluştu', 'error');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
  
    /**
     * Sonraki sayfayı yükler (infinite scroll)
     */
    const loadMoreComments = () => {
      if (!nextCursor || loadingMore) return;
      loadComments(nextCursor, false);
    };
    
    /**
     * Yeni yorumları kontrol et ve varsa listeye ekle
     * Son bilinen yorumdan daha yeni yorumları getirir
     */
    const checkForNewComments = async () => {
      try {
        const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
        const cityParam = selectedCity ? `&city=${encodeURIComponent(selectedCity)}` : '';
        
        const response = await fetch(
          `/api/comments?pageSize=${PAGE_SIZE}${searchParam}${cityParam}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!response.ok) {
          throw new Error('Yorumlar yüklenirken hata oluştu');
        }
        
        const result: import('@/types').CursorPaginatedCommentsWithAnnouncesResponse = 
          await response.json();
        
        if (result.data.length === 0) {
          showToast("Henüz yeni Tecrübe yok", "info");
          return;
        }
        
        // En son bilinen yorumdan daha yeni yorumlar var mı kontrol et
        if (latestCommentTime && result.data[0].created_at > latestCommentTime) {
          // Yeni yorumları filtrele
          const newComments = result.data.filter(
            comment => comment.created_at > latestCommentTime
          );
          
          if (newComments.length > 0) {
            // Yeni yorumları listenin başına ekle
            setComments(prev => [...newComments, ...prev]);
            setLatestCommentTime(result.data[0].created_at);
            showToast(`${newComments.length} yeni Tecrübe yüklendi`, "success");
          } else {
            showToast("Henüz yeni Tecrübe yok", "info");
          }
        } else {
          showToast("Henüz yeni Tecrübe yok", "info");
        }
      } catch (error) {
        console.error('Yeni yorumlar kontrol edilirken hata:', error);
        showToast("Yeni yorumlar kontrol edilirken bir hata oluştu", "error");
      }
    };
    
    /**
     * Mevcut yorumların duyuru bilgilerini güncelle
     * Duyuru işlemi yapıldığında çağrılır
     */
    const refreshAnnounceData = async () => {
      try {
        const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
        const cityParam = selectedCity ? `&city=${encodeURIComponent(selectedCity)}` : '';
        
        const response = await fetch(
          `/api/comments?pageSize=${PAGE_SIZE}${searchParam}${cityParam}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!response.ok) {
          throw new Error('Yorumlar yüklenirken hata oluştu');
        }
        
        const result: import('@/types').CursorPaginatedCommentsWithAnnouncesResponse = 
          await response.json();
        
        // Mevcut yorumları güncelle (sadece duyuru bilgileri)
        setComments(prevComments => {
          return prevComments.map(prevComment => {
            const updatedComment = result.data.find(c => c.id === prevComment.id);
            if (updatedComment) {
              return {
                ...prevComment,
                announceCount: updatedComment.announceCount,
                hasAnnounced: updatedComment.hasAnnounced
              };
            }
            return prevComment;
          });
        });
      } catch (error) {
        console.error('Duyuru bilgileri güncellenirken hata:', error);
      }
    };
    
    // lastRefreshTime değiştiğinde yeni yorumları kontrol et veya duyuru bilgilerini güncelle
    useEffect(() => {
      if (lastRefreshTime && lastRefreshTime > 0) {
        // Eğer onAnnounceChange callback'i varsa, bu duyuru değişikliği demektir
        // Sadece duyuru bilgilerini güncelle
        if (onAnnounceChange) {
          refreshAnnounceData();
        } else {
          // Normal refresh ise yeni yorumları kontrol et
          checkForNewComments();
        }
      }
    }, [lastRefreshTime]);
  
    return (
      <div className="mt-8">
        {/* Başlık ve Filtreleme */}
        <div className="flex justify-between items-center mb-6">
          {selectedCity ? (
            <div className="flex items-start gap-4">
              <div>
                <h2 className="text-3xl font-semibold text-gray-900">
                  {selectedCity} Yorumları
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {comments.length} Tecrübe bulundu
                </p>
              </div>
              {onClearCitySelection && (
                <button
                  onClick={onClearCitySelection}
                  className="mt-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Tümünü Gör
                </button>
              )}
            </div>
          ) : (
            <h2 className="text-3xl font-semibold text-gray-900">
              <span 
                className={`inline-block transition-all duration-300 ${
                  isAnimating ? "opacity-0 transform -translate-y-2" : "opacity-100 transform translate-y-0"
                }`}
              >
                {categories[currentIndex]}
              </span>
            </h2>
          )}
          <RefreshButton onRefresh={onRefresh} />
        </div>
        
        {/* İnceleme Kartları */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <ReviewCardSkeleton key={i} />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-16 px-4">
            {searchTerm ? (
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Arama sonucu bulunamadı
                </h3>
                <p className="text-gray-500">
                  Arama kriterlerine uygun Tecrübe bulunamadı. Farklı bir arama terimi deneyin.
                </p>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 shadow-sm border border-red-100">
                <div className="text-6xl mb-6">👋</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Merhaba! İlk yorumu sen yapmak ister misin?
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Bu platform henüz yeni açıldı ve senin deneyimlerini duymayı çok isteriz! 
                  Gittiğin bir kafe, çalıştığın bir ofis ya da alışveriş yaptığın bir mağaza hakkında 
                  ilk yorumu yapan kişi sen ol. Diğer kullanıcılara yol göster! 🌟
                </p>
                <a 
                  href="/add-review" 
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition-all transform hover:scale-105 shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  İlk Yorumu Yap
                </a>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {comments.map((comment) => (
                <ReviewCard
                  key={comment.id}
                  commentId={comment.id}
                  company={comment.business_name}
                  address={`${comment.district}, ${comment.city}`}
                  rating={comment.rating}
                  review={comment.experience}
                  date={new Date(comment.created_at).toLocaleDateString("tr-TR")}
                  username={comment.username}
                  announceCount={comment.announceCount || 0}
                  hasAnnounced={comment.hasAnnounced || false}
                  showToast={showToast}
                  onAnnounceChange={onAnnounceChange}
                />
              ))}
            </div>
            
            {/* Infinite Scroll Tetikleyici */}
            <div ref={observerTarget} className="w-full py-8">
              {loadingMore && (
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 text-gray-400">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                    <span>Daha fazla Tecrübe yükleniyor...</span>
                  </div>
                </div>
              )}
              {!hasMore && comments.length > 0 && (
                <div className="text-center text-gray-400">
                  <p>Tüm yorumlar yüklendi</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }