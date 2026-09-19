'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  CloudRain,
  Wind,
  Waves,
  Sparkles,
  Plus,
  Minus,
  Target,
  Quote,
  Flame,
} from 'lucide-react';
import { soundManager } from '@/lib/sound';

interface TimerDisplayProps {
  initialMinutes: number;
  subjectName?: string;
  chapterName?: string;
  onSessionComplete: (durationMinutes: number, plannedMinutes: number) => void;
  sessionGoal?: string;
  onGoalChange?: (goal: string) => void;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  initialMinutes,
  subjectName,
  chapterName,
  onSessionComplete,
  sessionGoal = '',
  onGoalChange,
}) => {
  const [plannedMinutes, setPlannedMinutes] = useState(initialMinutes);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ambientType, setAmbientType] = useState<'off' | 'rain' | 'whitenoise' | 'waves'>('off');
  const [ambientVolume, setAmbientVolume] = useState(0.3);
  const [soundMuted, setSoundMuted] = useState(false);
  const [goalText, setGoalText] = useState(sessionGoal);

  const timerContainerRef = useRef<HTMLDivElement>(null);
  const totalDurationSeconds = plannedMinutes * 60;
  const elapsedSeconds = totalDurationSeconds - timeLeftSeconds;
  const progressPercent = totalDurationSeconds > 0 ? (elapsedSeconds / totalDurationSeconds) * 100 : 0;

  // Handle preset duration change
  const handleSetPreset = (mins: number) => {
    if (isRunning) return;
    setPlannedMinutes(mins);
    setTimeLeftSeconds(mins * 60);
  };

  const adjustMinutes = (delta: number) => {
    if (isRunning) return;
    const newMins = Math.max(1, Math.min(180, plannedMinutes + delta));
    setPlannedMinutes(newMins);
    setTimeLeftSeconds(newMins * 60);
  };

  const handleFinishEarly = useCallback(() => {
    setIsRunning(false);
    soundManager.stopAmbient();
    soundManager.playComplete();
    const actualMinutesFocused = Math.max(1, Math.round(elapsedSeconds / 60));
    onSessionComplete(actualMinutesFocused, plannedMinutes);
  }, [elapsedSeconds, plannedMinutes, onSessionComplete]);

  // Main countdown timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            setIsRunning(false);
            soundManager.stopAmbient();
            soundManager.playComplete();
            onSessionComplete(plannedMinutes, plannedMinutes);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeftSeconds, plannedMinutes, onSessionComplete]);

  const toggleStartPause = () => {
    if (!isRunning) {
      if (timeLeftSeconds === 0) {
        setTimeLeftSeconds(plannedMinutes * 60);
      }
      if (!soundMuted) {
        soundManager.playStart();
      }
      if (ambientType !== 'off') {
        soundManager.startAmbient(ambientType, ambientVolume);
      }
      setIsRunning(true);
    } else {
      setIsRunning(false);
      soundManager.stopAmbient();
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    soundManager.stopAmbient();
    setTimeLeftSeconds(plannedMinutes * 60);
  };

  const handleAmbientChange = (type: 'off' | 'rain' | 'whitenoise' | 'waves') => {
    setAmbientType(type);
    if (type === 'off' || !isRunning) {
      soundManager.stopAmbient();
    } else {
      soundManager.startAmbient(type, ambientVolume);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    soundManager.setAmbientVolume(vol);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      timerContainerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Listen for escape or native fullscreen exit
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Format MM:SS
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG Circular Ring calculation
  const radius = isFullscreen ? 140 : 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div
      ref={timerContainerRef}
      className={`relative w-full transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#0d0e11] text-white flex flex-col items-center justify-between p-8 sm:p-12 select-none overflow-hidden'
          : 'bg-white dark:bg-[#1a1b20] border border-[#F0E4DC] dark:border-[#2e313a] rounded-4xl p-6 sm:p-10 shadow-soft-lg flex flex-col items-center justify-between text-center'
      }`}
    >
      {/* Background Ambient Stars / Particles for Fullscreen Zen Mode */}
      {isFullscreen && (
        <>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lavender-500/10 rounded-full blur-3xl pointer-events-none animate-pulse delay-1000" />
        </>
      )}

      {/* Top Header info & Controls */}
      <div className="w-full flex items-center justify-between z-10 gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
              isRunning
                ? 'bg-coral-500 text-white shadow-coral-glow animate-pulse'
                : isFullscreen
                ? 'bg-white/10 text-coral-300 border border-white/10'
                : 'bg-[#FFF0EB] dark:bg-coral-950/60 text-coral-600 dark:text-coral-300 border border-[#FFD9CE]/70 dark:border-coral-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            {isRunning ? 'Deep Flow Active' : 'Ready to Focus'}
          </span>
          {subjectName && (
            <span className="hidden sm:inline-block text-xs font-bold text-charcoal-600 dark:text-gray-300 bg-charcoal-50 dark:bg-white/10 px-3 py-1 rounded-full border border-charcoal-100 dark:border-white/10">
              {subjectName} {chapterName ? `• ${chapterName}` : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundMuted(!soundMuted)}
            className={`p-2.5 rounded-2xl transition-all ${
              isFullscreen
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-[#FCFAF8] dark:bg-[#22242a] border border-[#EFE7E1] dark:border-[#2e313a] text-charcoal-600 dark:text-gray-300 hover:text-coral-600'
            }`}
            title={soundMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {soundMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className={`p-2.5 rounded-2xl transition-all ${
              isFullscreen
                ? 'bg-coral-500 text-white shadow-coral-glow hover:bg-coral-600'
                : 'bg-[#FCFAF8] dark:bg-[#22242a] border border-[#EFE7E1] dark:border-[#2e313a] text-charcoal-600 dark:text-gray-300 hover:text-coral-600'
            }`}
            title={isFullscreen ? 'Exit Zen Fullscreen' : 'Enter Zen Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4.5 h-4.5" /> : <Maximize2 className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>

      {/* Session Objective Input Capsule */}
      <div className="w-full max-w-md my-4 z-10">
        <div
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl transition-all border ${
            isFullscreen
              ? 'bg-white/5 border-white/10 text-white focus-within:border-coral-400'
              : 'bg-[#FAF6F3] dark:bg-[#212328] border-[#EFE7E1] dark:border-[#2e313a] focus-within:border-coral-400'
          }`}
        >
          <Target className="w-4 h-4 text-coral-500 shrink-0" />
          <input
            type="text"
            value={goalText}
            onChange={(e) => {
              setGoalText(e.target.value);
              onGoalChange?.(e.target.value);
            }}
            placeholder="Focus Goal: e.g. Solve 15 Rotational Motion Problems..."
            className="w-full bg-transparent text-xs sm:text-sm font-semibold placeholder:text-charcoal-400 dark:placeholder:text-gray-500 focus:outline-none text-charcoal-900 dark:text-white"
          />
        </div>
      </div>

      {/* Preset Duration & Fine Adjustment Selector */}
      {!isRunning && (
        <div className="flex items-center gap-2 sm:gap-3 my-2 flex-wrap justify-center z-10">
          <button
            onClick={() => adjustMinutes(-5)}
            className={`p-2 rounded-xl text-xs font-bold transition-all ${
              isFullscreen
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-[#FCFAF8] dark:bg-[#22242a] text-charcoal-600 dark:text-gray-300 border border-[#EFE7E1] dark:border-[#2e313a]'
            }`}
            title="Decrease 5 mins"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {[
            { label: '25m Pomodoro', mins: 25 },
            { label: '50m Deep Work', mins: 50 },
            { label: '90m Flow State', mins: 90 },
          ].map((preset) => (
            <button
              key={preset.mins}
              onClick={() => handleSetPreset(preset.mins)}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all ${
                plannedMinutes === preset.mins
                  ? 'btn-coral text-white shadow-coral-glow scale-105'
                  : isFullscreen
                  ? 'bg-white/10 text-gray-300 border border-white/10 hover:bg-white/20'
                  : 'bg-[#FCFAF8] dark:bg-[#22242a] text-charcoal-600 dark:text-gray-300 border border-[#EFE7E1] dark:border-[#2e313a] hover:border-coral-300'
              }`}
            >
              {preset.label}
            </button>
          ))}

          <button
            onClick={() => adjustMinutes(5)}
            className={`p-2 rounded-xl text-xs font-bold transition-all ${
              isFullscreen
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-[#FCFAF8] dark:bg-[#22242a] text-charcoal-600 dark:text-gray-300 border border-[#EFE7E1] dark:border-[#2e313a]'
            }`}
            title="Increase 5 mins"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SVG Circular Countdown Ring */}
      <div className="relative my-6 sm:my-8 flex items-center justify-center z-10">
        <svg
          className={`${
            isFullscreen ? 'w-80 h-80 sm:w-96 sm:h-96' : 'w-64 h-64 sm:w-80 sm:h-80'
          } transition-all duration-300`}
          viewBox="0 0 320 320"
        >
          {/* Background circle */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="transparent"
            stroke={isFullscreen ? '#20222a' : '#FFF2EB'}
            className="dark:stroke-[#252832]"
            strokeWidth="16"
          />
          {/* Animated countdown progress ring */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="transparent"
            stroke="url(#timerCoralGradient)"
            strokeWidth="16"
            strokeDasharray={2 * Math.PI * radius}
            strokeDashoffset={2 * Math.PI * radius - (progressPercent / 100) * (2 * Math.PI * radius)}
            strokeLinecap="round"
            className="timer-ring-circle"
          />
          <defs>
            <linearGradient id="timerCoralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFA088" />
              <stop offset="100%" stopColor="#FF704E" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Time & Motivation Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div
            className={`${
              isFullscreen ? 'text-6xl sm:text-7xl' : 'text-5xl sm:text-6xl'
            } font-extrabold font-mono tracking-tight ${
              isFullscreen ? 'text-white' : 'text-charcoal-900 dark:text-white'
            }`}
          >
            {formattedTime}
          </div>

          <div className="mt-2 text-xs font-semibold">
            {isRunning ? (
              <span className="flex items-center gap-1.5 text-coral-500 font-bold animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                {goalText ? goalText.slice(0, 32) + '...' : 'Deep Focus Session'}
              </span>
            ) : (
              <span className="text-charcoal-400 dark:text-gray-400">
                {Math.round(progressPercent)}% elapsed ({plannedMinutes}m target)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Zen Ambient Sound Mixer */}
      <div
        className={`w-full max-w-md mb-6 p-3 rounded-2xl flex flex-col gap-2.5 z-10 transition-all ${
          isFullscreen
            ? 'bg-white/5 border border-white/10 text-white'
            : 'bg-[#FCFAF8] dark:bg-[#22242a] border border-[#EFE7E1] dark:border-[#2e313a]'
        }`}
      >
        <div className="flex items-center justify-between text-xs font-semibold px-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-charcoal-400 dark:text-gray-400">
            Ambient Soundscape
          </span>
          {ambientType !== 'off' && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-coral-500 font-bold">Vol: {Math.round(ambientVolume * 100)}%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={ambientVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-16 accent-coral-500 cursor-pointer h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
          <button
            onClick={() => handleAmbientChange('off')}
            className={`py-2 rounded-xl transition-all text-center ${
              ambientType === 'off'
                ? 'bg-white dark:bg-[#2e313a] shadow-xs text-charcoal-900 dark:text-white font-extrabold'
                : 'text-charcoal-500 dark:text-gray-400 hover:text-charcoal-800'
            }`}
          >
            Silent
          </button>

          <button
            onClick={() => handleAmbientChange('rain')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
              ambientType === 'rain'
                ? 'bg-[#F0EDFF] dark:bg-purple-950/60 text-lavender-600 dark:text-lavender-300 font-extrabold shadow-xs'
                : 'text-charcoal-500 dark:text-gray-400 hover:text-charcoal-800'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Rain</span>
          </button>

          <button
            onClick={() => handleAmbientChange('whitenoise')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
              ambientType === 'whitenoise'
                ? 'bg-[#FFF0EB] dark:bg-coral-950/60 text-coral-600 dark:text-coral-300 font-extrabold shadow-xs'
                : 'text-charcoal-500 dark:text-gray-400 hover:text-charcoal-800'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Noise</span>
          </button>

          <button
            onClick={() => handleAmbientChange('waves')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
              ambientType === 'waves'
                ? 'bg-[#ECFDF5] dark:bg-emerald-950/60 text-mint-600 dark:text-mint-300 font-extrabold shadow-xs'
                : 'text-charcoal-500 dark:text-gray-400 hover:text-charcoal-800'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Waves</span>
          </button>
        </div>
      </div>

      {/* Primary Action Controls */}
      <div className="flex items-center justify-center gap-4 w-full z-10">
        <button
          onClick={handleReset}
          className={`p-4 rounded-2xl transition-all ${
            isFullscreen
              ? 'bg-white/10 hover:bg-white/20 text-white'
              : 'bg-[#F9F5F2] dark:bg-[#22242a] hover:bg-[#F0EAE4] dark:hover:bg-[#2a2c34] border border-[#EFE5DE] dark:border-[#2e313a] text-charcoal-600 dark:text-gray-300'
          }`}
          title="Reset timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={toggleStartPause}
          className="btn-coral px-10 py-4.5 rounded-2xl text-base font-extrabold flex items-center gap-3 shadow-coral-glow scale-105 active:scale-100 transition-transform"
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-white" />
              <span>Pause Focus</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-white" />
              <span>{elapsedSeconds > 0 ? 'Resume Focus' : 'Start Focus'}</span>
            </>
          )}
        </button>

        {elapsedSeconds > 30 && (
          <button
            onClick={handleFinishEarly}
            className="p-4 rounded-2xl bg-[#ECFDF5] dark:bg-emerald-950/60 hover:bg-[#DCFCE7] dark:hover:bg-emerald-900/60 border border-[#BBF7D0] dark:border-emerald-800 text-mint-600 dark:text-mint-300 transition-colors"
            title="Finish and log focus session"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Zen Fullscreen Micro Quote */}
      {isFullscreen && (
        <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 font-medium z-10 animate-fade-in">
          <Quote className="w-3.5 h-3.5 text-coral-400" />
          <span>&quot;Discipline today, mastery tomorrow.&quot;</span>
        </div>
      )}
    </div>
  );
};

