'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Menu, X, LogOut, User as UserIcon, Settings as SettingsIcon, Sun, Moon } from 'lucide-react';
import { User } from '@/types';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useTheme } from '@/components/providers/ThemeProvider';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface TopHeaderProps {
  user: User | null;
  onOpenMobileMenu?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ user, onOpenMobileMenu }) => {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [greeting, setGreeting] = useState('Good evening');
  const [greetingEmoji, setGreetingEmoji] = useState('👋');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Good morning');
      setGreetingEmoji('☀️');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good afternoon');
      setGreetingEmoji('👋');
    } else {
      setGreeting('Good evening');
      setGreetingEmoji('✨');
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const userName = user?.name || 'Scholar';
  const levelNumber = user?.levelInfo?.level || user?.totalXp ? Math.max(1, Math.floor(Math.sqrt((user?.totalXp || 0) / 100)) + 1) : 18;

  return (
    <header className="relative z-40 w-full flex items-center justify-between py-3.5 px-4 md:px-6 border-b border-[#F3ECE7]/60 dark:border-[#2e313a]/60 bg-[#FFF9F6]/90 dark:bg-[#131418]/90 backdrop-blur-md transition-colors duration-200">
      {/* Left: Sidebar toggle button + Greeting */}
      <div className="flex items-center gap-3 md:gap-3.5">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-1.5 rounded-xl bg-white dark:bg-[#1a1b20] border border-[#EFE7E1] dark:border-[#2e313a] text-charcoal-700 dark:text-gray-200 hover:bg-[#FFF5F2] dark:hover:bg-[#22242b]"
            aria-label="Open navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div>
          <h1 className="text-lg md:text-xl font-extrabold text-charcoal-900 dark:text-white tracking-tight flex items-center gap-1.5">
            <span>{greeting}, {userName}</span>
            <span className="text-lg">{greetingEmoji}</span>
          </h1>
          <p className="text-[11px] md:text-xs text-charcoal-500 dark:text-gray-400 font-medium">
            Discipline today, success tomorrow.
          </p>
        </div>
      </div>

      {/* Right: Search, Notifications, Profile */}
      <div className="flex items-center gap-2.5 md:gap-3.5">
        {/* Search bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex relative items-center">
          <Search className="w-3.5 h-3.5 text-charcoal-400 dark:text-gray-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anything..."
            className="bg-white/90 dark:bg-[#1a1b20]/90 border border-[#EFE7E1] dark:border-[#2e313a] rounded-xl pl-9 pr-3 py-1.5 text-xs w-44 lg:w-56 text-charcoal-900 dark:text-white placeholder-charcoal-400 dark:placeholder-gray-400 focus:outline-none focus:border-coral-400 focus:ring-2 focus:ring-coral-100 dark:focus:ring-coral-950 shadow-sm transition-all"
          />
        </form>

        {/* Notification Center Popover */}
        <NotificationCenter />

        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white dark:bg-[#1a1b20] border border-[#EFE7E1] dark:border-[#2e313a] text-charcoal-600 dark:text-gray-200 hover:text-coral-500 dark:hover:text-coral-400 shadow-xs transition-all flex items-center justify-center"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          aria-label="Toggle dark and light theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-charcoal-700" />}
        </button>

        {/* User Profile Badge */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 md:pr-3 rounded-xl bg-white dark:bg-[#1a1b20] border border-[#EFE7E1] dark:border-[#2e313a] hover:border-[#E4D5CB] dark:hover:border-coral-500/50 shadow-sm transition-all"
          >
            <UserAvatar
              avatarUrl={user?.avatarUrl}
              name={userName}
              size="sm"
              rounded="2xl"
            />
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-charcoal-900 dark:text-white leading-tight">{userName}</p>
              <p className="text-[10px] font-semibold text-coral-500 dark:text-coral-400">Level {levelNumber}</p>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-[#F5EBE4] dark:border-[#2e313a]">
                  <UserAvatar avatarUrl={user?.avatarUrl} name={userName} size="sm" rounded="2xl" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-charcoal-900 dark:text-white truncate">{userName}</p>
                    <p className="text-[11px] text-charcoal-400 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-charcoal-700 dark:text-gray-300 hover:bg-[#FFF5F2] dark:hover:bg-[#252832] hover:text-coral-600 dark:hover:text-coral-400 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-charcoal-400 dark:text-gray-400" />
                  View Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-charcoal-700 dark:text-gray-300 hover:bg-[#FFF5F2] dark:hover:bg-[#252832] hover:text-coral-600 dark:hover:text-coral-400 transition-colors"
                >
                  <SettingsIcon className="w-4 h-4 text-charcoal-400 dark:text-gray-400" />
                  Settings
                </Link>
                <div className="my-1 border-t border-[#F5EBE4] dark:border-[#2e313a]" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
