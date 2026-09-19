'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChatSidebar } from '@/components/ai/ChatSidebar';
import { ConversationHeader } from '@/components/ai/ConversationHeader';
import { EmptyState } from '@/components/ai/EmptyState';
import { MessageItem } from '@/components/ai/MessageItem';
import { MessageComposer } from '@/components/ai/MessageComposer';
import { RenameModal } from '@/components/ai/RenameModal';
import { DeleteConfirmModal } from '@/components/ai/DeleteConfirmModal';
import { ChatConversation, ChatMessage, ChatAttachment } from '@/types';
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function AiPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [composerPrompt, setComposerPrompt] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modals state
  const [renameTarget, setRenameTarget] = useState<ChatConversation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ChatConversation | null>(null);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const skipLoadForConvIdRef = useRef<string | null>(null);
  const activeConversation = conversations.find((c) => c.id === activeConvId) || null;

  // Scroll to bottom smoothly
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, messages[messages.length - 1]?.content, scrollToBottom]);

  // Load user's conversations list on mount
  const loadConversations = useCallback(async (selectFirst = false) => {
    try {
      const res = await fetch('/api/ai/conversations');
      if (res.ok) {
        const data = await res.json();
        const convList: ChatConversation[] = data.conversations || [];
        setConversations(convList);

        if (selectFirst && convList.length > 0) {
          setActiveConvId(convList[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, []);

  useEffect(() => {
    loadConversations(false);
  }, [loadConversations]);

  // Load messages whenever activeConvId changes
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }

    if (skipLoadForConvIdRef.current === activeConvId) {
      skipLoadForConvIdRef.current = null;
      return;
    }

    let isMounted = true;
    async function loadMessages() {
      setIsLoadingMessages(true);
      try {
        const res = await fetch(`/api/ai/conversations/${activeConvId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.conversation) {
            setMessages(data.conversation.messages || []);
          }
        }
      } catch (err) {
        console.error('Error fetching conversation messages:', err);
      } finally {
        if (isMounted) setIsLoadingMessages(false);
      }
    }

    loadMessages();
    return () => {
      isMounted = false;
    };
  }, [activeConvId]);

  const [newChatCount, setNewChatCount] = useState(0);

  // Handle "+ New Chat"
  const handleNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
    setComposerPrompt('');
    setErrorMessage(null);
    setNewChatCount((prev) => prev + 1);
  };

  // Handle prompt suggestion clicked or submitted from EmptyState
  const handleSelectPrompt = (prompt: string) => {
    handleSendMessage(prompt, []);
  };

  // Handle sending a message with real-time streaming
  const handleSendMessage = async (content: string, _attachments: ChatAttachment[]) => {
    if (!content.trim() || isSending || isStreaming) return;

    setErrorMessage(null);
    setIsSending(true);

    const userTempId = `user-msg-${Date.now()}`;
    const aiTempId = `ai-msg-${Date.now()}`;

    const optimisticUserMsg: ChatMessage = {
      id: userTempId,
      conversationId: activeConvId || '',
      role: 'USER',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    const initialAiMsg: ChatMessage = {
      id: aiTempId,
      conversationId: activeConvId || '',
      role: 'ASSISTANT',
      content: '',
      isStreaming: true,
      createdAt: new Date().toISOString(),
    };

    // Append user message & empty streaming AI placeholder
    setMessages((prev) => [...prev, optimisticUserMsg, initialAiMsg]);
    setComposerPrompt('');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConvId || undefined,
          message: content.trim(),
          model: selectedModel,
        }),

      });

      if (!response.ok) {
        let errorData: any = null;
        try {
          errorData = await response.json();
        } catch {}
        const errorText =
          errorData?.error ||
          "STUDYZ AI couldn't respond right now. Please try again in a moment.";

        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiTempId
              ? {
                  ...m,
                  content: `> **Notice:** ${errorText}`,
                  isStreaming: false,
                  isError: true,
                }
              : m
          )
        );
        setIsSending(false);
        setIsStreaming(false);
        return;
      }

      // Check conversation ID from response headers
      const returnedConvId = response.headers.get('X-Conversation-Id');
      if (returnedConvId && returnedConvId !== activeConvId) {
        skipLoadForConvIdRef.current = returnedConvId;
        setActiveConvId(returnedConvId);
      }

      setIsStreaming(true);
      setIsSending(false);

      // Read SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;

          if (value) {
            const rawChunk = decoder.decode(value, { stream: true });
            const lines = rawChunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6).trim();
                if (!jsonStr) continue;

                try {
                  const parsed = JSON.parse(jsonStr);
                  if (parsed.chunk) {
                    accumulatedText += parsed.chunk;
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === aiTempId ? { ...m, content: accumulatedText } : m
                      )
                    );
                  } else if (parsed.error) {
                    accumulatedText = `> **Error:** ${parsed.error}`;
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === aiTempId
                          ? { ...m, content: accumulatedText, isError: true }
                          : m
                      )
                    );
                  } else if (parsed.done) {
                    if (parsed.fullText) {
                      accumulatedText = parsed.fullText;
                    }
                  }
                } catch {
                  // Ignore JSON parse errors for partial chunks
                }
              }
            }
          }
        }
      }

      // Finalize streaming state
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiTempId
            ? { ...m, content: accumulatedText || m.content, isStreaming: false }
            : m
        )
      );

      // Refresh conversation list in background to sync latest titles and previews
      loadConversations(false);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiTempId
            ? {
                ...m,
                content:
                  "> **Notice:** STUDYZ AI couldn't respond right now. Please check your network and try again.",
                isStreaming: false,
                isError: true,
              }
            : m
        )
      );
    } finally {
      setIsSending(false);
      setIsStreaming(false);
    }
  };

  // Feedback action (Helpful / Unhelpful)
  const handleFeedback = async (messageId: string, type: 'HELPFUL' | 'UNHELPFUL') => {
    // Optimistic update
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedback: m.feedback === type ? null : type } : m))
    );

    try {
      await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          feedback: type,
        }),
      });
    } catch (err) {
      console.error('Failed to submit message feedback:', err);
    }
  };

  // Regenerate last AI response
  const handleRegenerate = async (messageId: string) => {
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex <= 0) return;

    const previousUserMessage = messages[messageIndex - 1];
    if (previousUserMessage && previousUserMessage.role === 'USER') {
      // Remove AI message and re-send the prompt
      setMessages((prev) => prev.filter((_, idx) => idx !== messageIndex));
      await handleSendMessage(previousUserMessage.content, []);
    }
  };

  // Rename action
  const handleRenameConfirm = async (newTitle: string) => {
    if (!renameTarget) return;
    try {
      const res = await fetch(`/api/ai/conversations/${renameTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });

      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === renameTarget.id ? { ...c, title: newTitle } : c))
        );
      }
    } catch (err) {
      console.error('Error renaming conversation:', err);
    } finally {
      setRenameTarget(null);
    }
  };

  // Delete action
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    try {
      const res = await fetch(`/api/ai/conversations/${targetId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const remaining = conversations.filter((c) => c.id !== targetId);
        setConversations(remaining);
        if (activeConvId === targetId) {
          if (remaining.length > 0) {
            setActiveConvId(remaining[0].id);
          } else {
            handleNewChat();
          }
        }
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  // Copy full chat transcript
  const handleCopyFullChat = () => {
    if (messages.length === 0) return;
    const chatText = messages
      .map((m) => `[${m.role === 'USER' ? 'Student' : 'STUDYZ AI'}]:\n${m.content}`)
      .join('\n\n---\n\n');
    navigator.clipboard.writeText(chatText);
  };

  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');

  return (
    <AppLayout fullBleed hideHeader>
      <div className={`h-full w-full flex flex-row overflow-hidden transition-colors duration-200 ${isDarkMode ? 'dark bg-[#131314] text-white' : 'bg-[#FFF9F6] text-charcoal-900'}`}>
        {/* Desktop Chat History Sidebar */}
        {isHistorySidebarOpen && (
          <div className="hidden md:block h-full shrink-0 transition-all duration-300 animate-in slide-in-from-left duration-200">
            <ChatSidebar
              conversations={conversations}
              activeConversationId={activeConvId}
              onSelectConversation={(id) => setActiveConvId(id)}
              onNewChat={handleNewChat}
              onRename={(conv) => setRenameTarget(conv)}
              onDelete={(conv) => setDeleteTarget(conv)}
              onToggleSidebar={() => setIsHistorySidebarOpen(false)}
            />
          </div>
        )}

        {/* Mobile Slide-in Drawer for Chat History */}
        {isDrawerOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex animate-in fade-in">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsDrawerOpen(false)}
            />
            <div className="relative w-4/5 max-w-xs bg-white dark:bg-[#1e1f20] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
              <ChatSidebar
                conversations={conversations}
                activeConversationId={activeConvId}
                onSelectConversation={(id) => setActiveConvId(id)}
                onNewChat={handleNewChat}
                onRename={(conv) => setRenameTarget(conv)}
                onDelete={(conv) => setDeleteTarget(conv)}
                isMobileDrawer
                onCloseDrawer={() => setIsDrawerOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main AI Workspace Center */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#FFF9F6] dark:bg-[#131314] transition-colors duration-200">
          {/* Conversation Top Header */}
          <ConversationHeader
            conversation={activeConversation}
            onNewChat={handleNewChat}
            onRename={() => activeConversation && setRenameTarget(activeConversation)}
            onDelete={() => activeConversation && setDeleteTarget(activeConversation)}
            onOpenSidebarDrawer={() => setIsDrawerOpen(true)}
            onCopyAll={handleCopyFullChat}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleTheme}
            isSidebarOpen={isHistorySidebarOpen}
            onToggleSidebar={() => setIsHistorySidebarOpen(!isHistorySidebarOpen)}
          />

          {/* Conversation Area (Scrollable) */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-8 py-4 flex flex-col">
            {isLoadingMessages ? (
              <div className="flex-1 flex flex-col items-center justify-center text-charcoal-400 dark:text-[#8e918f] gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-coral-500" />
                <p className="text-xs font-semibold">Loading conversation...</p>
              </div>
            ) : messages.length === 0 ? (
              <EmptyState
                key={activeConvId || `empty-state-${newChatCount}`}
                onSelectPrompt={handleSelectPrompt}
                selectedModel={selectedModel}
                onSelectModel={(m) => setSelectedModel(m)}
              />
            ) : (
              <div className="max-w-3xl lg:max-w-4xl w-full mx-auto flex-1 flex flex-col justify-start">
                {messages.map((message) => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    userName="Scholar"
                    onRegenerate={handleRegenerate}
                    onFeedback={handleFeedback}
                  />
                ))}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>

          {/* Anchored Bottom Message Composer (Shown when conversation is active) */}
          {messages.length > 0 && (
            <div className="shrink-0 pt-1 bg-gradient-to-t from-[#FFF9F6] dark:from-[#131314] via-[#FFF9F6]/95 dark:via-[#131314]/95 to-transparent">
              <MessageComposer
                onSendMessage={handleSendMessage}
                disabled={isSending || isStreaming}
                initialValue={composerPrompt}
                placeholder="Ask Gemini..."
                selectedModel={selectedModel}
                onModelChange={(m) => setSelectedModel(m)}
              />
            </div>
          )}
        </div>
      </div>


      {/* Modals */}
      <RenameModal
        isOpen={!!renameTarget}
        initialTitle={renameTarget?.title || ''}
        onClose={() => setRenameTarget(null)}
        onRename={handleRenameConfirm}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        conversationTitle={deleteTarget?.title || ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </AppLayout>
  );
}
