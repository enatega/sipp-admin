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
}

export const getEnategaDeliveriesDashboardStatsData = (
  cards?: EnategaDeliveriesDashboardCards,
  t?: (key: string) => string,
): EnategaDeliveriesDashboardStatItem[] => [
    {
      title: t ? t('totalRevenue') : 'Total Revenue',
      value: `${cards?.totalRevenue?.value ?? 0}`,
      isPositive: (cards?.totalRevenue?.change ?? 0) >= 0,
      icon: CircleDollarSignIcon,
      change: cards?.totalRevenue?.change ?? 0,
    },
    {
      title: t ? t('totalOrders') : 'Total Orders',
      value: `${cards?.totalOrders?.value ?? 0}`,
      isPositive: (cards?.totalOrders?.change ?? 0) >= 0,
      icon: Wallet,
      change: cards?.totalOrders?.change ?? 0,
    },
    {
      title: t ? t('totalVendors') : 'Total Vendors',
      value: `${cards?.totalVendors?.value ?? 0}`,
      isPositive: (cards?.totalVendors?.change ?? 0) >= 0,
      icon: User,
      change: cards?.totalVendors?.change ?? 0,
    },
    {
      title: t ? t('totalStores') : 'Total Stores',
      value: `${cards?.totalStores?.value ?? 0}`,
      isPositive: (cards?.totalStores?.change ?? 0) >= 0,
      icon: Store,
      change: cards?.totalStores?.change ?? 0,
    },
    {
      title: t ? t('activeRiders') : 'Active Riders',
      value: `${cards?.activeRiders?.value ?? 0}`,
      isPositive: (cards?.activeRiders?.change ?? 0) >= 0,
      icon: Bike,
      change: cards?.activeRiders?.change ?? 0,
    },
  ];
