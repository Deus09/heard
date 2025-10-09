"use client";

import { useEffect, useState, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

// Tip tanımlamaları
interface GeographyType {
  rsmKey: string;
  properties: {
    name?: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: any;
  };
}

interface CityReviewCount {
  city: string;
  count: number;
}

interface TurkeyMapProps {
  reviewCounts: CityReviewCount[];
  onCityClick: (city: string) => void;
}

const TURKEY_TOPOJSON_URL = "/Türkiye_İl.json";

// İl koordinatları (merkez noktaları)
const cityCoordinates: Record<string, [number, number]> = {
  "Adana": [35.3213, 37.0000],
  "Adıyaman": [38.2764, 37.7648],
  "Afyonkarahisar": [30.5387, 38.7507],
  "Ağrı": [43.0503, 39.7191],
  "Aksaray": [34.0254, 38.3687],
  "Amasya": [35.8333, 40.6500],
  "Ankara": [32.8597, 39.9334],
  "Antalya": [30.7133, 36.8969],
  "Ardahan": [42.7022, 41.1105],
  "Artvin": [41.8183, 41.1828],
  "Aydın": [27.8456, 37.8560],
  "Balıkesir": [27.8826, 39.6484],
  "Bartın": [32.3375, 41.6344],
  "Batman": [41.1351, 37.8812],
  "Bayburt": [40.2552, 40.2552],
  "Bilecik": [29.9833, 40.0567],
  "Bingöl": [40.7696, 38.8854],
  "Bitlis": [42.1089, 38.4001],
  "Bolu": [31.6061, 40.7394],
  "Burdur": [30.2900, 37.7200],
  "Bursa": [29.0636, 40.1826],
  "Çanakkale": [26.4064, 40.1553],
  "Çankırı": [33.6134, 40.6013],
  "Çorum": [34.9550, 40.5506],
  "Denizli": [29.0875, 37.7765],
  "Diyarbakır": [40.2181, 37.9144],
  "Düzce": [31.1565, 40.8438],
  "Edirne": [26.5557, 41.6771],
  "Elazığ": [39.2264, 38.6748],
  "Erzincan": [39.4900, 39.7500],
  "Erzurum": [41.2769, 39.9000],
  "Eskişehir": [30.5206, 39.7767],
  "Gaziantep": [37.3825, 37.0662],
  "Giresun": [38.3895, 40.9128],
  "Gümüşhane": [39.4814, 40.4386],
  "Hakkari": [43.7408, 37.5744],
  "Hatay": [36.4018, 36.4018],
  "Iğdır": [44.0450, 39.9237],
  "Isparta": [30.5566, 37.7648],
  "İstanbul": [28.9784, 41.0082],
  "İzmir": [27.1428, 38.4192],
  "Kahramanmaraş": [36.9370, 37.5858],
  "Karabük": [32.6204, 41.2061],
  "Karaman": [33.2287, 37.1759],
  "Kars": [43.0975, 40.6013],
  "Kastamonu": [33.7827, 41.3887],
  "Kayseri": [35.4826, 38.7205],
  "Kilis": [37.1212, 36.7184],
  "Kırıkkale": [33.5153, 39.8468],
  "Kırklareli": [27.2167, 41.7333],
  "Kırşehir": [34.1709, 39.1425],
  "Kocaeli": [29.9167, 40.8533],
  "Konya": [32.4846, 37.8667],
  "Kütahya": [29.9833, 39.4167],
  "Malatya": [38.3552, 38.3554],
  "Manisa": [27.4260, 38.6191],
  "Mardin": [40.7350, 37.3212],
  "Mersin": [34.6415, 36.8121],
  "Muğla": [28.3665, 37.2153],
  "Muş": [41.7539, 38.9462],
  "Nevşehir": [34.7144, 38.6939],
  "Niğde": [34.6857, 37.9667],
  "Ordu": [37.8764, 40.9839],
  "Osmaniye": [36.2478, 37.0742],
  "Rize": [40.5219, 41.0201],
  "Sakarya": [30.4000, 40.7569],
  "Samsun": [36.3300, 41.2867],
  "Şanlıurfa": [38.7969, 37.1591],
  "Siirt": [41.9403, 37.9333],
  "Sinop": [35.1531, 42.0231],
  "Sivas": [37.0179, 39.7477],
  "Şırnak": [42.4918, 37.5164],
  "Tekirdağ": [27.5117, 40.9833],
  "Tokat": [36.5544, 40.3167],
  "Trabzon": [39.7168, 41.0015],
  "Tunceli": [39.5401, 39.1079],
  "Uşak": [29.4058, 38.6823],
  "Van": [43.0567, 38.4891],
  "Yalova": [29.2767, 40.6500],
  "Yozgat": [34.8147, 39.8181],
  "Zonguldak": [31.7982, 41.4564],
};

// Pin boyutu kategorileri
const getPinSize = (count: number): number => {
  if (count >= 50) return 24;
  if (count >= 20) return 20;
  if (count >= 5) return 16;
  return 12;
};

// Pin rengi kategorileri
const getPinColor = (count: number): string => {
  if (count >= 50) return "#dc2626"; // red-600
  if (count >= 20) return "#ea580c"; // orange-600
  if (count >= 5) return "#f59e0b"; // amber-500
  return "#fbbf24"; // amber-400
};

const TurkeyMap = ({ reviewCounts, onCityClick }: TurkeyMapProps) => {
  const [topoData, setTopoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  useEffect(() => {
    fetch(TURKEY_TOPOJSON_URL)
      .then((response) => response.json())
      .then((data) => {
        setTopoData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("TopoJSON yüklenirken hata:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Harita yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!topoData) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
        <p className="text-red-600">Harita yüklenemedi</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-10">
      {/* Harita Başlığı ve Açıklama */}
      <div className="mb-8 md:mb-10">
        <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-5">
          İl Bazında Yorum Dağılımı
        </h3>
        <div className="flex flex-wrap items-center gap-5 md:gap-8 text-base md:text-lg text-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-amber-400 shadow-md"></div>
            <span className="font-semibold">1-4 yorum</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-amber-500 shadow-md"></div>
            <span className="font-semibold">5-19 yorum</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-orange-600 shadow-md"></div>
            <span className="font-semibold">20-49 yorum</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-red-600 shadow-md"></div>
            <span className="font-semibold">50+ yorum</span>
          </div>
        </div>
      </div>

      {/* Harita - 16:9 aspect ratio */}
      <div className="relative bg-gray-50 rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 3200,
            center: [35, 39],
          }}
          width={1600}
          height={900}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <ZoomableGroup
            center={[35, 39]}
            zoom={1}
            minZoom={1}
            maxZoom={4}
          >
            <Geographies geography={topoData}>
              {({ geographies }: { geographies: GeographyType[] }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#e5e7eb"
                    stroke="#9ca3af"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#d1d5db", outline: "none" },
                      pressed: { fill: "#9ca3af", outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Pinler */}
            {reviewCounts.map((item) => {
              const coordinates = cityCoordinates[item.city];
              if (!coordinates) return null;

              const pinSize = getPinSize(item.count);
              const pinColor = getPinColor(item.count);

              const isHovered = hoveredCity === item.city;
              const displayPinSize = isHovered ? pinSize * 1.3 : pinSize;

              return (
                <Marker key={item.city} coordinates={coordinates}>
                  <g 
                    transform={`translate(${-displayPinSize / 2}, ${-displayPinSize})`}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoveredCity(item.city)}
                    onMouseLeave={() => setHoveredCity(null)}
                    onClick={() => onCityClick(item.city)}
                  >
                    {/* Pin şekli */}
                    <path
                      d={`M${displayPinSize / 2},0 Q${displayPinSize},0 ${displayPinSize},${displayPinSize / 2} Q${displayPinSize},${displayPinSize} ${displayPinSize / 2},${displayPinSize * 1.5} Q0,${displayPinSize} 0,${displayPinSize / 2} Q0,0 ${displayPinSize / 2},0 Z`}
                      fill={pinColor}
                      stroke="white"
                      strokeWidth={isHovered ? 2 : 1.5}
                      style={{
                        filter: isHovered 
                          ? "drop-shadow(0 6px 12px rgba(220,38,38,0.5))"
                          : "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                        transition: "all 0.3s ease",
                      }}
                    />
                    {/* İç nokta */}
                    <circle
                      cx={displayPinSize / 2}
                      cy={displayPinSize / 2}
                      r={displayPinSize / 4}
                      fill="white"
                    />
                  </g>
                  {/* İl adı ve yorum sayısı tooltip - sadece hover'da göster */}
                  {isHovered && (
                    <g className="pointer-events-none">
                      {/* Arka plan beyaz kutu */}
                      <rect
                        x={-55}
                        y={-displayPinSize - 45}
                        width={110}
                        height={38}
                        fill="white"
                        rx={10}
                        opacity={0.98}
                        style={{
                          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                        }}
                      />
                      <text
                        textAnchor="middle"
                        y={-displayPinSize - 30}
                        style={{
                          fontFamily: "system-ui",
                          fontSize: "17px",
                          fontWeight: "700",
                          fill: "#1f2937",
                        }}
                      >
                        {item.city}
                      </text>
                      <text
                        textAnchor="middle"
                        y={-displayPinSize - 14}
                        style={{
                          fontFamily: "system-ui",
                          fontSize: "15px",
                          fill: pinColor,
                          fontWeight: "600",
                        }}
                      >
                        {item.count} yorum
                      </text>
                    </g>
                  )}
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Harita Kontrol Bilgisi */}
      <div className="mt-8 space-y-3">
        <div className="text-center text-sm md:text-base text-gray-600 flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <span className="hidden md:inline font-medium">Haritada gezinmek için tekerleği kullanabilir veya sürükleyebilirsiniz</span>
          <span className="md:hidden font-medium">Haritayı sürükleyerek gezinin</span>
        </div>
        <div className="text-center text-sm md:text-base text-red-600 font-semibold flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
          </svg>
          <span>İl pinlerine tıklayarak o ile ait yorumları görebilirsiniz</span>
        </div>
      </div>
    </div>
  );
};

export default memo(TurkeyMap);
