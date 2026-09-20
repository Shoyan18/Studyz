'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  MessageSquare,
  X,
  MoreHorizontal,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  PanelLeftClose,
} from 'lucide-react';
import { ChatConversation } from '@/types';

interface ChatSidebarProps {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRename: (conversation: ChatConversation) => void;
  onDelete: (conversation: ChatConversation) => void;
  isMobileDrawer?: boolean;
  onCloseDrawer?: () => void;
  onToggleSidebar?: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRename,
  onDelete,
  isMobileDrawer = false,
  onCloseDrawer,
  onToggleSidebar,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Group conversations by Today, Yesterday, Previous 7 days, Older
  const filteredAndGrouped = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = conversations.filter((c) => {
      if (!query) return true;
      const titleMatch = c.title.toLowerCase().includes(query);
      const previewMatch = c.lastMessagePreview?.toLowerCase().includes(query);
      return titleMatch || previewMatch;
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const sevenDaysAgo = today - 7 * 86400000;

    const groups: {
      today: ChatConversation[];
      yesterday: ChatConversation[];
      previous7Days: ChatConversation[];
      older: ChatConversation[];
    } = {
      today: [],
      yesterday: [],
      previous7Days: [],
      older: [],
    };

    filtered.forEach((conv) => {
      const convTime = new Date(conv.updatedAt || conv.createdAt).getTime();
      if (convTime >= today) {
        groups.today.push(conv);
      } else if (convTime >= yesterday) {
        groups.yesterday.push(conv);
      } else if (convTime >= sevenDaysAgo) {
        groups.previous7Days.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return { filtered, groups };
  }, [conversations, searchQuery]);

  const renderGroup = (title: string, list: ChatConversation[]) => {
    if (list.length === 0) return null;

    return (
      <div className="mb-4">
        <h4 className="px-3 mb-1.5 text-[11px] font-extrabold text-charcoal-400 dark:text-[#8e918f] uppercase tracking-wider">
          {title}
        </h4>
        <div className="space-y-1">
          {list.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const isMenuOpen = menuOpenId === conv.id;

            return (
              <div
                key={conv.id}
                className={`group relative flex items-center justify-between px-3 py-2 rounded-2xl cursor-pointer transition-all duration-150 ${
                  isActive
                    ? 'bg-[#FFF0EB] dark:bg-white/10 text-coral-600 dark:text-white font-bold border border-[#FFD9CE]/70 dark:border-[#333538]'
                    : 'text-charcoal-700 dark:text-[#c4c7c5] hover:bg-[#FAF4F0] dark:hover:bg-white/5 hover:text-charcoal-900 dark:hover:text-white border border-transparent'
                }`}
                onClick={() => {
                  onSelectConversation(conv.id);
                  if (onCloseDrawer) onCloseDrawer();
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  <MessageSquare
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-coral-500 stroke-[2.2]' : 'text-charcoal-400 dark:text-[#8e918f] group-hover:text-charcoal-600 dark:group-hover:text-white'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs truncate">{conv.title}</p>
                    {conv.lastMessagePreview && (
                      <p className="text-[10px] text-charcoal-400 dark:text-[#8e918f] truncate font-normal mt-0.5">
                        {conv.lastMessagePreview}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className="relative shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setMenuOpenId(isMenuOpen ? null : conv.id)}
                    className={`p-1 rounded-lg text-charcoal-400 dark:text-[#8e918f] hover:text-charcoal-700 dark:hover:text-white transition-opacity ${
                      isMenuOpen || isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    title="Conversation options"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>

                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setMenuOpenId(null)}
                      />
                      <div className="absolute right-0 top-6 w-36 bg-white dark:bg-[#28292c] border border-[#F3ECE7] dark:border-[#333538] rounded-2xl shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                        <button
                          onClick={() => {
                            setMenuOpenId(null);
                            onRename(conv);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-charcoal-700 dark:text-[#c4c7c5] hover:bg-[#FFF5F2] dark:hover:bg-white/10 hover:text-coral-600 font-medium text-left"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Rename
                        </button>
                        <button
                          onClick={() => {
                            setMenuOpenId(null);
                            onDelete(conv);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-medium text-left"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside
      className={`h-full bg-white/70 dark:bg-[#1e1f20] backdrop-blur-md border-r border-[#F3ECE7] dark:border-[#28292c] flex flex-col justify-between select-none transition-colors duration-200 ${
        isMobileDrawer ? 'w-full' : 'w-72 lg:w-80 shrink-0'
      }`}
    >
      {/* Top Header & New Chat Button */}
      <div className="p-4 border-b border-[#F3ECE7] dark:border-[#28292c]">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-coral-500 to-lavender-500 flex items-center justify-center text-white shadow-coral-glow">
              <Sparkles className="w-3.5 h-3.5 fill-white" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-charcoal-900 dark:text-white tracking-tight">
                STUDYZ AI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!isMobileDrawer && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-1.5 rounded-xl text-charcoal-400 dark:text-[#8e918f] hover:text-charcoal-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Collapse Chat History Sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}

            {isMobileDrawer && onCloseDrawer && (
              <button
                onClick={onCloseDrawer}
                className="p-1.5 rounded-xl text-charcoal-400 dark:text-[#8e918f] hover:text-charcoal-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* + New Chat CTA */}
        <button
          onClick={() => {
            onNewChat();
            if (onCloseDrawer) onCloseDrawer();
          }}
          className="w-full btn-coral py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-coral-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Chat</span>
        </button>

        {/* Search bar */}
        <div className="mt-3 relative">
          <Search className="w-3.5 h-3.5 text-charcoal-400 dark:text-[#8e918f] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-[#FAF6F3] dark:bg-[#131314] border border-[#EFE7E1] dark:border-[#333538] rounded-2xl pl-8 pr-7 py-2 text-xs text-charcoal-900 dark:text-white placeholder-charcoal-400 dark:placeholder-[#8e918f] focus:outline-none focus:border-coral-400 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal-400 dark:text-[#8e918f] hover:text-charcoal-700 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Conversation Groups (Scrollable) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3">
        {filteredAndGrouped.filtered.length === 0 ? (
          <div className="py-12 text-center px-4">
            <MessageSquare className="w-8 h-8 text-charcoal-300 dark:text-[#8e918f] mx-auto mb-2 opacity-60" />
            <p className="text-xs font-bold text-charcoal-600 dark:text-[#c4c7c5]">No conversations found.</p>
            <p className="text-[11px] text-charcoal-400 dark:text-[#8e918f] mt-0.5">
              {searchQuery ? 'Try a different search term.' : 'Start a new chat to begin studying.'}
            </p>
          </div>
        ) : (
          <>
            {renderGroup('Today', filteredAndGrouped.groups.today)}
            {renderGroup('Yesterday', filteredAndGrouped.groups.yesterday)}
            {renderGroup('Previous 7 days', filteredAndGrouped.groups.previous7Days)}
            {renderGroup('Older', filteredAndGrouped.groups.older)}
          </>
        )}
      </div>
    </aside>
  );
};




