'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Flame, Trophy, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import confetti from 'canvas-confetti';

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  durationMinutes: number;
  xpEarned: number;
  streak: number;
  unlockedAchievements?: Array<{ id: string; name: string; description: string; icon: string; xpReward: number }>;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  isOpen,
  onClose,
  durationMinutes,
  xpEarned,
  streak,
  unlockedAchievements = [],
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire celebratory confetti cannons
      const end = Date.now() + 1000;
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FF704E', '#8C7CFF', '#FDBA74', '#34D399'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FF704E', '#8C7CFF', '#FDBA74', '#34D399'],
        });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-charcoal-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white border border-[#F3ECE7] rounded-4xl shadow-2xl p-6 sm:p-8 z-10 text-center animate-in zoom-in-95 duration-200">
        {/* Triumph Graphic */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-coral-400 to-amber-300 flex items-center justify-center text-white shadow-coral-glow mb-5">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <span className="text-xs font-extrabold text-coral-500 uppercase tracking-widest bg-[#FFF0EB] px-3 py-1 rounded-full">
          Mission Accomplished
        </span>

        <h2 className="text-2xl font-black text-charcoal-900 mt-2">
          Focus Session Complete!
        </h2>
        <p className="text-xs text-charcoal-500 mt-1 font-medium">
          Every moment of deep work builds your intellectual mastery.
        </p>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-3 gap-3 my-6">
          <div className="p-3.5 rounded-2xl bg-[#FCFAF8] border border-[#EFE7E1]">
            <span className="text-[11px] font-bold text-charcoal-400 uppercase">Duration</span>
            <p className="text-lg font-black text-charcoal-900 mt-0.5">{durationMinutes}m</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FFF8E6] border border-[#FDE68A]">
            <span className="text-[11px] font-bold text-amber-600 uppercase flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" /> XP Earned
            </span>
            <p className="text-lg font-black text-amber-600 mt-0.5">+{xpEarned}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FFF0EB] border border-[#FFD6CB]">
            <span className="text-[11px] font-bold text-coral-500 uppercase flex items-center justify-center gap-1">
              <Flame className="w-3 h-3" /> Streak
            </span>
            <p className="text-lg font-black text-coral-600 mt-0.5">{streak} Days</p>
          </div>
        </div>

        {/* Unlocked Achievements List if any */}
        {unlockedAchievements.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-[#F0EDFF] border border-[#DFD7FE] text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold text-lavender-700 uppercase mb-2">
              <Trophy className="w-4 h-4 text-lavender-500" />
              <span>Achievement Unlocked!</span>
            </div>
            {unlockedAchievements.map((ach) => (
              <div key={ach.id} className="flex items-center justify-between mt-1 text-xs">
                <span className="font-bold text-charcoal-900">{ach.name}</span>
                <span className="font-bold text-lavender-600">+{ach.xpReward} XP</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Start Another
          </Button>
          <Link href="/dashboard" className="w-full">
            <Button variant="primary" className="w-full flex items-center justify-center gap-1.5">
              <span>Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
