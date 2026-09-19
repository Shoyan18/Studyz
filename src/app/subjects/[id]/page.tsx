'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { StudyzSelect } from '@/components/ui/StudyzSelect';
import { Badge } from '@/components/ui/Badge';
import { TaskCreateModal } from '@/components/tasks/TaskCreateModal';
import {
  ArrowLeft,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  Atom,
  FlaskConical,
  Calculator,
  Trash2,
  Sparkles,
  Edit3,
  AlertTriangle,
} from 'lucide-react';
import { Subject, Chapter } from '@/types';
import confetti from 'canvas-confetti';
import { soundManager } from '@/lib/sound';

export default function SubjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Add Chapter state
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [chapterName, setChapterName] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const [createChapterError, setCreateChapterError] = useState<string | null>(null);

  // Quick Add Task state
  const [selectedChapterForTask, setSelectedChapterForTask] = useState<string | undefined>(undefined);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  // Edit Subject state
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
  const [isDeleteSubjectOpen, setIsDeleteSubjectOpen] = useState(false);
  const [editSubjectName, setEditSubjectName] = useState('');
  const [editSubjectCode, setEditSubjectCode] = useState('');
  const [editSubjectColor, setEditSubjectColor] = useState('#8C7CFF');
  const [editSubjectIcon, setEditSubjectIcon] = useState('book-open');
  const [isUpdatingSubject, setIsUpdatingSubject] = useState(false);
  const [subjectError, setSubjectError] = useState<string | null>(null);

  const fetchSubject = useCallback(async () => {
    try {
      const res = await fetch(`/api/subjects/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setSubject(data.subject);
      } else {
        router.push('/subjects');
      }
    } catch (err) {
      console.error('Failed to fetch subject:', err);
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchSubject();
  }, [fetchSubject]);

  const handleOpenAddChapter = () => {
    setChapterName('');
    setDifficulty('MEDIUM');
    setCreateChapterError(null);
    setIsAddChapterOpen(true);
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingChapter) return;

    const trimmed = chapterName.trim();
    if (!trimmed) {
      setCreateChapterError('Chapter title is required');
      return;
    }

    setIsCreatingChapter(true);
    setCreateChapterError(null);

    try {
      const res = await fetch(`/api/subjects/${params.id}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmed,
          name: trimmed,
          difficulty,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateChapterError(data.error || "Couldn't create chapter. Please try again.");
        return;
      }

      // Success: Reset state and close modal
      setChapterName('');
      setDifficulty('MEDIUM');
      setCreateChapterError(null);
      setIsAddChapterOpen(false);

      // Immediately refresh subject and chapter list
      await fetchSubject();
    } catch (err) {
      console.error('Failed to create chapter:', err);
      setCreateChapterError("Couldn't create chapter. Please try again.");
    } finally {
      setIsCreatingChapter(false);
    }
  };

  const handleUpdateChapterProgress = async (
    chapterId: string,
    newProgress: number
  ) => {
    const wasNotComplete =
      subject?.chapters?.find((c) => c.id === chapterId)?.progress !== 100;

    try {
      const res = await fetch(`/api/chapters/${chapterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: newProgress }),
      });

      if (res.ok) {
        if (newProgress === 100 && wasNotComplete) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#FF704E', '#8C7CFF', '#34D399'],
          });
        }
        fetchSubject();
      }
    } catch (err) {
      console.error('Failed to update chapter progress:', err);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return;
    try {
      await fetch(`/api/chapters/${chapterId}`, { method: 'DELETE' });
      fetchSubject();
    } catch (err) {
      console.error('Failed to delete chapter:', err);
    }
  };

  const handleOpenEditSubject = () => {
    if (!subject) return;
    setEditSubjectName(subject.name);
    setEditSubjectCode(subject.code || '');
    setEditSubjectColor(subject.color || '#8C7CFF');
    setEditSubjectIcon(subject.icon || 'book-open');
    setSubjectError(null);
    setIsEditSubjectOpen(true);
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSubjectName.trim()) return;
    setIsUpdatingSubject(true);
    setSubjectError(null);
    try {
      const res = await fetch(`/api/subjects/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editSubjectName.trim(),
          code: editSubjectCode.trim() || editSubjectName.slice(0, 4).toUpperCase(),
          color: editSubjectColor,
          icon: editSubjectIcon,
        }),
      });
      if (!res.ok) throw new Error('Failed to update subject');
      setIsEditSubjectOpen(false);
      fetchSubject();
    } catch (err: unknown) {
      const e = err as Error;
      setSubjectError(e.message || 'Failed to update subject');
    } finally {
      setIsUpdatingSubject(false);
    }
  };

  const handleDeleteSubject = async () => {
    setIsUpdatingSubject(true);
    try {
      const res = await fetch(`/api/subjects/${params.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete subject');
      router.push('/subjects');
    } catch (err) {
      console.error('Delete error:', err);
      setIsUpdatingSubject(false);
    }
  };

  const handleToggleChapterComplete = async (chapter: Chapter) => {
    const isCompleted = chapter.status === 'COMPLETED' || chapter.progress === 100;
    const newProgress = isCompleted ? 0 : 100;
    const newStatus = isCompleted ? 'NOT_STARTED' : 'COMPLETED';

    if (!isCompleted) {
      soundManager.playComplete();
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#FF704E', '#8C7CFF', '#34D399', '#FDBA74'],
      });
    }

    try {
      await fetch(`/api/chapters/${chapter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: newProgress, status: newStatus }),
      });
      fetchSubject();
    } catch (err) {
      console.error('Failed to toggle chapter:', err);
    }
  };

  const getSubjectIcon = (subName?: string) => {
    const lower = (subName || '').toLowerCase();
    if (lower.includes('phys')) return <Atom className="w-7 h-7" />;
    if (lower.includes('chem')) return <FlaskConical className="w-7 h-7" />;
    if (lower.includes('math')) return <Calculator className="w-7 h-7" />;
    return <BookOpen className="w-7 h-7" />;
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'EASY':
        return <Badge variant="mint" size="sm">Easy</Badge>;
      case 'HARD':
        return <Badge variant="coral" size="sm">Hard 🔥</Badge>;
      default:
        return <Badge variant="amber" size="sm">Medium</Badge>;
    }
  };

  if (loading || !subject) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-44 bg-[#F3ECE7] rounded-3xl" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-[#F3ECE7] rounded-2xl" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const chapters = subject.chapters || [];
  const filteredChapters = chapters.filter((c) => {
    if (filterStatus === 'ALL') return true;
    return c.status === filterStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/subjects"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-500 dark:text-gray-400 hover:text-coral-600 dark:hover:text-coral-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all Subjects</span>
          </Link>
        </div>

        {/* Subject Header Banner */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-4xl p-6 sm:p-8 shadow-soft">
          <div
            className="absolute top-0 left-0 right-0 h-3"
            style={{ backgroundColor: subject.color }}
          />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-sm shrink-0"
                style={{ backgroundColor: subject.color }}
              >
                {getSubjectIcon(subject.name)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
                    {subject.name}
                  </h1>
                  {subject.code && (
                    <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-xl bg-[#FAF4F0] dark:bg-[#252832] text-charcoal-600 dark:text-gray-300 border border-[#EFE7E1] dark:border-[#2e313a]">
                      {subject.code}
                    </span>
                  )}
                </div>
                <p className="text-xs text-charcoal-500 dark:text-gray-400 font-medium mt-1">
                  Syllabus Tracking & Structured Chapter Progress
                </p>
              </div>
            </div>

            {/* Quick Action */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={handleOpenEditSubject}
                className="flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Button>

              <button
                onClick={() => setIsDeleteSubjectOpen(true)}
                className="p-2 rounded-xl text-charcoal-400 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-[#EFE7E1] dark:border-[#2e313a] transition-colors"
                title="Delete Subject"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedChapterForTask(undefined);
                  setIsAddTaskOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </Button>

              <Button
                variant="primary"
                onClick={handleOpenAddChapter}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Chapter</span>
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#F5EBE4] dark:border-[#2e313a]">
            <div>
              <span className="text-xs font-bold text-charcoal-400 dark:text-gray-400 uppercase">Completed</span>
              <p className="text-xl font-extrabold text-charcoal-900 dark:text-white mt-0.5">
                {subject.completedChapters} / {subject.totalChapters}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-charcoal-400 dark:text-gray-400 uppercase">Focus Time</span>
              <p className="text-xl font-extrabold text-charcoal-900 dark:text-white mt-0.5">
                {subject.studyHoursFormatted || '0h 0m'}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-charcoal-400 dark:text-gray-400 uppercase">Completion Rate</span>
              <p className="text-xl font-extrabold text-charcoal-900 dark:text-white mt-0.5">
                {subject.progress}%
              </p>
            </div>

            <div className="flex flex-col justify-center">
              <ProgressBar
                value={subject.progress || 0}
                variant="custom"
                color={subject.color}
                height="md"
              />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-[#FCFAF8] dark:bg-[#212328] p-1.5 rounded-2xl border border-[#EFE7E1] dark:border-[#2e313a]">
            {[
              { label: 'All Chapters', value: 'ALL' },
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Not Started', value: 'NOT_STARTED' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilterStatus(tab.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterStatus === tab.value
                    ? 'bg-white dark:bg-[#1a1b20] text-coral-600 dark:text-coral-400 shadow-sm'
                    : 'text-charcoal-500 dark:text-gray-400 hover:text-charcoal-800 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-bold text-charcoal-400 dark:text-gray-400">
            Showing {filteredChapters.length} chapters
          </span>
        </div>

        {/* Chapters List */}
        {filteredChapters.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-4xl p-8 shadow-soft">
            <BookOpen className="w-12 h-12 text-coral-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-charcoal-800 dark:text-white">No chapters found</h3>
            <p className="text-xs text-charcoal-400 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              Add your first chapter to break down this subject syllabus.
            </p>
            <Button
              variant="primary"
              className="mt-5"
              onClick={handleOpenAddChapter}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Chapter
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredChapters.map((chapter, index) => {
              const isCompleted = chapter.status === 'COMPLETED' || chapter.progress === 100;

              return (
                <div
                  key={chapter.id}
                  className={`border rounded-3xl p-5 sm:p-6 shadow-soft transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                    isCompleted
                      ? 'border-[#EAE0D8] dark:border-[#2e313a] bg-[#FAF8F6]/80 dark:bg-[#212328]/60'
                      : 'bg-white dark:bg-[#1a1b20] border-[#F3ECE7] dark:border-[#2e313a] hover:border-[#EBD9CE] dark:hover:border-gray-600'
                  }`}
                >
                  {/* Left Info */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <span className="w-8 h-8 rounded-xl bg-[#FAF4F0] dark:bg-[#252832] border border-[#EFE7E1] dark:border-[#2e313a] flex items-center justify-center text-xs font-black text-charcoal-500 dark:text-gray-400 shrink-0">
                      {chapter.order || index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-extrabold text-charcoal-900 dark:text-white truncate">
                          {chapter.name}
                        </h2>
                        {getDifficultyBadge(chapter.difficulty)}
                        {isCompleted && (
                          <span className="text-[11px] font-bold text-mint-600 dark:text-emerald-400 bg-mint-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-mint-200 dark:border-emerald-900/60 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Completed (+100 XP)
                          </span>
                        )}
                      </div>

                      {/* Interactive Progress Slider */}
                      <div className="mt-3.5 flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="10"
                          value={chapter.progress}
                          onChange={(e) =>
                            handleUpdateChapterProgress(chapter.id, Number(e.target.value))
                          }
                          className="w-full max-w-xs accent-coral-500 h-2 bg-[#F3EBE5] dark:bg-[#2c2f38] rounded-lg cursor-pointer"
                        />
                        <span className="text-xs font-black text-charcoal-800 dark:text-gray-200 w-10 text-right">
                          {chapter.progress}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleChapterComplete(chapter)}
                      className={`p-1.5 rounded-xl border transition-all ${
                        isCompleted
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                          : 'bg-white dark:bg-[#252832] border-[#EFE7E1] dark:border-[#2e313a] text-charcoal-400 dark:text-gray-400 hover:text-coral-600 dark:hover:text-coral-400 hover:border-coral-300'
                      }`}
                      title={isCompleted ? 'Mark as in progress' : 'Mark as 100% completed'}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'fill-emerald-500 text-white' : ''}`} />
                    </button>

                    <Link
                      href={`/focus?subjectId=${subject.id}&chapterId=${chapter.id}&duration=50`}
                    >
                      <Button variant="lavender" size="sm" className="gap-1.5">
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Focus</span>
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedChapterForTask(chapter.id);
                        setIsAddTaskOpen(true);
                      }}
                      title="Schedule task for this chapter"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>

                    <button
                      onClick={() => handleDeleteChapter(chapter.id)}
                      className="p-2 text-charcoal-400 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-colors"
                      title="Delete chapter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Chapter Modal */}
        <Modal
          isOpen={isAddChapterOpen}
          onClose={() => {
            if (!isCreatingChapter) {
              setCreateChapterError(null);
              setIsAddChapterOpen(false);
            }
          }}
          title={`Add Chapter to ${subject.name}`}
          subtitle="Break syllabus down into clear milestones"
          maxWidth="sm"
        >
          <form onSubmit={handleCreateChapter} className="space-y-4">
            <Input
              label="Chapter Title"
              placeholder="e.g. Thermodynamics, Ray Optics"
              value={chapterName}
              onChange={(e) => {
                setChapterName(e.target.value);
                if (createChapterError) setCreateChapterError(null);
              }}
              error={createChapterError || undefined}
              disabled={isCreatingChapter}
              maxLength={150}
              required
            />

            <StudyzSelect
              label="Difficulty Rating"
              value={difficulty}
              onChange={(val) => setDifficulty(val as 'EASY' | 'MEDIUM' | 'HARD')}
              disabled={isCreatingChapter}
              options={[
                { value: 'EASY', label: 'Easy', secondaryText: 'Introductory' },
                { value: 'MEDIUM', label: 'Medium', secondaryText: 'Standard' },
                { value: 'HARD', label: 'Hard 🔥', secondaryText: 'Advanced / High Weightage' },
              ]}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F5EBE4] dark:border-[#2e313a]">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setCreateChapterError(null);
                  setIsAddChapterOpen(false);
                }}
                disabled={isCreatingChapter}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isCreatingChapter}
                disabled={isCreatingChapter || !chapterName.trim()}
              >
                {isCreatingChapter ? 'Adding...' : 'Add Chapter'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Task Creation Modal */}
        <TaskCreateModal
          isOpen={isAddTaskOpen}
          onClose={() => setIsAddTaskOpen(false)}
          onTaskCreated={fetchSubject}
          initialSubjectId={subject.id}
          initialChapterId={selectedChapterForTask}
        />

        {/* Edit Subject Modal */}
        <Modal
          isOpen={isEditSubjectOpen}
          onClose={() => setIsEditSubjectOpen(false)}
          title="Edit Subject"
          subtitle="Update subject information, course code, and color"
          maxWidth="sm"
        >
          <form onSubmit={handleUpdateSubject} className="space-y-4">
            {subjectError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-300 text-xs rounded-xl font-semibold">
                {subjectError}
              </div>
            )}

            <Input
              label="Subject Name"
              placeholder="e.g. Organic Chemistry"
              value={editSubjectName}
              onChange={(e) => setEditSubjectName(e.target.value)}
              required
            />

            <Input
              label="Subject Code / Short Name"
              placeholder="e.g. ORG-CHEM"
              value={editSubjectCode}
              onChange={(e) => setEditSubjectCode(e.target.value)}
            />

            <div>
              <label className="text-xs font-bold text-charcoal-700 dark:text-gray-300 uppercase tracking-wider block mb-2">
                Color Theme
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                {['#8C7CFF', '#FF8E72', '#FDBA74', '#34D399', '#38BDF8', '#FB7185'].map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setEditSubjectColor(col)}
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                      editSubjectColor === col
                        ? 'ring-2 ring-offset-2 ring-coral-500 scale-110 shadow-sm'
                        : 'hover:scale-105 opacity-80'
                    }`}
                    style={{ backgroundColor: col }}
                  >
                    {editSubjectColor === col && <CheckCircle2 className="w-5 h-5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <StudyzSelect
              label="Subject Icon"
              value={editSubjectIcon}
              onChange={(val) => setEditSubjectIcon(String(val))}
              options={[
                {
                  value: 'book-open',
                  label: 'Book (Default)',
                  icon: <BookOpen className="w-4 h-4 text-charcoal-600 dark:text-gray-300" />,
                  secondaryText: 'Default',
                },
                {
                  value: 'atom',
                  label: 'Atom (Physics / Science)',
                  icon: <Atom className="w-4 h-4 text-lavender-500" />,
                  secondaryText: 'Physics',
                },
                {
                  value: 'flask-conical',
                  label: 'Flask (Chemistry / Biology)',
                  icon: <FlaskConical className="w-4 h-4 text-coral-500" />,
                  secondaryText: 'Chemistry',
                },
                {
                  value: 'calculator',
                  label: 'Calculator (Mathematics)',
                  icon: <Calculator className="w-4 h-4 text-amber-500" />,
                  secondaryText: 'Maths',
                },
                {
                  value: 'code',
                  label: 'Code (Computer Science / Tech)',
                  icon: <span className="font-mono text-xs font-bold text-sky-500">&lt;/&gt;</span>,
                  secondaryText: 'CS',
                },
              ]}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F5EBE4] dark:border-[#2e313a]">
              <Button type="button" variant="secondary" onClick={() => setIsEditSubjectOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isUpdatingSubject}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Subject Confirmation Modal */}
        <Modal
          isOpen={isDeleteSubjectOpen}
          onClose={() => setIsDeleteSubjectOpen(false)}
          title="Delete Subject?"
          subtitle="This will permanently delete this subject and its chapters."
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-800 dark:text-rose-200">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                Are you sure you want to delete <strong className="font-bold">{subject?.name}</strong>? All associated chapters and study progress will be permanently removed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F5EBE4] dark:border-[#2e313a]">
              <Button type="button" variant="secondary" onClick={() => setIsDeleteSubjectOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                isLoading={isUpdatingSubject}
                onClick={handleDeleteSubject}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete Subject
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
