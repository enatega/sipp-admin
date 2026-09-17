'use client';

import React from 'react';
import Image from 'next/image';
import { Flag } from 'lucide-react';
import { CustomerSupportGroupedByCustomer } from '@/types/api/super-admin/general/customerSupport.api';
import { formatReadableLabel } from '@/lib/utils';
import RelativeTime from '@/components/shared/RelativeTime';
import Status from '@/components/shared/Status';
import StatusIcon from '@/components/shared/StatusIcon';

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
  const base = 'flex gap-3 items-start p-3 transition-colors';
  const selectedClass = isSelected
    ? 'bg-black text-white rounded-none'
    : 'bg-white';
  const classes = `${base} ${selectedClass} cursor-pointer ${isLast ? 'border-b-0 rounded-md' : 'rounded-t-md border-b'}`;

  // Determine priority icon color
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-blue-500';
      case 'low':
      default:
        return 'text-gray-500';
    }
  };

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
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`text-xs truncate ${isSelected ? 'text-white' : 'text-muted-foreground'}`}
              >
                {formatReadableLabel(item.title)}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div
              className={`text-xs ${isSelected ? 'text-white' : 'text-muted-foreground'}`}
            >
              <RelativeTime date={item.latestMessageAt} />
            </div>
            <span className="text-xs text-white bg-primary px-1.5 py-0.5 rounded-full">
              {item.ticketCount}
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <Status status={item.status} />
          <StatusIcon
            status={item.priority}
            className="!text-semibold !text-black capitalize"
            icon={<Flag size={14} />}
            iconClassName={getPriorityColor(item.priority)}
          />
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {formatReadableLabel(item.ticketType)}
          </span>
        </div>
      </div>
    </div>
  );
};
