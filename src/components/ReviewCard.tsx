"use client";

import { Star, MapPin } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ReviewDetailModal from "@/components/ReviewDetailModal";

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
  onAnnounceChange?: () => void; // Duyuru değişikliği callback'i
}

export default function ReviewCard({ company, address, rating, review, date, username, commentId, announceCount = 0, hasAnnounced = false, showToast, onAnnounceChange }: ReviewCardProps) {
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
        showToast('📢 Tecrübe duyuruldu!', 'success');
      }
      
      // Parent component'e duyuru değişikliğini bildir
      if (onAnnounceChange) {
        onAnnounceChange();
      }
    } catch (error) {
      console.error('Duyuru işlemi hatası:', error);
      
      // Kullanıcıya toast ile bilgi ver
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('zaten duyurdunuz')) {
        showToast('⚠️ Bu yorumu zaten duyurdunuz', 'warning');
        // State'i düzelt - kullanıcı zaten duyurmuş
        setAnnounced(true);
        // Parent component'e duyuru değişikliğini bildir
        if (onAnnounceChange) {
          onAnnounceChange();
        }
      } else {
        showToast('❌ Bir hata oluştu. Lütfen tekrar deneyin', 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 min-h-[280px] flex flex-col">
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
                loading="lazy"
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
        <div className="mb-4 flex-grow min-h-[96px]">
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
        onAnnounceChange={onAnnounceChange}
      />
    </>
  );
}