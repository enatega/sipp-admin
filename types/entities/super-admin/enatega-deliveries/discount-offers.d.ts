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
    /** Switched off by an admin; `inactive` alone can also mean scheduled. */
    deactivated?: boolean;
    /** True once redemptions reach the total usage limit. */
    limit_reached?: boolean;
}

export interface UsageLimit {
    total: number;
    per_user: number;
    /** Redemptions so far (cancelled, rejected and failed orders excluded). */
    used?: number;
    /** Null when the coupon has no total limit. */
    remaining?: number | null;
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

export type DiscountType = "%" | "flat" | "free_delivery";

export type PaymentMethod = "CARD" | "WALLET";

export type DeliveryType = "ALL" | "DELIVERY" | "PICKUP";

export type AppliedTo = "store" | "product" | "category";

export type CouponStatus = "active" | "inactive" | "expired";