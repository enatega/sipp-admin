import { DashboardCards } from '@/types/entities/super-admin/enatega-deliveries/earning-report';
import { CircleDollarSignIcon, Store, TrendingUp, Wallet } from 'lucide-react';

interface StatCardLabels {
  totalEarnings: string;
  totalOrders: string;
  totalCommission: string;
  totalWithdrawals: string;
  totalSales: string;
}

export const buildStatsData = (
  cards?: DashboardCards,
  labels?: StatCardLabels,
) => [
  {
    title: labels?.totalEarnings ?? 'Total Earnings',
    value: String(cards?.totalEarnings?.value ?? 0),
    isPositive: (cards?.totalEarnings?.change ?? 0) >= 0,
    icon: CircleDollarSignIcon,
    change: cards?.totalEarnings?.change ?? 0,
  },
  {
    title: labels?.totalOrders ?? 'Total Orders',
    value: String(cards?.totalOrders?.value ?? 0),
    isPositive: (cards?.totalOrders?.change ?? 0) >= 0,
    icon: Wallet,
    change: cards?.totalOrders?.change ?? 0,
  },
  {
    title: labels?.totalCommission ?? 'Total Commission',
    value: String(cards?.totalCommission?.value ?? 0),
    isPositive: (cards?.totalCommission?.change ?? 0) >= 0,
    icon: TrendingUp,
    change: cards?.totalCommission?.change ?? 0,
  },
  {
    title: labels?.totalWithdrawals ?? 'Total Withdrawals',
    value: String(cards?.totalWithdrawals?.value ?? 0),
    isPositive: (cards?.totalWithdrawals?.change ?? 0) >= 0,
    icon: Store,
    change: cards?.totalWithdrawals?.change ?? 0,
  },
  {
    title: labels?.totalSales ?? 'Total Sales',
    value: String(cards?.totalSales?.value ?? 0),
    isPositive: (cards?.totalSales?.change ?? 0) >= 0,
    icon: CircleDollarSignIcon,
    change: cards?.totalSales?.change ?? 0,
  },

];
