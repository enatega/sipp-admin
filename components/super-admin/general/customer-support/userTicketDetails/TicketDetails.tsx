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
      <div className="flex items-center gap-4 mb-6">
        <Heading title={t('title')} showBackBtn />
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
