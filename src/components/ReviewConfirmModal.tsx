"use client";

import { AlertCircle, X } from "lucide-react";

interface ReviewConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reviewData: {
    businessName: string;
    city: string;
    district: string;
    rating: number;
    experience: string;
  };
}

export default function ReviewConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  reviewData
}: ReviewConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-amber-500" />
            <h2 className="text-xl font-bold text-gray-900">
              Yorumunuzu Kontrol Edin
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              Yorumunuz gönderilmeden önce lütfen kontrol edin. Küfür, hakaret
              veya argo içeren yorumlar yayınlanmayacaktır.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                İş Yeri Adı:
              </label>
              <p className="text-gray-900 mt-1">{reviewData.businessName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Şehir:
                </label>
                <p className="text-gray-900 mt-1">{reviewData.city}</p>
              </div>
              {reviewData.district && (
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    İlçe:
                  </label>
                  <p className="text-gray-900 mt-1">{reviewData.district}</p>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Puan:
              </label>
              <p className="text-gray-900 mt-1">
                {reviewData.rating}/5 {'⭐'.repeat(reviewData.rating)}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Deneyiminiz:
              </label>
              <div className="mt-1 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {reviewData.experience}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Düzenle
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Onayla ve Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
