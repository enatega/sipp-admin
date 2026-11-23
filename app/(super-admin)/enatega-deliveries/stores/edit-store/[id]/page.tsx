'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Heading } from '@/components/shared/Heading';
import { EditStoreForm } from '@/components/super-admin/enatega-deliveries/stores/edit-store';
import { EditStoreShimmer } from '@/components/super-admin/enatega-deliveries/stores/edit-store/EditStoreShimmer';
import { useGetStoreDetail } from '@/hooks/api/super-admin/enatega-deliveries/stores';
import DisplayError from '@/components/shared/DisplayError';
import { ApiErrorResponse } from '@/types';
import { returnErrorMessage } from '@/lib/toast-error';

export default function EditStorePage() {
  const t = useTranslations('lumiFood.stores');
  const tErrors = useTranslations('lumiFood.stores.errors');
  const params = useParams();
  const storeId = params.id as string;

  const { data: store, isLoading, isError, error, refetch } = useGetStoreDetail(storeId);

  if (isLoading) {
    return (
      <div>
        <Heading title={t('editStoreLabel')} showBackBtn={true} />
        <EditStoreShimmer />
      </div>
    );
  }

  if (isError || !store) {
    return (
      <div>
        <Heading title={t('editStoreLabel')} showBackBtn={true} />
        <DisplayError
          title={tErrors('fetchStoreDetailsTitle')}
          message={
            returnErrorMessage(error as ApiErrorResponse) ||
            tErrors('genericRetryMessage')
          }
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div>
      <Heading title={t('editStoreLabel')} showBackBtn={true} />
      <EditStoreForm store={store} />
    </div>
  );
}
