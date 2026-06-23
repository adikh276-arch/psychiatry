'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);

  // Helper to read cookies on the client
  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return null;
  };

  const setCookie = (name: string, value: string, days: number = 30) => {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  };

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get('token');
      const userId = getCookie('user_id');

      // 4. Stale Token Cleanup (Failsafe)
      // If user is authenticated but a token exists in URL, strip it immediately.
      if (userId && token) {
        setIsAuthenticated(true);
        setIsProcessing(false);
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete('token');
        const newSearch = newSearchParams.toString();
        const cleanUrl = pathname + (newSearch ? `?${newSearch}` : '');
        window.history.replaceState(null, '', cleanUrl);
        router.replace(cleanUrl);
        return;
      }

      // If user is authenticated and no token, allow them in
      if (userId) {
        setIsAuthenticated(true);
        setIsProcessing(false);
        return;
      }

      // Ponytail: The only necessary auth handshake paths.
      // 2. Handle Auth Portal Return & Magic Links
      if (token) {
        try {
          // Perform the handshake
          const response = await fetch('https://api.mantracare.com/user/user-info', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.user_id || data.id) {
              const validUserId = data.user_id || data.id;
              
              // Set the cookie for SSR and future checks
              setCookie('user_id', validUserId.toString());
              
              // 3. The "Smart" Restore & Navigate
              const savedPath = typeof window !== 'undefined' ? localStorage.getItem('APP_REDIRECT_PATH') : null;
              
              if (savedPath) {
                localStorage.removeItem('APP_REDIRECT_PATH');
                // Instantly update URL so window.location.search is correct for child components
                window.history.replaceState(null, '', savedPath);
                // Use router.replace to notify Next.js of the change
                router.replace(savedPath);
              } else {
                // Magic link scenario (no saved path)
                const newSearchParams = new URLSearchParams(searchParams.toString());
                newSearchParams.delete('token');
                const newSearch = newSearchParams.toString();
                const cleanUrl = pathname + (newSearch ? `?${newSearch}` : '');
                window.history.replaceState(null, '', cleanUrl || '/');
                router.replace(cleanUrl || '/');
              }
              
              setIsAuthenticated(true);
              setIsProcessing(false);
              return;
            }
          }
          
          // Handshake failed (e.g. invalid token)
          throw new Error('Handshake failed');
          
        } catch (error) {
          console.error("Auth Handshake Error:", error);
          // If handshake fails, redirect to auth portal
          redirectToAuth();
        }
      } else {
        // 1. Intercept Unauthenticated Deep Links
        redirectToAuth();
      }
    };

    handleAuth();
  }, [pathname, searchParams, router]);

  const redirectToAuth = () => {
    if (typeof window !== 'undefined') {
      const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      // Save the destination path
      localStorage.setItem('APP_REDIRECT_PATH', currentUrl);
      
      // Redirect to the main web app which handles adding the token
      window.location.href = 'https://web.mantracare.com/app/psychiatry';
    }
  };

  if (isProcessing || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fafcff] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-lg"></div>
        <p className="mt-6 text-slate-500 font-bold uppercase tracking-widest text-sm animate-pulse">Securing Session...</p>
      </div>
    );
  }

  return <>{children}</>;
};
