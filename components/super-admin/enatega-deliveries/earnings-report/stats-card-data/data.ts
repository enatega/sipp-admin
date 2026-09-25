import { DashboardCards } from '@/types/entities/super-admin/enatega-deliveries/earning-report';
import { CircleDollarSignIcon, Store, TrendingUp, Wallet } from 'lucide-react';

interface StatCardLabels {
  totalEarnings: string;
  totalOrders: string;
  totalCommission: string;
  totalWithdrawals: string;
  totalSales: string;
}

const amountFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const countFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

export const buildStatsData = (
  cards?: DashboardCards,
  labels?: StatCardLabels,
) => [
  {
    title: labels?.totalEarnings ?? 'Total Earnings',
    value: amountFormatter.format(cards?.totalEarnings?.value ?? 0),
    isPositive: (cards?.totalEarnings?.change ?? 0) >= 0,
    icon: CircleDollarSignIcon,
    change: cards?.totalEarnings?.change ?? 0,
  },
  {
    title: labels?.totalOrders ?? 'Total Orders',
    value: countFormatter.format(cards?.totalOrders?.value ?? 0),
    isPositive: (cards?.totalOrders?.change ?? 0) >= 0,
    icon: Wallet,
    change: cards?.totalOrders?.change ?? 0,
    useCurrencyPrefix: false,
  },
  {
    title: labels?.totalCommission ?? 'Total Commission',
    value: amountFormatter.format(cards?.totalCommission?.value ?? 0),
    isPositive: (cards?.totalCommission?.change ?? 0) >= 0,
    icon: TrendingUp,
    change: cards?.totalCommission?.change ?? 0,
  },
  {
    title: labels?.totalWithdrawals ?? 'Total Withdrawals',
    value: amountFormatter.format(cards?.totalWithdrawals?.value ?? 0),
    isPositive: (cards?.totalWithdrawals?.change ?? 0) >= 0,
    icon: Store,
    change: cards?.totalWithdrawals?.change ?? 0,
  },
  {
    title: labels?.totalSales ?? 'Total Sales',
    value: amountFormatter.format(cards?.totalSales?.value ?? 0),
    isPositive: (cards?.totalSales?.change ?? 0) >= 0,
    icon: CircleDollarSignIcon,
    change: cards?.totalSales?.change ?? 0,
  },
];
