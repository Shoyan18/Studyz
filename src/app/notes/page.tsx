'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { StudyzSelect } from '@/components/ui/StudyzSelect';
import { Plus, Pin, Trash2, Edit3, BookOpen, Search, Copy, Check, Eye } from 'lucide-react';
import { Note, Subject } from '@/types';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Form state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch('/api/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
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
      console.error('Failed to load subjects:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
    fetchSubjects();
  }, [fetchNotes, fetchSubjects]);

  const handleOpenCreate = () => {
    setEditingNoteId(null);
    setTitle('');
    setContent('');
    setSubjectId('');
    setIsPinned(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setSubjectId(note.subjectId || '');
    setIsPinned(note.pinned);
    setIsModalOpen(true);
  };

  const handleCopyNote = (content: string) => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const url = editingNoteId ? `/api/notes/${editingNoteId}` : '/api/notes';
      const method = editingNoteId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          subjectId: subjectId || null,
          pinned: isPinned,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchNotes();
      }
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      fetchNotes();
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const handleTogglePin = async (note: Note) => {
    try {
      await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: !note.pinned }),
      });
      fetchNotes();
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const filteredNotes = notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      (n.subject?.name || '').toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
              Study Notes & Formulas
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500 dark:text-gray-400 font-medium mt-1">
              Capture quick problem solutions, derivations, and exam reminders.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleOpenCreate}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Note</span>
          </Button>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-3xl p-4 shadow-soft">
          <div className="relative">
            <Search className="w-4 h-4 text-charcoal-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search your notes by keyword or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FCFAF8] dark:bg-[#212328] border border-[#EFE7E1] dark:border-[#2e313a] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-charcoal-800 dark:text-gray-200 placeholder-charcoal-400 dark:placeholder-gray-500 focus:outline-none focus:border-coral-400"
            />
          </div>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 bg-[#F3ECE7] dark:bg-[#252832] rounded-3xl" />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-4xl p-8 shadow-soft">
            <BookOpen className="w-12 h-12 text-coral-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-charcoal-800 dark:text-white">No notes found</h3>
            <p className="text-xs text-charcoal-400 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              Create a note to save essential concepts and revision points.
            </p>
            <Button variant="primary" className="mt-5" onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-1" /> Add First Note
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`border rounded-3xl p-6 shadow-soft transition-all flex flex-col justify-between ${
                  note.pinned
                    ? 'border-coral-300 dark:border-coral-800 ring-1 ring-coral-200 dark:ring-coral-900/50 bg-white dark:bg-[#1a1b20]'
                    : 'bg-white dark:bg-[#1a1b20] border-[#F3ECE7] dark:border-[#2e313a] hover:border-[#EBD9CE] dark:hover:border-gray-600'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    {note.subject ? (
                      <span
                        className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg text-white"
                        style={{ backgroundColor: note.subject.color }}
                      >
                        {note.subject.name}
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-[#FAF4F0] dark:bg-[#252832] text-charcoal-600 dark:text-gray-300">
                        General
                      </span>
                    )}

                    <button
                      onClick={() => handleTogglePin(note)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        note.pinned
                          ? 'text-coral-500 bg-[#FFF0EB] dark:bg-coral-950/60'
                          : 'text-charcoal-300 dark:text-gray-500 hover:text-charcoal-600 dark:hover:text-white'
                      }`}
                      title={note.pinned ? 'Unpin note' : 'Pin note'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="cursor-pointer" onClick={() => setViewingNote(note)}>
                    <h2 className="text-base font-extrabold text-charcoal-900 dark:text-white mb-2 hover:text-coral-600 dark:hover:text-coral-400 transition-colors">
                      {note.title}
                    </h2>
                    <p className="text-xs text-charcoal-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap line-clamp-6">
                      {note.content}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#F8F2ED] dark:border-[#2e313a]">
                  <span className="text-[10px] text-charcoal-400 dark:text-gray-400 font-medium">
                    {new Date(note.updatedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingNote(note)}
                      className="p-1.5 text-charcoal-400 dark:text-gray-400 hover:text-coral-600 dark:hover:text-coral-400 hover:bg-[#FAF4F0] dark:hover:bg-[#252832] rounded-lg transition-colors"
                      title="Read full note"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(note)}
                      className="p-1.5 text-charcoal-400 dark:text-gray-400 hover:text-charcoal-700 dark:hover:text-white hover:bg-[#FAF4F0] dark:hover:bg-[#252832] rounded-lg transition-colors"
                      title="Edit note"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1.5 text-charcoal-400 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Note Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingNoteId ? 'Edit Study Note' : 'Create Study Note'}
          subtitle="Save formulas, summaries, and key ideas"
          maxWidth="md"
        >
          <form onSubmit={handleSaveNote} className="space-y-4">
            <Input
              label="Note Title"
              placeholder="e.g. Kinematics 2D Projectile Equations"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <StudyzSelect
              label="Subject (Optional)"
              value={subjectId}
              onChange={(val) => setSubjectId(String(val))}
              searchable
              options={[
                { value: '', label: 'General / No Subject' },
                ...subjects.map((s) => ({
                  value: s.id,
                  label: s.name,
                  secondaryText: s.code || undefined,
                  icon: (
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: s.color || '#8C7CFF' }}
                    />
                  ),
                })),
              ]}
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-gray-300 mb-1.5">
                Note Content
              </label>
              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your study notes, derivations, or bullet points here..."
                className="w-full bg-[#FCFAF8] dark:bg-[#212328] border border-[#EFE7E1] dark:border-[#2e313a] rounded-2xl p-4 text-xs text-charcoal-800 dark:text-gray-200 placeholder-charcoal-400 dark:placeholder-gray-500 focus:outline-none focus:border-coral-400 focus:ring-2 focus:ring-coral-100 dark:focus:ring-coral-950"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#F5EBE4] dark:border-[#2e313a]">
              <label className="flex items-center gap-2 text-xs font-bold text-charcoal-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="accent-coral-500 rounded"
                />
                <span>Pin note to top</span>
              </label>

              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting}>
                  Save Note
                </Button>
              </div>
            </div>
          </form>
        </Modal>

        {/* View / Read Full Note Modal */}
        <Modal
          isOpen={!!viewingNote}
          onClose={() => setViewingNote(null)}
          title={viewingNote?.title || 'Study Note'}
          subtitle={
            viewingNote?.subject ? `Subject: ${viewingNote.subject.name}` : 'General Concept Note'
          }
          maxWidth="md"
        >
          {viewingNote && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#F5EBE4] dark:border-[#2e313a]">
                <div className="flex items-center gap-2">
                  {viewingNote.subject ? (
                    <span
                      className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg text-white"
                      style={{ backgroundColor: viewingNote.subject.color }}
                    >
                      {viewingNote.subject.name}
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-[#FAF4F0] dark:bg-[#252832] text-charcoal-600 dark:text-gray-300">
                      General
                    </span>
                  )}
                  {viewingNote.pinned && (
                    <span className="text-[10px] font-bold text-coral-600 dark:text-coral-400 bg-coral-50 dark:bg-coral-950/60 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyNote(viewingNote.content)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FCFAF8] dark:bg-[#252832] border border-[#EFE7E1] dark:border-[#2e313a] text-charcoal-700 dark:text-gray-200 hover:text-coral-600 dark:hover:text-coral-400 hover:border-coral-300 transition-all"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-charcoal-400" />
                      <span>Copy Note</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#FCFAF8] dark:bg-[#212328] border border-[#F3ECE7] dark:border-[#2e313a] text-xs sm:text-sm text-charcoal-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto select-text font-sans">
                {viewingNote.content}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#F5EBE4] dark:border-[#2e313a]">
                <span className="text-[11px] text-charcoal-400 dark:text-gray-400">
                  Last updated: {new Date(viewingNote.updatedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const n = viewingNote;
                      setViewingNote(null);
                      handleOpenEdit(n);
                    }}
                    className="gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setViewingNote(null)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}
