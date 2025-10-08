"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

export default function SearchBar({ searchTerm, onSearchChange, onSearch, onClearSearch }: { searchTerm: string; onSearchChange: (value: string) => void; onSearch: (value: string) => void; onClearSearch: () => void }) {
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    
    const placeholders = [
      "Örneğin: Zara",
      "Örneğin: A101",
      "Örneğin: Sarıyer",
      "Örneğin: Starbucks",
      "Örneğin: Kadıköy",
      "Örneğin: McDonald's",
      "Örneğin: Beşiktaş",
      "Örneğin: LC Waikiki",
      "Örneğin: Şişli",
      "Örneğin: Migros",
      "Örneğin: Ankara",
      "Örneğin: Burger King",
      "Örneğin: İzmir",
      "Örneğin: Çarşı",
      "Örneğin: Beyoğlu"
    ];
  
    useEffect(() => {
      const interval = setInterval(() => {
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
      }, 3000); // Her 3 saniyede bir değişir
  
      return () => clearInterval(interval);
    }, [placeholders.length]);
  
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onSearch(searchTerm);
      }
    };
  
    const handleClear = () => {
      onClearSearch();
    };
  
    return (
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholders[placeholderIndex]}
          className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Aramayı temizle"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    );
  }