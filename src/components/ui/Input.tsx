import React, { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-charcoal-400 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-[#FCFAF8] border border-[#EFE7E1] rounded-2xl px-4 py-3 text-sm text-charcoal-800 placeholder-charcoal-400 transition-all',
                'focus:outline-none focus:bg-white focus:border-coral-400 focus:ring-2 focus:ring-coral-100',
                'disabled:bg-gray-100 disabled:cursor-not-allowed',
                icon && 'pl-11',
                error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-100 bg-rose-50/20',
                className
              )
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs text-rose-500 mt-1.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-charcoal-400 mt-1.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
