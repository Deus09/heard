const nextConfig = {
  // Netlify'de Next/Image optimizer'ı devre dışı bırakıp
  // public altındaki dosyaları doğrudan servis etmek için
  images: {
    unoptimized: true,
  },
  
  // Güvenlik başlıkları
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return [
      {
        // Tüm route'lara güvenlik başlıkları ekle
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://cloud.umami.is https://www.google.com https://www.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://cloud.umami.is https://api-gateway.umami.dev https://www.google.com",
              "frame-src 'self' https://www.google.com",
              // Development'ta GitHub Codespaces için manifest-src'yi gevşet
              isDevelopment ? "manifest-src 'self' https://github.dev https://*.github.dev" : "manifest-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'interest-cohort=()',
            ].join(', '),
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
