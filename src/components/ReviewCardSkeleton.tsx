export default function ReviewCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 min-h-[280px]">
      {/* Üst Kısım: İşletme Adı ve Puan */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            {/* İşletme adı placeholder */}
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            {/* Puan placeholder */}
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
          {/* Adres placeholder */}
          <div className="flex items-start space-x-1">
            <div className="h-4 w-4 bg-gray-200 rounded flex-shrink-0"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        {/* Sağ Üst Duyur Butonu placeholder */}
        <div className="flex flex-col items-center ml-2">
          <div className="h-6 w-6 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      {/* Yıldızlar placeholder */}
      <div className="flex items-center mb-4 space-x-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-5 w-5 bg-gray-200 rounded"></div>
        ))}
      </div>
      
      {/* İnceleme Metni placeholder */}
      <div className="mb-4 space-y-2 min-h-[96px]">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      
      {/* Alt Kısım: Kullanıcı ve Tarih placeholder */}
      <div className="flex items-center justify-between">
        <div className="h-3 bg-gray-200 rounded w-20"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  );
}
