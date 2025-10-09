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
  const cookieStore = await cookies();
  
  // Mevcut token'ı kontrol et
  const existingToken = cookieStore.get(CSRF_TOKEN_NAME)?.value;
  
  // Eğer geçerli bir token varsa onu kullan
  if (existingToken && existingToken.length === 64) {
    console.log('🔵 Existing CSRF token found:', existingToken.substring(0, 10) + '...');
    return existingToken;
  }
  
  // Yeni token oluştur
  const token = await generateRandomToken();
  console.log('🟢 New CSRF token generated:', token.substring(0, 10) + '...');
  
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
  console.log('🔍 Starting CSRF token verification...');
  
  if (!token) {
    console.error('❌ CSRF verification failed: Token is null or undefined');
    return false;
  }

  console.log('🔵 Received token:', token.substring(0, 10) + '...', 'Length:', token.length);

  // Token formatını kontrol et (64 karakter hex olmalı)
  if (token.length !== 64 || !/^[a-f0-9]{64}$/.test(token)) {
    console.error('❌ CSRF verification failed: Invalid token format', {
      length: token.length,
      preview: token.substring(0, 10) + '...'
    });
    return false;
  }

  const cookieStore = await cookies();
  const storedToken = cookieStore.get(CSRF_TOKEN_NAME)?.value;

  console.log('🔵 Stored token in cookie:', storedToken?.substring(0, 10) + '...', 'Length:', storedToken?.length);

  if (!storedToken) {
    console.error('❌ CSRF verification failed: No token found in cookies');
    return false;
  }

  // Token uzunluklarını kontrol et
  if (storedToken.length !== 64) {
    console.error('❌ CSRF verification failed: Stored token has invalid length', {
      length: storedToken.length
    });
    return false;
  }

  // Timing attack'a karşı güvenli karşılaştırma
  const isValid = await timingSafeEqual(token, storedToken);
  
  if (!isValid) {
    console.error('❌ CSRF verification failed: Token mismatch', {
      receivedPreview: token.substring(0, 10) + '...',
      storedPreview: storedToken.substring(0, 10) + '...',
      receivedFull: token,
      storedFull: storedToken
    });
  } else {
    console.log('✅ CSRF token verified successfully');
  }
  
  return isValid;
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
