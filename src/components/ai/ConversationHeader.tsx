'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  MoreVertical,
  Menu,
  Copy,
  Check,
  Moon,
  Sun,
  PenSquare,
  PanelLeftOpen,
  PanelLeftClose,
} from 'lucide-react';
import { ChatConversation } from '@/types';

interface ConversationHeaderProps {
  conversation: ChatConversation | null;
  onNewChat: () => void;
  onRename: () => void;
  onDelete: () => void;
  onOpenSidebarDrawer?: () => void;
  onCopyAll?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  onNewChat,
  onRename,
  onDelete,
  onOpenSidebarDrawer,
  onCopyAll,
  isDarkMode = true,
  onToggleDarkMode,
  isSidebarOpen = true,
  onToggleSidebar,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopy = () => {
    if (onCopyAll) {
      onCopyAll();
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
    setShowMoreMenu(false);
  };

  const title = conversation?.title || 'STUDYZ AI';

  return (
    <header className="h-14 px-4 md:px-6 border-b border-[#F3ECE7] dark:border-[#28292c] bg-white/80 dark:bg-[#131314]/90 backdrop-blur-md flex items-center justify-between shrink-0 select-none z-10 transition-colors duration-200">
      {/* Left: Desktop Sidebar Toggle & Mobile Drawer Toggle + Title */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex p-2 rounded-xl text-charcoal-600 dark:text-[#c4c7c5] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title={isSidebarOpen ? 'Collapse Chat History' : 'Expand Chat History'}
            aria-label="Toggle Chat History Sidebar"
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <PanelLeftOpen className="w-5 h-5 text-coral-500" />
            )}
          </button>
        )}

        {onOpenSidebarDrawer && (
          <button
            onClick={onOpenSidebarDrawer}
            className="md:hidden p-2 rounded-xl text-charcoal-600 dark:text-[#c4c7c5] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Open Chat History"
            aria-label="Open Chat History"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6.5 h-6.5 rounded-xl bg-gradient-to-tr from-coral-500 to-lavender-500 flex items-center justify-center text-white shrink-0 hidden sm:flex">
            <Sparkles className="w-3.5 h-3.5 fill-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-medium text-charcoal-900 dark:text-white truncate tracking-tight">
                {title}
              </h2>
              {conversation && (
                <button
                  onClick={onRename}
                  className="p-1 rounded-lg text-charcoal-400 dark:text-[#8e918f] hover:text-charcoal-700 dark:hover:text-white transition-colors"
                  title="Rename conversation"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Theme Toggle & Gemini Top-Right Pencil New Chat */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Dark/Light Mode Toggle */}
        {onToggleDarkMode && (
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-charcoal-600 dark:text-[#c4c7c5] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Gemini Dark Theme'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-charcoal-600" />}
          </button>
        )}

        {/* Gemini Pencil Edit Icon (New Chat) */}
        <button
          onClick={onNewChat}
          className="p-2 rounded-xl text-charcoal-600 dark:text-[#c4c7c5] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title="New Chat"
        >
          <PenSquare className="w-4 h-4" />
        </button>

        {conversation && (
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 rounded-xl text-charcoal-600 dark:text-[#c4c7c5] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMoreMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#28292c] border border-[#F3ECE7] dark:border-[#333538] rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={onRename}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-charcoal-700 dark:text-[#c4c7c5] hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-left"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Rename Chat
                  </button>
                  {onCopyAll && (
                    <button
                      onClick={handleCopy}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-charcoal-700 dark:text-[#c4c7c5] hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-left"
                    >
                      {copiedAll ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Full Chat
                        </>
                      )}
                    </button>
                  )}
                  <div className="my-1 border-t border-[#F5EBE4] dark:border-[#333538]" />
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      onDelete();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Chat
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

