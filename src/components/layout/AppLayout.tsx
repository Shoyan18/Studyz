'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { MobileNav } from './MobileNav';
import { User } from '@/types';

interface AppLayoutProps {
  children: React.ReactNode;
  fullBleed?: boolean;
  hideHeader?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, fullBleed = false, hideHeader = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (isMounted) {
          if (data.authenticated && data.user) {
            // If user has not completed onboarding and is not already on onboarding page
            if (!data.user.onboarded && pathname !== '/onboarding') {
              router.push('/onboarding');
              return;
            }
            setUser(data.user);
          } else {
            router.push('/login');
          }
        }
      } catch (err) {
        console.error('Session load error:', err);
        router.push('/login');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUser();
    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-coral-500 flex items-center justify-center shadow-coral-glow animate-bounce">
          <span className="text-white font-black text-xl">S</span>
        </div>
        <p className="mt-4 text-xs font-bold text-coral-600 tracking-wider uppercase animate-pulse">
          Loading STUDYZ...
        </p>
      </div>
    );
  }

  if (fullBleed) {
    return (
      <div className="h-screen max-h-screen w-screen overflow-hidden bg-[#FFF9F6] dark:bg-[#131418] text-charcoal-900 dark:text-gray-100 flex transition-colors duration-200">
        {/* Desktop Sidebar */}
        <div className="hidden md:block shrink-0 h-screen overflow-y-auto">
          <Sidebar />
        </div>

        {/* Main Full-Bleed Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
          {!hideHeader && (
            <div className="shrink-0">
              <TopHeader user={user} onOpenMobileMenu={() => setIsDrawerOpen(true)} />
            </div>
          )}
          <main className="flex-1 min-h-0 w-full overflow-hidden flex flex-col">
            {children}
          </main>
        </div>

        {/* Mobile Nav & Drawer */}
        <MobileNav isDrawerOpen={isDrawerOpen} onCloseDrawer={() => setIsDrawerOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F6] dark:bg-[#131418] text-charcoal-900 dark:text-gray-100 flex transition-colors duration-200">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0 sticky top-0 h-screen z-30">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-6 transition-all duration-300 ease-in-out">
        {!hideHeader && <TopHeader user={user} onOpenMobileMenu={() => setIsDrawerOpen(true)} />}
        <main className="flex-1 px-4 md:px-6 py-3.5 md:py-4 max-w-[1600px] w-full mx-auto transition-all duration-300">
          {children}
        </main>
      </div>

      {/* Mobile Nav & Drawer */}
      <MobileNav isDrawerOpen={isDrawerOpen} onCloseDrawer={() => setIsDrawerOpen(false)} />
    </div>
  );
};
