
export type LoyaltyTabType = 'customer' | 'driver';

// Point Conversion
export interface PointsToBalance {
    id: string;
    points_equals_one: number;
    type: LoyaltyTabType;
    created_at: string;
    updated_at: string;
}

export type PointsToBalanceResponse = PointsToBalance[];

export interface UpdatePointsToBalancePayload {
    points: number;
}

// Referral Rules
export interface ReferralPointItem {
    id: string;
    points: number;
    // type: LoyaltyTabType;
    triggerEvent: string
}

export interface GetReferralPointsResponse {
    data: ReferralPointItem[];
}

export interface UpdateReferralPointsPayload {
    points: number;
}

export interface UpdateReferralPointsResponse {
    message: string;
}

// Loyalty Points Range (Customer)
export interface LoyaltyPointsRangeItem {
    id: string;
    from: number;
    to: number;
    points: number;
    created_at: string;
    updated_at: string;
}

export interface GetLoyaltyPointsRangeResponse {
    data: LoyaltyPointsRangeItem[];
}

export interface CreateLoyaltyPointsRangePayload {
    from: number;
    to: number;
    points: number;
}

export interface CreateLoyaltyPointsRangeResponse {
    message: string;
    data: LoyaltyPointsRangeItem;
}

export interface UpdateLoyaltyPointsRangePayload {
    from: number;
    to: number;
    points: number;
}

export interface UpdateLoyaltyPointsRangeResponse {
    message: string;
    data: LoyaltyPointsRangeItem;
}

export interface DeleteLoyaltyPointsRangeResponse {
    message: string;
}

// Rider Loyalty Points Range (Rider)
export interface RiderLoyaltyPointsRangeTier {
    id: string;
    name: string;
}

export interface RiderLoyaltyPointsRangeItem {
    id: string;
    tier_id: string;
    no_of_rides_completed: number;
    points: number;
    created_at: string;
    updated_at: string;
    tier?: RiderLoyaltyPointsRangeTier;
}

export interface GetRiderLoyaltyPointsRangeResponse {
    data: RiderLoyaltyPointsRangeItem[];
}

export interface CreateRiderLoyaltyPointsRangePayload {
    tier_id: string;
    no_of_rides_completed: number;
    points: number;
}

export interface CreateRiderLoyaltyPointsRangeResponse {
    message: string;
    data: RiderLoyaltyPointsRangeItem;
}

export interface UpdateRiderLoyaltyPointsRangePayload {
    tier_id: string;
    no_of_rides_completed: number;
    points: number;
}

export interface UpdateRiderLoyaltyPointsRangeResponse {
    message: string;
    data: RiderLoyaltyPointsRangeItem;
}

export interface DeleteRiderLoyaltyPointsRangeResponse {
    message: string;
}

// Points History
export type PointsHistoryFilterType = 'all' | 'referral' | 'loyalty';

export interface PointsHistoryQueryParams {
    page?: number;
    limit?: number;
    type?: PointsHistoryFilterType;
    start_date?: string;
    end_date?: string;
}

export interface PointsHistoryItem {
    id: string;
    user_name: string;
    pointsHistory_points: number;
    pointsHistory_type: 'referral' | 'loyalty';
    pointsHistory_created_at: string;
}

export interface PointsHistoryPagination {
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
}

export interface CustomerPointsHistoryData extends PointsHistoryPagination {
    customerPointsHistory: PointsHistoryItem[];
}

export interface GetCustomerPointsHistoryResponse {
    returnCustomerPointsHistory: CustomerPointsHistoryData;
}

export interface RiderPointsHistoryData extends PointsHistoryPagination {
    riderPointsHistory: PointsHistoryItem[];
}

export interface GetRiderPointsHistoryResponse {
    returnRiderPointsHistory: RiderPointsHistoryData;
}

// Loyalty Dashboard
export interface CustomerLoyaltyDashboardData {
    total_loyal_customers: number;
    total_loyal_customers_stats: string;
    total_customer_points_issued: number;
    total_customer_points_issued_stats: string;
    customers_points_redeemed: number;
    customers_points_redeemed_stats: string;
    active_customers_referrals: number;
    active_customers_referrals_stats: string;
}

export interface GetCustomerLoyaltyDashboardResponse {
    data: CustomerLoyaltyDashboardData;
}

export interface RiderLoyaltyDashboardData {
    total_loyal_riders: number;
    total_loyal_riders_stats: string;
    total_riders_points_issued: number;
    total_riders_points_issued_stats: string;
    riders_points_redeemed: number;
    riders_points_redeemed_stats: string;
    active_riders_referrals: number;
    active_riders_referrals_stats: string;
}

export interface GetRiderLoyaltyDashboardResponse {
    data: RiderLoyaltyDashboardData;
}

// Point Adjustments
export interface CreateRiderPointAdjustmentPayload {
    rider_id: string;
    points: number;
    description?: string;
    type?: 'credit' | 'debit';
}

export interface CreateRiderPointAdjustmentResponse {
    message: string;
    data: {
        id: string;
        rider_id: string;
        points: number;
        description?: string;
        type: 'credit' | 'debit';
        created_at: string;
    };
}

export interface UpdateRiderPointAdjustmentResponse {
    message: string;
    data: {
        id: string;
        rider_id: string;
        points: number;
        updated_at: string;
    };
}

export interface GetRiderPointsResponse {
    data: {
        id: string;
        rider_id: string;
        total_points: number;
        available_points: number;
        redeemed_points: number;
    };
}

export interface CreateCustomerPointAdjustmentPayload {
    customer_id: string;
    points: number;
    description?: string;
    type?: 'credit' | 'debit';
}

export interface CreateCustomerPointAdjustmentResponse {
    message: string;
    data: {
        id: string;
        customer_id: string;
        points: number;
        description?: string;
        type: 'credit' | 'debit';
        created_at: string;
    };
}

export interface UpdateCustomerPointAdjustmentResponse {
    message: string;
    data: {
        id: string;
        customer_id: string;
        points: number;
        updated_at: string;
    };
}

export interface GetCustomerPointsResponse {
    data: {
        id: string;
        customer_id: string;
        total_points: number;
        available_points: number;
        redeemed_points: number;
    };
}

export interface UpdatePointsToBalanceResponse {
    message: string;
    data: PointsToBalance;
}
