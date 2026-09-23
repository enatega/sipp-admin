import { StoreEarningCards } from '@/types';
import {
  CircleDollarSignIcon,
  LucideBanknote,
  Wallet,
} from 'lucide-react';

interface StoreStatsLabels {
  netEarnings: string;
  commissionAndVat: string;
  pendingWithdrawals: string;
}

export const buildStoreStatsData = (
  cards: StoreEarningCards | undefined,
  labels: StoreStatsLabels,
) => [
  {
    title: labels.netEarnings,
    value: String(cards?.totalEarnings?.value ?? 0),
    isPositive: (cards?.totalEarnings?.change ?? 0) >= 0,
    icon: LucideBanknote,
    change: cards?.totalEarnings?.change ?? 0,
  },
  {
    title: labels.commissionAndVat,
    value: String(cards?.totalCommission?.value ?? 0),
    isPositive: (cards?.totalCommission?.change ?? 0) >= 0,
    icon: CircleDollarSignIcon,
    change: cards?.totalCommission?.change ?? 0,
  },
  {
    title: labels.pendingWithdrawals,
    value: String(cards?.pendingWithdrawals?.value ?? 0),
    isPositive: (cards?.pendingWithdrawals?.change ?? 0) >= 0,
    icon: Wallet,
    change: cards?.pendingWithdrawals?.change ?? 0,
  },
];
