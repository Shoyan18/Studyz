import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  variant?: 'coral' | 'lavender' | 'amber' | 'mint' | 'neutral' | 'blue';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'coral',
  size = 'md',
  children,
  className,
}) => {
  const variants = {
    coral: 'bg-[#FFF0EB] text-[#FF704E] border border-[#FFD6CB]/60',
    lavender: 'bg-[#F0EDFF] text-[#7C6AFF] border border-[#DFD7FE]/60',
    amber: 'bg-[#FFF5EB] text-[#D97706] border border-[#FDE68A]/60',
    mint: 'bg-[#ECFDF5] text-[#059669] border border-[#BBF7D0]/60',
    blue: 'bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD]/60',
    neutral: 'bg-[#F4EFEA] text-[#524B46] border border-[#E8DDD4]',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-semibold rounded-lg',
    md: 'text-xs px-2.5 py-1 font-bold rounded-xl',
  };

  return (
    <span
      className={twMerge(
        clsx('inline-flex items-center gap-1 leading-none tracking-wide select-none', variants[variant], sizes[size], className)
      )}
    >
      {children}
    </span>
  );
};
