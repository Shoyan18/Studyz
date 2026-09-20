'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Image as ImageIcon,
  Film,
  File,
  Volume2,
  VolumeX,
  User,
} from 'lucide-react';
import { ChatMessage, ChatAttachment } from '@/types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface MessageItemProps {
  message: ChatMessage;
  userName?: string;
  userAvatar?: string | null;
  onRegenerate?: (messageId: string) => void;
  onFeedback?: (messageId: string, type: 'HELPFUL' | 'UNHELPFUL') => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  userName = 'You',
  userAvatar,
  onRegenerate,
  onFeedback,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isAi = message.role === 'ASSISTANT';

  // Speech Synthesis Cleanup & Voice Pre-loader
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Pre-warm voices list for instant female voice selection
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
      }
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      // Clean markdown formatting & math expressions for natural speech reading
      const cleanText = message.content
        .replace(/```[\s\S]*?```/g, 'Code snippet.')
        .replace(/\$\$[\s\S]*?\$\$/g, 'Mathematical equation.')
        .replace(/[#*`_~]/g, '')
        .replace(/\n+/g, ' ');

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Select top available realistic female voice
      const voices = window.speechSynthesis.getVoices();
      
      const preferredFemaleVoices = [
        'Microsoft Aria Online (Natural)',
        'Microsoft Jenny Online (Natural)',
        'Microsoft Ana Online (Natural)',
        'Google UK English Female',
        'Google US English',
        'Microsoft Zira',
        'Microsoft Zira Desktop',
        'Samantha',
        'Victoria',
        'Karen',
        'Fiona',
        'Moira',
        'Veena',
        'Serena',
      ];

      let selectedVoice: SpeechSynthesisVoice | undefined;

      // 1. Check preferred list
      for (const pref of preferredFemaleVoices) {
        const match = voices.find((v) => v.name.toLowerCase().includes(pref.toLowerCase()));
        if (match) {
          selectedVoice = match;
          break;
        }
      }

      // 2. Fallback: match any voice with female indicators
      if (!selectedVoice) {
        selectedVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.toLowerCase().includes('female') ||
              v.name.toLowerCase().includes('zira') ||
              v.name.toLowerCase().includes('samantha') ||
              v.name.toLowerCase().includes('aria') ||
              v.name.toLowerCase().includes('jenny'))
        );
      }

      // 3. Fallback: match any English non-male voice
      if (!selectedVoice) {
        selectedVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            !v.name.toLowerCase().includes('david') &&
            !v.name.toLowerCase().includes('mark') &&
            !v.name.toLowerCase().includes('male') &&
            !v.name.toLowerCase().includes('george')
        );
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.15; // Higher pitch for smooth, pleasant female vocal tone
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const getAttachmentIcon = (cat: string) => {
    switch (cat) {
      case 'PDF':
        return <FileText className="w-3.5 h-3.5 text-rose-500" />;
      case 'IMAGE':
        return <ImageIcon className="w-3.5 h-3.5 text-sky-500" />;
      case 'VIDEO':
        return <Film className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <File className="w-3.5 h-3.5 text-charcoal-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isAi) {
    // User Message (Right-aligned bubble)
    return (
      <div className="flex justify-end gap-3 my-4 group animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex flex-col items-end max-w-[88%] sm:max-w-[75%]">
          {/* File attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2 justify-end">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-[#F0E4DC] shadow-xs text-xs font-semibold text-charcoal-800"
                >
                  {getAttachmentIcon(att.category)}
                  <span className="max-w-[140px] truncate">{att.fileName}</span>
                  <span className="text-[10px] text-charcoal-400">({formatFileSize(att.size)})</span>
                </div>
              ))}
            </div>
          )}

          {/* User Message Card */}
          <div className="px-4 py-3 sm:px-5 sm:py-3.5 rounded-3xl rounded-tr-xs bg-gradient-to-br from-[#FFF0EB] via-[#FFEBE4] to-[#FFE4DC] dark:from-[#3a251f] dark:to-[#2a1a16] border border-[#FFD9CE] dark:border-[#52342b] text-charcoal-900 dark:text-amber-50 shadow-xs text-xs sm:text-sm font-medium leading-relaxed">
            <MarkdownRenderer content={message.content} />
          </div>

          <span className="text-[10px] font-semibold text-charcoal-400 dark:text-gray-400 mt-1 px-1">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* User Avatar */}
        <UserAvatar
          avatarUrl={userAvatar}
          name={userName}
          size="sm"
          rounded="2xl"
          className="mt-0.5"
        />
      </div>
    );
  }

  // AI Message (Left-aligned structured card)
  return (
    <div className="flex items-start gap-3 my-5 group animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* STUDYZ AI Avatar */}
      <div className="w-8.5 h-8.5 rounded-2xl bg-gradient-to-tr from-coral-500 via-coral-400 to-lavender-500 flex items-center justify-center text-white shadow-coral-glow shrink-0 mt-0.5">
        <Sparkles className="w-4.5 h-4.5 fill-white" />
      </div>

      <div className="flex-1 min-w-0">
        {/* AI Header Line */}
        <div className="flex items-center gap-2 mb-1.5 select-none">
          <span className="text-xs font-extrabold text-charcoal-900 dark:text-white tracking-tight">
            STUDYZ AI
          </span>
          <span className="text-[10px] font-medium text-charcoal-400 dark:text-gray-400">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>

          {/* Audio Wave Visualizer when speaking */}
          {isSpeaking && (
            <div className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-coral-50 dark:bg-coral-950/80 border border-coral-200 dark:border-coral-800">
              <span className="w-1 h-3 rounded-full bg-coral-500 animate-pulse" />
              <span className="w-1 h-4 rounded-full bg-coral-500 animate-bounce" />
              <span className="w-1 h-2 rounded-full bg-coral-500 animate-pulse" />
              <span className="text-[10px] font-bold text-coral-600 dark:text-coral-300 ml-1">Reading...</span>
            </div>
          )}
        </div>

        {/* AI Answer Container Card */}
        <div className="relative bg-white dark:bg-[#212328] rounded-3xl p-4 sm:p-5 border border-[#F0E4DC] dark:border-[#2e313a] shadow-soft transition-all duration-200">
          {/* Top subtle gradient accent line */}
          <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-coral-400 via-lavender-400 to-amber-300 rounded-full" />

          {/* Render structured markdown */}
          <MarkdownRenderer content={message.content} />

          {/* Dynamic Streaming / Thinking Indicator */}
          {message.isStreaming && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#F5EBE4] dark:border-[#2e313a] text-xs font-semibold text-coral-600 dark:text-coral-400">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-coral-500 animate-ping" />
                <span className="w-1.5 h-1.5 rounded-full bg-coral-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-coral-500 animate-bounce [animation-delay:0.2s]" />
              </div>
              <span className="tracking-wide">Formulating step-by-step answer...</span>
            </div>
          )}
        </div>

        {/* AI Action Tool Bar */}
        {!message.isStreaming && (
          <div className="flex flex-wrap items-center gap-1 mt-2 text-charcoal-500 dark:text-gray-400 select-none">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold hover:bg-white dark:hover:bg-[#282a30] hover:text-charcoal-900 dark:hover:text-white border border-transparent hover:border-[#EFE7E1] dark:hover:border-[#333640] transition-all shadow-2xs"
              title="Copy response text"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Read Aloud (Text to Speech) */}
            <button
              onClick={toggleSpeech}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all shadow-2xs ${
                isSpeaking
                  ? 'bg-coral-500 text-white border-coral-500'
                  : 'hover:bg-white dark:hover:bg-[#282a30] hover:text-charcoal-900 dark:hover:text-white border-transparent hover:border-[#EFE7E1] dark:hover:border-[#333640]'
              }`}
              title={isSpeaking ? 'Stop reading' : 'Listen to AI answer'}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Read Aloud</span>
                </>
              )}
            </button>

            {/* Regenerate Button */}
            {onRegenerate && (
              <button
                onClick={() => onRegenerate(message.id)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold hover:bg-white dark:hover:bg-[#282a30] hover:text-charcoal-900 dark:hover:text-white border border-transparent hover:border-[#EFE7E1] dark:hover:border-[#333640] transition-all shadow-2xs"
                title="Regenerate AI answer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>
            )}

            {/* Helpful / Unhelpful feedback */}
            {onFeedback && (
              <div className="flex items-center gap-0.5 ml-1 pl-1 border-l border-[#F0E4DC] dark:border-[#2e313a]">
                <button
                  onClick={() => onFeedback(message.id, 'HELPFUL')}
                  className={`p-1.5 rounded-xl hover:bg-white dark:hover:bg-[#282a30] border border-transparent hover:border-[#EFE7E1] dark:hover:border-[#333640] transition-all ${
                    message.feedback === 'HELPFUL' ? 'text-coral-500 bg-coral-50 dark:bg-coral-950/60 border-coral-200 dark:border-coral-800' : 'text-charcoal-400 dark:text-gray-400 hover:text-charcoal-800 dark:hover:text-white'
                  }`}
                  title="Mark as helpful answer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onFeedback(message.id, 'UNHELPFUL')}
                  className={`p-1.5 rounded-xl hover:bg-white dark:hover:bg-[#282a30] border border-transparent hover:border-[#EFE7E1] dark:hover:border-[#333640] transition-all ${
                    message.feedback === 'UNHELPFUL' ? 'text-coral-500 bg-coral-50 dark:bg-coral-950/60 border-coral-200 dark:border-coral-800' : 'text-charcoal-400 dark:text-gray-400 hover:text-charcoal-800 dark:hover:text-white'
                  }`}
                  title="Mark as unhelpful answer"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

