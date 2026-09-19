'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Timer, CheckSquare, User, X, BarChart3, Trophy, Calendar, FileText, Settings, Sparkles } from 'lucide-react';

interface MobileNavProps {
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isDrawerOpen, onCloseDrawer }) => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Subjects', href: '/subjects', icon: BookOpen },
    { name: 'AI', href: '/ai', icon: Sparkles, isAi: true },
    { name: 'Focus', href: '/focus', icon: Timer },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const drawerLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Subjects', href: '/subjects', icon: BookOpen },
    { name: 'Focus Mode', href: '/focus', icon: Timer },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Achievements', href: '/achievements', icon: Trophy },
    { name: 'STUDYZ AI', href: '/ai', icon: Sparkles, isAi: true },
    { name: 'Notes', href: '/notes', icon: FileText },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#18191E]/95 backdrop-blur-md border-t border-[#F3ECE7] dark:border-[#2e313a] px-2 py-2 flex items-center justify-around shadow-lg transition-colors duration-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all ${
                isActive
                  ? 'text-coral-500 dark:text-coral-400 font-bold scale-105'
                  : 'text-charcoal-500 dark:text-gray-400 font-medium hover:text-charcoal-800 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4] text-coral-500 dark:text-coral-400' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Full Mobile Slide-in Drawer */}
      {isDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onCloseDrawer}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-white dark:bg-[#18191E] h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200 border-r border-[#F3ECE7] dark:border-[#2e313a]">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-[#F5EBE4] dark:border-[#2e313a]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-coral-500 to-coral-400 flex items-center justify-center shadow-coral-glow">
                    <Sparkles className="w-4 h-4 text-white fill-white" />
                  </div>
                  <span className="text-xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">STUDYZ</span>
                </div>
                <button
                  onClick={onCloseDrawer}
                  className="p-1.5 rounded-xl text-charcoal-400 dark:text-gray-400 hover:text-charcoal-800 dark:hover:text-white hover:bg-[#FFF2EE] dark:hover:bg-[#252832] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="mt-5 space-y-1">
                {drawerLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={onCloseDrawer}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#FFF0EB] dark:bg-coral-950/60 text-coral-600 dark:text-coral-400 shadow-xs border border-coral-200/40 dark:border-coral-800/40'
                          : 'text-charcoal-600 dark:text-gray-300 hover:bg-[#FAF4F0] dark:hover:bg-[#22242b] hover:text-charcoal-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-coral-500 dark:text-coral-400 stroke-[2.2]' : 'text-charcoal-400 dark:text-gray-400'}`} />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Motivational Footer */}
            <div className="mt-6 p-4 rounded-2xl bg-[#FFF5F2] dark:bg-[#212328] border border-[#FFD9CE] dark:border-[#2e313a] text-center">
              <p className="text-xs font-semibold text-charcoal-700 dark:text-gray-300">&quot;Learn. Focus. Grow.&quot;</p>
              <p className="text-[10px] text-coral-500 dark:text-coral-400 font-bold mt-1">STUDYZ V2</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
