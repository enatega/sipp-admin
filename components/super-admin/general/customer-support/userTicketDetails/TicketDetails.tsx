'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
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
  const creatorLabels = useTranslations('customerSupport.filters.creatorLabels');
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

  const { data, isLoading, isFetching, isError, error } = useGetSupportChatMessagesById(
    supportModule as SupportModule,
    ticketId,
    { staleTime: 0, refetchOnMount: 'always' },
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const queryClient = useQueryClient();

  // Reading the thread updates the server-side unread threshold. Refresh the
  // ticket list so its badge does not retain the pre-read cached count.
  useEffect(() => {
    if (data?.chatBoxId && !isFetching) {
      queryClient.invalidateQueries({ queryKey: ['get-delivery-support-chat'] });
    }
  }, [data?.chatBoxId, isFetching, queryClient]);

  // Older notification links carried the requester id; move to the resolved chat box URL
  // so replies and live updates use the real chat box id.
  useEffect(() => {
    if (data?.chatBoxId && data.chatBoxId !== ticketId) {
      const query = returnTo ? `?${new URLSearchParams({ returnTo })}` : '';
      router.replace(`/general/customer-support/${supportModule}/${data.chatBoxId}${query}`);
    }
  }, [data?.chatBoxId, ticketId, supportModule, router, returnTo]);

  const goBack = () => {
    if (returnTo && /^\/general\/customer-support(?:\?|$)/.test(returnTo)) {
      router.replace(returnTo);
    } else {
      router.back();
    }
  };

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
    <div className="min-w-0 max-w-full overflow-x-hidden">
      <div className="mb-6 rounded-lg border bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <Heading title={t('title')} showBackBtn onBack={goBack} />
          {data?.ticket?.reason === 'order_related_issue' && data.ticket.orderId ? (
            <Link href={`/enatega-deliveries/orders/${data.ticket.orderId}`} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white">
              Check order detail - Order #{data.ticket.orderId.slice(0, 8).toUpperCase()} <ExternalLink size={16} />
            </Link>
          ) : null}
        </div>
        {data?.ticket ? (
          <div className="mt-4 min-w-0 border-t pt-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-900">{t('description')}</h2>
            <p className="min-w-0 whitespace-pre-wrap [overflow-wrap:anywhere] text-sm leading-6 text-slate-700">{data.ticket.description || t('noDescription')}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="h-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{creatorLabels(data.ticket.creatorType ?? 'customer')}</span>
              {data.ticket.creatorType !== 'store' && data.ticket.creatorType !== 'rider' ? (
                <span className="h-fit rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold capitalize text-sky-700">{data.ticket.category?.replaceAll('_', ' ')}</span>
              ) : null}
              <span className="h-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold capitalize text-amber-700">{data.ticket.reason?.replaceAll('_', ' ')}</span>
            </div>
          </div>
        ) : null}
        {data?.ticket?.category === 'joining_as_a_business' ? (
          <section className="mt-4 min-w-0 border-t pt-4" aria-label={t('businessInfo.title')}>
            <h2 className="mb-3 font-semibold">{t('businessInfo.title')}</h2>
            <dl className="grid min-w-0 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              {([
                ['fullName', data.ticket.fullName],
                ['email', data.ticket.email],
                ['countryRegion', data.ticket.countryRegion],
                ['mobileNumber', data.ticket.mobileNumber],
                ['businessName', data.ticket.businessName],
                ['businessType', data.ticket.businessType],
                ['teamSize', data.ticket.teamSize],
              ] as const).map(([key, value]) => (
                <div key={key} className="min-w-0">
                  <dt className="text-xs text-mute">{t(`businessInfo.${key}`)}</dt>
                  <dd className="[overflow-wrap:anywhere] font-medium">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </div>
      <div className="my-6">
        <StatusDetails data={data} isLoading={isLoading} />
      </div>
      <div className="flex flex-col-reverse lg:flex-row lg:flex-nowrap gap-6 space-y-6 lg:space-y-0">
        <div className="min-w-0 lg:w-[40%] w-full h-[665px]">
          <Messages key={`${supportModule}-${ticketId}`} data={data} />
        </div>
        <div className="min-w-0 lg:w-[60%] w-full">
          <UserInformation data={data} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
