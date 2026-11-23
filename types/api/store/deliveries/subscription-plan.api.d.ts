import { SubscriptionPlan } from '@/types';

export interface StoreCurrentPlanCards {
  nextRenewal?: string | null;
  billing?: string | null;
  amount?: number | string | null;
  totalEarnings?: number | string | null;
  nextCharge?: string | null;
  paymentMethod?: string | null;
}

export interface StoreCurrentSubscriptionPlanResponse {
  storeId?: string;
  currentPlan?: {
    plan?: string;
    planId?: string;
    planDescription?: string | null;
    price?: number | string | null;
    monthlyPrice?: number | null;
    yearlyPrice?: number | null;
    commissionRate?: number | null;
    freeOrdersIncluded?: number | null;
    bannerDuration?: number | null;
    numberOfOrders?: number | null;
    isUnlimitedOrders?: boolean | null;
    billing?: string | null;
    nextRenewalDate?: string | null;
    isCancelled?: boolean | null;
    cancelPeriodEnd?: string | null;
  } | null;
  plan?: SubscriptionPlan | null;
  selectedPlan?: SubscriptionPlan | null;
  cards?: StoreCurrentPlanCards | null;
  latestInvoice?: {
    amount?: number | string | null;
    billingCycle?: string | null;
    nextRenewal?: string | null;
    nextCharge?: string | null;
    paymentMethod?: string | null;
  } | null;
}

export interface StoreBillingHistoryCards {
  totalEarnings?: number | null;
  nextCharge?: string | null;
  paymentMethod?: string | null;
}

export interface StoreBillingHistoryItem {
  invoiceId: string;
  date: string;
  plan: string;
  billingCycle: string;
  method: string;
  amount: number;
  status: string;
}

export interface StoreBillingHistoryResponse {
  cards?: StoreBillingHistoryCards | null;
  billingHistory?: StoreBillingHistoryItem[];
}
