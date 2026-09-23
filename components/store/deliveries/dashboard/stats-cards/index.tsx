'use client';

import { DollarSign, Package, Star, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCurrency } from '@/hooks/use-currency';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/shared/StatCard';
import { IStoreDashboardStats } from '../types';

const StoreDashboardStatsCards = ({ data, isLoading }: IStoreDashboardStats) => {
  const t = useTranslations('storeDeliveriesDashboard.statsCards');
  const { currencySymbol } = useCurrency();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Skeleton className="h-28" key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        title={t('totalSalesTitle')}
        value={`${currencySymbol} ${(Number(data?.totalSales?.value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        isPositive={Number(data?.totalSales?.change) >= 0}
        icon={DollarSign}
        change={Number(data?.totalSales?.change)}
      />
      <StatCard
        title={t('totalOrdersTitle')}
        value={`${Number(data?.totalOrders?.value) || 0}`}
        isPositive={Number(data?.totalOrders?.change) >= 0}
        icon={Package}
        change={Number(data?.totalOrders?.change)}
      />
      <StatCard
        title={t('storeRatingTitle')}
        value={`${(Number(data?.storeRating?.value) || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}`}
        isPositive={Number(data?.storeRating?.change) >= 0}
        icon={Star}
        change={Number(data?.storeRating?.change)}
      />
      <StatCard
        title={t('walletBalanceTitle')}
        value={`${currencySymbol} ${(Number(data?.walletBalance?.value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        isPositive
        icon={Wallet}
        change={0}
        showChange={false}
      />
    </div>
  );
};

export default StoreDashboardStatsCards;
