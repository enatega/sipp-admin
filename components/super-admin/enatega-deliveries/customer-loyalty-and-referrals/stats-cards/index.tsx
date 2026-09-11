'use client';

import { ApiErrorResponse } from '@/types';
import { Gift, Heart, Share2, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { returnErrorMessage } from '@/lib/toast-error';
import { useGetCustomerLoyaltyDashboard } from '@/hooks/api/super-admin/enatega-deliveries/loyalty-dashboard';
import { useQueryParams } from '@/hooks/use-query-params';
import { Skeleton } from '@/components/ui/skeleton';
import DisplayError from '@/components/shared/DisplayError';
import { StatCard } from '@/components/shared/StatCard';

/**
 * Parse stats string like "2% up from yesterday" or "1% down from yesterday"
 * @returns { change: number, isPositive: boolean }
 */
const parseStatsString = (statsString?: string) => {
  if (!statsString) return { change: 0, isPositive: true };

  const match = statsString.match(/(\d+)%\s*(up|down)/i);
  if (!match) return { change: 0, isPositive: true };

  const change = parseInt(match[1], 10);
  const isPositive = match[2].toLowerCase() === 'up';

  return { change, isPositive };
};

const LoyaltyStatsCards = () => {
  const t = useTranslations('deliveriesCustomerLoyaltyAndReferrals.statsCards');
  const { getParam } = useQueryParams();
  const activeTab = getParam('type') || 'customer';
  const isCustomer = activeTab === 'customer';

  const {
    data: customerData,
    isLoading: isLoadingCustomer,
    isError: isErrorCustomer,
    error: errorCustomer,
  } = useGetCustomerLoyaltyDashboard({
    enabled: isCustomer,
  });

  if (!isCustomer) {
    return null;
  }

  if (isLoadingCustomer) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Skeleton className="h-28" key={index} />
        ))}
      </div>
    );
  }

  if (isErrorCustomer) {
    return (
      <DisplayError
        title={t('errorLoading')}
        message={returnErrorMessage(errorCustomer as ApiErrorResponse)}
      />
    );
  }

  const stats = {
    loyalUsers: {
      value: customerData?.data?.total_loyal_customers ?? 0,
      ...parseStatsString(customerData?.data?.total_loyal_customers_stats),
    },
    pointsIssued: {
      value: customerData?.data?.total_customer_points_issued ?? 0,
      ...parseStatsString(
        customerData?.data?.total_customer_points_issued_stats,
      ),
    },
    pointsRedeemed: {
      value: customerData?.data?.customers_points_redeemed ?? 0,
      ...parseStatsString(customerData?.data?.customers_points_redeemed_stats),
    },
    activeReferrals: {
      value: customerData?.data?.active_customers_referrals ?? 0,
      ...parseStatsString(customerData?.data?.active_customers_referrals_stats),
    },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title={t('loyalCustomers')}
        value={stats.loyalUsers.value.toLocaleString()}
        change={stats.loyalUsers.change}
        isPositive={stats.loyalUsers.isPositive}
        icon={Heart}
      />
      <StatCard
        title={t('pointsIssued')}
        value={stats.pointsIssued.value.toLocaleString()}
        change={stats.pointsIssued.change}
        isPositive={stats.pointsIssued.isPositive}
        icon={Star}
      />
      <StatCard
        title={t('pointsRedeemed')}
        value={stats.pointsRedeemed.value.toLocaleString()}
        change={stats.pointsRedeemed.change}
        isPositive={stats.pointsRedeemed.isPositive}
        icon={Gift}
      />
      <StatCard
        title={t('activeReferrals')}
        value={stats.activeReferrals.value.toLocaleString()}
        change={stats.activeReferrals.change}
        isPositive={stats.activeReferrals.isPositive}
        icon={Share2}
      />
    </div>
  );
};

export default LoyaltyStatsCards;
