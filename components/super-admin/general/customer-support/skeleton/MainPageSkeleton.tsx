'use client';

import { Skeleton } from '@/components/ui/skeleton';

const MainPageSkeleton = () => {
  return (
    <div>
      <Skeleton className="h-9 w-64 mb-4" />
      <div className="mt-4">
        <div className="flex gap-2 flex-wrap items-center">
          <Skeleton className="h-11 min-w-[400px] rounded-md" />
          <Skeleton className="h-11 w-48 rounded-md" />
          <Skeleton className="h-11 w-48 rounded-md" />
          <Skeleton className="h-11 w-48 rounded-md" />
        </div>
      </div>
      <div className="flex flex-col-reverse lg:flex-row gap-6 mt-4">
        <div className="w-full md:w-[300px] lg:w-[420px]">
          <Skeleton className="h-[600px] w-full rounded-md" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-[600px] w-full rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default MainPageSkeleton;
