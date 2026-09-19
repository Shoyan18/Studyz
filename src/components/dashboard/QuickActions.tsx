'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, BookOpen, LineChart, Trophy } from 'lucide-react';

interface QuickActionsProps {
  onOpenAddTask: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onOpenAddTask }) => {
  return (
    <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-2xl p-3.5 md:p-4 shadow-soft">
      <div className="mb-2.5">
        <h2 className="text-sm font-bold text-charcoal-900 dark:text-white tracking-tight">Quick Actions</h2>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* 1. Add Task */}
        <button
          onClick={onOpenAddTask}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#FCFAF8] dark:bg-[#212328] border border-[#F3ECE7] dark:border-[#2e313a] hover:border-coral-300 dark:hover:border-coral-500/50 hover:bg-[#FFF5F1] dark:hover:bg-[#28252b] transition-all group text-center"
        >
          <div className="w-7 h-7 rounded-lg bg-[#FFF0EB] dark:bg-coral-950/80 flex items-center justify-center text-coral-500 mb-1 group-hover:scale-105 transition-transform shadow-inner">
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold text-charcoal-800 dark:text-gray-200 group-hover:text-coral-600 dark:group-hover:text-coral-400 transition-colors">
            Add Task
          </span>
        </button>

        {/* 2. View Subjects */}
        <Link
          href="/subjects"
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#FCFAF8] dark:bg-[#212328] border border-[#F3ECE7] dark:border-[#2e313a] hover:border-lavender-300 dark:hover:border-lavender-500/50 hover:bg-[#F6F4FE] dark:hover:bg-[#232332] transition-all group text-center"
        >
          <div className="w-7 h-7 rounded-lg bg-[#F0EDFF] dark:bg-lavender-950/80 flex items-center justify-center text-lavender-500 mb-1 group-hover:scale-105 transition-transform shadow-inner">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-bold text-charcoal-800 dark:text-gray-200 group-hover:text-lavender-600 dark:group-hover:text-lavender-300 transition-colors">
            View Subjects
          </span>
        </Link>

        {/* 3. View Analytics */}
        <Link
          href="/analytics"
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#FCFAF8] dark:bg-[#212328] border border-[#F3ECE7] dark:border-[#2e313a] hover:border-amber-300 dark:hover:border-amber-500/50 hover:bg-[#FFF8EE] dark:hover:bg-[#282622] transition-all group text-center"
        >
          <div className="w-7 h-7 rounded-lg bg-[#FFF8E6] dark:bg-amber-950/80 flex items-center justify-center text-amber-500 mb-1 group-hover:scale-105 transition-transform shadow-inner">
            <LineChart className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-bold text-charcoal-800 dark:text-gray-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            View Analytics
          </span>
        </Link>

        {/* 4. Achievements */}
        <Link
          href="/achievements"
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#FCFAF8] dark:bg-[#212328] border border-[#F3ECE7] dark:border-[#2e313a] hover:border-coral-300 dark:hover:border-coral-500/50 hover:bg-[#FFF0EB] dark:hover:bg-[#28252b] transition-all group text-center"
        >
          <div className="w-7 h-7 rounded-lg bg-[#FFF0EB] dark:bg-coral-950/80 flex items-center justify-center text-coral-500 mb-1 group-hover:scale-105 transition-transform shadow-inner">
            <Trophy className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-bold text-charcoal-800 dark:text-gray-200 group-hover:text-coral-600 dark:group-hover:text-coral-400 transition-colors">
            Achievements
          </span>
        </Link>
      </div>
    </div>
  );
};
