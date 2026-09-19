'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ArrowLeft, Check, BookOpen, Clock, Target, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import confetti from 'canvas-confetti';
import { AvatarPicker } from '@/components/avatar/AvatarPicker';

const GRADE_OPTIONS = [
  { label: 'Class 11', desc: 'Starting advanced preparation' },
  { label: 'Class 12', desc: 'Final year board & entrance exams' },
  { label: 'Dropper / Gap Year', desc: 'Full-time entrance prep' },
  { label: 'Undergraduate / College', desc: 'Higher education & semester prep' },
  { label: 'Self-Paced Learner', desc: 'Independent skill mastery' },
];

const EXAM_GOALS = [
  { label: 'JEE Main & Advanced', tag: 'Engineering' },
  { label: 'NEET UG', tag: 'Medical' },
  { label: 'CBSE / State Boards', tag: 'High School' },
  { label: 'SAT / ACT / College Prep', tag: 'Global' },
  { label: 'Academic & Concept Mastery', tag: 'General' },
];

const DEFAULT_SUBJECTS = [
  { name: 'Physics', code: 'PHY', color: '#8C7CFF', icon: 'atom', selected: true },
  { name: 'Chemistry', code: 'CHEM', color: '#FF8E72', icon: 'flask-conical', selected: true },
  { name: 'Mathematics', code: 'MATH', color: '#FDBA74', icon: 'calculator', selected: true },
  { name: 'Biology', code: 'BIO', color: '#4ADE80', icon: 'leaf', selected: false },
  { name: 'Computer Science', code: 'CS', color: '#38BDF8', icon: 'code', selected: false },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Form State
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🧑‍🎓');
  const [grade, setGrade] = useState('Class 12');
  const [examGoal, setExamGoal] = useState('JEE Main & Advanced');
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [dailyGoalHours, setDailyGoalHours] = useState('4');
  const [preferredFocusMinutes, setPreferredFocusMinutes] = useState('50');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.name) {
          setName(data.user.name);
        } else {
          setName('Scholar');
        }
      })
      .catch(() => {
        setName('Scholar');
      });
  }, []);

  const toggleSubject = (subName: string) => {
    setSubjects(
      subjects.map((s) => (s.name === subName ? { ...s, selected: !s.selected } : s))
    );
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const finishOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const selectedSubs = subjects.filter((s) => s.selected);
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          avatarUrl: avatar,
          grade,
          examGoal,
          subjects: selectedSubs,
          dailyStudyGoalHours: Number(dailyGoalHours) || 4,
          preferredFocusMinutes: Number(preferredFocusMinutes) || 50,
        }),
      });

      if (res.ok) {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF704E', '#8C7CFF', '#FDBA74'],
        });
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      console.error('Onboarding failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Soft Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FFEAE3] rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#F0EDFF] rounded-full blur-3xl opacity-30 pointer-events-none" />

      <div className="relative w-full max-w-lg bg-white border border-[#F3ECE7] rounded-4xl p-6 sm:p-10 shadow-soft-lg">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#F5EBE4]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-coral-500 flex items-center justify-center text-white shadow-coral-glow">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-sm font-extrabold text-charcoal-900">STUDYZ SETUP</span>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i + 1 === step
                    ? 'w-6 bg-coral-500'
                    : i + 1 < step
                    ? 'w-2 bg-coral-300'
                    : 'w-2 bg-[#EFE7E1]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Name & Avatar */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-coral-500 uppercase tracking-widest">Step 1 of 6</span>
              <h2 className="text-2xl font-black text-charcoal-900 mt-1">What should we call you?</h2>
              <p className="text-xs text-charcoal-500 mt-1">Personalize your student identity and pick an avatar.</p>
            </div>

            <Input
              label="Your Full Name"
              placeholder="e.g. Shoyan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-2">
                Choose Avatar or Upload Photo
              </label>
              <AvatarPicker
                selectedAvatar={avatar}
                onSelectAvatar={(newVal) => setAvatar(newVal)}
                userName={name}
              />
            </div>
          </div>
        )}

        {/* Step 2: Grade */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-coral-500 uppercase tracking-widest">Step 2 of 6</span>
              <h2 className="text-2xl font-black text-charcoal-900 mt-1">What grade or stage are you in?</h2>
              <p className="text-xs text-charcoal-500 mt-1">This tunes your difficulty and pacing benchmarks.</p>
            </div>

            <div className="space-y-2.5">
              {GRADE_OPTIONS.map((g) => (
                <div
                  key={g.label}
                  onClick={() => setGrade(g.label)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    grade === g.label
                      ? 'bg-[#FFF0EB] border-coral-400 shadow-sm'
                      : 'bg-white border-[#F3ECE7] hover:border-[#EBD9CE]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className={`w-5 h-5 ${grade === g.label ? 'text-coral-500' : 'text-charcoal-400'}`} />
                    <div>
                      <p className="text-sm font-bold text-charcoal-900">{g.label}</p>
                      <p className="text-xs text-charcoal-400 mt-0.5">{g.desc}</p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      grade === g.label ? 'border-coral-500 bg-coral-500 text-white' : 'border-[#DECFC6]'
                    }`}
                  >
                    {grade === g.label && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Exam Goal */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-coral-500 uppercase tracking-widest">Step 3 of 6</span>
              <h2 className="text-2xl font-black text-charcoal-900 mt-1">What is your primary target?</h2>
              <p className="text-xs text-charcoal-500 mt-1">Your dashboard and analytics will align with this exam.</p>
            </div>

            <div className="space-y-2.5">
              {EXAM_GOALS.map((eg) => (
                <div
                  key={eg.label}
                  onClick={() => setExamGoal(eg.label)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    examGoal === eg.label
                      ? 'bg-[#FFF0EB] border-coral-400 shadow-sm'
                      : 'bg-white border-[#F3ECE7] hover:border-[#EBD9CE]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Target className={`w-5 h-5 ${examGoal === eg.label ? 'text-coral-500' : 'text-charcoal-400'}`} />
                    <div>
                      <p className="text-sm font-bold text-charcoal-900">{eg.label}</p>
                      <span className="text-[11px] font-semibold text-coral-600 bg-[#FFF0EB] px-2 py-0.5 rounded-md mt-0.5 inline-block">
                        {eg.tag}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      examGoal === eg.label ? 'border-coral-500 bg-coral-500 text-white' : 'border-[#DECFC6]'
                    }`}
                  >
                    {examGoal === eg.label && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Subjects */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-coral-500 uppercase tracking-widest">Step 4 of 6</span>
              <h2 className="text-2xl font-black text-charcoal-900 mt-1">Select your study subjects</h2>
              <p className="text-xs text-charcoal-500 mt-1">Choose the core subjects to track in your syllabus.</p>
            </div>

            <div className="space-y-2.5">
              {subjects.map((sub) => (
                <div
                  key={sub.name}
                  onClick={() => toggleSubject(sub.name)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    sub.selected
                      ? 'bg-[#FFF0EB] border-coral-400 shadow-sm'
                      : 'bg-white border-[#F3ECE7] opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                      style={{ backgroundColor: sub.color }}
                    >
                      {sub.code}
                    </div>
                    <span className="text-sm font-bold text-charcoal-900">{sub.name}</span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      sub.selected ? 'border-coral-500 bg-coral-500 text-white' : 'border-[#DECFC6]'
                    }`}
                  >
                    {sub.selected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Daily Goal */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-coral-500 uppercase tracking-widest">Step 5 of 6</span>
              <h2 className="text-2xl font-black text-charcoal-900 mt-1">Daily Study Target</h2>
              <p className="text-xs text-charcoal-500 mt-1">How many hours do you plan to dedicate daily?</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['2', '3', '4.5', '6'].map((hrs) => (
                <button
                  key={hrs}
                  type="button"
                  onClick={() => setDailyGoalHours(hrs)}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                    dailyGoalHours === hrs
                      ? 'bg-[#FFF0EB] border-coral-400 scale-105 shadow-sm text-coral-600'
                      : 'bg-[#FCFAF8] border-[#EFE7E1] text-charcoal-700 hover:border-coral-200'
                  }`}
                >
                  <Clock className="w-5 h-5 mb-1" />
                  <span className="text-lg font-black">{hrs}h</span>
                  <span className="text-[10px] font-bold uppercase mt-0.5 text-charcoal-400">per day</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Preferred Focus Duration */}
        {step === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-coral-500 uppercase tracking-widest">Step 6 of 6</span>
              <h2 className="text-2xl font-black text-charcoal-900 mt-1">Preferred Focus Duration</h2>
              <p className="text-xs text-charcoal-500 mt-1">Choose your favorite session length for the timer.</p>
            </div>

            <div className="space-y-3">
              {[
                { mins: '25', label: '25 mins (Pomodoro Technique)', desc: 'Ideal for short bursts with frequent breaks' },
                { mins: '50', label: '50 mins (Deep Work Block)', desc: 'Recommended for intense problem solving & derivations' },
                { mins: '90', label: '90 mins (Ultra-Flow State)', desc: 'Full exam simulation & exhaustive practice' },
              ].map((item) => (
                <div
                  key={item.mins}
                  onClick={() => setPreferredFocusMinutes(item.mins)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    preferredFocusMinutes === item.mins
                      ? 'bg-[#FFF0EB] border-coral-400 shadow-sm'
                      : 'bg-white border-[#F3ECE7] hover:border-[#EBD9CE]'
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-charcoal-900">{item.label}</p>
                    <p className="text-xs text-charcoal-400 mt-0.5">{item.desc}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      preferredFocusMinutes === item.mins
                        ? 'border-coral-500 bg-coral-500 text-white'
                        : 'border-[#DECFC6]'
                    }`}
                  >
                    {preferredFocusMinutes === item.mins && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#F5EBE4]">
          {step > 1 ? (
            <Button type="button" variant="secondary" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          <Button
            type="button"
            variant="primary"
            onClick={handleNext}
            isLoading={isSubmitting}
            className="flex items-center gap-1.5"
          >
            <span>{step === totalSteps ? 'Launch Dashboard 🚀' : 'Continue'}</span>
            {step < totalSteps && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
