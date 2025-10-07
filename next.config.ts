const nextConfig = {
  // Netlify'de Next/Image optimizer'ı devre dışı bırakıp
  // public altındaki dosyaları doğrudan servis etmek için
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
