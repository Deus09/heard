"use client";

import React, { createContext, useCallback, useContext } from 'react';
import Script from 'next/script';

// 1. TypeScript'e grecaptcha objesini tanıtıyoruz
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

// 2. executeRecaptcha'nın dönüş tipini 'string | undefined' olarak belirliyoruz
interface RecaptchaContextType {
  executeRecaptcha: (action: string) => Promise<string | undefined>;
}

const RecaptchaContext = createContext<RecaptchaContextType | undefined>(undefined);

export const useRecaptcha = () => {
  const context = useContext(RecaptchaContext);
  if (!context) {
    throw new Error('useRecaptcha must be used within a RecaptchaProvider');
  }
  return context;
};

export const RecaptchaProvider = ({ children }: { children: React.ReactNode }) => {
  const executeRecaptcha = useCallback(async (action: string) => {
    if (typeof window === 'undefined' || !window.grecaptcha) {
      console.error('reCAPTCHA script not loaded or not in browser environment');
      return undefined;
    }

    return new Promise<string | undefined>((resolve) => {
      window.grecaptcha.ready(() => {
        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
        if (!siteKey) {
          console.error("reCAPTCHA site key is not set.");
          resolve(undefined);
          return;
        }
        window.grecaptcha.execute(siteKey, { action: action })
          // 3. 'token' parametresine 'string' tipini ekliyoruz
          .then((token: string) => {
            resolve(token);
          });
      });
    });
  }, []);

  return (
    <RecaptchaContext.Provider value={{ executeRecaptcha }}>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        strategy="lazyOnload"
      />
      {children}
    </RecaptchaContext.Provider>
  );
};