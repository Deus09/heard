"use client";

import { Map, List } from "lucide-react";

export default function ViewToggle({ 
    viewMode, 
    onViewModeChange 
  }: { 
    viewMode: "list" | "map"; 
    onViewModeChange: (mode: "list" | "map") => void;
  }) {
    return (
      <div className="inline-flex border border-red-600 rounded-full overflow-hidden">
        {/* List View */}
        <button 
          onClick={() => onViewModeChange("list")}
          className={`py-2 px-3 md:px-4 flex items-center space-x-1 md:space-x-2 transition-colors ${
            viewMode === "list" 
              ? "bg-red-600 text-white" 
              : "bg-white text-red-600 hover:bg-red-50"
          }`}
        >
          <List className="h-4 w-4" />
          <span className="text-sm md:text-base">Liste Görünümü</span>
        </button>
        {/* Map View */}
        <button 
          onClick={() => onViewModeChange("map")}
          className={`py-2 px-3 md:px-4 flex items-center space-x-1 md:space-x-2 transition-colors ${
            viewMode === "map" 
              ? "bg-red-600 text-white" 
              : "bg-white text-red-600 hover:bg-red-50"
          }`}
        >
          <Map className="h-4 w-4" />
          <span className="text-sm md:text-base">Harita Görünümü</span>
        </button>
      </div>
    );
  }