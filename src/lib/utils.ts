import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// E-posta doğrulama fonksiyonu
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  // Boş kontrolü
  if (!email.trim()) {
    return { isValid: false, error: "E-posta adresi gereklidir" };
  }

  // @ işareti kontrolü
  if (!email.includes('@')) {
    return { isValid: false, error: "E-posta adresi @ işareti içermelidir" };
  }

  // Temel e-posta formatı kontrolü
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Geçerli bir e-posta adresi giriniz" };
  }

  // Domain kısmını al ve kontrol et
  const domain = email.split('@')[1];
  if (!domain) {
    return { isValid: false, error: "E-posta adresi geçersiz" };
  }

  // Yaygın e-posta uzantıları listesi
  const validDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
    'icloud.com', 'aol.com', 'protonmail.com', 'zoho.com',
    'mail.com', 'yandex.com', 'gmx.com', 'inbox.com',
    // Türkiye domainleri
    'hotmail.com.tr', 'outlook.com.tr', 'mynet.com', 'turk.net',
    'ttmail.com', 'superonline.com', 'ttnet.com.tr', 'windowslive.com',
    // Kurumsal domainler için .com, .net, .org, .edu, .tr gibi uzantıları kabul et
  ];

  // Domain'in geçerli uzantıya sahip olup olmadığını kontrol et
  const domainParts = domain.toLowerCase().split('.');
  const extension = domainParts[domainParts.length - 1];
  
  // Yaygın uzantılar listesi
  const validExtensions = ['com', 'net', 'org', 'edu', 'gov', 'mil', 'tr', 'co', 'io', 'me', 'info', 'biz', 'tv', 'de', 'uk', 'fr', 'es', 'it'];
  
  // Eğer liste içindeki domainlerden biriyse veya geçerli uzantıya sahipse kabul et
  const isKnownDomain = validDomains.includes(domain.toLowerCase());
  const hasValidExtension = validExtensions.includes(extension.toLowerCase());
  
  if (!isKnownDomain && !hasValidExtension) {
    return { isValid: false, error: "Geçerli bir e-posta uzantısı kullanınız (örn: @gmail.com)" };
  }

  // Domain'in en az bir nokta içermesi gerekli
  if (domainParts.length < 2) {
    return { isValid: false, error: "Geçerli bir e-posta adresi giriniz" };
  }

  return { isValid: true };
}
