"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function HeroSection() {
    return (
      <div className="flex flex-col items-center py-12">
        {/* Büyük Logo ve Slogan */}
        <div className="flex items-center space-x-3 mb-2">
          <Image 
            src="/favicon/android-chrome-192x192.png" 
            alt="Duyur!" 
            width={48} 
            height={48} 
            className="h-12 w-12"
            priority
          />
          <h1 className="text-6xl font-extrabold text-red-600">Duyur!</h1>
        </div>
        <p className="text-md text-gray-500 mb-2 mt-2">
          İş deneyimlerinizi veya  günlük yaşadığınız olayları <span className="underline">anonim</span> olarak paylaşın
        </p>
        <p className="text-md text-gray-300 mb-8">
          (E-Mail ile giriş gerektirmez)
        </p>

        
        {/* Ana Eylem Butonu */}
        <Link href="/add-review">
          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6  rounded-xl shadow-lg shadow-red-500/50 transition-all flex items-center space-x-2 mb-6">
            <Plus className="h-5 w-5" />
            <span>Yorum Ekle</span>
          </button>
        </Link>
      </div>
    );
  }