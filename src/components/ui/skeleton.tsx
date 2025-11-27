import React from 'react';
import { Skeleton as MuiSkeleton, SkeletonProps } from '@mui/material';
import { cn } from '@/lib/utils';

interface CustomSkeletonProps extends Omit<SkeletonProps, 'className'> {
  className?: string;
}

function Skeleton({ className, ...props }: CustomSkeletonProps) {
  return (
    <MuiSkeleton
      className={cn('', className)}
      {...props}
    />
  );
}

export { Skeleton };