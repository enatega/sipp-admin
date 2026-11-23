'use client';

import { useParams } from 'next/dist/client/components/navigation';
import { DollarSign, ShoppingCart, Store } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ApiErrorResponse } from '@/types/api/common';
import { returnErrorMessage } from '@/lib/toast-error';
import { useGetSummaryCard } from '@/hooks/api/vendor/deliveries/earnings-report';
import { useCurrency } from '@/hooks/use-currency';
import { Skeleton } from '@/components/ui/skeleton';
import DisplayError from '@/components/shared/DisplayError';
import { StatCard } from '@/components/shared/StatCard';

const VendorEarningsStatsCards = () => {
  const params = useParams();
  const vendorId = params?.vendorId as string;

  const { data, isLoading, isError, error } = useGetSummaryCard(vendorId);
  const t = useTranslations('vendorEarnings.statsCards');
  const tErrors = useTranslations('vendorEarnings.statsCards.errors');
  const { currencySymbol } = useCurrency();

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, index) => (
          <Skeleton className="h-28" key={index} />
        ))}
      </div>
    );
  }
  if (isError)
    return (
      <DisplayError
        title={tErrors('fetchFailedTitle')}
        message={
          returnErrorMessage(error as ApiErrorResponse) ||
          tErrors('fetchFailedMessage')
        }
      />
    );

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard
        title={t('totalEarningsTitle')}
        value={`${currencySymbol} ${Number(data?.cards.earnings.total_earnings) ?? 0}`}
        isPositive={Number(data?.cards.earnings.earnings_change) >= 0}
        icon={DollarSign}
        change={Number(data?.cards.earnings.earnings_change)}
      />
      <StatCard
        title={t('totalStoresTitle')}
        value={`${Number(data?.cards.stores.total_stores) ?? 0}`}
        isPositive={Number(data?.cards.stores.stores_change) >= 0}
        icon={Store}
        change={Number(data?.cards.stores.stores_change)}
      />
      <StatCard
        title={t('totalOrdersTitle')}
        value={`${Number(data?.cards.orders.total_orders) ?? 0}`}
        isPositive={Number(data?.cards.orders.orders_change) >= 0}
        icon={ShoppingCart}
        change={Number(data?.cards.orders.orders_change)}
      />
    </div>
  );
};

export default VendorEarningsStatsCards;
