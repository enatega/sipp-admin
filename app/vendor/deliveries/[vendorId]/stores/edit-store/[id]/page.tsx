'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { VendorEditStoreForm } from '@/components/vendor/deliveries/stores/edit-store';
import { EditStoreShimmer } from '@/components/super-admin/enatega-deliveries/stores/edit-store/EditStoreShimmer';
import { Heading } from '@/components/shared/Heading';
import DisplayError from '@/components/shared/DisplayError';
import { ApiErrorResponse } from '@/types';
import { useGetVendorStoreDetail } from '@/hooks/api/vendor/deliveries/stores';
import { returnErrorMessage } from '@/lib/toast-error';

export default function EditVendorStorePage() {
  const t = useTranslations('vendorDeliveriesStores');
  const tErrors = useTranslations('vendorDeliveriesStores.errors');
  const params = useParams();
  const storeId = params.id as string;

  const {
    data: store,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetVendorStoreDetail(storeId);

  if (isLoading) {
    return (
      <div>
        <Heading title={t('editStore')} showBackBtn={true} />
        <EditStoreShimmer />
      </div>
    );
  }

  if (isError || !store) {
    return (
      <div>
        <Heading title={t('editStore')} showBackBtn={true} />
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
      <Heading title={t('editStore')} showBackBtn={true} />
      <VendorEditStoreForm store={store} />
    </div>
  );
}
