import {
  SubscriptionPlan,
  SubscriptionPlanFeature,
} from '@/types/entities/super-admin/enatega-deliveries/subscription-plan';

export type GetSubscriptionPlansResponse = SubscriptionPlan[];

export type GetSingleSubscriptionPlanResponse = SubscriptionPlan;

export interface CreateSubscriptionPlanPayload {
  planName: string;
  planDescription?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  isActive?: boolean;
  isRecommended?: boolean;
  commissionRate: number;
  freeOrdersIncluded: number;
  bannerDuration: number;
  numberOfOrders?: number;
  isUnlimitedOrders: boolean;
  planFeatureIds: string[];
}

export interface UpdateSubscriptionPlanPayload {
  planName?: string;
  planDescription?: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  isActive?: boolean;
  isRecommended?: boolean;
  commissionRate?: number;
  freeOrdersIncluded?: number;
  bannerDuration?: number;
  numberOfOrders?: number;
  isUnlimitedOrders?: boolean;
  planFeatureIds?: string[];
}

export interface DeleteSubscriptionPlanResponse {
  message: string;
}

export type CreateSubscriptionPlanResponse = SubscriptionPlan;
export type UpdateSubscriptionPlanResponse = SubscriptionPlan;

export interface GetSubscriptionPlanFeaturesResponse {
  title: SubscriptionPlanFeature[];
}
