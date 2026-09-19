import React from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number; // 0 - 100
  color?: string; // Hex color or preset
  variant?: 'coral' | 'lavender' | 'amber' | 'mint' | 'custom';
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color,
  variant = 'coral',
  height = 'md',
  showLabel = false,
  className = '',
}) => {
  const safeValue = Math.min(100, Math.max(0, isNaN(value) ? 0 : value));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const gradientClasses = {
    coral: 'bg-gradient-to-r from-[#FFA088] to-[#FF704E]',
    lavender: 'bg-gradient-to-r from-[#B4A6FF] to-[#8C7CFF]',
    amber: 'bg-gradient-to-r from-[#FED7AA] to-[#FB923C]',
    mint: 'bg-gradient-to-r from-[#86EFAC] to-[#22C55E]',
    custom: '',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-charcoal-600 mb-1.5">
          <span>Progress</span>
          <span className="font-bold text-charcoal-800">{safeValue}%</span>
        </div>
      )}
      <div className={clsx('w-full bg-[#F3EBE5] rounded-full overflow-hidden', heightClasses[height])}>
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500 ease-out',
            variant !== 'custom' ? gradientClasses[variant] : ''
          )}
          style={{
            width: `${safeValue}%`,
            backgroundColor: variant === 'custom' && color ? color : undefined,
          }}
        />
      </div>
    </div>
  );
};
