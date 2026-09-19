'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarEvent {
  id: string;
  type: 'task' | 'session';
  title: string;
  date: string; // YYYY-MM-DD
  scheduledTime?: string;
  duration: number;
  priority?: string;
  status?: string;
  subjectName?: string;
  subjectColor?: string;
  chapterName?: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<{ tasks: CalendarEvent[]; sessions: CalendarEvent[] }>({
    tasks: [],
    sessions: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  useEffect(() => {
    const monthFormatted = `${year}-${String(month + 1).padStart(2, '0')}`;
    setLoading(true);
    fetch(`/api/calendar?month=${monthFormatted}`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year, month]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar calculations
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // 0 = Mon
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: adjustedFirstDay }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTasks = events.tasks.filter((t) => t.date === dayStr);
    const daySessions = events.sessions.filter((s) => s.date === dayStr);
    return [...dayTasks, ...daySessions];
  };

  const handleDayClick = (day: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDateStr(dayStr);
    setSelectedDayEvents(getEventsForDay(day));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
              Study Calendar & Schedule
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500 dark:text-gray-400 font-medium mt-1">
              Visualize completed sessions, scheduled tasks, and focus timeline.
            </p>
          </div>

          {/* Month Navigator */}
          <div className="flex items-center gap-3 bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] p-1.5 rounded-2xl shadow-soft">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl text-charcoal-600 dark:text-gray-300 hover:bg-[#FFF0EB] dark:hover:bg-coral-950/60 hover:text-coral-600 dark:hover:text-coral-400 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-extrabold text-charcoal-900 dark:text-white min-w-[140px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-charcoal-600 dark:text-gray-300 hover:bg-[#FFF0EB] dark:hover:bg-coral-950/60 hover:text-coral-600 dark:hover:text-coral-400 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendar Box */}
          <div className="lg:col-span-8 bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-4xl p-6 shadow-soft">
            {/* Days of week */}
            <div className="grid grid-cols-7 text-center text-xs font-bold text-charcoal-400 dark:text-gray-400 uppercase tracking-wider mb-4 pb-2 border-b border-[#F5EBE4] dark:border-[#2e313a]">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {blanksArray.map((i) => (
                <div key={`blank-${i}`} className="h-20 sm:h-24 rounded-2xl bg-[#FCFAF8]/40 dark:bg-[#212328]/40" />
              ))}

              {daysArray.map((day) => {
                const dayEvents = getEventsForDay(day);
                const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = selectedDateStr === dayStr;
                const isToday = new Date().toISOString().split('T')[0] === dayStr;

                return (
                  <div
                    key={`day-${day}`}
                    onClick={() => handleDayClick(day)}
                    className={`h-20 sm:h-24 rounded-2xl p-2 border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-coral-500 bg-[#FFF5F2] dark:bg-coral-950/40 ring-2 ring-coral-200 dark:ring-coral-900/60'
                        : isToday
                        ? 'border-[#FFD6CB] dark:border-coral-900/40 bg-[#FFF9F6] dark:bg-coral-950/20'
                        : 'border-[#F3ECE7] dark:border-[#2e313a] hover:border-[#EBD9CE] dark:hover:border-gray-600 bg-white dark:bg-[#1a1b20]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-black w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday
                            ? 'bg-coral-500 text-white'
                            : isSelected
                            ? 'text-coral-600 dark:text-coral-400'
                            : 'text-charcoal-700 dark:text-gray-300'
                        }`}
                      >
                        {day}
                      </span>
                    </div>

                    {/* Dot indicators */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <span
                          key={ev.id}
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: ev.subjectColor || (ev.type === 'session' ? '#FF704E' : '#8C7CFF'),
                          }}
                          title={ev.title}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[9px] font-bold text-charcoal-400 dark:text-gray-400">
                          +{dayEvents.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Detail Drawer */}
          <div className="lg:col-span-4 bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-4xl p-6 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-4 border-b border-[#F5EBE4] dark:border-[#2e313a]">
                <CalendarIcon className="w-5 h-5 text-coral-500" />
                <h2 className="text-base font-extrabold text-charcoal-900 dark:text-white">
                  {selectedDateStr || 'Select a day'}
                </h2>
              </div>

              <div className="mt-4 space-y-3">
                {selectedDayEvents.length === 0 ? (
                  <p className="text-xs text-charcoal-400 dark:text-gray-400 py-8 text-center">
                    No scheduled tasks or sessions on this date.
                  </p>
                ) : (
                  selectedDayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3.5 rounded-2xl bg-[#FCFAF8] dark:bg-[#212328] border border-[#F3ECE7] dark:border-[#2e313a] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase text-coral-600 dark:text-coral-400">
                          {ev.type === 'session' ? '⏱️ Focus Session' : '☑️ Task'}
                        </span>
                        <span className="text-xs font-bold text-charcoal-600 dark:text-gray-300">{ev.duration}m</span>
                      </div>
                      <p className="text-xs font-bold text-charcoal-900 dark:text-white">{ev.title}</p>
                      <p className="text-[11px] text-charcoal-400 dark:text-gray-400">
                        {ev.subjectName} {ev.chapterName ? `– ${ev.chapterName}` : ''}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
