"use client";

import { Utensils, Menu, AlertCircle, Trash2, Edit, MapPin, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyReviewsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  // Kullanıcı girişini kontrol et (şimdilik localStorage kullanıyoruz)
  useEffect(() => {
    const checkAuth = () => {
      // TODO: Gerçek auth sistemine bağlanacak
      const user = localStorage.getItem("user");
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  // Yükleme durumu
  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  // Giriş yapılmamışsa uyarı sayfası göster
  if (!isLoggedIn) {
    return <LoginRequiredPage />;
  }

  // Giriş yapılmışsa yorumlar sayfasını göster
  return <ReviewsListPage />;
}

function LoginRequiredPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-20">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Önce Giriş Yapmalısınız
          </h1>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Yorumlarınızı görüntüleyebilmek için lütfen önce giriş yapın.
            Eğer henüz bir hesabınız yoksa, hemen kayıt olarak 
            yorumlarınızı takip edebilirsiniz.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/auth")}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg shadow-red-500/50 transition-all"
            >
              Giriş Yap
            </button>
            <button
              onClick={() => router.push("/")}
              className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-8 rounded-lg border-2 border-gray-200 transition-all"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function ReviewsListPage() {
  // Örnek veri (gerçek uygulamada API'den gelecek)
  const [reviews, setReviews] = useState([
    {
      id: 1,
      businessName: "Starbucks",
      city: "İstanbul",
      experience: "Çalışma ortamı oldukça iyi. Takım arkadaşlarım destekleyici ve yönetim anlayışlı. Mesai saatleri düzenli ve çalışan haklarına önem veriliyor. Özellikle eğitim programları çok faydalı.",
      date: "2024-03-15",
      status: "approved"
    },
    {
      id: 2,
      businessName: "McDonald's",
      city: "Ankara",
      experience: "İlk iş deneyimim için iyiydi ancak mesai saatleri biraz yoğun. Öğrenci için esnek çalışma saatleri sunmaları güzel. Ekip çalışması konusunda çok şey öğrendim.",
      date: "2024-02-28",
      status: "pending"
    },
    {
      id: 3,
      businessName: "Burger King",
      city: "İzmir",
      experience: "Hızlı tempolu bir çalışma ortamı. Stresli anlar olabiliyor ama takım çalışması güçlü. Maaş ödemeleri düzenli ve sigorta konusunda sorun yaşamadım.",
      date: "2024-01-20",
      status: "approved"
    }
  ]);

  const handleDelete = (id: number) => {
    if (confirm("Bu yorumu silmek istediğinize emin misiniz?")) {
      setReviews(reviews.filter(review => review.id !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "approved") {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
          Onaylandı
        </span>
      );
    } else if (status === "pending") {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
          İnceleniyor
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Yorumlarım</h1>
          <p className="text-gray-500">
            Toplam {reviews.length} yorum paylaştınız
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Utensils className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Henüz Yorum Yapmadınız
            </h2>
            <p className="text-gray-500 mb-6">
              İlk yorumunuzu ekleyerek deneyimlerinizi paylaşmaya başlayın.
            </p>
            <a href="/add-review">
              <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg shadow-red-500/50 transition-all">
                Yorum Ekle
              </button>
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {review.businessName}
                      </h3>
                      {getStatusBadge(review.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {review.city && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{review.city}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(review.date).toLocaleDateString("tr-TR")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Düzenle"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  {review.experience}
                </p>
              </div>
            ))}
          </div>
        )}

        {reviews.length > 0 && (
          <div className="mt-8 text-center">
            <a href="/add-review">
              <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg shadow-red-500/50 transition-all">
                Yeni Yorum Ekle
              </button>
            </a>
          </div>
        )}
      </main>
    </div>
  );
}

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  if (!isMounted) {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <a className="flex items-center gap-2" href="/">
              <Utensils className="h-5 w-5 text-primary" />
              <span className="font-semibold">Heard!</span>
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
            <Utensils className="h-5 w-5 text-primary" />
            <span className="font-semibold">Heard!</span>
          </a>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a className="text-foreground hover:text-primary transition-colors" href="/">
            Ana Sayfa
          </a>
          <a className="text-foreground hover:text-primary transition-colors" href="/add-review">
            Yorum Ekle
          </a>
          <a aria-current="page" className="text-primary hover:text-primary transition-colors" href="/account/reviews">
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
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-red-600 text-white hover:bg-red-700 h-9 px-3" 
                aria-label="Çıkış Yap"
              >
                Çıkış Yap
              </button>
            ) : (
              <a href="/auth">
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3" aria-label="Giriş Yap">
                  Giriş Yap
                </button>
              </a>
            )}
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9"
            aria-label="Menüyü Aç"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 space-y-3">
          <a
            className="block text-foreground hover:text-primary transition-colors py-2"
            href="/"
          >
            Ana Sayfa
          </a>
          <a
            className="block text-foreground hover:text-primary transition-colors py-2"
            href="/add-review"
          >
            Yorum Ekle
          </a>
          <a
            aria-current="page"
            className="block text-primary hover:text-primary transition-colors py-2"
            href="/account/reviews"
          >
            Yorumlarım
          </a>
        </div>
      )}
    </header>
  );
}
