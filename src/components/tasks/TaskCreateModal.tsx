'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { StudyzSelect } from '@/components/ui/StudyzSelect';
import { Button } from '@/components/ui/Button';
import { Subject, Chapter } from '@/types';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  initialSubjectId?: string;
  initialChapterId?: string;
}

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
  initialSubjectId,
  initialChapterId,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectId || '');
  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId || '');
  const [title, setTitle] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('45');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [notificationEnabled, setNotificationEnabled] = useState(true);

  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialSubjectId) setSelectedSubjectId(initialSubjectId);
    if (initialChapterId) setSelectedChapterId(initialChapterId);
  }, [initialSubjectId, initialChapterId]);

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId);
  const availableChapters = activeSubject?.chapters || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          subjectId: selectedSubjectId || null,
          chapterId: selectedChapterId || null,
          dueDate,
          scheduledTime: scheduledTime.trim() || null,
          duration: Number(duration) || 45,
          priority,
          description: description.trim() || null,
          timezone: userTimezone,
          notificationEnabled,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create task');
      }

      // Reset form & close
      setTitle('');
      setScheduledTime('');
      setDescription('');
      onTaskCreated();
      onClose();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Study Task"
      subtitle="Schedule focused study or practice for your goals"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl font-semibold">
            {error}
          </div>
        )}

        <Input
          label="Task Title"
          placeholder="e.g. Physics – Newton's Laws of Motion Revision"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <StudyzSelect
            label="Subject"
            placeholder="Select Subject (Optional)"
            value={selectedSubjectId}
            onChange={(val) => {
              setSelectedSubjectId(String(val));
              setSelectedChapterId('');
            }}
            searchable
            options={[
              { value: '', label: 'No Subject (General)' },
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

          <StudyzSelect
            label="Chapter"
            placeholder={
              !selectedSubjectId
                ? 'Select a subject first'
                : availableChapters.length === 0
                ? 'No chapters in this subject'
                : 'Select Chapter (Optional)'
            }
            value={selectedChapterId}
            onChange={(val) => setSelectedChapterId(String(val))}
            disabled={!selectedSubjectId || availableChapters.length === 0}
            searchable={availableChapters.length > 5}
            options={[
              { value: '', label: 'All / General Chapter' },
              ...availableChapters.map((ch: Chapter) => ({
                value: ch.id,
                label: ch.name,
                secondaryText: ch.difficulty ? `${ch.difficulty}` : undefined,
              })),
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            label="Scheduled Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />

          <Input
            label="Exact Time"
            placeholder="e.g. 7:30 PM or 19:30"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
          />

          <StudyzSelect
            label="Duration"
            value={duration}
            onChange={(val) => setDuration(String(val))}
            options={[
              { value: '25', label: '25 mins', secondaryText: 'Pomodoro' },
              { value: '45', label: '45 mins', secondaryText: 'Standard' },
              { value: '60', label: '60 mins', secondaryText: '1 hr' },
              { value: '90', label: '90 mins', secondaryText: '1.5 hrs' },
              { value: '120', label: '120 mins', secondaryText: '2 hrs' },
            ]}
          />
        </div>

        {/* Reminder Notification Notice / Toggle */}
        <div className="p-3 bg-[#FCFAF8] border border-[#F3ECE7] rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">⏰</span>
            <div>
              <p className="text-xs font-bold text-charcoal-900">Task Schedule Reminder</p>
              <p className="text-[11px] text-charcoal-500">
                {scheduledTime
                  ? `STUDYZ will notify you on ${dueDate} at ${scheduledTime}`
                  : 'Specify an exact time above to schedule an instant reminder'}
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={notificationEnabled}
              onChange={(e) => setNotificationEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[#E8DDD4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E8DDD4] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-coral-500" />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <StudyzSelect
            label="Priority"
            value={priority}
            onChange={(val) => setPriority(val as 'LOW' | 'MEDIUM' | 'HIGH')}
            options={[
              { value: 'LOW', label: 'Low Priority', secondaryText: 'Casual' },
              { value: 'MEDIUM', label: 'Medium Priority', secondaryText: 'Default' },
              { value: 'HIGH', label: 'High Priority 🔥', secondaryText: 'Urgent' },
            ]}
          />

          <Input
            label="Notes / Goal (Optional)"
            placeholder="e.g. Solve 20 PYQs from HC Verma"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F5EBE4]">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Create Task (+20 XP on completion)
          </Button>
        </div>
      </form>
    </Modal>
  );
};
