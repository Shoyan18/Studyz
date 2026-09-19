'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { StudyzSelect } from '@/components/ui/StudyzSelect';
import { Plus, BookOpen, Atom, FlaskConical, Calculator, Clock, CheckCircle2, ChevronRight, Edit3, Trash2, AlertTriangle } from 'lucide-react';
import { Subject } from '@/types';

const COLOR_PRESETS = [
  { label: 'Lavender', value: '#8C7CFF' },
  { label: 'Coral', value: '#FF8E72' },
  { label: 'Soft Orange', value: '#FDBA74' },
  { label: 'Mint Green', value: '#34D399' },
  { label: 'Sky Blue', value: '#38BDF8' },
  { label: 'Rose', value: '#FB7185' },
];

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState('#8C7CFF');
  const [icon, setIcon] = useState('book-open');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await fetch('/api/subjects');
      if (res.ok) {
        const data = await res.json();
        setSubjects(data.subjects || []);
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a subject name.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim() || name.slice(0, 4).toUpperCase(),
          color,
          icon,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create subject');
      }

      setName('');
      setCode('');
      setIsAddOpen(false);
      fetchSubjects();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (sub: Subject, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingSubject(sub);
    setName(sub.name);
    setCode(sub.code || '');
    setColor(sub.color || '#8C7CFF');
    setIcon(sub.icon || 'book-open');
    setError('');
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !name.trim()) return;
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/subjects/${editingSubject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim() || name.slice(0, 4).toUpperCase(),
          color,
          icon,
        }),
      });
      if (!res.ok) throw new Error('Failed to update subject');
      setEditingSubject(null);
      fetchSubjects();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to update subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSubject) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/subjects/${deletingSubject.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete subject');
      setDeletingSubject(null);
      fetchSubjects();
    } catch (err) {
      console.error('Failed to delete subject:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubjectIcon = (iconName: string, subName: string) => {
    const lower = subName.toLowerCase();
    if (lower.includes('phys') || iconName === 'atom') return <Atom className="w-6 h-6" />;
    if (lower.includes('chem') || iconName === 'flask-conical') return <FlaskConical className="w-6 h-6" />;
    if (lower.includes('math') || iconName === 'calculator') return <Calculator className="w-6 h-6" />;
    return <BookOpen className="w-6 h-6" />;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
              Curriculum &amp; Subjects
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500 dark:text-gray-400 font-medium mt-1">
              Organize your chapters, syllabus progress, and study time by subject.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </Button>
        </div>

        {/* Subjects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-[#F3ECE7] dark:bg-[#252832] rounded-3xl" />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-4xl p-8 shadow-soft">
            <BookOpen className="w-12 h-12 text-coral-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-charcoal-800 dark:text-gray-200">No subjects yet</h3>
            <p className="text-xs text-charcoal-400 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              Create your first subject to start organizing chapters and tracking completion.
            </p>
            <Button
              variant="primary"
              className="mt-5"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1" /> Add First Subject
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((sub) => (
              <Link
                key={sub.id}
                href={`/subjects/${sub.id}`}
                className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-3xl p-6 shadow-soft hover:border-[#EBD9CE] dark:hover:border-coral-500/50 hover:shadow-soft-lg transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Subject Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: sub.color }}
                    >
                      {getSubjectIcon(sub.icon, sub.name)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {sub.code && (
                        <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-xl bg-[#FAF4F0] dark:bg-[#22242b] text-charcoal-600 dark:text-gray-300 border border-[#EFE7E1] dark:border-[#2e313a]">
                          {sub.code}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleOpenEdit(sub, e)}
                        className="p-1.5 rounded-xl text-charcoal-400 dark:text-gray-400 hover:text-coral-600 dark:hover:text-coral-400 hover:bg-[#FFF5F2] dark:hover:bg-[#252832] transition-colors"
                        title="Edit Subject"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeletingSubject(sub);
                        }}
                        className="p-1.5 rounded-xl text-charcoal-400 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h2 className="text-xl font-extrabold text-charcoal-900 dark:text-white group-hover:text-coral-600 dark:group-hover:text-coral-400 transition-colors">
                    {sub.name}
                  </h2>

                  {/* Stat Highlights */}
                  <div className="grid grid-cols-2 gap-3 my-5">
                    <div className="p-3 rounded-2xl bg-[#FCFAF8] dark:bg-[#22242b] border border-[#F3ECE7] dark:border-[#2e313a]">
                      <div className="flex items-center gap-1.5 text-charcoal-400 dark:text-gray-400 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-mint-500" />
                        <span>Chapters</span>
                      </div>
                      <p className="text-sm font-extrabold text-charcoal-900 dark:text-white mt-1">
                        {sub.completedChapters} / {sub.totalChapters}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#FCFAF8] dark:bg-[#22242b] border border-[#F3ECE7] dark:border-[#2e313a]">
                      <div className="flex items-center gap-1.5 text-charcoal-400 dark:text-gray-400 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 text-coral-500" />
                        <span>Study Time</span>
                      </div>
                      <p className="text-sm font-extrabold text-charcoal-900 dark:text-white mt-1">
                        {sub.studyHoursFormatted || '0h'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Footer */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-charcoal-500 dark:text-gray-400">Syllabus Completion</span>
                    <span className="text-charcoal-900 dark:text-white font-extrabold">{sub.progress}%</span>
                  </div>
                  <ProgressBar
                    value={sub.progress || 0}
                    variant="custom"
                    color={sub.color}
                    height="md"
                  />
                  <div className="flex items-center justify-end gap-1 mt-4 text-xs font-bold text-coral-600 dark:text-coral-400 group-hover:translate-x-1 transition-transform">
                    <span>View Chapters</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Add Subject Modal */}
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add New Subject"
          subtitle="Define a subject to manage chapters and track focus"
          maxWidth="sm"
        >
          <form onSubmit={handleCreateSubject} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl font-semibold">
                {error}
              </div>
            )}

            <Input
              label="Subject Name"
              placeholder="e.g. Physics, Biology, History"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Subject Code"
              placeholder="e.g. PHY, BIO, HIST"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-gray-300 mb-2">
                Color Theme
              </label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setColor(preset.value)}
                    className={`w-9 h-9 rounded-2xl transition-all ${
                      color === preset.value
                        ? 'ring-4 ring-offset-2 ring-coral-400 scale-110'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: preset.value }}
                    title={preset.label}
                  />
                ))}
              </div>
            </div>

            <StudyzSelect
              label="Subject Icon"
              value={icon}
              onChange={(val) => setIcon(String(val))}
              options={[
                {
                  value: 'book-open',
                  label: 'Book Open (General / Humanities)',
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
              <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Create Subject
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Subject Modal */}
        <Modal
          isOpen={!!editingSubject}
          onClose={() => setEditingSubject(null)}
          title="Edit Subject"
          subtitle="Update subject details, display code, or theme color"
          maxWidth="sm"
        >
          <form onSubmit={handleUpdateSubject} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-300 text-xs rounded-xl font-semibold">
                {error}
              </div>
            )}

            <Input
              label="Subject Name"
              placeholder="e.g. Organic Chemistry"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Subject Code / Short Name"
              placeholder="e.g. ORG-CHEM"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <div>
              <label className="text-xs font-bold text-charcoal-700 dark:text-gray-300 uppercase tracking-wider block mb-2">
                Color Theme
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setColor(p.value)}
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                      color === p.value
                        ? 'ring-2 ring-offset-2 ring-coral-500 scale-110 shadow-sm'
                        : 'hover:scale-105 opacity-80'
                    }`}
                    style={{ backgroundColor: p.value }}
                    title={p.label}
                  >
                    {color === p.value && <CheckCircle2 className="w-5 h-5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <StudyzSelect
              label="Subject Icon"
              value={icon}
              onChange={(val) => setIcon(String(val))}
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
              <Button type="button" variant="secondary" onClick={() => setEditingSubject(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Subject Confirmation Modal */}
        <Modal
          isOpen={!!deletingSubject}
          onClose={() => setDeletingSubject(null)}
          title="Delete Subject?"
          subtitle="This will permanently delete this subject and its chapters."
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-800 dark:text-rose-200">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                Are you sure you want to delete <strong className="font-bold">{deletingSubject?.name}</strong>? All associated chapters and study progress will be removed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F5EBE4] dark:border-[#2e313a]">
              <Button type="button" variant="secondary" onClick={() => setDeletingSubject(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                isLoading={isSubmitting}
                onClick={handleConfirmDelete}
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
