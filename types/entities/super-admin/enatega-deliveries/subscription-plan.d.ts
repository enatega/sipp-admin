export type SubscriptionPlanFeatureType =
  | 'promotions'
  | 'support'
  | 'operations'
  | 'marketing'
  | 'general';

export interface SubscriptionPlanFeature {
  id: string;
  title: string;
  type: SubscriptionPlanFeatureType | string;
}

export interface SubscriptionPlan {
  id: string;
  planName: string;
  planDescription?: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyPriceId?: string | null;
  yearlyPriceId?: string | null;
  isActive: boolean;
  isRecommended: boolean;
  commissionRate: number;
  freeOrdersIncluded: number;
  bannerDuration: number;
  numberOfOrders?: number | null;
  isUnlimitedOrders: boolean;
  planFeatures: SubscriptionPlanFeature[];
}
