'use client';

import { useParams } from 'next/navigation';
import { Heading } from '@/components/shared/Heading';
import AppLoader from '@/components/shared/AppLoader';
import DisplayError from '@/components/shared/DisplayError';
import { useGetStoreBillingHistory } from '@/hooks/api/store/deliveries/subscription-plan';
import { ApiErrorResponse } from '@/types';
import { returnErrorMessage } from '@/lib/toast-error';
import { BillingStatsCards } from './StatsCards';
import { BillingHistoryTable } from './table/BillingHistoryTable';

export function BillingHistoryPage() {
  const { storeId } = useParams() as { storeId: string };
  const { data, isLoading, isError, error } = useGetStoreBillingHistory(storeId, '50');

  if (isLoading) {
    return <AppLoader />;
  }

  if (isError) {
    return (
      <DisplayError
        title="Failed to load billing history"
        message={returnErrorMessage(error as ApiErrorResponse) || 'Please try again later.'}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Heading
        showBackBtn
        title="Billing History"
        subTitle="Review past invoices, payment status, and download receipts."
      />

      <BillingStatsCards cards={data?.cards} />
      {/* Filters UI intentionally hidden until backend supports filter query params. */}
      {/* <BillingHistoryFilters /> */}
      <BillingHistoryTable rows={data?.billingHistory || []} />
    </div>
  );
}
