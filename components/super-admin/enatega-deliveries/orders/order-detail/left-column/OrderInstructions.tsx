'use client';

import { OrderDetail } from '@/types';
import { Bike, MessageSquareText, Store } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Heading } from '@/components/shared/Heading';

interface OrderInstructionsProps {
  order: OrderDetail;
}

export function OrderInstructions({ order }: OrderInstructionsProps) {
  const t = useTranslations('orders.orderDetail.instructions');
  const restaurantNote = order.orderNotes?.restaurantNote?.trim();
  const courierNote = order.orderNotes?.courierNote?.trim();

  if (!restaurantNote && !courierNote) return null;

  return (
    <section className="rounded-[12px] border border-sidebar-border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <Heading title={t('title')} containerClassName="mb-0" />
        <MessageSquareText
          aria-hidden="true"
          className="size-5 shrink-0 text-primary"
        />
      </div>

      <dl className="mt-6 grid gap-5 sm:grid-cols-2">
        {restaurantNote ? (
          <div className="min-w-0">
            <dt className="flex items-center gap-2 text-sm font-semibold text-black">
              <Store
                aria-hidden="true"
                className="size-4 shrink-0 text-primary"
              />
              {t('storeLabel')}
            </dt>
            <dd className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-mute">
              {restaurantNote}
            </dd>
          </div>
        ) : null}

        {courierNote ? (
          <div className="min-w-0">
            <dt className="flex items-center gap-2 text-sm font-semibold text-black">
              <Bike
                aria-hidden="true"
                className="size-4 shrink-0 text-primary"
              />
              {t('courierLabel')}
            </dt>
            <dd className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-mute">
              {courierNote}
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
