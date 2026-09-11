'use client';

import { Skeleton } from '@/components/ui/skeleton';

const TicketDetailsSkeleton = () => {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="my-6">
        <Skeleton className="h-24 w-full rounded-md" />
      </div>
      <div className="flex flex-col-reverse lg:flex-row lg:flex-nowrap gap-6 space-y-6 lg:space-y-0">
        <div className="lg:w-[40%] w-full h-[665px]">
          <Skeleton className="h-full w-full rounded-md" />
        </div>
        <div className="lg:w-[60%] w-full">
          <Skeleton className="h-[665px] w-full rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsSkeleton;
