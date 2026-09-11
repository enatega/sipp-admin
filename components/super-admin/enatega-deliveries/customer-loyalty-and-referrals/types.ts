// Customer Loyalty and Referrals Types

export type {
  CreateLoyaltyPointsRangePayload,
  CreateLoyaltyPointsRangeResponse,
  CreateRiderLoyaltyPointsRangePayload,
  CreateRiderLoyaltyPointsRangeResponse,
  CustomerLoyaltyDashboardData,
  CustomerPointsHistoryData,
  DeleteLoyaltyPointsRangeResponse,
  DeleteRiderLoyaltyPointsRangeResponse,
  GetCustomerLoyaltyDashboardResponse,
  GetCustomerPointsHistoryResponse,
  GetLoyaltyPointsRangeResponse,
  GetReferralPointsResponse,
  GetRiderLoyaltyDashboardResponse,
  GetRiderLoyaltyPointsRangeResponse,
  GetRiderPointsHistoryResponse,
  LoyaltyPointsRangeItem,
  LoyaltyTabType,
  PointsHistoryFilterType,
  PointsHistoryItem,
  PointsHistoryPagination,
  PointsHistoryQueryParams,
  PointsToBalance,
  PointsToBalanceResponse,
  ReferralPointItem,
  RiderLoyaltyDashboardData,
  RiderLoyaltyPointsRangeItem,
  RiderLoyaltyPointsRangeTier,
  RiderPointsHistoryData,
  UpdateLoyaltyPointsRangePayload,
  UpdateLoyaltyPointsRangeResponse,
  UpdatePointsToBalancePayload,
  UpdateReferralPointsPayload,
  UpdateReferralPointsResponse,
  UpdateRiderLoyaltyPointsRangePayload,
  UpdateRiderLoyaltyPointsRangeResponse,
} from '@/types/api/super-admin/enatega-deliveries/loyalty.api';

// Breakdown Types
export interface CustomerBreakdown {
  id: string;
  rangeFrom: number;
  rangeTo: number;
  points: number;
  pointsWorth: number;
}

export interface RiderBreakdown {
  id: string;
  tierId: string;
  tierName?: string;
  rideCount: number;
  points: number;
  pointsWorth: number;
}

export type BreakdownItem = CustomerBreakdown | RiderBreakdown;

// Form values for creating breakdown (without id)
export interface CustomerBreakdownFormValues {
  rangeFrom: number;
  rangeTo: number;
  points: number;
}

export interface RiderBreakdownFormValues {
  tierId: string;
  rideCount: number;
  points: number;
}

export type BreakdownFormValues = CustomerBreakdownFormValues | RiderBreakdownFormValues;

// Referral Rule Types
export interface ReferralRule {
  id: string;
  triggerEvent: string;
  points: number;
}

export interface ReferralRuleFormValues {
  triggerEvent: string;
  points: number;
}

// Point Conversion Form Values
export interface PointConversionFormValues {
  basePoints: number;
  baseReward: number;
}

// Referral and Loyalty History Types
export type HistoryType = 'referral' | 'loyalty';

export interface HistoryItem {
  id: string;
  name: string;
  totalPoints: number;
  type: HistoryType;
  lastPurchase: string; // ISO date string
}
