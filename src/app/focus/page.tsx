'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { TimerDisplay } from '@/components/focus/TimerDisplay';
import { SessionSummaryModal } from '@/components/focus/SessionSummaryModal';
import { StudyzSelect } from '@/components/ui/StudyzSelect';
import { Subject, Chapter } from '@/types';
import {
  Sparkles,
  Flame,
  Trophy,
  CheckSquare,
  FileEdit,
  Target,
  Plus,
  Trash2,
  Clock,
  Zap,
  CheckCircle2,
  Download,
  RefreshCw,
} from 'lucide-react';

interface FocusTask {
  id: string;
  text: string;
  completed: boolean;
  isDbTask?: boolean;
}

const PRESET_MICRO_GOALS = [
  'Review core definitions & formulas',
  'Solve 10 practice problems',
  'Read chapter summary & key notes',
  'Complete active recall quiz',
];

function FocusContent() {
  const searchParams = useSearchParams();
  const initialSubjectId = searchParams.get('subjectId') || '';
  const initialChapterId = searchParams.get('chapterId') || '';
  const initialDuration = Number(searchParams.get('duration')) || 25;

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectId);
  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId);

  // Database tasks for selected subject
  const [dbTasks, setDbTasks] = useState<any[]>([]);
  const [isLoadingDbTasks, setIsLoadingDbTasks] = useState(false);

  // Scratchpad & Micro Tasks
  const [notes, setNotes] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('studyz_focus_notes') || '';
    }
    return '';
  });

  const [tasks, setTasks] = useState<FocusTask[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('studyz_focus_tasks');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return [
      { id: '1', text: 'Review core definitions & formulas', completed: false },
      { id: '2', text: 'Solve 10 practice problems', completed: false },
    ];
  });

  const [newTaskInput, setNewTaskInput] = useState('');
  const [sessionGoal, setSessionGoal] = useState('');

  // Daily focus stats state
  const [dailyFocusedMins, setDailyFocusedMins] = useState(75);
  const dailyGoalMins = 120;

  // Summary Modal state
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    durationMinutes: number;
    xpEarned: number;
    streak: number;
    unlockedAchievements: Array<{ id: string; name: string; description: string; icon: string; xpReward: number }>;
  }>({
    durationMinutes: 25,
    xpEarned: 25,
    streak: 12,
    unlockedAchievements: [],
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('studyz_focus_notes', notes);
    }
  }, [notes]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('studyz_focus_tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  useEffect(() => {
    fetch('/api/subjects')
      .then((res) => res.json())
      .then((data) => {
        if (data.subjects) {
          setSubjects(data.subjects);
          if (!selectedSubjectId && data.subjects.length > 0) {
            setSelectedSubjectId(data.subjects[0].id);
          }
        }
      })
      .catch(console.error);
  }, []);

  // Fetch pending tasks from DB for selected subject/chapter
  useEffect(() => {
    async function fetchSubjectTasks() {
      setIsLoadingDbTasks(true);
      try {
        const url = selectedSubjectId
          ? `/api/tasks?subjectId=${selectedSubjectId}&status=TODO`
          : `/api/tasks?status=TODO`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.tasks) {
            setDbTasks(data.tasks);
          }
        }
      } catch (err) {
        console.error('Failed to fetch subject tasks:', err);
      } finally {
        setIsLoadingDbTasks(false);
      }
    }
    fetchSubjectTasks();
  }, [selectedSubjectId]);

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId);
  const availableChapters = activeSubject?.chapters || [];
  const activeChapter = availableChapters.find((c: Chapter) => c.id === selectedChapterId);

  const handleImportDbTasks = () => {
    if (dbTasks.length === 0) return;
    const imported: FocusTask[] = dbTasks.map((t) => ({
      id: t.id,
      text: t.title,
      completed: t.status === 'COMPLETED',
      isDbTask: true,
    }));

    setTasks((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const newItems = imported.filter((item) => !existingIds.has(item.id));
      return [...prev, ...newItems];
    });
  };

  const handleAddTask = async (taskText?: string, e?: React.FormEvent) => {
    e?.preventDefault();
    const textToAdd = taskText || newTaskInput.trim();
    if (!textToAdd) return;

    const tempId = `local-${Date.now()}`;
    const newTask: FocusTask = {
      id: tempId,
      text: textToAdd,
      completed: false,
    };

    setTasks((prev) => [...prev, newTask]);
    if (!taskText) setNewTaskInput('');

    // Save task to backend database asynchronously
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: textToAdd,
          subjectId: selectedSubjectId || undefined,
          chapterId: selectedChapterId || undefined,
          priority: 'MEDIUM',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.task?.id) {
          setTasks((prev) =>
            prev.map((t) => (t.id === tempId ? { ...t, id: data.task.id, isDbTask: true } : t))
          );
        }
      }
    } catch (err) {
      console.error('Error creating database task:', err);
    }
  };

  const toggleTask = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    const nextState = !target.completed;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: nextState } : t)));

    // Sync task state with backend database if persistent ID exists
    if (id && !id.startsWith('local-')) {
      try {
        await fetch(`/api/tasks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: nextState ? 'COMPLETED' : 'TODO',
          }),
        });
      } catch (err) {
        console.error('Failed to sync task status:', err);
      }
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (id && !id.startsWith('local-')) {
      try {
        await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  const handleSessionComplete = async (durationMinutes: number, plannedMinutes: number) => {
    setDailyFocusedMins((prev) => prev + durationMinutes);
    try {
      const res = await fetch('/api/focus/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubjectId || null,
          chapterId: selectedChapterId || null,
          durationMinutes,
          plannedDurationMinutes: plannedMinutes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSummaryData({
          durationMinutes,
          xpEarned: data.xpEarned || durationMinutes,
          streak: data.streak || 12,
          unlockedAchievements: data.unlockedAchievements || [],
        });
        setIsSummaryOpen(true);
      }
    } catch (err) {
      console.error('Failed to log session:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Config bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1a1b20] border border-[#F0E4DC] dark:border-[#2e313a] rounded-3xl p-5 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">Focus Zone</h1>
            <span className="text-xs font-extrabold text-coral-600 bg-[#FFF0EB] dark:bg-coral-950/60 dark:text-coral-300 px-2.5 py-0.5 rounded-full border border-[#FFD9CE] dark:border-coral-800">
              Pro Suite
            </span>
          </div>
          <p className="text-xs text-charcoal-500 dark:text-gray-400 font-medium mt-0.5">
            Lock in and build your streak with zero distractions.
          </p>
        </div>

        {/* Subject & Chapter selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-48 sm:w-56">
            <StudyzSelect
              value={selectedSubjectId}
              onChange={(val) => {
                setSelectedSubjectId(String(val));
                setSelectedChapterId('');
              }}
              searchable
              options={[
                { value: '', label: 'General Focus (All)' },
                ...subjects.map((sub) => ({
                  value: sub.id,
                  label: sub.name,
                  secondaryText: sub.code || undefined,
                  icon: (
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: sub.color || '#8C7CFF' }}
                    />
                  ),
                })),
              ]}
            />
          </div>

          <div className="w-48 sm:w-56">
            <StudyzSelect
              placeholder="Select Chapter"
              value={selectedChapterId}
              onChange={(val) => setSelectedChapterId(String(val))}
              disabled={!selectedSubjectId || availableChapters.length === 0}
              searchable={availableChapters.length > 5}
              options={[
                { value: '', label: 'Entire Subject (All)' },
                ...availableChapters.map((ch: Chapter) => ({
                  value: ch.id,
                  label: ch.name,
                  secondaryText: ch.difficulty || undefined,
                })),
              ]}
            />
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Focus Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Timer & Zen Control (7 cols) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <TimerDisplay
            initialMinutes={initialDuration}
            subjectName={activeSubject?.name}
            chapterName={activeChapter?.name}
            sessionGoal={sessionGoal}
            onGoalChange={setSessionGoal}
            onSessionComplete={handleSessionComplete}
          />
        </div>

        {/* Right Column: Productivity Tools (5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Daily Goal & Streak Card */}
          <div className="bg-white dark:bg-[#1a1b20] border border-[#F0E4DC] dark:border-[#2e313a] rounded-3xl p-5 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-orange-600">
                  <Flame className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-charcoal-400 dark:text-gray-400">
                    Daily Progress
                  </h3>
                  <span className="text-sm font-extrabold text-charcoal-900 dark:text-white">
                    {dailyFocusedMins}m / {dailyGoalMins}m Target
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-coral-50 dark:bg-coral-950/60 text-coral-600 dark:text-coral-300 px-3 py-1 rounded-full text-xs font-bold border border-coral-200 dark:border-coral-800">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>12 Day Streak</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-[#FAF6F3] dark:bg-[#252832] h-2.5 rounded-full overflow-hidden mb-2">
              <div
                className="bg-gradient-to-r from-coral-500 to-coral-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (dailyFocusedMins / dailyGoalMins) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-charcoal-400 dark:text-gray-400">
              <span>{Math.round((dailyFocusedMins / dailyGoalMins) * 100)}% Completed</span>
              <span>+25 XP per session</span>
            </div>
          </div>

          {/* Session Micro Tasks Checklist */}
          <div className="bg-white dark:bg-[#1a1b20] border border-[#F0E4DC] dark:border-[#2e313a] rounded-3xl p-5 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-coral-500" />
                <h3 className="text-sm font-extrabold text-charcoal-900 dark:text-white">Session Tasks</h3>
              </div>
              <div className="flex items-center gap-2">
                {tasks.length > 0 && tasks.some((t) => t.completed) && (
                  <button
                    type="button"
                    onClick={() => setTasks((prev) => prev.filter((t) => !t.completed))}
                    className="text-[11px] font-semibold text-charcoal-400 hover:text-coral-500 dark:text-gray-400 transition-colors cursor-pointer"
                  >
                    Clear done
                  </button>
                )}
                <span className="text-xs font-bold text-charcoal-400 dark:text-gray-400">
                  {tasks.filter((t) => t.completed).length}/{tasks.length} done
                </span>
              </div>
            </div>

            {/* Add Task Form */}
            <form onSubmit={(e) => handleAddTask(undefined, e)} className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="Add micro-task for this focus session..."
                className="flex-1 bg-[#FAF6F3] dark:bg-[#212328] border border-[#EFE7E1] dark:border-[#2e313a] rounded-xl px-3 py-2 text-xs font-medium text-charcoal-900 dark:text-white focus:outline-none focus:border-coral-400 placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-coral-500 text-white hover:bg-coral-600 shadow-xs transition-colors shrink-0 cursor-pointer"
                title="Add micro-task"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Import Subject Tasks Banner if pending tasks exist for selected subject */}
            {dbTasks.length > 0 && (
              <div className="mb-3">
                <button
                  type="button"
                  onClick={handleImportDbTasks}
                  className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-coral-50 dark:bg-coral-950/40 border border-coral-200 dark:border-coral-800/60 text-coral-600 dark:text-coral-300 text-xs font-bold hover:bg-coral-100 dark:hover:bg-coral-900/60 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Import {dbTasks.length} pending task{dbTasks.length > 1 ? 's' : ''} from {activeSubject ? activeSubject.name : 'Subject'}</span>
                </button>
              </div>
            )}

            {/* Task Items list */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {tasks.length === 0 ? (
                <div className="py-3 px-2 text-center space-y-2.5">
                  <p className="text-xs text-charcoal-400 dark:text-gray-400 font-medium">
                    No tasks added yet. Pick a quick micro-goal:
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {PRESET_MICRO_GOALS.map((goal, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddTask(goal)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#FAF6F3] dark:bg-[#252830] border border-[#EFE7E1] dark:border-[#2e313a] text-charcoal-700 dark:text-gray-300 hover:border-coral-400 hover:text-coral-500 dark:hover:text-coral-400 transition-all cursor-pointer"
                      >
                        + {goal}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#FCFAF8] dark:bg-[#22242a] border border-[#EFE7E1] dark:border-[#2e313a] group hover:border-coral-200 dark:hover:border-coral-800/50 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                    >
                      <div
                        className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          task.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-charcoal-300 dark:border-gray-600 bg-white dark:bg-transparent'
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
                      </div>
                      <span
                        className={`text-xs font-semibold truncate ${
                          task.completed
                            ? 'line-through text-charcoal-400 dark:text-gray-500'
                            : 'text-charcoal-800 dark:text-gray-200'
                        }`}
                      >
                        {task.text}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-charcoal-400 hover:text-rose-500 transition-opacity cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Focus Scratchpad */}
          <div className="bg-white dark:bg-[#1a1b20] border border-[#F0E4DC] dark:border-[#2e313a] rounded-3xl p-5 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-coral-500" />
                <h3 className="text-sm font-extrabold text-charcoal-900 dark:text-white">Quick Scratchpad</h3>
              </div>
              <span className="text-[11px] font-semibold text-charcoal-400 dark:text-gray-400">Autosaved</span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down quick thoughts, formulas, or reminders without breaking focus..."
              rows={4}
              className="w-full bg-[#FAF6F3] dark:bg-[#212328] border border-[#EFE7E1] dark:border-[#2e313a] rounded-2xl p-3 text-xs font-mono text-charcoal-800 dark:text-gray-200 focus:outline-none focus:border-coral-400 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Celebratory Summary Modal */}
      <SessionSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        durationMinutes={summaryData.durationMinutes}
        xpEarned={summaryData.xpEarned}
        streak={summaryData.streak}
        unlockedAchievements={summaryData.unlockedAchievements}
      />
    </div>
  );
}

export default function FocusPage() {
  return (
    <AppLayout>
      <Suspense
        fallback={
          <div className="h-96 bg-[#F3ECE7] rounded-3xl animate-pulse flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-coral-400 animate-spin" />
          </div>
        }
      >
        <FocusContent />
      </Suspense>
    </AppLayout>
  );
}

