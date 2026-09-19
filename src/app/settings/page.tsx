'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StudyzSelect } from '@/components/ui/StudyzSelect';
import {
  Sliders,
  Shield,
  CheckCircle2,
  Bell,
  BellRing,
  BellOff,
  Globe,
  Volume2,
  AlertCircle,
  Sun,
  Moon,
  Camera,
  User,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useNotificationScheduler } from '@/lib/useNotificationScheduler';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Modal } from '@/components/ui/Modal';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { AvatarPicker } from '@/components/avatar/AvatarPicker';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('/avatars/avatar-scholar-boy.svg');
  const [userEmail, setUserEmail] = useState('');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [dailyGoalHours, setDailyGoalHours] = useState('4');
  const [preferredFocusMinutes, setPreferredFocusMinutes] = useState('50');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [taskRemindersEnabled, setTaskRemindersEnabled] = useState(true);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const {
    permission,
    requestPermission,
    sendTestNotification,
    isLoading: isTestLoading,
  } = useNotificationScheduler();

  useEffect(() => {
    // Detect browser timezone if not loaded yet
    try {
      const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detectedTz) {
        setTimezone(detectedTz);
      }
    } catch {
      // Fallback default
    }

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setName(data.user.name);
          if (data.user.email) setUserEmail(data.user.email);
          if (data.user.avatarUrl) setAvatarUrl(data.user.avatarUrl);
          if (data.profile) {
            setDailyGoalHours(String(data.profile.dailyStudyGoalHours || 4));
            setPreferredFocusMinutes(String(data.profile.preferredFocusMinutes || 50));
            if (data.profile.timezone) setTimezone(data.profile.timezone);
            if (data.profile.taskRemindersEnabled !== undefined) {
              setTaskRemindersEnabled(data.profile.taskRemindersEnabled);
            }
            if (data.profile.browserNotificationsEnabled !== undefined) {
              setBrowserNotificationsEnabled(data.profile.browserNotificationsEnabled);
            }
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSelectAvatar = async (newUrl: string) => {
    setAvatarUrl(newUrl);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: newUrl }),
      });
      setSuccessMessage('Profile picture updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch {
      // Main save button will also persist it
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          avatarUrl: avatarUrl || undefined,
          dailyStudyGoalHours: Number(dailyGoalHours),
          preferredFocusMinutes: Number(preferredFocusMinutes),
          themePreference: theme,
          timezone,
          taskRemindersEnabled,
          browserNotificationsEnabled,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      setSuccessMessage('Settings and preferences updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-64 bg-[#F3ECE7] rounded-3xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
            Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-gray-400 font-medium mt-1">
            Manage your task reminder notifications, study targets, timer preferences, and security.
          </p>
        </div>

        {successMessage && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs rounded-2xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-300 text-xs rounded-2xl font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Student Profile & Avatar Section */}
          <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-4xl p-6 sm:p-8 shadow-soft space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#F5EBE4] dark:border-[#2e313a]">
              <div className="flex items-center gap-2.5">
                <User className="w-5 h-5 text-coral-500" />
                <div>
                  <h2 className="text-base font-extrabold text-charcoal-900 dark:text-white">
                    Student Profile &amp; Avatar
                  </h2>
                  <p className="text-xs text-charcoal-500 dark:text-gray-400 mt-0.5">
                    Customize your profile picture, upload custom photos, or pick from high-quality presets.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAvatarModalOpen(true)}
                className="text-xs flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-coral-500" />
                <span>Change Photo / Avatar</span>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-4 rounded-3xl bg-[#FCFAF8] dark:bg-[#212328] border border-[#F3ECE7] dark:border-[#2e313a]">
              <div
                className="relative group cursor-pointer shrink-0"
                onClick={() => setIsAvatarModalOpen(true)}
                title="Click to change profile picture"
              >
                <UserAvatar avatarUrl={avatarUrl} name={name} size="xl" showBorder />
                <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold gap-1">
                  <Camera className="w-4 h-4" />
                  <span>Change</span>
                </div>
              </div>

              <div className="space-y-3 flex-1 text-center sm:text-left w-full">
                <div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-lg font-black text-charcoal-900 dark:text-white">
                      {name || 'Scholar'}
                    </h3>
                    {avatarUrl && (avatarUrl.includes('custom-') || avatarUrl.startsWith('data:')) && (
                      <span className="px-2 py-0.5 bg-coral-100 dark:bg-coral-950/60 text-coral-600 dark:text-coral-300 text-[10px] font-extrabold rounded-full">
                        Custom Photo Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-charcoal-500 dark:text-gray-400 font-medium">
                    {userEmail || 'Student Account'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    Open Avatar &amp; Photo Studio
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="text-xs"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    Upload Custom Picture
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications & Task Reminders Section */}
          <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-4xl p-6 sm:p-8 shadow-soft space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#F5EBE4] dark:border-[#2e313a]">
              <div className="flex items-center gap-2.5">
                <Bell className="w-5 h-5 text-coral-500" />
                <div>
                  <h2 className="text-base font-extrabold text-charcoal-900 dark:text-white">
                    Notifications & Reminders
                  </h2>
                  <p className="text-xs text-charcoal-500 dark:text-gray-400 mt-0.5">
                    Configure task alerts and local browser push notifications.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {permission === 'granted' ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/60 rounded-xl text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Browser Allowed
                  </span>
                ) : permission === 'denied' ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60 rounded-xl text-xs font-bold">
                    <BellOff className="w-3.5 h-3.5 text-rose-500" />
                    Blocked in Browser
                  </span>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => requestPermission()}
                    className="text-xs"
                  >
                    <BellRing className="w-3.5 h-3.5 text-coral-500" />
                    Enable Push
                  </Button>
                )}
              </div>
            </div>

            {/* Permission explanation banner */}
            {permission === 'denied' ? (
              <div className="p-4 bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-800 dark:text-rose-200">
                  <p className="font-bold">Notifications are disabled in your browser.</p>
                  <p className="mt-0.5 text-rose-700 dark:text-rose-300">
                    To receive alerts at your exact task time, click the lock/settings icon near your browser address bar and switch Notifications to &quot;Allow&quot;.
                  </p>
                </div>
              </div>
            ) : permission === 'default' ? (
              <div className="p-4 bg-coral-50/70 dark:bg-coral-950/40 border border-coral-200/60 dark:border-coral-900/40 rounded-2xl flex items-center justify-between gap-4">
                <div className="text-xs text-coral-900 dark:text-coral-100">
                  <p className="font-bold">Enable Desktop &amp; Mobile Notifications</p>
                  <p className="text-coral-700 dark:text-coral-300 mt-0.5">
                    Allow browser push notifications to get alerted even when STUDYZ is in the background.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => requestPermission()}
                >
                  Allow Notifications
                </Button>
              </div>
            ) : null}

            {/* Toggles */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FCFAF8] dark:bg-[#212328] border border-[#F3ECE7] dark:border-[#2e313a]">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-charcoal-900 dark:text-white">
                    Task Reminders
                  </p>
                  <p className="text-[11px] sm:text-xs text-charcoal-500 dark:text-gray-400 mt-0.5">
                    Schedule alerts for tasks with exact scheduled times.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={taskRemindersEnabled}
                    onChange={(e) => setTaskRemindersEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#E8DDD4] dark:bg-[#2e313a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E8DDD4] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coral-500" />
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FCFAF8] dark:bg-[#212328] border border-[#F3ECE7] dark:border-[#2e313a]">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-charcoal-900 dark:text-white">
                    Browser Push Notifications
                  </p>
                  <p className="text-[11px] sm:text-xs text-charcoal-500 dark:text-gray-400 mt-0.5">
                    Display native system alerts and audio chimes at exact schedule times.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={browserNotificationsEnabled}
                    onChange={(e) => setBrowserNotificationsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#E8DDD4] dark:bg-[#2e313a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E8DDD4] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coral-500" />
                </label>
              </div>
            </div>

            {/* Timezone & Test Notification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <StudyzSelect
                label="Student Timezone"
                value={timezone}
                onChange={(val) => setTimezone(String(val))}
                searchable
                options={[
                  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)', secondaryText: 'UTC+5:30' },
                  { value: 'America/New_York', label: 'America/New_York (EST)', secondaryText: 'UTC-5:00' },
                  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)', secondaryText: 'UTC-8:00' },
                  { value: 'America/Chicago', label: 'America/Chicago (CST)', secondaryText: 'UTC-6:00' },
                  { value: 'Europe/London', label: 'Europe/London (GMT/BST)', secondaryText: 'UTC+0:00' },
                  { value: 'Europe/Paris', label: 'Europe/Paris (CET)', secondaryText: 'UTC+1:00' },
                  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)', secondaryText: 'UTC+4:00' },
                  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)', secondaryText: 'UTC+8:00' },
                  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)', secondaryText: 'UTC+9:00' },
                  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST)', secondaryText: 'UTC+10:00' },
                  { value: 'UTC', label: 'Coordinated Universal Time (UTC)', secondaryText: 'UTC+0:00' },
                ]}
              />

              <div className="flex flex-col justify-end">
                <label className="text-xs font-bold text-charcoal-700 dark:text-gray-300 uppercase tracking-wider block mb-1.5">
                  Test Notification Audio &amp; Popup
                </label>
                <button
                  type="button"
                  onClick={() => sendTestNotification()}
                  disabled={isTestLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FCFAF8] dark:bg-[#212328] hover:bg-[#FFF5F2] dark:hover:bg-coral-950/40 border border-[#EFE7E1] dark:border-[#2e313a] hover:border-coral-200 text-charcoal-700 dark:text-gray-200 hover:text-coral-600 dark:hover:text-coral-400 rounded-2xl text-xs font-bold transition-all shadow-sm"
                >
                  <Volume2 className="w-4 h-4 text-coral-500" />
                  <span>{isTestLoading ? 'Sending Alert...' : 'Send Test Study Reminder 🔔'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Visual Theme Section (Dark & Light) */}
          <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-4xl p-6 sm:p-8 shadow-soft space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#F5EBE4] dark:border-[#2a2c34]">
              <Sun className="w-5 h-5 text-coral-500" />
              <div>
                <h2 className="text-base font-extrabold text-charcoal-900 dark:text-white">
                  Visual Interface Theme
                </h2>
                <p className="text-xs text-charcoal-500 dark:text-gray-400 mt-0.5">
                  Choose between Dark Theme and Light Theme across all workspaces.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Dark Theme Card */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-5 rounded-3xl border text-left transition-all relative ${
                  theme === 'dark'
                    ? 'bg-[#131314] text-white border-coral-500 shadow-coral-glow ring-2 ring-coral-500/20'
                    : 'bg-[#1e1f20] text-gray-300 border-gray-700 hover:border-coral-400'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-amber-400" />
                    <span className="font-extrabold text-sm text-white">Dark Theme</span>
                  </div>
                  {theme === 'dark' && (
                    <span className="px-2.5 py-0.5 bg-coral-500 text-white text-[10px] font-extrabold rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 font-medium">
                  Sleek dark mode tailored for deep work, late night study sessions, and reduced eye strain.
                </p>
              </button>

              {/* Light Theme Card */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-5 rounded-3xl border text-left transition-all relative ${
                  theme === 'light'
                    ? 'bg-white text-charcoal-900 border-coral-500 shadow-coral-glow ring-2 ring-coral-500/20'
                    : 'bg-[#FAF6F3] text-charcoal-800 border-[#EFE7E1] hover:border-coral-400'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-coral-500" />
                    <span className="font-extrabold text-sm text-charcoal-900">Light Theme</span>
                  </div>
                  {theme === 'light' && (
                    <span className="px-2.5 py-0.5 bg-coral-500 text-white text-[10px] font-extrabold rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-charcoal-500 font-medium">
                  Warm, bright aesthetic with high contrast and clean typography for daytime study.
                </p>
              </button>
            </div>
          </div>

          {/* Study Preferences Section */}
          <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-4xl p-6 sm:p-8 shadow-soft space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#F5EBE4] dark:border-[#2e313a]">
              <Sliders className="w-5 h-5 text-coral-500" />
              <h2 className="text-base font-extrabold text-charcoal-900 dark:text-white">Study Preferences</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Student Display Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <StudyzSelect
                label="Daily Study Target"
                value={dailyGoalHours}
                onChange={(val) => setDailyGoalHours(String(val))}
                options={[
                  { value: '2', label: '2 Hours / Day', secondaryText: 'Light' },
                  { value: '3', label: '3 Hours / Day', secondaryText: 'Moderate' },
                  { value: '4', label: '4 Hours / Day', secondaryText: 'Recommended' },
                  { value: '5', label: '5 Hours / Day', secondaryText: 'Standard' },
                  { value: '6', label: '6 Hours / Day', secondaryText: 'Intensive' },
                  { value: '8', label: '8 Hours / Day', secondaryText: 'Exam Prep 🔥' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StudyzSelect
                label="Default Focus Timer Duration"
                value={preferredFocusMinutes}
                onChange={(val) => setPreferredFocusMinutes(String(val))}
                options={[
                  { value: '25', label: '25 Minutes', secondaryText: 'Pomodoro' },
                  { value: '50', label: '50 Minutes', secondaryText: 'Deep Work' },
                  { value: '90', label: '90 Minutes', secondaryText: 'Flow State' },
                ]}
              />
            </div>
          </div>

          {/* Security & Password Section */}
          <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-4xl p-6 sm:p-8 shadow-soft space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#F5EBE4] dark:border-[#2e313a]">
              <Shield className="w-5 h-5 text-lavender-500" />
              <h2 className="text-base font-extrabold text-charcoal-900 dark:text-white">Account Security</h2>
            </div>

            <p className="text-xs text-charcoal-400 dark:text-gray-400">
              Leave password fields blank if you do not want to change your password.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />

              <Input
                label="New Password"
                type="password"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="lg" isLoading={isSaving}>
              Save Preferences
            </Button>
          </div>
        </form>

        {/* Avatar Customization Modal */}
        <Modal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          title="Student Avatar &amp; Profile Picture"
          subtitle="Upload your custom photo or pick from high-quality illustrated personas"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <AvatarPicker
              selectedAvatar={avatarUrl}
              onSelectAvatar={handleSelectAvatar}
              userName={name}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F5EBE4] dark:border-[#2e313a]">
              <Button
                type="button"
                variant="primary"
                onClick={() => setIsAvatarModalOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>

      </div>
    </AppLayout>
  );
}
