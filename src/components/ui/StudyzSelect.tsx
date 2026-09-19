'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  ReactNode,
} from 'react';
import { ChevronDown, Check, Search, X, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface StudyzSelectOption<T = string | number> {
  value: T;
  label: string;
  icon?: ReactNode;
  description?: string;
  secondaryText?: string;
  disabled?: boolean;
}

export interface StudyzSelectProps<T = string | number> {
  label?: string;
  placeholder?: string;
  value?: T;
  defaultValue?: T;
  options?: StudyzSelectOption<T>[];
  onChange?: (value: T) => void;
  icon?: ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  isLoading?: boolean;
  className?: string;
  dropdownClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  children?: ReactNode; // For backwards compatibility with <option> tags
  id?: string;
  name?: string;
  required?: boolean;
  clearable?: boolean;
}

export function StudyzSelect<T extends string | number = string>({
  label,
  placeholder = 'Select an option',
  value: controlledValue,
  defaultValue,
  options: propOptions,
  onChange,
  icon,
  searchable = false,
  searchPlaceholder = 'Search...',
  disabled = false,
  error,
  helperText,
  isLoading = false,
  className,
  dropdownClassName,
  size = 'md',
  children,
  id: customId,
  name,
  required,
  clearable = false,
}: StudyzSelectProps<T>) {
  const generatedId = useId();
  const selectId = customId || (label ? label.toLowerCase().replace(/\s+/g, '-') : generatedId);

  // Extract options from children if <option> tags are passed
  const extractedOptions: StudyzSelectOption<T>[] = React.useMemo(() => {
    if (propOptions && propOptions.length > 0) {
      return propOptions;
    }

    if (!children) return [];

    const opts: StudyzSelectOption<T>[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === 'option') {
        const val = (child.props.value !== undefined ? child.props.value : child.props.children) as T;
        const text = String(child.props.children || child.props.label || val);
        opts.push({
          value: val,
          label: text,
          disabled: child.props.disabled,
        });
      }
    });
    return opts;
  }, [propOptions, children]);

  // State
  const [internalValue, setInternalValue] = useState<T | undefined>(
    controlledValue !== undefined ? controlledValue : defaultValue
  );
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [dropUpward, setDropUpward] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  // Sync controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;

  const selectedOption = extractedOptions.find((opt) => String(opt.value) === String(currentValue));

  // Filtered options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return extractedOptions;
    const q = searchQuery.toLowerCase().trim();
    return extractedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.description && opt.description.toLowerCase().includes(q)) ||
        (opt.secondaryText && opt.secondaryText.toLowerCase().includes(q))
    );
  }, [extractedOptions, searchQuery]);

  // Determine if search input should be visible
  const showSearch = searchable || extractedOptions.length > 7;

  // Reposition dropdown if it might overflow the viewport
  const checkPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = Math.min(320, filteredOptions.length * 48 + (showSearch ? 50 : 20));

    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      setDropUpward(true);
    } else {
      setDropUpward(false);
    }
  }, [filteredOptions.length, showSearch]);

  const handleOpen = () => {
    if (disabled || isLoading) return;
    checkPosition();
    setIsOpen(true);
    setSearchQuery('');
    const curIdx = filteredOptions.findIndex((opt) => String(opt.value) === String(currentValue));
    setHighlightedIndex(curIdx >= 0 ? curIdx : 0);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
  };

  const handleSelect = (option: StudyzSelectOption<T>) => {
    if (option.disabled) return;
    if (controlledValue === undefined) {
      setInternalValue(option.value);
    }
    onChange?.(option.value);
    handleClose();
    triggerRef.current?.focus();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (controlledValue === undefined) {
      setInternalValue('' as unknown as T);
    }
    onChange?.('' as unknown as T);
  };

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      window.addEventListener('resize', checkPosition);
      window.addEventListener('scroll', checkPosition, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      window.removeEventListener('resize', checkPosition);
      window.removeEventListener('scroll', checkPosition, true);
    };
  }, [isOpen, checkPosition]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showSearch]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOpen();
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        handleClose();
        triggerRef.current?.focus();
        break;

      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
          scrollOptionIntoView(next);
          return next;
        });
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
          scrollOptionIntoView(next);
          return next;
        });
        break;

      case 'Enter':
      case ' ':
        if (showSearch && e.target === searchInputRef.current && e.key === ' ') {
          // Allow typing spaces in search input
          return;
        }
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;

      case 'Tab':
        handleClose();
        break;
    }
  };

  const scrollOptionIntoView = (index: number) => {
    if (!listboxRef.current) return;
    const items = listboxRef.current.querySelectorAll('li');
    if (items[index]) {
      items[index].scrollIntoView({ block: 'nearest' });
    }
  };

  // Size styles
  const sizeStyles = {
    sm: 'py-2 px-3 text-xs min-h-[38px] rounded-xl',
    md: 'py-2.5 px-4 text-sm min-h-[46px] rounded-2xl',
    lg: 'py-3.5 px-5 text-base min-h-[54px] rounded-2xl',
  };

  return (
    <div ref={containerRef} className={twMerge('w-full relative', className)} onKeyDown={handleKeyDown}>
      {/* Hidden native input for form submissions / accessibility */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={currentValue !== undefined ? String(currentValue) : ''}
          required={required}
        />
      )}

      {/* Label */}
      {label && (
        <label
          htmlFor={selectId}
          onClick={() => triggerRef.current?.focus()}
          className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-gray-300 mb-1.5"
        >
          {label}
          {required && <span className="text-coral-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        disabled={disabled || isLoading}
        onClick={() => (isOpen ? handleClose() : handleOpen())}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? selectId : undefined}
        className={twMerge(
          clsx(
            'w-full flex items-center justify-between gap-2.5 bg-[#FCFAF8] dark:bg-[#1a1b20] border border-[#EFE7E1] dark:border-[#2e313a] text-charcoal-800 dark:text-gray-200 transition-all cursor-pointer font-medium select-none text-left',
            'hover:border-[#E5D7CD] dark:hover:border-gray-600 hover:bg-[#FAF6F3] dark:hover:bg-[#22242b]',
            'focus:outline-none focus:bg-white dark:focus:bg-[#1a1b20] focus:border-coral-400 focus:ring-3 focus:ring-coral-100 dark:focus:ring-coral-900/40',
            sizeStyles[size],
            isOpen && 'bg-white dark:bg-[#1a1b20] border-coral-400 ring-3 ring-coral-100 dark:ring-coral-900/40 shadow-sm',
            disabled && 'bg-gray-50 dark:bg-gray-900 text-charcoal-400 dark:text-gray-600 border-gray-200 dark:border-gray-800 cursor-not-allowed opacity-75',
            error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-100 bg-rose-50/20'
          )
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Leading Icon */}
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-coral-500 animate-spin shrink-0" />
          ) : icon ? (
            <span className="text-charcoal-500 dark:text-gray-400 shrink-0 flex items-center">{icon}</span>
          ) : selectedOption?.icon ? (
            <span className="shrink-0 flex items-center">{selectedOption.icon}</span>
          ) : null}

          {/* Selected value or placeholder */}
          <span
            className={twMerge(
              'truncate block',
              !selectedOption && 'text-charcoal-400 dark:text-gray-500 font-normal'
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {clearable && selectedOption && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-1 text-charcoal-400 dark:text-gray-400 hover:text-charcoal-700 dark:hover:text-white rounded-lg hover:bg-[#EFE7E1]/50 dark:hover:bg-[#252832] transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}

          <ChevronDown
            className={twMerge(
              'w-4 h-4 text-charcoal-400 dark:text-gray-400 transition-transform duration-200 ease-out',
              isOpen && 'rotate-180 text-coral-500'
            )}
          />
        </div>
      </button>

      {/* Floating Popover Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={twMerge(
            clsx(
              'absolute z-50 left-0 right-0 min-w-[200px] bg-white dark:bg-[#1a1b20] border border-[#EFE7E1] dark:border-[#2e313a] rounded-3xl p-1.5 shadow-soft-lg',
              'animate-in fade-in zoom-in-95 duration-150 ease-out',
              dropUpward ? 'bottom-full mb-2' : 'top-full mt-2',
              dropdownClassName
            )
          )}
        >
          {/* Search Box */}
          {showSearch && (
            <div className="p-1.5 pb-2 mb-1 border-b border-[#F5EBE4] dark:border-[#2e313a]">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-charcoal-400 dark:text-gray-500 absolute left-3 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  className="w-full bg-[#FAF7F4] dark:bg-[#212328] border border-[#EFE7E1] dark:border-[#2e313a] rounded-xl pl-8 pr-7 py-1.5 text-xs text-charcoal-800 dark:text-gray-200 placeholder-charcoal-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-[#1a1b20] focus:border-coral-400 focus:ring-2 focus:ring-coral-100 dark:focus:ring-coral-900/40"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2.5 text-charcoal-400 dark:text-gray-500 hover:text-charcoal-600 dark:hover:text-gray-300 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options Listbox */}
          <ul
            ref={listboxRef}
            role="listbox"
            tabIndex={-1}
            className="max-h-60 overflow-y-auto space-y-1 p-0.5 custom-scrollbar focus:outline-none"
          >
            {filteredOptions.length === 0 ? (
              <li className="py-4 px-3 text-center text-xs text-charcoal-400 dark:text-gray-500 font-medium">
                No matching options
              </li>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = String(opt.value) === String(currentValue);
                const isHighlighted = idx === highlightedIndex;

                return (
                  <li
                    key={String(opt.value) + idx}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={twMerge(
                      clsx(
                        'flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition-colors select-none text-xs sm:text-sm font-medium',
                        isSelected
                          ? 'bg-[#FFF0EB] dark:bg-coral-950/60 text-coral-600 dark:text-coral-400 font-bold'
                          : 'text-charcoal-800 dark:text-gray-200',
                        isHighlighted && !isSelected && 'bg-[#FAF7F4] dark:bg-[#252832] text-charcoal-900 dark:text-white',
                        opt.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'
                      )
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {opt.icon && <span className="shrink-0 flex items-center">{opt.icon}</span>}
                      <div className="min-w-0 flex-1">
                        <p className="truncate leading-tight">{opt.label}</p>
                        {opt.description && (
                          <p className="text-[11px] font-normal text-charcoal-400 dark:text-gray-400 truncate mt-0.5">
                            {opt.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {opt.secondaryText && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 dark:text-gray-400 bg-white/80 dark:bg-[#22242b] px-2 py-0.5 rounded-md border border-[#EFE7E1] dark:border-[#2e313a]">
                          {opt.secondaryText}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-4 h-4 text-coral-500 stroke-[2.5] shrink-0" />
                      )}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {/* Error & Helper text */}
      {error ? (
        <p className="text-xs text-rose-500 mt-1.5 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-charcoal-400 mt-1.5">{helperText}</p>
      ) : null}
    </div>
  );
}

export default StudyzSelect;
