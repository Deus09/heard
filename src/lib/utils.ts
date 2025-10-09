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

// Kullanıcı adı doğrulama fonksiyonu
export function validateUsername(username: string): { isValid: boolean; error?: string } {
  // Boş kontrolü
  if (!username.trim()) {
    return { isValid: false, error: "Kullanıcı adı gereklidir" };
  }

  // Uzunluk kontrolü (minimum 4, maksimum 20 karakter)
  if (username.length < 4) {
    return { isValid: false, error: "Kullanıcı adı en az 4 karakter olmalıdır" };
  }
  
  if (username.length > 20) {
    return { isValid: false, error: "Kullanıcı adı en fazla 20 karakter olabilir" };
  }

  // Sadece harf, rakam, alt çizgi ve tire içerebilir
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, error: "Kullanıcı adı sadece harf, rakam, alt çizgi (_) ve tire (-) içerebilir" };
  }

  // Harf ile başlamalı (rakam veya özel karakter ile başlamamalı)
  if (!/^[a-zA-Z]/.test(username)) {
    return { isValid: false, error: "Kullanıcı adı bir harf ile başlamalıdır" };
  }

  // Ardışık özel karakterler olmamalı (__ veya -- gibi)
  if (/__{2,}|--{2,}/.test(username)) {
    return { isValid: false, error: "Kullanıcı adı ardışık özel karakterler içeremez" };
  }

  // Özel karakter ile bitemez
  if (/[_-]$/.test(username)) {
    return { isValid: false, error: "Kullanıcı adı özel karakter ile bitemez" };
  }

  // Yasaklı kelimeler listesi
  const forbiddenWords = [
    'admin', 'administrator', 'moderator', 'mod', 'root', 'system', 
    'anon', 'anonim', 'anonymous', 'user', 'guest', 'test', 'demo',
    'null', 'undefined', 'deleted', 'banned', 'suspended'
  ];

  const lowerUsername = username.toLowerCase();
  for (const word of forbiddenWords) {
    if (lowerUsername.includes(word)) {
      return { isValid: false, error: `Kullanıcı adı '${word}' kelimesini içeremez` };
    }
  }

  return { isValid: true };
}
