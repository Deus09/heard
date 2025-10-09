import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware - CSRF token kontrolü header seviyesinde
 * Edge Runtime uyumlu basit kontrol
 */
export async function middleware(request: NextRequest) {
  // API route'ları için CSRF header kontrolü (csrf-token endpoint hariç)
  if (request.nextUrl.pathname.startsWith('/api/') && 
      request.nextUrl.pathname !== '/api/csrf-token' &&
      !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    
    // CSRF token header'ını kontrol et
    const csrfToken = request.headers.get('X-CSRF-Token');
    const csrfCookie = request.cookies.get('csrf_token')?.value;

    // Token yoksa veya eşleşmiyorsa reddet
    if (!csrfToken || !csrfCookie || csrfToken !== csrfCookie) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
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
