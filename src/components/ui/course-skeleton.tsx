import React from 'react';
import { Skeleton } from '@mui/material';

export function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Image skeleton */}
      <Skeleton variant="rectangular" width="100%" height={192} />
      
      {/* Content skeleton */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {/* Title skeleton */}
            <Skeleton variant="text" width="75%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="50%" height={16} />
          </div>
          <div className="flex gap-2 ml-4">
            {/* Action buttons skeleton */}
            <Skeleton variant="rounded" width={24} height={24} />
          </div>
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <Skeleton variant="text" width="100%" height={16} />
          <Skeleton variant="text" width="80%" height={16} />
          <Skeleton variant="text" width="60%" height={16} />
        </div>
      </div>
    </div>
  );
}

export function CourseGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center">
        <div className="p-3 bg-gray-100 rounded-lg">
          <Skeleton variant="rounded" width={24} height={24} />
        </div>
        <div className="ml-4 flex-1">
          <Skeleton variant="text" width={80} height={16} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={64} height={32} />
        </div>
      </div>
    </div>
  );
}