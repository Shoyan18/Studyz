'use client';

import React from 'react';
import Link from 'next/link';
import { Atom, FlaskConical, Calculator, BookOpen } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface SubjectProgressItem {
  id: string;
  name: string;
  code?: string | null;
  color: string;
  icon: string;
  progress: number;
}

interface SubjectProgressListProps {
  subjects: SubjectProgressItem[];
}

export const SubjectProgressList: React.FC<SubjectProgressListProps> = ({ subjects }) => {
  const getSubjectIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('phys')) return <Atom className="w-5 h-5 text-lavender-500" />;
    if (lower.includes('chem')) return <FlaskConical className="w-5 h-5 text-coral-500" />;
    if (lower.includes('math')) return <Calculator className="w-5 h-5 text-amber-500" />;
    return <BookOpen className="w-5 h-5 text-lavender-500" />;
  };

  const getSubjectIconBg = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('phys')) return 'bg-[#F0EDFF] border-[#DFD7FE]';
    if (lower.includes('chem')) return 'bg-[#FFF0EB] border-[#FFD6CB]';
    if (lower.includes('math')) return 'bg-[#FFF8E6] border-[#FDE68A]';
    return 'bg-[#F0EDFF] border-[#DFD7FE]';
  };

  const getBarVariant = (name: string): 'lavender' | 'coral' | 'amber' => {
    const lower = name.toLowerCase();
    if (lower.includes('phys')) return 'lavender';
    if (lower.includes('chem')) return 'coral';
    return 'amber';
  };

  return (
    <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-2xl p-3.5 md:p-4 shadow-soft">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-bold text-charcoal-900 dark:text-white tracking-tight">Subject Progress</h2>
          <Link
            href="/subjects"
            className="text-xs font-bold text-charcoal-500 dark:text-gray-400 hover:text-coral-600 dark:hover:text-coral-400 transition-colors px-2 py-1 rounded-lg hover:bg-[#FFF5F2] dark:hover:bg-[#252832]"
          >
            View all
          </Link>
        </div>

        {/* Subjects list */}
        {subjects.length === 0 ? (
          <div className="py-4 text-center bg-[#FAF6F3] dark:bg-[#212328] rounded-xl border border-dashed border-[#EAE0D8] dark:border-[#2e313a] p-3">
            <p className="text-xs font-semibold text-charcoal-700 dark:text-gray-300">No subjects yet.</p>
            <p className="text-[11px] text-charcoal-400 dark:text-gray-400 mt-0.5">Add your study subjects to track progress.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {subjects.map((sub) => (
              <Link
                key={sub.id}
                href={`/subjects/${sub.id}`}
                className="block p-2 rounded-xl border border-[#F3ECE7] dark:border-[#2e313a] hover:border-[#EBD9CE] dark:hover:border-[#404452] hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${getSubjectIconBg(
                        sub.name
                      )}`}
                    >
                      {getSubjectIcon(sub.name)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-charcoal-900 dark:text-white group-hover:text-coral-600 dark:group-hover:text-coral-400 transition-colors">
                        {sub.name}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-charcoal-800 dark:text-gray-200">{sub.progress}%</span>
                </div>
                <ProgressBar value={sub.progress} variant={getBarVariant(sub.name)} height="sm" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3.5 pt-2.5 border-t border-[#F8F2ED] dark:border-[#2a2c34] text-center">
        <Link
          href="/subjects"
          className="text-xs font-bold text-charcoal-500 dark:text-gray-400 hover:text-coral-600 dark:hover:text-coral-400 transition-colors"
        >
          Manage Curriculum & Chapters →
        </Link>
      </div>
    </div>
  );
};
