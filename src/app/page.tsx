"use client";

import { Star, Map, List, ChevronDown, Search, Bookmark, Plus, ForkKnife, MapPin, Menu } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ReviewDetailModal from "@/components/ReviewDetailModal";
import { useToast } from "@/components/ui/toast";
import Link from 'next/link';
import dynamic from 'next/dynamic';

// TurkeyMap'i dinamik olarak yükle (SSR'yi devre dışı bırak)
const TurkeyMap = dynamic(() => import('@/components/TurkeyMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>
  )
});

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const { showToast, ToastContainer } = useToast();

  const handleSearch = (value: string) => {
    setActiveSearchTerm(value);
    // Manuel arama yapıldığında şehir seçimini temizle
    if (value !== selectedCity) {
      setSelectedCity(null);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setActiveSearchTerm("");
    setSelectedCity(null);
  };

  const handleCityClick = (city: string) => {
    setSelectedCity(city);
    setViewMode("list");
    setActiveSearchTerm(city);
    // Sayfanın başına smooth scroll
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className={`mx-auto px-6 flex-grow ${viewMode === "list" ? "max-w-6xl" : "max-w-full"}`}>
        <div className={viewMode === "list" ? "" : "max-w-[1400px] mx-auto"}>
          <HeroSection />
          <Controls 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm}
            onSearch={handleSearch}
            onClearSearch={handleClearSearch}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          {viewMode === "list" ? (
            <ReviewsContainer searchTerm={activeSearchTerm} showToast={showToast} selectedCity={selectedCity} />
          ) : (
            <MapContainer onCityClick={handleCityClick} />
          )}
        </div>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex justify-center">
          <p className="text-sm text-gray-500">
            Copyright © {new Date().getFullYear()} Duyur!
          </p>
        </div>
      </div>
    </footer>
  );
}

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Supabase kullanıcısını kontrol et
    import("@/services/auth").then(({ authService }) => {
      authService.getCurrentUser().then(user => {
        setIsLoggedIn(!!user);
      });

      // Auth state değişikliklerini dinle
      const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
        setIsLoggedIn(!!session?.user);
      });

      return () => subscription.unsubscribe();
    });
  }, []);

  const handleLogout = async () => {
    const { authService } = await import("@/services/auth");
    await authService.signOut();
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  // Client-side rendering için hydration uyarısını önle
  if (!isMounted) {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link className="flex items-center gap-2" href="/">
              <Image src="/favicon/favicon-32x32.png" alt="Duyur!" width={20} height={20} className="h-5 w-5" />
              <span className="font-semibold">Duyur!</span>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link className="flex items-center gap-2" href="/">
            <Image src="/favicon/favicon-32x32.png" alt="Duyur!" width={20} height={20} className="h-5 w-5" />
            <span className="font-semibold">Duyur!</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link aria-current="page" className="text-primary hover:text-primary transition-colors" href="/">
            Ana Sayfa
          </Link> 
          <Link className="text-foreground hover:text-primary transition-colors" href="/duyduy">
            DuyDuy!!!
          </Link> 
          <Link className="text-foreground hover:text-primary transition-colors" href="/add-review">
            Yorum Ekle
          </Link> 
          <Link className="text-foreground hover:text-primary transition-colors" href="/account/reviews">
            Yorumlarım
          </Link> 
        </nav>
        <div className="hidden md:block">
          <div className="">
            {isLoggedIn ? (
              <button 
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-red-600 text-white hover:bg-red-700 h-10 px-4 py-2" 
                aria-label="Çıkış Yap"
              >
                Çıkış Yap
              </button>
            ) : (
              <Link href="/auth">
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2" aria-label="Giriş Yap">
                  Giriş Yap
                </button>
              </Link>
            )}
          </div>
        </div>
        <div className="md:hidden flex items-center gap-2">
          <div className="">
            {isLoggedIn ? (
              <button 
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-red-600 text-white hover:bg-red-700 h-10 px-4 py-2" 
                aria-label="Çıkış Yap"
              >
                Çıkış Yap
              </button>
            ) : (
              <Link href="/auth">
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2" aria-label="Giriş Yap">
                  Giriş Yap
                </button>
              </Link>
            )}
          </div>
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10" aria-label="Menüyü Aç" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:r0:" data-state="closed">
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <div className="flex flex-col items-center py-12">
      {/* Büyük Logo ve Slogan */}
      <div className="flex items-center space-x-3 mb-2">
        <Image src="/favicon/android-chrome-192x192.png" alt="Duyur!" width={48} height={48} className="h-12 w-12" />
        <h1 className="text-6xl font-extrabold text-red-600">Duyur!</h1>
      </div>
      <p className="text-md text-gray-500 mb-6">
        İş deneyimlerinizi anonim olarak paylaşın
      </p>
      
      {/* Ana Eylem Butonu */}
      <Link href="/add-review">
        <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6  rounded-xl shadow-lg shadow-red-500/50 transition-all flex items-center space-x-2 mb-12">
          <Plus className="h-5 w-5" />
          <span>Yorum Ekle</span>
        </button>
      </Link>
    </div>
  );
}

function Controls({ 
  searchTerm, 
  onSearchChange, 
  onSearch,
  onClearSearch,
  viewMode,
  onViewModeChange 
}: { 
  searchTerm: string; 
  onSearchChange: (value: string) => void; 
  onSearch: (value: string) => void;
  onClearSearch: () => void;
  viewMode: "list" | "map";
  onViewModeChange: (mode: "list" | "map") => void;
}) {
  return (
    <div className="space-y-6 mb-8">
      {/* Arama Çubuğu - Ortalanmış */}
      <div className="flex justify-center">
        <div className="w-full max-w-lg">
          <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} onSearch={onSearch} onClearSearch={onClearSearch} />
        </div>
      </div>
      
      {/* Görünüm Seçici - Sağda */}
      <div className="flex justify-end">
        <ViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
      </div>
    </div>
  );
}

function SearchBar({ searchTerm, onSearchChange, onSearch, onClearSearch }: { searchTerm: string; onSearchChange: (value: string) => void; onSearch: (value: string) => void; onClearSearch: () => void }) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  
  const placeholders = [
    "Örneğin: Zara",
    "Örneğin: A101",
    "Örneğin: Sarıyer",
    "Örneğin: Starbucks",
    "Örneğin: Kadıköy",
    "Örneğin: McDonald's",
    "Örneğin: Beşiktaş",
    "Örneğin: LC Waikiki",
    "Örneğin: Şişli",
    "Örneğin: Migros",
    "Örneğin: Ankara",
    "Örneğin: Burger King",
    "Örneğin: İzmir",
    "Örneğin: Çarşı",
    "Örneğin: Beyoğlu"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000); // Her 3 saniyede bir değişir

    return () => clearInterval(interval);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(searchTerm);
    }
  };

  const handleClear = () => {
    onClearSearch();
  };

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholders[placeholderIndex]}
        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
      />
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Aramayı temizle"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}

function ViewToggle({ 
  viewMode, 
  onViewModeChange 
}: { 
  viewMode: "list" | "map"; 
  onViewModeChange: (mode: "list" | "map") => void;
}) {
  return (
    <div className="inline-flex border border-red-600 rounded-full overflow-hidden">
      {/* List View */}
      <button 
        onClick={() => onViewModeChange("list")}
        className={`py-2 px-3 md:px-4 flex items-center space-x-1 md:space-x-2 transition-colors ${
          viewMode === "list" 
            ? "bg-red-600 text-white" 
            : "bg-white text-red-600 hover:bg-red-50"
        }`}
      >
        <List className="h-4 w-4" />
        <span className="text-sm md:text-base">Liste Görünümü</span>
      </button>
      {/* Map View */}
      <button 
        onClick={() => onViewModeChange("map")}
        className={`py-2 px-3 md:px-4 flex items-center space-x-1 md:space-x-2 transition-colors ${
          viewMode === "map" 
            ? "bg-red-600 text-white" 
            : "bg-white text-red-600 hover:bg-red-50"
        }`}
      >
        <Map className="h-4 w-4" />
        <span className="text-sm md:text-base">Harita Görünümü</span>
      </button>
    </div>
  );
}

function MapContainer({ onCityClick }: { onCityClick: (city: string) => void }) {
  const [cityReviewCounts, setCityReviewCounts] = useState<Array<{ city: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCityReviewCounts = async () => {
      try {
        const { commentsService } = await import("@/services/comments");
        const counts = await commentsService.getCityReviewCounts();
        setCityReviewCounts(counts);
      } catch (error) {
        console.error('İl bazlı yorum sayıları yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCityReviewCounts();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center space-x-2 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span>Harita yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 max-w-full">
      <TurkeyMap reviewCounts={cityReviewCounts} onCityClick={onCityClick} />
    </div>
  );
}

function ReviewsContainer({ searchTerm, showToast, selectedCity }: { searchTerm: string; showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void; selectedCity: string | null }) {
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
  }, []);

  // searchTerm değiştiğinde listeyi sıfırla ve ilk sayfayı yükle
  useEffect(() => {
    // Eğer arama temizleniyorsa (boş string) ve cache varsa, cache'i kullan
    if (!searchTerm && typeof window !== 'undefined') {
      const cached = localStorage.getItem('cached_comments');
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          setComments(cachedData);
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
    loadComments(0, true);
  }, [searchTerm]);

  // Infinite scroll için Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMoreComments();
        }
      },
      { threshold: 0.1 }
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
  }, [hasMore, loading, loadingMore, page]);

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
        
        // İlk 4 yorumu localStorage'a kaydet (sadece arama yoksa)
        if (!searchTerm && result.data.length > 0) {
          const firstFour = result.data.slice(0, 4);
          try {
            localStorage.setItem('cached_comments', JSON.stringify(firstFour));
          } catch (e) {
            console.warn('localStorage kayıt hatası:', e);
          }
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
        <div className="text-center py-12">
          <div className="animate-pulse text-gray-400">Yorumlar yükleniyor...</div>
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

interface ReviewCardProps {
  company: string;
  address: string;
  rating: number;
  review: string;
  date: string;
  username?: string;
  commentId: string;
  announceCount?: number;
  hasAnnounced?: boolean;
  showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
}

function ReviewCard({ company, address, rating, review, date, username, commentId, announceCount = 0, hasAnnounced = false, showToast }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [announced, setAnnounced] = useState(hasAnnounced);
  const [count, setCount] = useState(announceCount);
  const [isProcessing, setIsProcessing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // Metnin 4 satırdan uzun olup olmadığını kontrol et
    if (textRef.current) {
      const lineHeight = parseFloat(getComputedStyle(textRef.current).lineHeight);
      const maxHeight = lineHeight * 4;
      const actualHeight = textRef.current.scrollHeight;
      setIsTruncated(actualHeight > maxHeight);
    }
  }, [review]);

  useEffect(() => {
    setAnnounced(hasAnnounced);
    setCount(announceCount);
  }, [hasAnnounced, announceCount]);

  const handleAnnounceClick = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Önce kullanıcı giriş yapmış mı kontrol et
      const { authService } = await import("@/services/auth");
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        // Giriş yapmamış kullanıcı - Toast ile bildir
        showToast('🔒 Duyur özelliğini kullanmak için giriş yapmalısınız', 'warning');
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1500);
        setIsProcessing(false);
        return;
      }
      
      // Optimistic update için eski değerleri sakla
      const oldAnnounced = announced;
      const oldCount = count;
      
      const { commentsService } = await import("@/services/comments");
      
      if (announced) {
        // Duyuruyu geri al
        await commentsService.unannounceComment(commentId);
        setAnnounced(false);
        setCount(prev => Math.max(0, prev - 1));
        showToast('✅ Duyuru geri alındı', 'success');
      } else {
        // Duyur
        await commentsService.announceComment(commentId);
        setAnnounced(true);
        setCount(prev => prev + 1);
        showToast('📢 Yorum duyuruldu!', 'success');
      }
    } catch (error) {
      console.error('Duyuru işlemi hatası:', error);
      
      // Kullanıcıya toast ile bilgi ver
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('zaten duyurdunuz')) {
        showToast('⚠️ Bu yorumu zaten duyurdunuz', 'warning');
      } else {
        showToast('❌ Bir hata oluştu. Lütfen tekrar deneyin', 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Üst Kısım: Restoran Adı ve Puan */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900">{company}</h3>
              <span className="text-sm text-gray-400">{rating}/5</span>
            </div>
            {/* Adres */}
            <div className="flex items-start space-x-1">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-500">{address}</p>
            </div>
          </div>
          {/* Sağ Üst Duyur Butonu */}
          <div className="flex flex-col items-center ml-2">
            <button 
              onClick={handleAnnounceClick}
              disabled={isProcessing}
              className={`transition-all duration-200 ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
              aria-label={announced ? "Duyuruyu geri al" : "Duyur"}
            >
              <Image 
                src="/favicon/favicon-32x32.png" 
                alt="Duyur" 
                width={24} 
                height={24} 
                className={`transition-all duration-200 ${announced ? '' : 'grayscale'}`}
              />
            </button>
            {count > 0 && (
              <span className={`text-xs mt-1 font-medium ${announced ? 'text-red-600' : 'text-gray-500'}`}>
                {count}
              </span>
            )}
          </div>
        </div>
        
        {/* Yıldızlar */}
        <div className="flex items-center mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'}`}
            />
          ))}
        </div>
        
        {/* İnceleme Metni */}
        <div className="mb-4">
          <p 
            ref={textRef}
            className={`text-gray-900 leading-relaxed ${isTruncated ? 'line-clamp-4' : ''}`}
          >
            {review}
          </p>
          {isTruncated && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-red-600 hover:text-red-700 font-medium text-sm mt-2 transition-colors"
            >
              Devamını oku
            </button>
          )}
        </div>
        
        {/* Alt Kısım: Kullanıcı ve Tarih */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{username ? `@${username}` : 'Anonim'}</span>
          <span>{date}</span>
        </div>
      </div>

      {/* Modal */}
      <ReviewDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        company={company}
        address={address}
        rating={rating}
        review={review}
        date={date}
        username={username}
        commentId={commentId}
        announceCount={count}
        hasAnnounced={announced}
        showToast={showToast}
      />
    </>
  );
}
