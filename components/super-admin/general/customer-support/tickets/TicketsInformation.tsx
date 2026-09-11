'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Flag, Inbox } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  CustomerSupportTicketItem,
  SupportModule,
} from '@/types/api/super-admin/general/customerSupport.api';
import { formatTime } from '@/lib/date';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import NoDataFound from '@/components/shared/NoDataFound';
import Status from '@/components/shared/Status';
import StatusIcon from '@/components/shared/StatusIcon';

interface Props {
  ticket?: CustomerSupportTicketItem | null;
  tickets?: CustomerSupportTicketItem[] | null;
  isLoading?: boolean;
  module: SupportModule;
}

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((n) => n[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();

const TicketsInformation: React.FC<Props> = ({
  ticket,
  tickets,
  isLoading,
  module,
}) => {
  const t = useTranslations('customerSupport.tickets');
  const router = useRouter();

  const handleOpenTicketDetails = useCallback(
    (id: string) => {
      router.push(`/general/customer-support/${module}/${id}`);
    },
    [router, module],
  );

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'mx-auto w-full rounded-xl border border-primary bg-background/50 p-8 text-center h-[75vh] flex flex-col justify-center',
        )}
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-primary text-primary">
          <Inbox className="h-6 w-6 opacity-70" />
        </div>
        <h3 className="text-base font-medium text-mute">{t('selectPrompt')}</h3>
      </div>
    );
  }

  if (tickets && tickets?.length === 0) {
    return <NoDataFound title={t('noTicketsForUser')} />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="border-b w-full p-4">
          <h3 className="font-semibold text-lg flex items-center gap-3 capitalize">
            {ticket?.sender?.name ?? ''}
            <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-blue-100 text-primary font-medium">
              {t('ticketCount', { count: tickets?.length ?? 0 })}
            </span>
          </h3>
        </div>
      </div>

      {/* Tickets list */}
      <div className="divide-y">
        {tickets?.map((t) => (
          <div
            key={t.id}
            className="p-4 pt-0 flex items-start gap-4 cursor-pointer border-b"
            onClick={() => handleOpenTicketDetails(t.id)}
          >
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">
                    ID: #{t.id}
                  </div>
                  <div className="font-medium mt-1">{t.title}</div>
                </div>
                <div className="text-sm text-muted-foreground text-right">
                  <div>{formatTime(t.latestMessageAt)}</div>
                  <div className="mt-2">
                    {/* <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs">
                      {t.totalMessages}
                    </span> */}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <Status status={t.status} />

                <StatusIcon
                  status={t.priority}
                  className="!text-semibold !text-black"
                  icon={<Flag size={14} />}
                  iconClassName={`${t.priority === 'urgent' ? 'text-red-500' : t.priority === 'high' ? 'text-orange-500' : t.priority === 'medium' ? 'text-blue-500' : 'text-gray-500'}`}
                />

                {/* Avatar */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                    {getInitials(t.sender.name)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.sender.name.split(' ')[0]}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketsInformation;
