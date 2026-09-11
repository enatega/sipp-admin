export interface Coupon {
    max_discount_cap: number;
    id: string;
    code: string;
    title: string;
    discount_type: DiscountType;
    values: number;
    usage_limit: UsageLimit;
    validity: Validity;
    description: string;
    minimum_order_value: number;
    payment_method: PaymentMethod[];
    delivery_type: DeliveryType[];
    for_new_user_only: boolean;
    for_premium_shops_only: boolean;
    stores: Store[];
    applied_to: AppliedTo;
    store_name: string;
    status: CouponStatus;
}

export interface UsageLimit {
    total: number;
    per_user: number;
}

export interface Validity {
    start_date: string; // ISO Date string
    end_date: string;   // ISO Date string
    active_immediately: boolean;
}

export interface Store {
    id: string;
    name: string;
    image: string;
}

/* Enums / Union Types */

export type DiscountType = "%" | "flat";

export type PaymentMethod = "COD" | "CARD";

export type DeliveryType = "ALL" | "DELIVERY" | "PICKUP";

export type AppliedTo = "store" | "product" | "category";

export type CouponStatus = "active" | "inactive" | "expired";