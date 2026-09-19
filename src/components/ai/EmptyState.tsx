'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Mic, ChevronDown, CornerDownRight, Sparkles, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
  selectedModel?: string;
  onSelectModel?: (model: string) => void;
}

const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash', label: 'Pro', color: 'bg-blue-500' },
  { id: 'gemini-1.5-flash', label: 'Flash', color: 'bg-amber-400' },
];

const DYNAMIC_PLACEHOLDERS = [
  'Ask STUDYZ AI...',
  'Ask here...',
  'Brainstorm study plans...',
  'Solve a physics or calculus doubt...',
  'Draft a revision schedule...',
  'Explain a complex concept...',
  'What would you like to learn today?...',
  'Summarize key chapter notes...',
  'Ask anything...',
  'Generate practice quiz questions...',
  'Explore interactive study tools...',
  'Help with homework & exam prep...',
];

const ALL_PROMPT_SUGGESTIONS = [
  // Personal Focus & Analytics Insights (NEW!)
  "How much time did I focus this week and month?",
  "Analyze my subject completion & syllabus progress",
  "Am I on track with my daily study goal today?",
  "Create a personalized study plan based on my focus stats",
  "What pending tasks should I prioritize right now?",

  // Physics & STEM
  "Explain Newton's Laws of Motion with formulas",
  "Check my work on this math problem",
  "Summarize key concepts from Quantum Physics in simple terms",
  "Explain how attention mechanisms work in AI and Transformers",
  "Create 5 multiple-choice practice questions on cellular biology",
  "Design a spaced-repetition deck for organic chemistry functional groups",
  "Help me construct a logic proof for discrete mathematics",
  "Explain the process of DNA replication step by step",
  "Formulate 3 real-world applications of linear algebra matrices",
  "Break down calculus integration by parts with step-by-step examples",
  
  // Study Planning & Productivity
  "Plan my weekly study schedule for exams",
  "Audit my distracting apps and suggest focus rules",
  "Create a 30-minute daily routine to improve memory and focus",
  "How to effectively manage time using the Pomodoro technique",
  "Formulate a step-by-step revision plan for SAT/GRE prep",
  "Suggest top cognitive strategies for avoiding study burnout",
  "Draft a study blueprint to master Python data structures",
  "Help me set up an active recall system for my lectures",
  
  // Literature, Economics & Writing
  "Describe a new sci-fi world",
  "Draft an outline for a persuasive essay on renewable energy",
  "Critique my thesis statement and suggest improvements",
  "Analyze themes of duality in Dr. Jekyll and Mr. Hyde",
  "Explain the difference between microeconomics and macroeconomics",
  "Create a simplified breakdown of Keynesian vs Classical Economics",
  "Draft a summary cheat-sheet for World War II causes",
  "Compare democratic and authoritarian governance models with examples",
  
  // Programming & CS
  "Help me debug a React component useEffect infinite loop",
  "What are the core design principles of Object-Oriented Programming?",
  "Explain how SQL index optimizations improve query speed",
  "Create a beginner-friendly guide to Git rebase vs merge",
  "How do promises and async/await work in JavaScript under the hood?",
  
  // General Curiosity & Learning
  "Generate mnemonic techniques for memorizing the periodic table",
  "Draft an email template asking a professor for research opportunities",
  "Help me translate and break down a complex foreign language paragraph",
  "Explain how neural networks process visual imagery",
  "Give me 5 mental models for better analytical decision-making",
];

function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onSelectPrompt,
  selectedModel = 'gemini-2.5-flash',
  onSelectModel,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [placeholderText, setPlaceholderText] = useState('Ask STUDYZ AI...');
  const [prompts, setPrompts] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshPrompts = useCallback(() => {
    setIsRefreshing(true);
    const newPrompts = getRandomItems(ALL_PROMPT_SUGGESTIONS, 5);
    const newPlaceholder = getRandomItems(DYNAMIC_PLACEHOLDERS, 1)[0];
    setPrompts(newPrompts);
    setPlaceholderText(newPlaceholder);
    setTimeout(() => setIsRefreshing(false), 300);
  }, []);

  useEffect(() => {
    refreshPrompts();
  }, [refreshPrompts]);

  const currentModel =
    AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSelectPrompt(inputValue.trim());
      setInputValue('');
    }
  };

  const handlePromptClick = (promptText: string) => {
    onSelectPrompt(promptText);
    refreshPrompts();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 w-full max-w-2xl mx-auto my-auto select-none animate-in fade-in zoom-in-95 duration-300">
      {/* Central Gemini Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="w-full relative bg-[#1e1f24] dark:bg-[#1e1f24] border border-[#2e313a]/80 shadow-2xl rounded-full px-5 py-3.5 sm:py-4 flex items-center justify-between gap-3 group focus-within:border-coral-500/60 focus-within:ring-2 focus-within:ring-coral-500/20 transition-all"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            title="Add attachment or prompt"
          >
            <Plus className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholderText}
            className="w-full bg-transparent text-sm sm:text-base font-normal text-white placeholder-gray-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Model Selection Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 hover:bg-black/50 border border-gray-700/60 text-xs font-semibold text-gray-200 transition-all"
            >
              <span className={`w-2 h-2 rounded-full ${currentModel.color}`} />
              <span>{currentModel.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {isModelDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-[#282a30] border border-gray-700/80 shadow-2xl py-1.5 z-20 animate-in fade-in zoom-in-95">
                {AVAILABLE_MODELS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onSelectModel?.(m.id);
                      setIsModelDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-white/10 transition-colors ${
                      selectedModel === m.id ? 'text-white font-bold' : 'text-gray-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${m.color}`} />
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Voice Input Icon */}
          <button
            type="button"
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Voice Input"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Gemini Vertical Return Arrow Prompt List with Header & Refresh */}
      <div className="mt-8 sm:mt-10 w-full space-y-2.5 px-2 text-left">
        <div className="flex items-center justify-between px-1 mb-1.5">
          <span className="text-xs font-medium tracking-wide text-gray-400/80 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-coral-400" />
            Suggestions for you
          </span>
          <button
            type="button"
            onClick={refreshPrompts}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-coral-400 transition-colors py-1 px-2 rounded-lg hover:bg-white/5 cursor-pointer"
            title="Shuffle suggestions"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-coral-400' : ''}`} />
            <span>Shuffle</span>
          </button>
        </div>

        {prompts.map((promptText, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handlePromptClick(promptText)}
            className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl hover:bg-white/5 transition-all text-left group cursor-pointer"
          >
            <CornerDownRight className="w-4.5 h-4.5 text-gray-400 group-hover:text-coral-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            <span className="text-sm sm:text-base font-normal text-gray-200 group-hover:text-white transition-colors">
              {promptText}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};



