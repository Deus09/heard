import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware - Güvenlik başlıkları
 * CSRF kontrolü API route'larında yapılır (daha detaylı kontrol için)
 */
export async function middleware(request: NextRequest) {
  // Response oluştur ve güvenlik başlıklarını ekle
  const response = NextResponse.next();
  
  // Runtime güvenlik başlıkları (next.config.ts'deki statik başlıklara ek)
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

// Middleware'in hangi route'larda çalışacağını belirt
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
