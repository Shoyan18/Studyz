'use client';

import React, { useState, useEffect } from 'react';
import { Edit3, X, Check } from 'lucide-react';

interface RenameModalProps {
  isOpen: boolean;
  initialTitle: string;
  onClose: () => void;
  onRename: (newTitle: string) => void;
}

export const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  initialTitle,
  onClose,
  onRename,
}) => {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onRename(title.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-charcoal-900/30 backdrop-blur-xs animate-in fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#F3ECE7] animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-[#F5EBE4]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-coral-50 text-coral-500 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-charcoal-900">Rename Conversation</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-charcoal-400 hover:text-charcoal-700 hover:bg-[#FFF5F2]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-charcoal-700 mb-1.5">
              Conversation Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Newton's Third Law"
              autoFocus
              className="w-full bg-[#FAF6F3] border border-[#EFE7E1] rounded-2xl px-4 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:border-coral-400 focus:ring-2 focus:ring-coral-100"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl text-xs font-bold text-charcoal-600 hover:bg-[#FAF4F0]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="btn-coral px-5 py-2 rounded-2xl text-xs font-bold shadow-coral-glow disabled:opacity-50"
            >
              Save Title
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
