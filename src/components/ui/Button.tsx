import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'lavender' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-2xl transition-all focus:outline-none focus:ring-2 focus:ring-coral-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none active:scale-[0.98]';

    const variants = {
      primary: 'btn-coral text-white',
      lavender: 'btn-lavender text-white',
      secondary: 'bg-[#F9F5F2] hover:bg-[#F0EAE4] text-charcoal-800 border border-[#EFE5DE]',
      outline: 'border border-[#EBD9CE] bg-white hover:bg-[#FFF5F2] text-charcoal-700 hover:text-coral-600',
      ghost: 'bg-transparent hover:bg-[#FFF5F2] text-charcoal-600 hover:text-coral-600',
      danger: 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2.5 gap-2 h-11',
      lg: 'text-base px-6 py-3.5 gap-2.5 h-13',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
