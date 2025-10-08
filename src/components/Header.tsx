"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10" 
              aria-label={isMobileMenuOpen ? "Menüyü Kapat" : "Menüyü Aç"} 
              type="button"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link 
                href="/" 
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Ana Sayfa
              </Link>
              <Link 
                href="/duyduy" 
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                DuyDuy!!!
              </Link>
              <Link 
                href="/add-review" 
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Yorum Ekle
              </Link>
              <Link 
                href="/account/reviews" 
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Yorumlarım
              </Link>
            </nav>
          </div>
        )}
      </header>
    );
  }