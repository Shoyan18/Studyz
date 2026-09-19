'use client';

import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  conversationTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  conversationTitle,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-charcoal-900/30 backdrop-blur-xs animate-in fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white dark:bg-[#1a1b20] rounded-3xl p-6 shadow-2xl border border-[#F3ECE7] dark:border-[#2e313a] animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center">
            <Trash2 className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-charcoal-400 dark:text-gray-400 hover:text-charcoal-700 dark:hover:text-white hover:bg-[#FFF5F2] dark:hover:bg-[#252832]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3">
          <h3 className="text-base font-bold text-charcoal-900 dark:text-white">Delete Conversation?</h3>
          <p className="text-xs text-charcoal-500 dark:text-gray-400 mt-1.5 leading-relaxed">
            Are you sure you want to delete <strong className="text-charcoal-800 dark:text-gray-200">&quot;{conversationTitle}&quot;</strong>? All associated messages will be permanently removed.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-2xl text-xs font-bold text-charcoal-600 dark:text-gray-300 hover:bg-[#FAF4F0] dark:hover:bg-[#252832]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-2xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
