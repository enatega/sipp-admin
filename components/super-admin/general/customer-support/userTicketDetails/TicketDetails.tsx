'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SupportModule } from '@/types/api/super-admin/general/customerSupport.api';
import { returnErrorMessage } from '@/lib/toast-error';
import { useGetSupportChatMessagesById } from '@/hooks/api/super-admin/general/customerSupport';
import DisplayError from '@/components/shared/DisplayError';
import { Heading } from '@/components/shared/Heading';
import TicketDetailsSkeleton from '../skeleton/TicketDetailsSkeleton';
import Messages from './Messages';
import { StatusDetails } from './status/StatusDetails';
import UserInformation from './UserInformation';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

const TicketDetails = () => {
  const t = useTranslations('customerSupport.details');
  const params = useParams<{
    module: SupportModule;
    slug: string;
  }>();

  const ticketId = Array.isArray(params.slug)
    ? params.slug[0]
    : (params.slug ?? '');
  const supportModule = Array.isArray(params.module)
    ? params.module[0]
    : (params.module ?? '');

  const { data, isLoading, isError, error } = useGetSupportChatMessagesById(
    supportModule as SupportModule,
    ticketId,
  );

  if (isLoading) {
    return <TicketDetailsSkeleton />;
  }

  if (isError) {
    return (
      <div className="p-4">
        <DisplayError
          message={returnErrorMessage(error) ?? t('errors.loadFailed')}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 rounded-lg border bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <Heading title={t('title')} showBackBtn />
          {data?.ticket?.reason === 'order_related_issue' && data.ticket.orderId ? (
            <Link href={`/enatega-deliveries/orders/${data.ticket.orderId}`} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white">
              Check order detail - Order #{data.ticket.orderId.slice(0, 8).toUpperCase()} <ExternalLink size={16} />
            </Link>
          ) : null}
        </div>
        {data?.ticket ? (
          <div className="mt-4 grid gap-3 border-t pt-4 md:grid-cols-[auto_1fr]">
            <div className="flex flex-wrap gap-2">
              <span className="h-fit rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold capitalize text-sky-700">{data.ticket.category?.replaceAll('_', ' ')}</span>
              <span className="h-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold capitalize text-amber-700">{data.ticket.reason?.replaceAll('_', ' ')}</span>
            </div>
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{data.ticket.description || 'No description provided.'}</p>
          </div>
        ) : null}
      </div>
      <div className="my-6">
        <StatusDetails data={data} isLoading={isLoading} />
      </div>
      <div className="flex flex-col-reverse lg:flex-row lg:flex-nowrap gap-6 space-y-6 lg:space-y-0">
        <div className="lg:w-[40%] w-full  h-[665px]">
          <Messages key={`${supportModule}-${ticketId}`} data={data} />
        </div>
        <div className="lg:w-[60%] w-full">
          <UserInformation data={data} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
