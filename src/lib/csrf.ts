// Bu dosya sadece API route'larında kullanılır (Node.js runtime)
import { cookies } from 'next/headers';

const CSRF_TOKEN_NAME = 'csrf_token';

/**
 * Random token oluştur (sadece server-side, Node.js crypto kullanır)
 */
async function generateRandomToken(): Promise<string> {
  // Node.js crypto modülünü dinamik olarak yükle
  const crypto = await import('crypto');
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Timing attack'a karşı güvenli string karşılaştırma
 */
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  if (a.length !== b.length) {
    return false;
  }
  
  // Node.js crypto modülünü kullan
  const crypto = await import('crypto');
  return crypto.timingSafeEqual(
    Buffer.from(a),
    Buffer.from(b)
  );
}

/**
 * CSRF token oluşturur ve cookie'ye kaydeder
 * NOT: Bu fonksiyon sadece API route'larında (Node.js runtime) kullanılabilir
 */
export async function generateCSRFToken(): Promise<string> {
  const token = await generateRandomToken();
  const cookieStore = await cookies();
  
  // CSRF token'ı httpOnly cookie olarak kaydet
  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 saat
    path: '/'
  });

  return token;
}

/**
 * CSRF token'ı doğrular
 * NOT: Bu fonksiyon sadece API route'larında (Node.js runtime) kullanılabilir
 */
export async function verifyCSRFToken(token: string | null): Promise<boolean> {
  if (!token) {
    return false;
  }

  const cookieStore = await cookies();
  const storedToken = cookieStore.get(CSRF_TOKEN_NAME)?.value;

  if (!storedToken) {
    return false;
  }

  // Timing attack'a karşı güvenli karşılaştırma
  return await timingSafeEqual(token, storedToken);
}

/**
 * Mevcut CSRF token'ı getirir
 */
export async function getCSRFToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_TOKEN_NAME)?.value;
}

/**
 * CSRF token'ı siler
 */
export async function deleteCSRFToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CSRF_TOKEN_NAME);
}
