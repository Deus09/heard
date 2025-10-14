export default function ReviewCardSmallSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 min-h-[280px] relative">
      {/* Duyur Butonu placeholder - Sağ üst köşe */}
      <div className="absolute top-4 right-4 flex flex-col items-center gap-1">
        <div className="h-6 w-6 bg-gray-200 rounded"></div>
      </div>

      {/* Yıldızlar placeholder */}
      <div className="flex mb-2 space-x-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 w-4 bg-gray-200 rounded"></div>
        ))}
      </div>

      {/* İşletme Adı placeholder */}
      <div className="mb-2 pr-8">
        <div className="h-5 bg-gray-200 rounded w-32"></div>
      </div>

      {/* Konum placeholder */}
      <div className="mb-3">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>

      {/* Tecrübe placeholder */}
      <div className="mb-4 space-y-2 min-h-[72px]">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>

      {/* Kullanıcı ve Tarih placeholder */}
      <div className="flex items-center justify-between border-t pt-3">
        <div className="h-3 bg-gray-200 rounded w-16"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  );
}
