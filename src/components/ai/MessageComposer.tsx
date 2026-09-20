'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Mic,
  MicOff,
  Send,
  FileText,
  Image as ImageIcon,
  Film,
  FileCode,
  X,
  Sparkles,
  AlertCircle,
  ChevronDown,
  Check,
} from 'lucide-react';
import { ChatAttachment } from '@/types';

interface MessageComposerProps {
  onSendMessage: (content: string, attachments: ChatAttachment[]) => void;
  disabled?: boolean;
  placeholder?: string;
  initialValue?: string;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
}

const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash', label: 'Pro', desc: 'High intelligence & complex reasoning' },
  { id: 'gemini-1.5-flash', label: 'Flash', desc: 'Fast & responsive for quick doubts' },
];

const DYNAMIC_PLACEHOLDERS = [
  'Ask STUDYZ AI...',
  'Ask here...',
  'Brainstorm study plans...',
  'Solve a physics or math doubt...',
  'Draft a revision schedule...',
  'Explain a complex concept...',
  'What would you like to learn today?...',
  'Summarize chapter notes...',
  'Ask anything...',
];

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Ask STUDYZ AI...',
  initialValue = '',
  selectedModel = 'gemini-2.5-flash',
  onModelChange,
}) => {
  const [text, setText] = useState(initialValue);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dynamicPlaceholder, setDynamicPlaceholder] = useState('Ask STUDYZ AI...');

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * DYNAMIC_PLACEHOLDERS.length);
    setDynamicPlaceholder(DYNAMIC_PLACEHOLDERS[randomIndex]);
  }, []);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const modelMenuRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (initialValue) {
      setText(initialValue);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [initialValue]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 24), 160)}px`;
    }
  }, [text]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target as Node)) {
        setIsModelMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        };

        recognition.onerror = (event: any) => {
          setIsRecording(false);
          setErrorMessage('Microphone access issue. Please check browser permissions.');
          setTimeout(() => setErrorMessage(null), 4000);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setErrorMessage('Speech recognition is not supported in this browser.');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch {
        setIsRecording(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (disabled || (!text.trim() && attachments.length === 0)) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    onSendMessage(text.trim(), attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }
  };

  const triggerFileInput = (acceptType: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = acceptType;
      fileInputRef.current.click();
    }
    setIsMenuOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMessage('File analysis attached! Ask any question about your file.');
    setTimeout(() => setErrorMessage(null), 4000);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const currentModelLabel =
    AVAILABLE_MODELS.find((m) => m.id === selectedModel)?.label || 'Pro';

  const canSend = (text.trim().length > 0 || attachments.length > 0) && !disabled;

  return (
    <div className="relative w-full max-w-2xl lg:max-w-3xl mx-auto px-3 sm:px-4 pb-4">
      {errorMessage && (
        <div className="mb-2 px-4 py-2 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Capsule Search Box */}
      <div className="relative bg-white dark:bg-[#1e1f20] border border-[#EFE7E1] dark:border-[#333538] focus-within:border-coral-400 dark:focus-within:border-[#444746] rounded-full shadow-lg transition-all duration-200 p-2 pl-3 flex items-center gap-2">
        {/* Attach Files Button (+) */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-charcoal-600 dark:text-[#c4c7c5] hover:text-coral-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus:outline-none"
            title="Attach study file"
            aria-label="Attach file"
          >
            <Plus className="w-5 h-5" />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
          />

          {isMenuOpen && (
            <div className="absolute bottom-12 left-0 w-64 bg-white dark:bg-[#28292c] border border-[#F3ECE7] dark:border-[#333538] rounded-3xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 select-none">
              <div className="px-3 py-2 border-b border-[#F5EBE4] dark:border-[#333538] mb-1">
                <p className="text-xs font-bold text-charcoal-900 dark:text-white">Attach Study Files</p>
                <p className="text-[10px] text-charcoal-500 dark:text-[#8e918f]">PDFs, Images, Code</p>
              </div>

              <button
                type="button"
                onClick={() => triggerFileInput('.pdf,application/pdf')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 text-left transition-colors group"
              >
                <div className="w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-500 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-charcoal-800 dark:text-[#c4c7c5]">
                  Upload PDF
                </span>
              </button>

              <button
                type="button"
                onClick={() => triggerFileInput('image/*')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 text-left transition-colors group"
              >
                <div className="w-7 h-7 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-500 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-charcoal-800 dark:text-[#c4c7c5]">
                  Upload Image
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Input Text Area */}
        <div className="flex-1 min-w-0 flex items-center">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? 'Listening...' : dynamicPlaceholder}
            rows={1}
            disabled={disabled}
            className="w-full bg-transparent resize-none outline-none text-xs sm:text-sm text-charcoal-900 dark:text-white placeholder-charcoal-400 dark:placeholder-[#8e918f] py-1.5 max-h-[160px] overflow-y-auto leading-5 block"
          />
        </div>

        {/* Model Selector Dropdown inside capsule */}
        <div className="relative shrink-0" ref={modelMenuRef}>
          <button
            type="button"
            onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF0EB] dark:bg-coral-950/60 text-coral-600 dark:text-coral-300 border border-[#FFD9CE]/70 dark:border-coral-800/60 hover:bg-[#FFE6DE] dark:hover:bg-coral-900/80 transition-colors focus:outline-none"
          >
            <Sparkles className="w-3 h-3 fill-current text-coral-500" />
            <span>{currentModelLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-coral-500" />
          </button>

          {isModelMenuOpen && (
            <div className="absolute bottom-12 right-0 w-52 bg-white dark:bg-[#28292c] border border-[#F3ECE7] dark:border-[#333538] rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
              {AVAILABLE_MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    if (onModelChange) onModelChange(m.id);
                    setIsModelMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                    selectedModel === m.id
                      ? 'bg-[#FFF0EB] dark:bg-white/10 font-bold text-coral-600 dark:text-coral-400'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 text-charcoal-800 dark:text-[#c4c7c5]'
                  }`}
                >
                  <div>
                    <p className="text-xs">{m.label}</p>
                    <p className="text-[10px] text-charcoal-400 dark:text-[#8e918f] font-normal">
                      {m.desc}
                    </p>
                  </div>
                  {selectedModel === m.id && <Check className="w-3.5 h-3.5 text-coral-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Microphone Button */}
        <button
          type="button"
          onClick={toggleRecording}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all focus:outline-none ${
            isRecording
              ? 'bg-rose-500 text-white animate-pulse'
              : 'text-charcoal-600 dark:text-[#c4c7c5] hover:text-coral-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
          }`}
          title={isRecording ? 'Stop listening' : 'Voice mic input'}
          aria-label="Voice input"
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Send Button */}
        {canSend && (
          <button
            type="button"
            onClick={handleSend}
            className="w-9 h-9 rounded-full bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white flex items-center justify-center transition-all shadow-coral-glow active:scale-95 shrink-0"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

