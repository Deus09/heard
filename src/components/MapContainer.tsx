"use client";

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';

const TurkeyMap = dynamic(() => import('@/components/TurkeyMap'), {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  });

export default function MapContainer({ onCityClick }: { onCityClick: (city: string) => void }) {
    const [cityReviewCounts, setCityReviewCounts] = useState<Array<{ city: string; count: number }>>([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const loadCityReviewCounts = async () => {
        try {
          const { commentsService } = await import("@/services/comments");
          const counts = await commentsService.getCityReviewCounts();
          setCityReviewCounts(counts);
        } catch (error) {
          console.error('İl bazlı yorum sayıları yüklenirken hata:', error);
        } finally {
          setLoading(false);
        }
      };
  
      loadCityReviewCounts();
    }, []);
  
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-2 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span>Harita yükleniyor...</span>
          </div>
        </div>
      );
    }
  
    return (
      <div className="mt-4 max-w-full">
        <TurkeyMap reviewCounts={cityReviewCounts} onCityClick={onCityClick} />
      </div>
    );
  }