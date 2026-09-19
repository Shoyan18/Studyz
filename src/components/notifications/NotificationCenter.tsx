'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  BellOff,
  BellRing,
  CheckCheck,
  Clock,
  CheckCircle2,
  Trophy,
  Sparkles,
  X,
  Settings,
  AlertCircle,
  ExternalLink,
  Volume2,
} from 'lucide-react';
import { useNotificationScheduler, StudyzNotificationItem } from '@/lib/useNotificationScheduler';

export const NotificationCenter: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'REMINDERS' | 'ACHIEVEMENTS'>('ALL');
  const popoverRef = useRef<HTMLDivElement>(null);

  const {
    permission,
    notifications,
    unreadCount,
    pendingCount,
    requestPermission,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendTestNotification,
    isLoading,
  } = useNotificationScheduler();

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === 'REMINDERS') return notif.type === 'TASK_REMINDER';
    if (activeFilter === 'ACHIEVEMENTS') return notif.type === 'ACHIEVEMENT';
    return true;
  });

  const formatNotificationTime = (dateStr?: string | null) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TASK_REMINDER':
        return (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-coral-500 to-amber-400 text-white flex items-center justify-center shadow-sm shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        );
      case 'TASK_COMPLETED':
        return (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-sm shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case 'ACHIEVEMENT':
        return (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-sm shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-lavender-500 to-indigo-500 text-white flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
        );
    }
  };

  const handleNotificationClick = (notif: StudyzNotificationItem) => {
    if (!notif.isRead) {
      markAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-2xl bg-white dark:bg-[#1a1b20] border transition-all relative flex items-center justify-center ${
          isOpen
            ? 'border-coral-400 shadow-md ring-2 ring-coral-100 dark:ring-coral-900/40 text-coral-600 dark:text-coral-400'
            : 'border-[#EFE7E1] dark:border-[#2e313a] text-charcoal-600 dark:text-gray-300 hover:text-coral-600 dark:hover:text-coral-400 hover:border-coral-200 dark:hover:border-coral-800 shadow-sm'
        }`}
        aria-label="Notifications"
      >
        {permission === 'denied' ? (
          <BellOff className="w-4 h-4 md:w-5 md:h-5 text-charcoal-400 dark:text-gray-500" />
        ) : unreadCount > 0 ? (
          <BellRing className="w-4 h-4 md:w-5 md:h-5 text-coral-500 animate-pulse" />
        ) : (
          <Bell className="w-4 h-4 md:w-5 md:h-5" />
        )}

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-coral-500 to-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 max-w-[90vw] bg-white dark:bg-[#1a1b20] border border-[#EFE7E1] dark:border-[#2e313a] rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-[#F5EBE4] dark:border-[#2e313a] bg-[#FCFAF8] dark:bg-[#212328] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-coral-100 dark:bg-coral-950/80 text-coral-600 dark:text-coral-400 flex items-center justify-center">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-extrabold text-charcoal-900 dark:text-white tracking-tight">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-coral-50 dark:bg-coral-950/60 text-coral-600 dark:text-coral-300 border border-coral-200/60 dark:border-coral-800">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-bold text-coral-600 dark:text-coral-400 hover:text-coral-700 dark:hover:text-coral-300 hover:bg-coral-50 dark:hover:bg-coral-950/40 px-2.5 py-1 rounded-xl transition-all"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-charcoal-400 dark:text-gray-400 hover:text-charcoal-700 dark:hover:text-white hover:bg-[#F3ECE7] dark:hover:bg-[#252832] transition-all"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Browser Permission Banner (if default or denied) */}
          {permission === 'default' && (
            <div className="m-3 p-3 bg-gradient-to-r from-coral-50 to-amber-50 dark:from-[#2a2420] dark:to-[#252220] border border-coral-200/70 dark:border-coral-800/60 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-6 h-6 rounded-lg bg-coral-500 text-white flex items-center justify-center shrink-0">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-charcoal-900 dark:text-white leading-snug">
                    Enable Task Reminders
                  </p>
                  <p className="text-[10px] text-charcoal-500 dark:text-gray-400">
                    Get alerted when study tasks start.
                  </p>
                </div>
              </div>
              <button
                onClick={() => requestPermission()}
                className="text-xs font-black bg-coral-500 hover:bg-coral-600 text-white px-3 py-1.5 rounded-xl shadow-sm transition-transform active:scale-95 shrink-0"
              >
                Allow
              </button>
            </div>
          )}

          {permission === 'denied' && (
            <div className="m-3 p-3 bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/60 rounded-2xl flex items-center gap-2.5 text-left text-rose-800 dark:text-rose-200 text-[11px]">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <div>
                <span className="font-bold">Notifications disabled:</span> Allow them in your browser settings to receive study reminders.
              </div>
            </div>
          )}

          {/* Filter Pills */}
          <div className="px-4 py-2 flex items-center gap-1.5 border-b border-[#F5EBE4] dark:border-[#2e313a] bg-white dark:bg-[#1a1b20]">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-900 shadow-xs'
                  : 'text-charcoal-500 dark:text-gray-400 hover:text-charcoal-800 dark:hover:text-white hover:bg-[#F7F2EE] dark:hover:bg-[#252832]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('REMINDERS')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                activeFilter === 'REMINDERS'
                  ? 'bg-coral-500 text-white shadow-xs'
                  : 'text-charcoal-500 dark:text-gray-400 hover:text-charcoal-800 dark:hover:text-white hover:bg-[#F7F2EE] dark:hover:bg-[#252832]'
              }`}
            >
              <span>Reminders ⏰</span>
            </button>
            <button
              onClick={() => setActiveFilter('ACHIEVEMENTS')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                activeFilter === 'ACHIEVEMENTS'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-charcoal-500 dark:text-gray-400 hover:text-charcoal-800 dark:hover:text-white hover:bg-[#F7F2EE] dark:hover:bg-[#252832]'
              }`}
            >
              <span>Milestones 🏆</span>
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#F5EBE4]/60 dark:divide-[#2e313a]/60">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF5F2] dark:bg-coral-950/40 text-coral-400 mx-auto flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <p className="text-xs font-extrabold text-charcoal-800 dark:text-gray-200">All caught up!</p>
                <p className="text-[11px] text-charcoal-400 dark:text-gray-400 mt-0.5">
                  Scheduled task reminders and achievements will appear here.
                </p>
                {pendingCount > 0 && (
                  <p className="text-[10px] font-semibold text-coral-600 dark:text-coral-400 mt-2">
                    ⏳ {pendingCount} upcoming reminder{pendingCount > 1 ? 's' : ''} scheduled
                  </p>
                )}
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-[#FCFAF8] dark:hover:bg-[#252832] transition-colors cursor-pointer relative group ${
                    !notif.isRead ? 'bg-[#FFF8F5]/70 dark:bg-coral-950/30' : ''
                  }`}
                >
                  {getNotificationIcon(notif.type)}

                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-charcoal-900 dark:text-white leading-snug truncate">
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-coral-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-charcoal-600 dark:text-gray-300 font-medium line-clamp-2 mt-0.5">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-semibold text-charcoal-400 dark:text-gray-400">
                        {formatNotificationTime(notif.createdAt)}
                      </span>
                      {notif.task?.subject && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.2 rounded-md border"
                          style={{
                            borderColor: `${notif.task.subject.color}40`,
                            color: notif.task.subject.color,
                            backgroundColor: `${notif.task.subject.color}15`,
                          }}
                        >
                          {notif.task.subject.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions on hover */}
                  <div className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 text-charcoal-400 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      title="Delete"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-[#FCFAF8] dark:bg-[#212328] border-t border-[#F5EBE4] dark:border-[#2e313a] flex items-center justify-between text-xs">
            <button
              onClick={() => sendTestNotification()}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-[11px] font-bold text-charcoal-600 dark:text-gray-300 hover:text-coral-600 dark:hover:text-coral-400 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5 text-coral-500" />
              <span>Test Alert</span>
            </button>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-charcoal-500 dark:text-gray-400 hover:text-charcoal-800 dark:hover:text-white transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
