"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface CSRFContextType {
  csrfToken: string | null;
  isLoading: boolean;
  refreshToken: () => Promise<void>;
}

const CSRFContext = createContext<CSRFContextType | undefined>(undefined);

export function CSRFProvider({ children }: { children: React.ReactNode }) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCSRFToken = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } else {
        console.error('Failed to fetch CSRF token');
        setCsrfToken(null);
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      setCsrfToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCSRFToken();
  }, []);

  const refreshToken = async () => {
    await fetchCSRFToken();
  };

  return (
    <CSRFContext.Provider value={{ csrfToken, isLoading, refreshToken }}>
      {children}
    </CSRFContext.Provider>
  );
}

export function useCSRF() {
  const context = useContext(CSRFContext);
  if (context === undefined) {
    throw new Error('useCSRF must be used within a CSRFProvider');
  }
  return context;
}
