"use client";

import { Star, Plus, Menu, ChevronDown } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import ReviewDetailModal from "@/components/ReviewDetailModal";
import ReviewCardSmallSkeleton from "@/components/ReviewCardSmallSkeleton";
import { useToast } from "@/components/ui/toast";
import { commentsService } from "@/services/comments";
import Link from 'next/link'; // Sayfanın en üstüne ekle

type TimeFilter = 'week' | 'month' | 'year' | 'all';

interface CommentWithAnnounce {
  id: string;
  business_name: string;
  city: string;
  district: string;
  experience: string;
  rating: number;
  username: string;
  created_at: string;
  announceCount: number;
  hasAnnounced: boolean;
}

export default function DuyDuyPage() {
  const { showToast, ToastContainer } = useToast();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="max-w-6xl mx-auto px-6 flex-grow">
        <HeroSection timeFilter={timeFilter} onFilterChange={setTimeFilter} />
        <ReviewsContainer showToast={showToast} timeFilter={timeFilter} />
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
            <Image 
              src="/favicon/favicon-32x32.png" 
              alt="Duyur!" 
              width={20} 
              height={20} 
              className="h-5 w-5"
              priority
            />
            <span className="font-semibold">Duyur!</span>
          </Link> 
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link className="text-foreground hover:text-primary transition-colors" href="/">
            Ana Sayfa
          </Link> 
          <Link aria-current="page" className="text-primary hover:text-primary transition-colors" href="/duyduy">
            DuydunMu?
          </Link> 
          <Link className="text-foreground hover:text-primary transition-colors" href="/add-review">
            Tecrübe Ekle
          </Link> 
          <Link className="text-foreground hover:text-primary transition-colors" href="/account/reviews">
            Tecrübelerim
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

function HeroSection({ 
  timeFilter, 
  onFilterChange 
}: { 
  timeFilter: TimeFilter; 
  onFilterChange: (filter: TimeFilter) => void 
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filterLabels = {
    week: 'Bu Hafta',
    month: 'Bu Ay',
    year: 'Bu Yıl',
    all: 'Tüm Zamanlar'
  };

  return (
    <div className="flex flex-col items-center py-12">
      {/* Büyük Logo ve Slogan */}
      <div className="flex items-center space-x-3 mb-2">
        <Image 
          src="/favicon/android-chrome-192x192.png" 
          alt="Duyur!" 
          width={48} 
          height={48} 
          className="h-12 w-12"
          priority
        />
        <h1 className="text-6xl font-extrabold text-red-600">DuydunMu?</h1>
      </div>
      <p className="text-md text-gray-500 mt-2 mb-6">
        En çok duyurulan yorumlar
      </p>

      {/* Zaman Filtresi Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="inline-flex items-center justify-between gap-3 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-red-600 transition-all shadow-sm min-w-[200px] group"
        >
          <span className="font-semibold text-gray-700 group-hover:text-red-600 transition-colors">
            {filterLabels[timeFilter]}
          </span>
          <ChevronDown 
            className={`h-5 w-5 text-gray-400 group-hover:text-red-600 transition-all ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isDropdownOpen && (
          <>
            {/* Overlay - dropdown dışına tıklandığında kapat */}
            <div 
              className="fixed inset-0 z-10"
              onClick={() => setIsDropdownOpen(false)}
            />
            
            {/* Dropdown Menü */}
            <div className="absolute top-full mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden z-20">
              {(Object.keys(filterLabels) as TimeFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    onFilterChange(filter);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-6 py-3 text-left font-medium transition-colors ${
                    timeFilter === filter
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {filterLabels[filter]}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ReviewsContainer({ 
  showToast, 
  timeFilter 
}: { 
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  timeFilter: TimeFilter;
}) {
  const [comments, setComments] = useState<CommentWithAnnounce[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<CommentWithAnnounce | null>(null);

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await commentsService.getCommentsWithAnnouncesFiltered(timeFilter);
      setComments(data);
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error);
      showToast('Yorumlar yüklenirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, timeFilter]);

  const handleAnnounceChange = () => {
    // Duyuru değişikliği olduğunda verileri yeniden yükle
    loadComments();
  };

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <ReviewCardSmallSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg mb-4">Henüz duyuru yapılmamış.</p>
        <Link href="/add-review">
          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-red-500/50 transition-all flex items-center space-x-2 mx-auto">
            <Plus className="h-5 w-5" />
            <span>İlk Yorumu Sen Ekle</span>
          </button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {comments.map((comment) => (
          <ReviewCard
            key={comment.id}
            review={comment}
            onSelect={() => setSelectedReview(comment)}
          />
        ))}
      </div>

      {selectedReview && (
        <ReviewDetailModal
          isOpen={!!selectedReview}
          onClose={() => setSelectedReview(null)}
          company={selectedReview.business_name}
          address={`${selectedReview.district}, ${selectedReview.city}`}
          rating={selectedReview.rating}
          review={selectedReview.experience}
          date={new Date(selectedReview.created_at).toLocaleDateString('tr-TR')}
          username={selectedReview.username}
          commentId={selectedReview.id}
          announceCount={selectedReview.announceCount}
          hasAnnounced={selectedReview.hasAnnounced}
          showToast={showToast}
          onAnnounceChange={handleAnnounceChange}
        />
      )}
    </>
  );
}

function ReviewCard({ 
  review, 
  onSelect
}: { 
  review: CommentWithAnnounce; 
  onSelect: () => void;
}) {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer relative group min-h-[280px] flex flex-col"
      onClick={onSelect}
    >
      {/* Duyur Butonu - Sağ üst köşe (Sadece görüntüleme - tıklanamaz) */}
      <div className="absolute top-4 right-4 flex flex-col items-center gap-1">
        <div
          className="cursor-default"
          aria-label="Duyuru sayısı"
        >
          <Image 
            src="/favicon/favicon-32x32.png" 
            alt="Duyur" 
            width={24} 
            height={24}
            className={review.hasAnnounced ? "duyur-active" : "duyur-inactive"}
            loading="lazy"
          />
        </div>
        {review.announceCount > 0 && (
          <span className={`text-xs font-semibold ${review.hasAnnounced ? 'text-red-600' : 'text-gray-400'}`}>
            {review.announceCount}
          </span>
        )}
      </div>

      {/* Yıldızlar */}
      <div className="flex mb-2">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>

      {/* İşletme Adı */}
      <h3 className="font-bold text-lg mb-2 pr-8">{review.business_name}</h3>

      {/* Konum */}
      <p className="text-sm text-gray-500 mb-3">
        {review.district}, {review.city}
      </p>

      {/* Tecrübe */}
      <p className="text-gray-700 mb-4 line-clamp-3 flex-grow min-h-[72px]">
        {review.experience}
      </p>

      {/* Kullanıcı ve Tarih */}
      <div className="flex items-center justify-between text-xs text-gray-400 border-t pt-3">
        <span>{review.username}</span>
        <span>{new Date(review.created_at).toLocaleDateString('tr-TR')}</span>
      </div>
    </div>
  );
}
