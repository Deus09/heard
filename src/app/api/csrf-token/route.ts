import { NextResponse } from 'next/server';
import { generateCSRFToken } from '@/lib/csrf';

/**
 * CSRF token endpoint'i
 * GET /api/csrf-token - Yeni bir CSRF token oluşturur ve döner
 */
export async function GET() {
  try {
    // Token oluştur veya mevcut olanı al
    const token = await generateCSRFToken();
    
    const response = NextResponse.json({ 
      csrfToken: token,
      message: 'CSRF token generated successfully'
    });
    
    // Cookie'nin제대로 ayarlandığından emin ol
    response.cookies.set('csrf_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 saat
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
