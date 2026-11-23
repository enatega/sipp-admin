import { EnategaDeliveriesDashboardCards } from '@/types/api/super-admin/enatega-deliveries/dashboard.api';
import {
  Bike,
  CircleDollarSignIcon,
  LucideIcon,
  Store,
  User,
  Wallet,
} from 'lucide-react';

export interface EnategaDeliveriesDashboardStatItem {
  title: string;
  value: string;
  isPositive: boolean;
  icon: LucideIcon;
  change: number;
  showChange?: boolean;
  changeLabel?: string;
  useCurrencyPrefix?: boolean;
}

const amountFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const countFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

export const getEnategaDeliveriesDashboardStatsData = (
  cards?: EnategaDeliveriesDashboardCards,
  t?: (key: string) => string,
): EnategaDeliveriesDashboardStatItem[] => {
  const comparisonLabel = (
    comparison?: 'yesterday' | 'previous_period' | null,
  ) => {
    if (!comparison || !t) return undefined;
    return comparison === 'yesterday'
      ? t('vsYesterday')
      : t('vsPreviousPeriod');
  };

  return [
    {
      title: t ? t('totalRevenue') : 'Total Revenue',
      value: amountFormatter.format(Number(cards?.totalRevenue?.value ?? 0)),
      isPositive: (cards?.totalRevenue?.change ?? 0) >= 0,
      icon: CircleDollarSignIcon,
      change: cards?.totalRevenue?.change ?? 0,
      showChange: Boolean(cards?.totalRevenue?.comparison),
      changeLabel: comparisonLabel(cards?.totalRevenue?.comparison),
    },
    {
      title: t ? t('totalOrders') : 'Total Orders',
      value: countFormatter.format(Number(cards?.totalOrders?.value ?? 0)),
      isPositive: (cards?.totalOrders?.change ?? 0) >= 0,
      icon: Wallet,
      change: cards?.totalOrders?.change ?? 0,
      showChange: Boolean(cards?.totalOrders?.comparison),
      changeLabel: comparisonLabel(cards?.totalOrders?.comparison),
      useCurrencyPrefix: false,
    },
    {
      title: t ? t('totalVendors') : 'Total Vendors',
      value: countFormatter.format(Number(cards?.totalVendors?.value ?? 0)),
      isPositive: (cards?.totalVendors?.change ?? 0) >= 0,
      icon: User,
      change: cards?.totalVendors?.change ?? 0,
      showChange: false,
      useCurrencyPrefix: false,
    },
    {
      title: t ? t('totalStores') : 'Total Stores',
      value: countFormatter.format(Number(cards?.totalStores?.value ?? 0)),
      isPositive: (cards?.totalStores?.change ?? 0) >= 0,
      icon: Store,
      change: cards?.totalStores?.change ?? 0,
      showChange: false,
      useCurrencyPrefix: false,
    },
    {
      title: t ? t('activeRiders') : 'Active Riders',
      value: countFormatter.format(Number(cards?.activeRiders?.value ?? 0)),
      isPositive: (cards?.activeRiders?.change ?? 0) >= 0,
      icon: Bike,
      change: cards?.activeRiders?.change ?? 0,
      showChange: false,
      useCurrencyPrefix: false,
    },
  ];
};

