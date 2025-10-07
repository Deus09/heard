"use client";

import { Star, Map, List, ChevronDown, Search, Bookmark, Plus, ForkKnife, MapPin, Utensils, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-6xl mx-auto px-6">
        <HeroSection />
        <Controls searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <ReviewsContainer searchTerm={searchTerm} />
      </main>
    </div>
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
          <a aria-current="page" className="text-primary hover:text-primary transition-colors" href="/">
            Ana Sayfa
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
        <h1 className="text-6xl font-extrabold text-red-600">Duyur!</h1>
      </div>
      <p className="text-md text-gray-500 mb-6">
        İş deneyimlerinizi anonim olarak paylaşın
      </p>
      
      {/* Ana Eylem Butonu */}
      <a href="/add-review">
        <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6  rounded-xl shadow-lg shadow-red-500/50 transition-all flex items-center space-x-2 mb-12">
          <Plus className="h-5 w-5" />
          <span>Yorum Ekle</span>
        </button>
      </a>
    </div>
  );
}

function Controls({ searchTerm, onSearchChange }: { searchTerm: string; onSearchChange: (value: string) => void }) {
  return (
    <div className="space-y-6 mb-8">
      {/* Arama Çubuğu - Ortalanmış */}
      <div className="flex justify-center">
        <div className="w-full max-w-lg">
          <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
        </div>
      </div>
      
      {/* Görünüm Seçici - Sağda */}
      <div className="flex justify-end">
        <ViewToggle />
      </div>
    </div>
  );
}

function SearchBar({ searchTerm, onSearchChange }: { searchTerm: string; onSearchChange: (value: string) => void }) {
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

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholders[placeholderIndex]}
        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
      />
    </div>
  );
}

function ViewToggle() {
  return (
    <div className="inline-flex border border-red-600 rounded-full overflow-hidden">
      {/* Aktif: List View */}
      <button className="bg-red-600 text-white py-2 px-4 flex items-center space-x-2">
        <List className="h-4 w-4" />
        <span>Liste Görünümü</span>
      </button>
      {/* Pasif: Map View */}
      <button className="bg-white text-red-600 py-2 px-4 flex items-center space-x-2 hover:bg-red-50 transition-colors">
        <Map className="h-4 w-4" />
        <span>Harita Görünümü</span>
      </button>
    </div>
  );
}

function ReviewsContainer({ searchTerm }: { searchTerm: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  useEffect(() => {
    loadComments();
  }, [searchTerm]); // searchTerm değiştiğinde yorumları yeniden yükle

  const loadComments = async () => {
    setLoading(true);
    try {
      const { commentsService } = await import("@/services/comments");
      const data = await commentsService.getComments(searchTerm);
      setComments(data.slice(0, 6)); // İlk 6 yorumu göster
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      {/* Başlık ve Filtreleme */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-900">
          <span 
            className={`inline-block transition-all duration-300 ${
              isAnimating ? "opacity-0 transform -translate-y-2" : "opacity-100 transform translate-y-0"
            }`}
          >
            {categories[currentIndex]}
          </span>
        </h2>
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
          <p className="text-gray-500">Henüz yorum bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {comments.map((comment) => (
            <ReviewCard
              key={comment.id}
              company={comment.business_name}
              address={`${comment.district}, ${comment.city}`}
              rating={comment.rating}
              review={comment.experience}
              date={new Date(comment.created_at).toLocaleDateString("tr-TR")}
              username={comment.username}
            />
          ))}
        </div>
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
}

function ReviewCard({ company, address, rating, review, date, username }: ReviewCardProps) {
  return (
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
        {/* Sağ Üst İkon */}
        <Bookmark className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
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
      <p className="text-gray-900 mb-4 leading-relaxed">{review}</p>
      
      {/* Alt Kısım: Kullanıcı ve Tarih */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{username ? `@${username}` : 'Anonim'}</span>
        <span>{date}</span>
      </div>
    </div>
  );
}
