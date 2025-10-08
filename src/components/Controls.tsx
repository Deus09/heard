"use client";

import SearchBar from "./SearchBar";
import ViewToggle from "./ViewToggle";

export default function Controls({ 
    searchTerm, 
    onSearchChange, 
    onSearch,
    onClearSearch,
    viewMode,
    onViewModeChange 
  }: { 
    searchTerm: string; 
    onSearchChange: (value: string) => void; 
    onSearch: (value: string) => void;
    onClearSearch: () => void;
    viewMode: "list" | "map";
    onViewModeChange: (mode: "list" | "map") => void;
  }) {
    return (
      <div className="space-y-6 mb-8">
        {/* Arama Çubuğu - Ortalanmış */}
        <div className="flex justify-center">
          <div className="w-full max-w-lg">
            <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} onSearch={onSearch} onClearSearch={onClearSearch} />
          </div>
        </div>
        
        {/* Görünüm Seçici - Sağda */}
        <div className="flex justify-end">
          <ViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
        </div>
      </div>
    );
  }