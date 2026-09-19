'use client';

import React, { useState, useEffect } from 'react';
import { isImageUrl, getInitials } from '@/lib/avatars';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface UserAvatarProps {
  avatarUrl?: string | null;
  name?: string;
  size?: AvatarSize;
  className?: string;
  rounded?: 'full' | '2xl' | '3xl';
  showBorder?: boolean;
  onClick?: () => void;
  interactive?: boolean;
  alt?: string;
  priority?: boolean;
}

const sizeConfig: Record<
  AvatarSize,
  { container: string; text: string; emoji: string; rounded: string }
> = {
  xs: {
    container: 'w-6 h-6 min-w-[24px]',
    text: 'text-[10px] font-bold',
    emoji: 'text-xs leading-none',
    rounded: 'rounded-lg',
  },
  sm: {
    container: 'w-8 h-8 min-w-[32px]',
    text: 'text-xs font-black',
    emoji: 'text-sm leading-none',
    rounded: 'rounded-xl',
  },
  md: {
    container: 'w-10 h-10 min-w-[40px]',
    text: 'text-sm font-black',
    emoji: 'text-lg leading-none',
    rounded: 'rounded-2xl',
  },
  lg: {
    container: 'w-14 h-14 min-w-[56px]',
    text: 'text-lg font-black',
    emoji: 'text-2xl leading-none',
    rounded: 'rounded-2xl',
  },
  xl: {
    container: 'w-20 h-20 min-w-[80px]',
    text: 'text-2xl font-black',
    emoji: 'text-4xl leading-none',
    rounded: 'rounded-3xl',
  },
  '2xl': {
    container: 'w-24 h-24 sm:w-28 sm:h-28 min-w-[96px]',
    text: 'text-3xl sm:text-4xl font-black',
    emoji: 'text-5xl sm:text-6xl leading-none',
    rounded: 'rounded-4xl',
  },
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  name = 'Scholar',
  size = 'md',
  className = '',
  rounded,
  showBorder = false,
  onClick,
  interactive = false,
  alt,
}) => {
  const [imgError, setImgError] = useState(false);

  // Reset img error if avatarUrl changes
  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  const cfg = sizeConfig[size] || sizeConfig.md;
  const roundedClass = rounded
    ? rounded === 'full'
      ? 'rounded-full'
      : rounded === '2xl'
      ? 'rounded-2xl'
      : 'rounded-3xl'
    : cfg.rounded;

  const isImg = isImageUrl(avatarUrl) && !imgError;
  const isEmoji = !isImg && Boolean(avatarUrl && avatarUrl.trim().length > 0);

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden select-none transition-transform ${
        cfg.container
      } ${roundedClass} ${
        isImg
          ? 'bg-gradient-to-tr from-coral-400/20 to-amber-300/20 dark:from-coral-950/40 dark:to-amber-950/40'
          : 'bg-gradient-to-tr from-coral-400 to-amber-300 shadow-coral-glow'
      } ${showBorder ? 'ring-2 ring-white dark:ring-[#2e313a] shadow-sm' : ''} ${
        interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${className}`}
      style={{
        WebkitBackfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
      }}
    >
      {isImg ? (
        <img
          src={avatarUrl!}
          alt={alt || name}
          className="w-full h-full object-cover object-center pointer-events-none select-none"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : isEmoji ? (
        <span className={`flex items-center justify-center pointer-events-none ${cfg.emoji}`}>
          {avatarUrl}
        </span>
      ) : (
        <span className={`text-white leading-none tracking-tight pointer-events-none ${cfg.text}`}>
          {getInitials(name)}
        </span>
      )}
    </div>
  );
};
