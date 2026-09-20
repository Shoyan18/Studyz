import React, { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelRight?: React.ReactNode;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, labelRight, error, helperText, icon, rightElement, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor={inputId} className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-700 dark:text-gray-300">
              {label}
            </label>
            {labelRight}
          </div>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-charcoal-400 dark:text-gray-400 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-[#FCFAF8] dark:bg-[#121318] border border-[#EFE7E1] dark:border-[#2b2d38] rounded-2xl px-4 py-3 text-sm text-charcoal-800 dark:text-gray-100 placeholder-charcoal-400 dark:placeholder-gray-500 transition-all',
                'focus:outline-none focus:bg-white dark:focus:bg-[#16171d] focus:border-coral-400 dark:focus:border-coral-500 focus:ring-2 focus:ring-coral-100 dark:focus:ring-coral-500/20',
                'disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed',
                icon && 'pl-11',
                rightElement && 'pr-11',
                error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-100 dark:focus:ring-rose-900/30 bg-rose-50/20',
                className
              )
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3.5 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-rose-500 mt-1.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-charcoal-400 dark:text-gray-400 mt-1.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
