"use client";

import { X, Star, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";


interface ReviewDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: string;
  address: string;
  rating: number;
  review: string;
  date: string;
  username?: string;
  commentId?: string;
  announceCount?: number;
  hasAnnounced?: boolean;
  showToast?: (message: string, type?: "success" | "error" | "info" | "warning") => void;
}

export default function ReviewDetailModal({
  isOpen,
  onClose,
  company,
  address,
  rating,
  review,
  date,
  username,
  commentId,
  announceCount = 0,
  hasAnnounced = false,
  showToast,
}: ReviewDetailModalProps) {
  const [announced, setAnnounced] = useState(hasAnnounced);
  const [count, setCount] = useState(announceCount);
  const [isProcessing, setIsProcessing] = useState(false);


  // ESC tuşu ile kapatma
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Arka planın scroll olmasını engelle
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    setAnnounced(hasAnnounced);
    setCount(announceCount);
  }, [hasAnnounced, announceCount]);

  const handleAnnounceClick = async () => {
    if (isProcessing || !commentId) return;
    
    setIsProcessing(true);
    
    try {
      // Önce kullanıcı giriş yapmış mı kontrol et
      const { authService } = await import("@/services/auth");
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        // Giriş yapmamış kullanıcı - Toast ile bildir
        if (showToast) {
          showToast('🔒 Duyur özelliğini kullanmak için giriş yapmalısınız', 'warning');
          setTimeout(() => {
            window.location.href = '/auth';
          }, 1500);
        }
        setIsProcessing(false);
        return;
      }
      
      // Optimistic update için eski değerleri sakla
      const oldAnnounced = announced;
      const oldCount = count;
      
      const { commentsService } = await import("@/services/comments");
      
      if (announced) {
        await commentsService.unannounceComment(commentId);
        setAnnounced(false);
        setCount(prev => Math.max(0, prev - 1));
        if (showToast) showToast('✅ Duyuru geri alındı', 'success');
      } else {
        await commentsService.announceComment(commentId);
        setAnnounced(true);
        setCount(prev => prev + 1);
        if (showToast) showToast('📢 Tecrübe duyuruldu!', 'success');
      }
    } catch (error) {
      console.error('Duyuru işlemi hatası:', error);
      
      // Kullanıcıya toast ile bilgi ver
      if (showToast) {
        const errorMessage = error instanceof Error ? error.message : '';
        if (errorMessage.includes('zaten duyurdunuz')) {
          showToast('⚠️ Bu yorumu zaten duyurdunuz', 'warning');
        } else {
          showToast('❌ Bir hata oluştu. Lütfen tekrar deneyin', 'error');
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Kapatma Butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
          aria-label="Kapat"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* İçerik */}
        <div className="p-8">
          {/* Üst Kısım: İşletme Bilgileri */}
          <div className="mb-6">
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-gray-900 pr-12">
                {company}
              </h2>
            </div>
            <div className="flex items-start space-x-2 mb-4">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-500">{address}</p>
            </div>

            {/* Yıldızlar, Puan ve Duyur Butonu */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-300 fill-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-700">
                  {rating}/5
                </span>
              </div>
              
              {/* Duyur Butonu */}
              {commentId && (
                <div className="flex flex-col items-center">
                  <button 
                    onClick={handleAnnounceClick}
                    disabled={isProcessing}
                    className={`transition-all duration-200 ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                    aria-label={announced ? "Duyuruyu geri al" : "Duyur"}
                  >
                    <Image 
                      src="/favicon/favicon-32x32.png" 
                      alt="Duyur" 
                      width={32} 
                      height={32} 
                      className={`transition-all duration-200 ${announced ? '' : 'grayscale'}`}
                    />
                  </button>
                  {count > 0 && (
                    <span className={`text-sm mt-1 font-medium ${announced ? 'text-red-600' : 'text-gray-500'}`}>
                      {count}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6" />

          {/* Tecrübe Metni */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Tecrübe
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {review}
            </p>
          </div>

          {/* Alt Kısım: Kullanıcı ve Tarih */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              {username ? `@${username}` : "Anonim"}
            </span>
            <span className="text-sm text-gray-500">{date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
