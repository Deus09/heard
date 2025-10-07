"use client";

import { Menu, Mail, Lock, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import { useToast } from "@/components/ui/toast";
import Image from "next/image";

export default function AuthPage() {
  const { showToast, ToastContainer } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Zaten giriş yapmışsa ana sayfaya yönlendir
  useEffect(() => {
    const checkUser = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        router.push("/");
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Giriş yap
        await authService.signIn(formData.email, formData.password);
        showToast("Giriş başarılı! Yönlendiriliyorsunuz...", "success");
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        // Kayıt ol
        if (!formData.username.trim()) {
          setError("Kullanıcı adı gereklidir");
          setLoading(false);
          return;
        }
        
        await authService.signUp(formData.email, formData.password, formData.username);
        
        // Başarılı kayıt mesajı göster
        showToast("Kayıt başarılı! Lütfen email adresinizi kontrol edin ve hesabınızı doğrulayın.", "success");
        
        // Formu temizle ve giriş ekranına geç
        setFormData({ email: "", password: "", username: "" });
        
        // 2 saniye sonra giriş ekranına geç
        setTimeout(() => {
          setIsLogin(true);
        }, 2000);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(""); // Hata mesajını temizle
  };

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer />
      <Header />
      <main className="max-w-md mx-auto px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </h1>
          <p className="text-gray-500">
            {isLogin 
              ? "Yorumlarınızı görüntülemek için giriş yapın" 
              : "Yorumlarınızı takip etmek için hesap oluşturun"
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Hata mesajı */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Kullanıcı Adı (sadece kayıt için) */}
          {!isLogin && (
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-900 mb-2">
                Kullanıcı Adı <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  required={!isLogin}
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="kullaniciadi"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Bu isim yorumlarınızda görünecektir.
              </p>
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
              E-posta Adresi <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="ornek@email.com"
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              />
            </div>
          </div>

          {/* Şifre */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
              Şifre <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder={isLogin ? "Şifrenizi girin" : "En az 6 karakter"}
                minLength={6}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              />
            </div>
            {!isLogin && (
              <p className="mt-2 text-xs text-gray-500">
                Şifreniz en az 6 karakter olmalıdır.
              </p>
            )}
          </div>

          {/* Gönder Butonu */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "İşleniyor..." : (isLogin ? "Giriş Yap" : "Kayıt Ol")}
            </button>
          </div>

          {/* Giriş/Kayıt Değiştirme */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {isLogin ? "Hesabınız yok mu?" : "Zaten hesabınız var mı?"}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ email: "", password: "", username: "" });
                  setError("");
                }}
                className="ml-2 text-red-600 hover:text-red-700 font-semibold transition-colors"
              >
                {isLogin ? "Kayıt Ol" : "Giriş Yap"}
              </button>
            </p>
          </div>
        </form>

        {/* Bilgi Notu */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            Hesabınız sadece yorumlarınızı görüntülemek için kullanılır. 
            E-posta doğrulaması gerektirmez.
          </p>
        </div>
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
    authService.getCurrentUser().then(user => {
      setIsLoggedIn(!!user);
    });

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await authService.signOut();
    setIsLoggedIn(false);
    window.location.href = "/";
  };

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
          <a className="text-foreground hover:text-primary transition-colors" href="/duyduy">
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
