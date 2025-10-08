"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import ReviewCardSkeleton from "@/components/ReviewCardSkeleton";
import ReviewCard from "@/components/ReviewCard";

export default function ReviewsContainer({ searchTerm, showToast, selectedCity }: { searchTerm: string; showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void; selectedCity: string | null }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [comments, setComments] = useState<import('@/types').CommentWithAnnounces[]>(() => {
      // İlk yüklemede localStorage'dan yorumları al
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('cached_comments');
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch (e) {
            return [];
          }
        }
      }
      return [];
    });
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const observerTarget = useRef<HTMLDivElement>(null);
    
    const PAGE_SIZE = 12;
    
    const categories = [
      "Kafe Yorumları",
      "Ofis Yorumları",
      "Restoran Yorumları",
      "Market Yorumları",
      "Giyim Mağazası Yorumları"
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
  
    // searchTerm değiştiğinde listeyi sıfırla ve ilk sayfayı yükle
    useEffect(() => {
      // Eğer arama temizleniyorsa (boş string) ve cache varsa, önce cache'i göster
      if (!searchTerm && typeof window !== 'undefined') {
        const cached = localStorage.getItem('cached_comments');
        if (cached) {
          try {
            const cachedData = JSON.parse(cached);
            setComments(cachedData);
            setLoading(false); // Cache'den yükledik, loading'i false yap
          } catch (e) {
            setComments([]);
          }
        } else {
          setComments([]);
        }
      } else {
        setComments([]);
      }
      
      setPage(0);
      setHasMore(true);
      
      // Cache varsa ve arama yoksa, arka planda güncelle
      const shouldShowCache = !searchTerm && typeof window !== 'undefined' && localStorage.getItem('cached_comments');
      loadComments(0, !shouldShowCache);
    }, [searchTerm]);
  
    // Infinite scroll için Intersection Observer
    useEffect(() => {
      if (!hasMore || loading || loadingMore) return;
      
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMoreComments();
          }
        },
        { threshold: 0.1, rootMargin: '100px' }
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
    }, [hasMore, loading, loadingMore]);
  
    const loadComments = async (pageNum: number, isInitial: boolean = false) => {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      try {
        const { commentsService } = await import("@/services/comments");
        const result = await commentsService.getCommentsPaginatedWithAnnounces(pageNum, PAGE_SIZE, searchTerm);
        
        if (isInitial) {
          setComments(result.data);
          
          // LocalStorage kaydını async yap - main thread'i bloklamaz
          if (!searchTerm && result.data.length > 0) {
            setTimeout(() => {
              const firstFour = result.data.slice(0, 4);
              try {
                localStorage.setItem('cached_comments', JSON.stringify(firstFour));
              } catch (e) {
                console.warn('localStorage kayıt hatası:', e);
              }
            }, 0);
          }
        } else {
          setComments(prev => [...prev, ...result.data]);
        }
        
        setHasMore(result.hasMore);
      } catch (error) {
        console.error('Yorumlar yüklenirken hata:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
  
    const loadMoreComments = () => {
      const nextPage = page + 1;
      setPage(nextPage);
      loadComments(nextPage, false);
    };
  
    return (
      <div className="mt-8">
        {/* Başlık ve Filtreleme */}
        <div className="flex justify-between items-center mb-6">
          {selectedCity ? (
            <div>
              <h2 className="text-3xl font-semibold text-gray-900">
                {selectedCity} Yorumları
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {comments.length} yorum bulundu
              </p>
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
          <button className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-colors">
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
        
        {/* İnceleme Kartları */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <ReviewCardSkeleton key={i} />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? 'Arama kriterlerine uygun yorum bulunamadı.' : 'Henüz yorum bulunmuyor.'}
            </p>
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
                />
              ))}
            </div>
            
            {/* Infinite Scroll Tetikleyici */}
            <div ref={observerTarget} className="w-full py-8">
              {loadingMore && (
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 text-gray-400">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                    <span>Daha fazla yorum yükleniyor...</span>
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