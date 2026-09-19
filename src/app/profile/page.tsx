'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { StudyzSelect } from '@/components/ui/StudyzSelect';
import {
  User,
  GraduationCap,
  Target,
  Flame,
  Zap,
  Clock,
  CheckCircle2,
  BookOpen,
  Edit3,
  Sparkles,
  Camera,
} from 'lucide-react';
import { LevelInfo } from '@/types';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { AvatarPicker } from '@/components/avatar/AvatarPicker';

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    createdAt: string;
  };
  profile?: {
    grade: string;
    examGoal: string;
    bio?: string | null;
    dailyStudyGoalHours: number;
    preferredFocusMinutes: number;
  };
  gamification: {
    totalXp: number;
    currentStreak: number;
    longestStreak: number;
    levelInfo: LevelInfo;
  };
  stats: {
    totalHours: number;
    totalSessions: number;
    completedTasks: number;
    completedChapters: number;
  };
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Edit fields
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('🧑‍🎓');
  const [grade, setGrade] = useState('');
  const [examGoal, setExamGoal] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setName(json.user.name);
        setAvatarUrl(json.user.avatarUrl || '🧑‍🎓');
        setGrade(json.profile?.grade || 'Class 12');
        setExamGoal(json.profile?.examGoal || 'JEE Main & Advanced');
        setBio(json.profile?.bio || '');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          avatarUrl,
          grade,
          examGoal,
          bio: bio.trim() || null,
        }),
      });

      if (res.ok) {
        setIsEditOpen(false);
        fetchProfile();
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-64 bg-[#F3ECE7] rounded-3xl" />
          <div className="h-44 bg-[#F3ECE7] rounded-3xl" />
        </div>
      </AppLayout>
    );
  }

  const { user, profile, gamification, stats } = data;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Profile Card Banner */}
        <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-4xl p-6 sm:p-10 shadow-soft relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div
                className="relative group cursor-pointer shrink-0"
                onClick={() => setIsEditOpen(true)}
                title="Click to change profile picture"
              >
                <UserAvatar
                  avatarUrl={user.avatarUrl}
                  name={user.name}
                  size="xl"
                  showBorder
                />
                <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold gap-1">
                  <Camera className="w-5 h-5" />
                  <span>Change</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 dark:text-white tracking-tight">
                    {user.name}
                  </h1>
                  <span className="text-xs font-bold text-coral-600 dark:text-coral-300 bg-[#FFF0EB] dark:bg-coral-950/60 px-3 py-1 rounded-xl">
                    Level {gamification.levelInfo.level}
                  </span>
                </div>
                <p className="text-xs text-charcoal-400 dark:text-gray-400 mt-1">{user.email}</p>

                <div className="flex items-center gap-3 mt-3 flex-wrap text-xs font-semibold text-charcoal-600 dark:text-gray-300">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4 text-lavender-500" />
                    {profile?.grade || 'Class 12'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4 text-coral-500" />
                    {profile?.examGoal || 'JEE Main'}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-2 self-start md:self-auto"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </Button>
          </div>

          {profile?.bio && (
            <p className="mt-6 pt-6 border-t border-[#F5EBE4] dark:border-[#2e313a] text-xs text-charcoal-600 dark:text-gray-300 leading-relaxed max-w-2xl">
              &quot;{profile.bio}&quot;
            </p>
          )}
        </div>

        {/* Gamification and Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-3xl p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF0EB] dark:bg-coral-950/60 flex items-center justify-center text-coral-500">
                <Flame className="w-5 h-5 fill-coral-500 text-coral-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-charcoal-400 dark:text-gray-400">Current Streak</p>
                <h3 className="text-xl font-extrabold text-charcoal-900 dark:text-white">{gamification.currentStreak} Days</h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-3xl p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF8E6] dark:bg-amber-950/60 flex items-center justify-center text-amber-500">
                <Sparkles className="w-5 h-5 fill-amber-400 text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-charcoal-400 dark:text-gray-400">Total XP</p>
                <h3 className="text-xl font-extrabold text-charcoal-900 dark:text-white">
                  {gamification.totalXp.toLocaleString()}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-3xl p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F0EDFF] dark:bg-indigo-950/60 flex items-center justify-center text-lavender-500">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-charcoal-400 dark:text-gray-400">Focus Hours</p>
                <h3 className="text-xl font-extrabold text-charcoal-900 dark:text-white">{stats.totalHours}h</h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-3xl p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] dark:bg-emerald-950/60 flex items-center justify-center text-mint-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-charcoal-400 dark:text-gray-400">Tasks Completed</p>
                <h3 className="text-xl font-extrabold text-charcoal-900 dark:text-white">{stats.completedTasks}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Student Profile"
          subtitle="Customize your profile picture, study details, and exam targets"
          maxWidth="lg"
        >
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-gray-300 mb-2">
                Profile Picture &amp; Avatar Studio
              </label>
              <AvatarPicker
                selectedAvatar={avatarUrl}
                onSelectAvatar={(newVal) => setAvatarUrl(newVal)}
                userName={name}
              />
            </div>

            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <StudyzSelect
              label="Grade / Stage"
              value={grade}
              onChange={(val) => setGrade(String(val))}
              options={[
                { value: 'Class 11', label: 'Class 11', secondaryText: 'High School' },
                { value: 'Class 12', label: 'Class 12', secondaryText: 'Senior Year' },
                { value: 'Dropper / Gap Year', label: 'Dropper / Gap Year', secondaryText: 'Competitive' },
                { value: 'Undergraduate / College', label: 'Undergraduate / College', secondaryText: 'Higher Ed' },
                { value: 'Self-Paced / Competitive', label: 'Self-Paced / Competitive', secondaryText: 'Independent' },
              ]}
            />

            <Input
              label="Target Exam / Goal"
              value={examGoal}
              onChange={(e) => setExamGoal(e.target.value)}
              placeholder="e.g. JEE Advanced 2026"
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-gray-300 mb-1.5">
                Bio / Motto
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Aiming for Top 500 in JEE Advanced."
                className="w-full bg-[#FCFAF8] dark:bg-[#212328] border border-[#EFE7E1] dark:border-[#2e313a] rounded-2xl p-3 text-xs text-charcoal-800 dark:text-gray-200 placeholder-charcoal-400 dark:placeholder-gray-500 focus:outline-none focus:border-coral-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F5EBE4] dark:border-[#2e313a]">
              <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
