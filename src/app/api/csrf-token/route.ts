import { NextResponse } from 'next/server';
import { generateCSRFToken } from '@/lib/csrf';

/**
 * CSRF token endpoint'i
 * GET /api/csrf-token - Yeni bir CSRF token oluşturur ve döner
 */
export async function GET() {
  try {
    const token = await generateCSRFToken();
    
    return NextResponse.json({ 
      csrfToken: token,
      message: 'CSRF token generated successfully'
    });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
