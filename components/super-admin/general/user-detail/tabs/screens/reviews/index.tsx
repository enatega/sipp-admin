'use client';

import { lazy, Suspense } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { TableShimmer } from '@/components/shared/TableShimmer';

// Lazy load review components
const ReviewsGiven = lazy(() =>
  import('./ReviewsGiven').then((mod) => ({
    default: mod.ReviewsGiven,
  })),
);
interface ReviewsProps {
  userId: string;
}

export function Reviews({ userId }: ReviewsProps) {
  return (
    <Suspense
      fallback={
        <div className="rounded-md border">
          <Table>
            <TableBody>
              <TableShimmer limit={10} columns={4} />
            </TableBody>
          </Table>
        </div>
      }
    >
      <ReviewsGiven userId={userId} />
    </Suspense>
  );
}
