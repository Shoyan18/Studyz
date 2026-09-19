import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', circle = false }) => {
  return (
    <div
      className={clsx(
        'animate-pulse bg-[#F3ECE7]',
        circle ? 'rounded-full' : 'rounded-2xl',
        className
      )}
    />
  );
};
