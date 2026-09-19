'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  Timer,
  CheckSquare,
  BarChart3,
  Trophy,
  Calendar,
  FileText,
  User,
  Settings,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useSidebar } from '@/components/providers/SidebarProvider';

const mainNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Subjects', href: '/subjects', icon: BookOpen },
  { name: 'Focus Mode', href: '/focus', icon: Timer },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Achievements', href: '/achievements', icon: Trophy },
];

const aiNavItem = {
  name: 'STUDYZ AI',
  href: '/ai',
  icon: Sparkles,
  badge: 'V2',
};

const secondaryNavItems = [
  { name: 'Notes', href: '/notes', icon: FileText },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
];

const accountNavItems = [
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const isAiActive = isActive(aiNavItem.href);

  return (
    <aside
      className={`h-screen sticky top-0 overflow-y-auto scrollbar-none bg-[#FFF9F6] dark:bg-[#18191E] flex flex-col justify-between border-r border-[#F3ECE7]/70 dark:border-[#2e313a]/80 select-none transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16 p-2.5' : 'w-60 p-4.5'
      }`}
    >
      <div>
        {/* Brand & Slide Bar Toggle Header */}
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2.5 mb-5">
            <Link
              href="/dashboard"
              title="STUDYZ"
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-coral-500 to-coral-400 flex items-center justify-center shadow-coral-glow hover:scale-105 transition-transform"
            >
              <Sparkles className="w-4 h-4 text-white fill-white" />
            </Link>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-charcoal-500 dark:text-gray-400 hover:text-coral-500 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-1.5 mb-5">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-coral-500 to-coral-400 flex items-center justify-center shadow-coral-glow group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-charcoal-900 dark:text-white font-sans">
                STUDYZ
              </span>
            </Link>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-charcoal-400 dark:text-gray-400 hover:text-coral-500 dark:hover:text-white hover:bg-[#FAF4F0] dark:hover:bg-[#22242b] transition-colors"
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Primary Navigation */}
        <nav className="space-y-1 mb-3">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isCollapsed ? 'justify-center w-9 h-9 mx-auto' : 'gap-3 px-3 py-2'
                } ${
                  active
                    ? 'bg-[#FFF0EB] dark:bg-coral-950/60 text-coral-600 dark:text-coral-400 shadow-sm border border-coral-200/40 dark:border-coral-800/40'
                    : 'text-charcoal-600 dark:text-gray-400 hover:text-charcoal-900 dark:hover:text-white hover:bg-[#FAF4F0] dark:hover:bg-[#22242b]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-coral-500 stroke-[2.2]' : 'text-charcoal-500 dark:text-gray-400'}`} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* AI Highlight Section */}
        <div className={`py-2 my-1.5 border-y border-[#F3ECE7]/90 dark:border-[#2e313a]/90 ${isCollapsed ? 'px-0' : ''}`}>
          <Link
            href={aiNavItem.href}
            title={isCollapsed ? 'STUDYZ AI' : undefined}
            className={`group relative flex items-center transition-all duration-200 rounded-xl ${
              isCollapsed ? 'justify-center w-9 h-9 mx-auto' : 'justify-between px-3 py-2'
            } ${
              isAiActive
                ? 'bg-gradient-to-r from-[#FFF0EB] via-[#F8F2FF] to-[#FFF0EB] dark:from-coral-950/60 dark:via-lavender-950/60 dark:to-coral-950/60 text-coral-600 dark:text-coral-400 shadow-sm border border-coral-200/60 dark:border-coral-800/60'
                : 'text-charcoal-800 dark:text-gray-200 hover:bg-gradient-to-r hover:from-[#FFF5F2] hover:to-[#F4F0FF] dark:hover:from-[#22242b] dark:hover:to-[#22242b] border border-transparent hover:border-[#F3ECE7] dark:hover:border-[#2e313a]'
            }`}
          >
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                  isAiActive
                    ? 'bg-gradient-to-tr from-coral-500 to-lavender-500 text-white shadow-coral-glow'
                    : 'bg-lavender-100 dark:bg-lavender-950/80 text-lavender-600 dark:text-lavender-300 group-hover:scale-105'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
              </div>
              {!isCollapsed && (
                <span className="text-xs font-bold tracking-tight flex items-center gap-1">
                  <span>✦</span>
                  <span>{aiNavItem.name}</span>
                </span>
              )}
            </div>

            {!isCollapsed && (
              <span
                className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded-md ${
                  isAiActive
                    ? 'bg-coral-500 text-white'
                    : 'bg-lavender-50 dark:bg-lavender-900/60 text-lavender-600 dark:text-lavender-300 group-hover:bg-lavender-100'
                }`}
              >
                {aiNavItem.badge}
              </span>
            )}
          </Link>
        </div>

        {/* Secondary Navigation */}
        <div className="space-y-1 mb-3">
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center rounded-xl text-xs font-medium transition-all duration-150 ${
                  isCollapsed ? 'justify-center w-9 h-9 mx-auto' : 'gap-3 px-3 py-2'
                } ${
                  active
                    ? 'bg-[#FFF0EB] dark:bg-coral-950/60 text-coral-600 dark:text-coral-400 font-semibold'
                    : 'text-charcoal-600 dark:text-gray-400 hover:text-charcoal-900 dark:hover:text-white hover:bg-[#FAF4F0] dark:hover:bg-[#22242b]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-coral-500' : 'text-charcoal-400 dark:text-gray-400'}`} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Account Navigation */}
        <div className="pt-2 border-t border-[#F3ECE7]/80 dark:border-[#2e313a]/80 space-y-1">
          {accountNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center rounded-xl text-xs font-medium transition-all duration-150 ${
                  isCollapsed ? 'justify-center w-9 h-9 mx-auto' : 'gap-3 px-3 py-2'
                } ${
                  active
                    ? 'bg-[#FFF0EB] dark:bg-coral-950/60 text-coral-600 dark:text-coral-400 font-semibold'
                    : 'text-charcoal-600 dark:text-gray-400 hover:text-charcoal-900 dark:hover:text-white hover:bg-[#FAF4F0] dark:hover:bg-[#22242b]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-coral-500' : 'text-charcoal-400 dark:text-gray-400'}`} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Daily Inspiration Card */}
      {!isCollapsed ? (
        <div className="mt-8 relative overflow-hidden bg-gradient-to-b from-[#FFF5F2] to-[#FFEAE3] dark:from-[#212328] dark:to-[#1a1b20] border border-[#FFD9CE]/70 dark:border-[#2e313a] rounded-3xl p-5 shadow-sm">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-coral-500 dark:text-coral-400 uppercase tracking-wider">
                Daily Inspiration
              </span>
              <Sparkles className="w-3.5 h-3.5 text-coral-400" />
            </div>
            <p className="text-xs font-semibold text-charcoal-700 dark:text-gray-300 leading-relaxed">
              &quot;Small steps every day lead to big results.&quot;
            </p>
          </div>

          <div className="mt-3 flex justify-end">
            <svg
              className="w-16 h-16 text-coral-300/70 dark:text-coral-500/30"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <path d="M50 85 C50 85 45 70 45 55 C45 40 50 30 50 30 C50 30 55 40 55 55 C55 70 50 85 50 85 Z" />
              <path d="M50 60 C38 55 30 45 35 35 C42 30 50 45 50 60 Z" />
              <path d="M50 48 C62 43 70 33 65 23 C58 18 50 33 50 48 Z" />
              <path d="M50 32 C40 28 35 18 42 12 C50 8 50 20 50 32 Z" />
              <ellipse cx="50" cy="88" rx="14" ry="4" opacity="0.4" />
            </svg>
          </div>
        </div>
      ) : (
        <div
          title="Daily Inspiration: Small steps every day lead to big results."
          className="mt-6 flex justify-center py-3 rounded-2xl bg-gradient-to-b from-[#FFF5F2] to-[#FFEAE3] dark:from-[#212328] dark:to-[#1a1b20] border border-[#FFD9CE]/70 dark:border-[#2e313a] cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-coral-500" />
        </div>
      )}
    </aside>
  );
};
