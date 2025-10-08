"use client";

import { Menu, Mail, Lock, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import { useToast } from "@/components/ui/toast";
import { validateEmail } from "@/lib/utils";
import Image from "next/image";
import Link from 'next/link'; // Sayfanın en üstüne ekle


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
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
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

  // Kullanıcı adı kontrolü için debounce
  useEffect(() => {
    if (isLogin || !formData.username) {
      setUsernameAvailable(null);
      setUsernameError("");
      return;
    }

    // Min 4 karakter kontrolü
    if (formData.username.length < 4) {
      setUsernameAvailable(false);
      setUsernameError("Kullanıcı adı en az 4 karakter olmalıdır");
      return;
    }

    setUsernameError("");
    setUsernameChecking(true);

    const timeoutId = setTimeout(async () => {
      try {
        const available = await authService.checkUsernameAvailability(formData.username);
        setUsernameAvailable(available);
      } catch (err) {
        console.error("Username check error:", err);
        setUsernameAvailable(false);
      } finally {
        setUsernameChecking(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [formData.username, isLogin]);

  // E-posta validasyonu
  useEffect(() => {
    if (!formData.email) {
      setEmailError("");
      setEmailValid(null);
      return;
    }

    const validation = validateEmail(formData.email);
    setEmailValid(validation.isValid);
    setEmailError(validation.error || "");
  }, [formData.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // E-posta validasyonu
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        setError(emailValidation.error || "Geçersiz e-posta adresi");
        setLoading(false);
        return;
      }

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
    } catch (err) {
      console.error("Auth error:", err);
      const errorMessage = err instanceof Error ? err.message : "Bir hata oluştu";
      setError(errorMessage);
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
                  minLength={4}
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                    formData.username.length > 0
                      ? usernameError || (usernameAvailable === false && !usernameChecking)
                        ? 'border-red-300 focus:ring-red-600'
                        : usernameAvailable === true
                        ? 'border-green-300 focus:ring-green-600'
                        : 'border-gray-300 focus:ring-red-600'
                      : 'border-gray-300 focus:ring-red-600'
                  }`}
                />
              </div>
              {/* Kullanıcı adı kontrol durumu */}
              {formData.username.length > 0 && (
                <div className="mt-2">
                  {usernameChecking && (
                    <p className="text-xs text-gray-500">Kontrol ediliyor...</p>
                  )}
                  {!usernameChecking && usernameError && (
                    <p className="text-xs text-red-600">{usernameError}</p>
                  )}
                  {!usernameChecking && !usernameError && usernameAvailable === true && (
                    <p className="text-xs text-green-600">✓ Kullanıcı adı müsait</p>
                  )}
                  {!usernameChecking && !usernameError && usernameAvailable === false && (
                    <p className="text-xs text-red-600">✗ Bu kullanıcı adı daha önce alınmış</p>
                  )}
                </div>
              )}
              {formData.username.length === 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  En az 4 karakter. Bu isim yorumlarınızda görünecektir.
                </p>
              )}
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
                placeholder="ornek@gmail.com"
                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                  formData.email.length > 0
                    ? emailValid === false
                      ? 'border-red-300 focus:ring-red-600'
                      : emailValid === true
                      ? 'border-green-300 focus:ring-green-600'
                      : 'border-gray-300 focus:ring-red-600'
                    : 'border-gray-300 focus:ring-red-600'
                }`}
              />
            </div>
            {/* E-posta validasyon durumu */}
            {formData.email.length > 0 && (
              <div className="mt-2">
                {emailError && (
                  <p className="text-xs text-red-600">{emailError}</p>
                )}
                {emailValid === true && (
                  <p className="text-xs text-green-600">✓ Geçerli e-posta adresi</p>
                )}
              </div>
            )}
            {formData.email.length === 0 && (
              <p className="mt-2 text-xs text-gray-500">
                @ işareti ve geçerli domain içermelidir (örn: @gmail.com)
              </p>
            )}
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
              disabled={
                loading || 
                emailValid !== true || 
                (!isLogin && (usernameAvailable !== true || formData.username.length < 4))
              }
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
                  setUsernameAvailable(null);
                  setUsernameError("");
                  setUsernameChecking(false);
                  setEmailValid(null);
                  setEmailError("");
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
          <Link className="text-foreground hover:text-primary transition-colors" href="/">
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
