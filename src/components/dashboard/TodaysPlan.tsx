'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Check, Atom, FlaskConical, Calculator, BookOpen } from 'lucide-react';
import { Task } from '@/types';
import confetti from 'canvas-confetti';

interface TodaysPlanProps {
  tasks: Task[];
  onToggleComplete: (taskId: string, currentStatus: string) => Promise<void>;
  onOpenAddTask: () => void;
}

export const TodaysPlan: React.FC<TodaysPlanProps> = ({
  tasks = [],
  onToggleComplete,
  onOpenAddTask,
}) => {
  const router = useRouter();

  const getSubjectIcon = (iconName?: string | null, subjectName?: string | null) => {
    const name = (subjectName || '').toLowerCase();
    if (name.includes('phys') || iconName === 'atom') {
      return <Atom className="w-5 h-5 text-lavender-500" />;
    }
    if (name.includes('chem') || iconName === 'flask-conical') {
      return <FlaskConical className="w-5 h-5 text-coral-500" />;
    }
    if (name.includes('math') || iconName === 'calculator') {
      return <Calculator className="w-5 h-5 text-amber-500" />;
    }
    return <BookOpen className="w-5 h-5 text-lavender-500" />;
  };

  const getSubjectIconBg = (subjectName?: string | null) => {
    const name = (subjectName || '').toLowerCase();
    if (name.includes('phys')) return 'bg-[#F0EDFF] border-[#DFD7FE]';
    if (name.includes('chem')) return 'bg-[#FFF0EB] border-[#FFD6CB]';
    if (name.includes('math')) return 'bg-[#FFF8E6] border-[#FDE68A]';
    return 'bg-[#F0EDFF] border-[#DFD7FE]';
  };

  const handleCheckboxClick = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (task.status !== 'COMPLETED') {
      // Trigger festive mini confetti
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FF704E', '#8C7CFF', '#FDBA74'],
      });
    }
    await onToggleComplete(task.id, task.status);
  };

  const handleStartStudy = (task: Task) => {
    const params = new URLSearchParams();
    if (task.subjectId) params.set('subjectId', task.subjectId);
    if (task.chapterId) params.set('chapterId', task.chapterId);
    if (task.duration) params.set('duration', String(task.duration));
    router.push(`/focus?${params.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-2xl p-3.5 md:p-4 shadow-soft">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-bold text-charcoal-900 dark:text-white tracking-tight">Today&apos;s Plan</h2>
          <Link
            href="/tasks"
            className="text-xs font-bold text-charcoal-500 dark:text-gray-400 hover:text-coral-600 dark:hover:text-coral-400 transition-colors px-2 py-1 rounded-lg hover:bg-[#FFF5F2] dark:hover:bg-[#252832]"
          >
            View all
          </Link>
        </div>

        {/* Task List */}
        {tasks.length === 0 ? (
          <div className="py-6 text-center bg-[#FAF6F3] dark:bg-[#212328] rounded-2xl border border-dashed border-[#EAE0D8] dark:border-[#2e313a] p-4">
            <p className="text-xs font-semibold text-charcoal-700 dark:text-gray-300">No plans for today.</p>
            <p className="text-[11px] text-charcoal-400 dark:text-gray-400 mt-0.5">Add your first study task to get going.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasks.map((task) => {
              const isCompleted = task.status === 'COMPLETED';
              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-2.5 md:p-3 rounded-2xl border transition-all ${
                    isCompleted
                      ? 'bg-[#F9F7F5] dark:bg-[#212328] border-[#EFE8E2] dark:border-[#2e313a] opacity-75'
                      : 'bg-white dark:bg-[#22242b] border-[#F3ECE7] dark:border-[#2e313a] hover:border-[#EBD9CE] dark:hover:border-[#404452] hover:shadow-sm'
                  }`}
                >
                  {/* Left: Icon + Title & Time */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${getSubjectIconBg(
                        task.subjectName
                      )}`}
                    >
                      {getSubjectIcon(task.subjectIcon, task.subjectName)}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-xs md:text-sm font-bold text-charcoal-900 dark:text-white truncate ${
                          isCompleted ? 'line-through text-charcoal-400 dark:text-gray-400' : ''
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-[11px] text-charcoal-400 dark:text-gray-400 font-medium">
                        {task.scheduledTime || `${task.duration} min`}
                      </p>
                    </div>
                  </div>

                  {/* Right: Study button + Checkmark */}
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {!isCompleted && (
                      <button
                        onClick={() => handleStartStudy(task)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-[#F0EDFF] dark:bg-lavender-950/80 text-[#7C6AFF] dark:text-lavender-300 hover:bg-[#E5E0FF] transition-colors"
                      >
                        Study
                      </button>
                    )}
                    <button
                      onClick={(e) => handleCheckboxClick(e, task)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                          : 'border-[#DECFC6] dark:border-gray-600 hover:border-coral-400 bg-white dark:bg-transparent'
                      }`}
                      aria-label={isCompleted ? 'Mark task incomplete' : 'Mark task complete'}
                    >
                      {isCompleted && <Check className="w-3 h-3 stroke-[3] text-white" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Add Task Button */}
      <button
        onClick={onOpenAddTask}
        className="mt-3.5 w-full py-2.5 border border-dashed border-[#DECFC6] dark:border-[#2e313a] hover:border-coral-400 bg-[#FAF7F4] dark:bg-[#212328] hover:bg-[#FFF7F4] dark:hover:bg-[#252832] text-coral-600 dark:text-coral-400 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add New Task</span>
      </button>
    </div>
  );
};
