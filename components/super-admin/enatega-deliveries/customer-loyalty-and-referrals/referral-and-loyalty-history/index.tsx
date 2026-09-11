'use client';

import { useMemo } from 'react';
import { ApiErrorResponse } from '@/types';
import { useTranslations } from 'next-intl';
import { returnErrorMessage } from '@/lib/toast-error';
import {
  useGetCustomerPointsHistory,
  useGetRiderPointsHistory,
} from '@/hooks/api/super-admin/enatega-deliveries/points-history';
import { useQueryParams } from '@/hooks/use-query-params';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import DisplayError from '@/components/shared/DisplayError';
import {
  HistoryItem,
  LoyaltyTabType,
  PointsHistoryFilterType,
  PointsHistoryItem,
} from '../types';
import { HistoryFilters } from './HistoryFilters';
import { HistoryTable } from './HistoryTable';

const ReferralAndLoyaltyHistory = () => {
  const t = useTranslations(
    'deliveriesCustomerLoyaltyAndReferrals.referralAndLoyaltyHistory',
  );
  const { getParam } = useQueryParams();
  const activeTab = (getParam('type') || 'customer') as LoyaltyTabType;
  const isCustomer = activeTab === 'customer';
  const historyType = (getParam('historyType') ||
    'all') as PointsHistoryFilterType;
  const currentPage = parseInt(getParam('page') || '1', 10);
  const currentLimit = parseInt(getParam('limit') || '10', 10);
  const startDate = getParam('startDate') || undefined;
  const endDate = getParam('endDate') || undefined;

  // Query params for API
  const queryParams = {
    page: currentPage,
    limit: currentLimit,
    type: historyType,
    start_date: startDate,
    end_date: endDate,
  };

  // Fetch customer or rider history based on active tab
  const {
    data: customerData,
    isLoading: isLoadingCustomer,
    isError: isErrorCustomer,
    error: errorCustomer,
  } = useGetCustomerPointsHistory(queryParams, {
    enabled: isCustomer,
  });

  const {
    data: riderData,
    isLoading: isLoadingRider,
    isError: isErrorRider,
    error: errorRider,
  } = useGetRiderPointsHistory(queryParams, {
    enabled: !isCustomer,
  });

  const isLoading = isCustomer ? isLoadingCustomer : isLoadingRider;
  const isError = isCustomer ? isErrorCustomer : isErrorRider;
  const error = isCustomer ? errorCustomer : errorRider;

  // Map API response to component format
  const { historyData, totalPages, totalData } = useMemo(() => {
    if (isCustomer && customerData) {
      const data = customerData.returnCustomerPointsHistory;
      const items: HistoryItem[] = data.customerPointsHistory.map(
        (item: PointsHistoryItem) => ({
          id: item.id,
          name: item.user_name,
          totalPoints: item.pointsHistory_points,
          type: item.pointsHistory_type,
          lastPurchase: item.pointsHistory_created_at,
        }),
      );
      return {
        historyData: items,
        totalPages: data.totalPages,
        totalData: data.customerPointsHistory.length * data.totalPages,
      };
    }

    if (!isCustomer && riderData) {
      const data = riderData.returnRiderPointsHistory;
      const items: HistoryItem[] = data.riderPointsHistory.map(
        (item: PointsHistoryItem) => ({
          id: item.id,
          name: item.user_name,
          totalPoints: item.pointsHistory_points,
          type: item.pointsHistory_type,
          lastPurchase: item.pointsHistory_created_at,
        }),
      );
      return {
        historyData: items,
        totalPages: data.totalPages,
        totalData: data.riderPointsHistory.length * data.totalPages,
      };
    }

    return { historyData: [], totalPages: 0, totalData: 0 };
  }, [isCustomer, customerData, riderData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription className="mt-1">
              {t('description')}
            </CardDescription>
          </div>
          <HistoryFilters />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isError ? (
          <DisplayError
            title={t('errorLoading')}
            message={returnErrorMessage(error as ApiErrorResponse)}
          />
        ) : (
          <HistoryTable
            data={historyData}
            isCustomer={isCustomer}
            currentPage={currentPage}
            totalPages={totalPages}
            totalData={totalData}
          />
        )}
      </CardContent>
    </Card>
  );
};

export { ReferralAndLoyaltyHistory };
