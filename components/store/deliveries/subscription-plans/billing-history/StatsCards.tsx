'use client';

import { StoreBillingHistoryCards } from '@/types';
import { CalendarClock, CreditCard, ReceiptText } from 'lucide-react';

type Props = {
  cards?: StoreBillingHistoryCards | null;
};

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export function BillingStatsCards({ cards }: Props) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg bg-accent p-4">
          <p className="mb-1 flex items-center gap-2 text-sm text-mute">
            <ReceiptText className="size-4" /> Total paid
          </p>
          <p className="text-2xl font-semibold">
            ${cards?.totalEarnings?.toFixed(2) ?? '0.00'}
          </p>
        </div>
        <div className="rounded-lg bg-accent p-4">
          <p className="mb-1 flex items-center gap-2 text-sm text-mute">
            <CalendarClock className="size-4" /> Next charge
          </p>
          <p className="text-2xl font-semibold">
            {formatDate(cards?.nextCharge)}
          </p>
        </div>
        <div className="rounded-lg bg-accent p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="mb-1 flex items-center gap-2 text-sm text-mute">
                <CreditCard className="size-4" /> Payment method
              </p>
              <p className="text-2xl font-semibold">
                {cards?.paymentMethod || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
