"use client";

import { X, Star, MapPin } from "lucide-react";
import { useEffect } from "react";

interface ReviewDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: string;
  address: string;
  rating: number;
  review: string;
  date: string;
  username?: string;
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
}: ReviewDetailModalProps) {
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2 pr-8">
              {company}
            </h2>
            <div className="flex items-start space-x-2 mb-4">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-500">{address}</p>
            </div>

            {/* Yıldızlar ve Puan */}
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
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6" />

          {/* Yorum Metni */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Yorum
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
