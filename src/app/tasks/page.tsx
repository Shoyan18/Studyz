'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StudyzSelect } from '@/components/ui/StudyzSelect';
import { TaskCreateModal } from '@/components/tasks/TaskCreateModal';
import {
  Plus,
  Check,
  Play,
  Trash2,
  List,
  LayoutGrid,
  Calendar,
  Clock,
  BookOpen,
  Atom,
  FlaskConical,
  Calculator,
  Search,
} from 'lucide-react';
import { Task, Subject } from '@/types';
import confetti from 'canvas-confetti';

function TasksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [filterTab, setFilterTab] = useState<'ALL' | 'TODAY' | 'TODO' | 'COMPLETED'>('ALL');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await fetch('/api/subjects');
      if (res.ok) {
        const data = await res.json();
        setSubjects(data.subjects || []);
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchSubjects();
  }, [fetchTasks, fetchSubjects]);

  const handleToggleTask = async (task: Task) => {
    const isCompleted = task.status === 'COMPLETED';
    const nextStatus = isCompleted ? 'TODO' : 'COMPLETED';

    if (!isCompleted) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FF704E', '#8C7CFF', '#34D399'],
      });
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchTasks();
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleStartStudy = (task: Task) => {
    const params = new URLSearchParams();
    if (task.subjectId) params.set('subjectId', task.subjectId);
    if (task.chapterId) params.set('chapterId', task.chapterId);
    if (task.duration) params.set('duration', String(task.duration));
    router.push(`/focus?${params.toString()}`);
  };

  const getSubjectIcon = (subName?: string | null) => {
    const lower = (subName || '').toLowerCase();
    if (lower.includes('phys')) return <Atom className="w-4 h-4 text-lavender-500" />;
    if (lower.includes('chem')) return <FlaskConical className="w-4 h-4 text-coral-500" />;
    if (lower.includes('math')) return <Calculator className="w-4 h-4 text-amber-500" />;
    return <BookOpen className="w-4 h-4 text-charcoal-400" />;
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'HIGH':
        return <Badge variant="coral" size="sm">High 🔥</Badge>;
      case 'LOW':
        return <Badge variant="neutral" size="sm">Low</Badge>;
      default:
        return <Badge variant="amber" size="sm">Medium</Badge>;
    }
  };

  // Filter tasks
  const todayStr = new Date().toISOString().split('T')[0];
  const filteredTasks = tasks.filter((t) => {
    // Subject filter
    if (selectedSubjectId !== 'ALL' && t.subjectId !== selectedSubjectId) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchSubject = (t.subject?.name || '').toLowerCase().includes(q);
      const matchChapter = (t.chapter?.name || '').toLowerCase().includes(q);
      if (!matchTitle && !matchSubject && !matchChapter) return false;
    }

    // Status Tab filter
    if (filterTab === 'TODAY') {
      const taskDate = t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '';
      return taskDate === todayStr;
    }
    if (filterTab === 'TODO') {
      return t.status !== 'COMPLETED';
    }
    if (filterTab === 'COMPLETED') {
      return t.status === 'COMPLETED';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
            Study Tasks & Missions
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-gray-400 font-medium mt-1">
            Organize daily problem sets, revisions, and milestone goals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex items-center bg-white dark:bg-[#1a1b20] border border-[#EFE7E1] dark:border-[#2e313a] p-1 rounded-2xl shadow-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'list'
                  ? 'bg-[#FFF0EB] dark:bg-coral-950/60 text-coral-600 dark:text-coral-400'
                  : 'text-charcoal-400 dark:text-gray-400 hover:text-charcoal-700 dark:hover:text-white'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'kanban'
                  ? 'bg-[#FFF0EB] dark:bg-coral-950/60 text-coral-600 dark:text-coral-400'
                  : 'text-charcoal-400 dark:text-gray-400 hover:text-charcoal-700 dark:hover:text-white'
              }`}
              title="Kanban Board view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsAddTaskOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-3xl p-4 sm:p-5 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-[#FCFAF8] dark:bg-[#212328] p-1.5 rounded-2xl border border-[#EFE7E1] dark:border-[#2e313a] overflow-x-auto">
          {[
            { label: 'All Tasks', value: 'ALL' },
            { label: 'Today', value: 'TODAY' },
            { label: 'To Do', value: 'TODO' },
            { label: 'Completed', value: 'COMPLETED' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterTab(tab.value as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterTab === tab.value
                  ? 'bg-white dark:bg-[#1a1b20] text-coral-600 dark:text-coral-400 shadow-sm'
                  : 'text-charcoal-500 dark:text-gray-400 hover:text-charcoal-800 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Subject Select */}
        <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 text-charcoal-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FCFAF8] dark:bg-[#212328] border border-[#EFE7E1] dark:border-[#2e313a] rounded-2xl pl-10 pr-4 py-2 text-xs text-charcoal-800 dark:text-gray-200 placeholder-charcoal-400 dark:placeholder-gray-500 focus:outline-none focus:border-coral-400"
            />
          </div>

          <div className="w-48">
            <StudyzSelect
              value={selectedSubjectId}
              onChange={(val) => setSelectedSubjectId(String(val))}
              size="sm"
              options={[
                { value: 'ALL', label: 'All Subjects' },
                ...subjects.map((sub) => ({
                  value: sub.id,
                  label: sub.name,
                  icon: (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: sub.color || '#8C7CFF' }}
                    />
                  ),
                })),
              ]}
            />
          </div>
        </div>
      </div>

      {/* Task Content: List or Kanban */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-[#F3ECE7] dark:bg-[#252832] rounded-3xl" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-4xl p-8 shadow-soft">
          <BookOpen className="w-12 h-12 text-coral-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-charcoal-800 dark:text-white">No tasks found</h3>
          <p className="text-xs text-charcoal-400 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            {filterTab === 'COMPLETED'
              ? 'Complete tasks to earn XP and build your study stats.'
              : 'Add a new study task or change your filter criteria.'}
          </p>
          <Button
            variant="primary"
            className="mt-5"
            onClick={() => setIsAddTaskOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Task
          </Button>
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="space-y-3.5">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            return (
              <div
                key={task.id}
                className={`border rounded-3xl p-4 sm:p-5 shadow-soft transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'border-[#EAE0D8] dark:border-[#2e313a] bg-[#FAF8F6]/80 dark:bg-[#212328]/60 opacity-75'
                    : 'bg-white dark:bg-[#1a1b20] border-[#F3ECE7] dark:border-[#2e313a] hover:border-[#EBD9CE] dark:hover:border-gray-600 hover:shadow-sm'
                }`}
              >
                {/* Left: Checkbox + Title + Metadata */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggleTask(task)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                        : 'border-[#DECFC6] dark:border-gray-600 hover:border-coral-400 bg-white dark:bg-[#1a1b20]'
                    }`}
                    aria-label="Toggle completed"
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3] text-white" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={`text-sm font-extrabold text-charcoal-900 dark:text-white ${
                          isCompleted ? 'line-through text-charcoal-400 dark:text-gray-500' : ''
                        }`}
                      >
                        {task.title}
                      </p>
                      {getPriorityBadge(task.priority)}
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-charcoal-400 dark:text-gray-400 font-medium flex-wrap">
                      {task.subject && (
                        <span className="flex items-center gap-1 text-charcoal-600 dark:text-gray-300 font-bold">
                          {getSubjectIcon(task.subject.name)}
                          <span>{task.subject.name}</span>
                        </span>
                      )}
                      {task.chapter && (
                        <span>• {task.chapter.name}</span>
                      )}
                      {task.scheduledTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{task.scheduledTime}</span>
                        </span>
                      )}
                      {task.duration && (
                        <span>({task.duration} min)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                  {!isCompleted && (
                    <Button
                      variant="lavender"
                      size="sm"
                      onClick={() => handleStartStudy(task)}
                      className="gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Study</span>
                    </Button>
                  )}

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 text-charcoal-400 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'To Do',
              tasks: filteredTasks.filter((t) => t.status === 'TODO'),
              color: '#8C7CFF',
            },
            {
              title: 'In Progress',
              tasks: filteredTasks.filter((t) => t.status === 'IN_PROGRESS'),
              color: '#FF8E72',
            },
            {
              title: 'Completed (+20 XP)',
              tasks: filteredTasks.filter((t) => t.status === 'COMPLETED'),
              color: '#34D399',
            },
          ].map((column) => (
            <div
              key={column.title}
              className="bg-[#FAF7F4] dark:bg-[#212328] border border-[#F3ECE7] dark:border-[#2e313a] rounded-3xl p-5 shadow-inner min-h-[400px]"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EFE5DE] dark:border-[#2e313a]">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <h2 className="text-sm font-extrabold text-charcoal-900 dark:text-white">{column.title}</h2>
                </div>
                <span className="text-xs font-bold text-charcoal-400 dark:text-gray-400 bg-white dark:bg-[#1a1b20] px-2 py-0.5 rounded-lg border border-[#EFE7E1] dark:border-[#2e313a]">
                  {column.tasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {column.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-2xl p-4 shadow-sm hover:border-[#EBD9CE] dark:hover:border-gray-600 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-charcoal-900 dark:text-white leading-snug">{task.title}</p>
                      {getPriorityBadge(task.priority)}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-charcoal-400 dark:text-gray-400 pt-2 border-t border-[#F8F2ED] dark:border-[#2e313a]">
                      <span>{task.subject?.name || 'General'}</span>
                      <span>{task.duration}m</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handleToggleTask(task)}
                        className="text-[11px] font-bold text-coral-600 dark:text-coral-400 hover:underline"
                      >
                        {task.status === 'COMPLETED' ? 'Mark To-Do' : 'Mark Done'}
                      </button>

                      {task.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleStartStudy(task)}
                          className="px-2.5 py-1 rounded-lg bg-[#F0EDFF] dark:bg-lavender-950/60 text-lavender-600 dark:text-lavender-400 text-[11px] font-bold hover:bg-[#E5E0FF] dark:hover:bg-lavender-950"
                        >
                          Focus
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Creation Modal */}
      <TaskCreateModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onTaskCreated={fetchTasks}
      />
    </div>
  );
}

export default function TasksPage() {
  return (
    <AppLayout>
      <Suspense
        fallback={
          <div className="h-96 bg-[#F3ECE7] rounded-3xl animate-pulse" />
        }
      >
        <TasksContent />
      </Suspense>
    </AppLayout>
  );
}
