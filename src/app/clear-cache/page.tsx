"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ClearCachePage() {
  const [cleared, setCleared] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // LocalStorage'daki cache'i temizle
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cached_comments');
      
      // Service Worker cache'ini temizle (varsa)
      if ('caches' in window) {
        caches.keys().then(function(names) {
          for (let name of names) caches.delete(name);
        });
      }
      
      setCleared(true);
    }
  }, []);

  const handleGoHome = () => {
    // Ana sayfaya git ve hard refresh yap
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {cleared ? (
          <>
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Önbellek Temizlendi!
            </h1>
            <p className="text-gray-600 mb-4">
              Tarayıcı önbelleği başarıyla temizlendi. 
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Ana sayfaya döndüğünde "İlk yorumu sen yapmak ister misin?" karşılama mesajını göreceksin.
            </p>
            <button
              onClick={handleGoHome}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-md"
            >
              Ana Sayfaya Dön (Hard Refresh)
            </button>
          </>
        ) : (
          <>
            <div className="text-6xl mb-6">🔄</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Önbellek Temizleniyor...
            </h1>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
