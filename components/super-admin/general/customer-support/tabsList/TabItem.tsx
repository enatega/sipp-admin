'use client';

import React from 'react';
import Image from 'next/image';
import { CustomerSupportGroupedByCustomer } from '@/types/api/super-admin/general/customerSupport.api';
import RelativeTime from '@/components/shared/RelativeTime';
import { useTranslations } from 'next-intl';

export interface TabItemProps {
  item: CustomerSupportGroupedByCustomer;
  isSelected?: boolean;
  onClick?: () => void;
  isLast?: boolean;
}

export const TabItem: React.FC<TabItemProps> = ({
  item,
  isSelected,
  onClick,
  isLast,
}) => {
  const t = useTranslations('customerSupport.tabs');
  const creatorLabels = useTranslations('customerSupport.filters.creatorLabels');
  const base = 'flex gap-3 items-start p-3 transition-colors';
  const selectedClass = isSelected
    ? 'bg-black text-white rounded-none'
    : 'bg-white';
  const classes = `${base} ${selectedClass} cursor-pointer ${isLast ? 'border-b-0 rounded-md' : 'rounded-t-md border-b'}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={classes}
    >
      <div className="bg-gray-100 rounded-full p-2 flex-shrink-0">
        <Image
          src={item?.sender?.profile}
          width={40}
          height={40}
          alt={item?.sender?.name}
          className="w-10 h-10 object-cover rounded-full"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">
              {item.sender.name}
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{creatorLabels(item.creatorType ?? 'customer')}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div
              className={`text-xs ${isSelected ? 'text-white' : 'text-muted-foreground'}`}
            >
              <RelativeTime date={item.latestMessageAt} />
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {([
            ['opened', t('opened'), 'bg-yellow-100 text-yellow-700'],
            ['in_progress', t('inProgress'), 'bg-orange-100 text-orange-700'],
            ['resolved', t('resolved'), 'bg-green-100 text-green-700'],
            ['closed', t('closed'), 'bg-slate-100 text-slate-700'],
          ] as const).map(([status, label, color]) =>
            item.statusCounts[status] > 0 ? (
              <span key={status} className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
                {item.statusCounts[status]} {label}
              </span>
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
};
