'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-900/40 dark:bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${widthClasses[maxWidth]} bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-3xl shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150 text-charcoal-900 dark:text-gray-100`}
      >
        <div className="flex items-start justify-between pb-4 border-b border-[#F5EBE4] dark:border-[#2e313a]">
          <div>
            <h3 className="text-xl font-bold text-charcoal-900 dark:text-white">{title}</h3>
            {subtitle && <p className="text-xs text-charcoal-500 dark:text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-charcoal-400 dark:text-gray-400 hover:text-charcoal-700 dark:hover:text-white hover:bg-[#FFF2EE] dark:hover:bg-[#252832] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
};
