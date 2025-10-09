"use client";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * CSRF token'ı header'lara ekleyen özel fetch fonksiyonu
 */
const customFetch: typeof fetch = async (input, init) => {
  // CSRF token'ı cookie'den al
  const response = await fetch('/api/csrf-token', {
    credentials: 'include',
  });
  
  let csrfToken = '';
  if (response.ok) {
    const data = await response.json();
    csrfToken = data.csrfToken;
  }

  // Header'ları güncelle
  const headers = new Headers(init?.headers);
  if (csrfToken && init?.method && !['GET', 'HEAD', 'OPTIONS'].includes(init.method)) {
    headers.set('X-CSRF-Token', csrfToken);
  }

  // Orijinal fetch'i çağır
  return fetch(input, {
    ...init,
    headers,
  });
};

// CSRF korumalı Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch,
  },
});

// Database Types
export interface Profile {
  id: string;
  username: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string | null; // Anonim kullanıcılar için null olabilir
  username: string;
  business_name: string;
  city: string;
  district: string;
  experience: string;
  rating: number;
  anonymous: boolean;
  created_at: string;
}
