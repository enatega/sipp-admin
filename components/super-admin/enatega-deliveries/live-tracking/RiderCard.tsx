'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';
import Status from '@/components/shared/Status';
import { cn } from '@/lib/utils';
import type { RiderTrackingItem } from './types';

interface RiderCardProps {
  item: RiderTrackingItem;
  isSelected: boolean;
  onClick: () => void;
}

export function RiderCard({ item, isSelected, onClick }: RiderCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative w-full rounded-xl border bg-white p-3 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md',
        isSelected && 'border-primary ring-1 ring-primary/30 shadow-md',
      )}
    >
      {isSelected && (
        <span className="absolute -left-2 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-full bg-primary" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Image
            src={item.riderAvatar}
            alt={item.riderName}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover"
            unoptimized
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {item.riderName}
            </p>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{item.riderRating.toFixed(1)}</span>
              <span>({item.riderReviews} reviews)</span>
            </div>
          </div>
        </div>

        <Status
          status={
            item.trackingStatus === 'busy'
              ? 'running'
              : item.trackingStatus === 'offline'
                ? 'inactive'
                : 'active'
          }
          label={
            item.trackingStatus === 'busy'
              ? 'Busy'
              : item.trackingStatus === 'offline'
                ? 'Offline'
                : 'Active'
          }
          className="shrink-0"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-accent px-2 py-1 text-[11px] font-medium text-muted-foreground">
          {item.riderPhone}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
        <span>{item.order?.orderId ?? 'No active order'}</span>
        <span>Updated: {item.lastUpdatedLabel}</span>
      </div>
    </button>
  );
}
