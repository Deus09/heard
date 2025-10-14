"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import dynamic from 'next/dynamic';
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Controls from "@/components/Controls";
import ReviewsContainer from "@/components/ReviewsContainer";
import Footer from "@/components/Footer";
import type { InitialCommentsData } from "@/types";

// TurkeyMap'i dinamik olarak yükle (SSR'yi devre dışı bırak)
const MapContainer = dynamic(() => import('@/components/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>
  )
});

interface HomeClientProps {
  initialData: InitialCommentsData;
}

export default function HomeClient({ initialData }: HomeClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const { showToast, ToastContainer } = useToast();
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [canRefresh, setCanRefresh] = useState(true);

  const handleSearch = (value: string) => {
    setActiveSearchTerm(value);
    // Manuel arama yapıldığında şehir seçimini temizle
    if (value !== selectedCity) {
      setSelectedCity(null);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setActiveSearchTerm("");
    setSelectedCity(null);
  };

  const handleCityClick = (city: string) => {
    setSelectedCity(city);
    setViewMode("list");
    setActiveSearchTerm(city);
    // Sayfanın başına smooth scroll
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleRefresh = () => {
    if (!canRefresh) {
      showToast("Lütfen 30 saniye bekleyin", "warning");
      return;
    }

    // Yenileme işlemini tetikle
    setLastRefreshTime(Date.now());
    
    // 30 saniye boyunca butonu devre dışı bırak
    setCanRefresh(false);
    setTimeout(() => {
      setCanRefresh(true);
    }, 30000);
  };

  const handleAnnounceChange = () => {
    // Duyuru değişikliği olduğunda verileri yeniden yükle
    setLastRefreshTime(Date.now());
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className={`mx-auto px-6 flex-grow ${viewMode === "list" ? "max-w-6xl" : "max-w-full"}`}>
        <div className={viewMode === "list" ? "" : "max-w-[1600px] mx-auto px-4"}>
          <HeroSection />
          <Controls 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm}
            onSearch={handleSearch}
            onClearSearch={handleClearSearch}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onRefresh={handleRefresh}
            lastRefreshTime={lastRefreshTime}
          />
          {viewMode === "list" ? (
            <ReviewsContainer 
              searchTerm={activeSearchTerm} 
              showToast={showToast} 
              selectedCity={selectedCity}
              onClearCitySelection={handleClearSearch}
              onRefresh={handleRefresh}
              lastRefreshTime={lastRefreshTime}
              initialData={initialData}
              onAnnounceChange={handleAnnounceChange}
            />
          ) : (
            <MapContainer onCityClick={handleCityClick} />
          )}
        </div>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}
