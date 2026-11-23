import { DashboardCardStat, DashboardCards } from '@/types/entities/super-admin/enatega-deliveries/earning-report';
import { CircleDollarSignIcon, Store, TrendingUp, Wallet } from 'lucide-react';

interface StatCardLabels {
  totalEarnings: string;
  totalOrders: string;
  totalCommission: string;
  totalWithdrawals: string;
  totalSales: string;
  comparison?: Record<NonNullable<DashboardCardStat['comparison']>, string>;
}

// The change line names the range it compares against, and is hidden when the
// period (all time) has nothing earlier to compare with.
const changeFields = (card?: DashboardCardStat, labels?: StatCardLabels) => ({
  isPositive: (card?.change ?? 0) >= 0,
  change: card?.change ?? 0,
  showChange: Boolean(card?.comparison),
  changeLabel: card?.comparison ? labels?.comparison?.[card.comparison] : undefined,
});

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
    icon: CircleDollarSignIcon,
    ...changeFields(cards?.totalEarnings, labels),
  },
  {
    title: labels?.totalOrders ?? 'Total Orders',
    value: countFormatter.format(cards?.totalOrders?.value ?? 0),
    icon: Wallet,
    ...changeFields(cards?.totalOrders, labels),
    useCurrencyPrefix: false,
  },
  {
    title: labels?.totalCommission ?? 'Total Commission',
    value: amountFormatter.format(cards?.totalCommission?.value ?? 0),
    icon: TrendingUp,
    ...changeFields(cards?.totalCommission, labels),
  },
  {
    title: labels?.totalWithdrawals ?? 'Total Withdrawals',
    value: amountFormatter.format(cards?.totalWithdrawals?.value ?? 0),
    icon: Store,
    ...changeFields(cards?.totalWithdrawals, labels),
  },
  {
    title: labels?.totalSales ?? 'Total Sales',
    value: amountFormatter.format(cards?.totalSales?.value ?? 0),
    icon: CircleDollarSignIcon,
    ...changeFields(cards?.totalSales, labels),
  },
];
