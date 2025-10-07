"use client";

import { Star, Plus, Menu } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import ReviewDetailModal from "@/components/ReviewDetailModal";
import { useToast } from "@/components/ui/toast";
import { commentsService } from "@/services/comments";

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="max-w-6xl mx-auto px-6 flex-grow">
        <HeroSection />
        <ReviewsContainer showToast={showToast} />
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
            <a className="flex items-center gap-2" href="/">
              <Image src="/favicon/favicon-32x32.png" alt="Duyur!" width={20} height={20} className="h-5 w-5" />
              <span className="font-semibold">Duyur!</span>
            </a>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <a className="flex items-center gap-2" href="/">
            <Image src="/favicon/favicon-32x32.png" alt="Duyur!" width={20} height={20} className="h-5 w-5" />
            <span className="font-semibold">Duyur!</span>
          </a>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a className="text-foreground hover:text-primary transition-colors" href="/">
            Ana Sayfa
          </a>
          <a aria-current="page" className="text-primary hover:text-primary transition-colors" href="/duyduy">
            DuyDuy!!!
          </a>
          <a className="text-foreground hover:text-primary transition-colors" href="/add-review">
            Yorum Ekle
          </a>
          <a className="text-foreground hover:text-primary transition-colors" href="/account/reviews">
            Yorumlarım
          </a>
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
              <a href="/auth">
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2" aria-label="Giriş Yap">
                  Giriş Yap
                </button>
              </a>
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
              <a href="/auth">
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2" aria-label="Giriş Yap">
                  Giriş Yap
                </button>
              </a>
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
        <h1 className="text-6xl font-extrabold text-red-600">DuyDuy!!!</h1>
      </div>
      <p className="text-md text-gray-500 mb-6">
        En çok duyurulan yorumlar
      </p>
    </div>
  );
}

function ReviewsContainer({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void }) {
  const [comments, setComments] = useState<CommentWithAnnounce[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<CommentWithAnnounce | null>(null);

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await commentsService.getCommentsWithAnnounces();
      
      // Duyuru sayısına göre azalan sırada sırala
      const sortedData = data.sort((a, b) => b.announceCount - a.announceCount);
      
      setComments(sortedData);
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error);
      showToast('Yorumlar yüklenirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleAnnounce = async (commentId: string) => {
    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;

      if (comment.hasAnnounced) {
        await commentsService.unannounceComment(commentId);
        showToast('Duyuru geri alındı', 'success');
      } else {
        await commentsService.announceComment(commentId);
        showToast('Yorum duyuruldu!', 'success');
      }

      // Yorumları yeniden yükle
      await loadComments();
    } catch (error: any) {
      showToast(error.message || 'Bir hata oluştu', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg mb-4">Henüz duyuru yapılmamış.</p>
        <a href="/add-review">
          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-red-500/50 transition-all flex items-center space-x-2 mx-auto">
            <Plus className="h-5 w-5" />
            <span>İlk Yorumu Sen Ekle</span>
          </button>
        </a>
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
            onAnnounce={handleAnnounce}
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
        />
      )}
    </>
  );
}

function ReviewCard({ 
  review, 
  onSelect,
  onAnnounce 
}: { 
  review: CommentWithAnnounce; 
  onSelect: () => void;
  onAnnounce: (commentId: string) => void;
}) {
  const handleAnnounceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAnnounce(review.id);
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer relative group"
      onClick={onSelect}
    >
      {/* Duyur Butonu - Sağ üst köşe */}
      <div className="absolute top-4 right-4 flex flex-col items-center gap-1">
        <button
          onClick={handleAnnounceClick}
          className="transition-transform hover:scale-110"
          aria-label={review.hasAnnounced ? "Duyuruyu Geri Al" : "Duyur"}
        >
          <Image 
            src="/favicon/favicon-32x32.png" 
            alt="Duyur" 
            width={24} 
            height={24}
            className={review.hasAnnounced ? "duyur-active" : "duyur-inactive"}
          />
        </button>
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

      {/* Yorum */}
      <p className="text-gray-700 mb-4 line-clamp-3">
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
