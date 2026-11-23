export interface CouponStore {
    id: string;
    name: string;
    image: string;
}

export interface CouponProduct {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
}

export interface StoreCouponValidity {
    start_date: string; // ISO
    end_date: string;   // ISO
}

export type StoreCouponDiscountType = "PERCENTAGE" | "FIXED" | "FREE_DELIVERY";

export type StoreCouponStatus = "active" | "inactive";

export type CreateCouponPaymentMethod =
    | "CARD"
    | "WALLET";

export type CreateCouponDeliveryType =
    | "ALL"
    | "PICKUP"
    | "DELIVERY";


//  Get All store coupon response

export interface StoreCoupon extends Record<string, unknown> {
    id: string;
    discount_code: string;
    title: string;
    discount_type: StoreCouponDiscountType;
    value: number;
    usage_limit: number;
    usage_per_user: number;
    used_count?: number;
    remaining_uses?: number | null;
    limit_reached?: boolean;
    validity: StoreCouponValidity;
    stores: CouponStore[];
    applies_to_products: CouponProduct[];
    isActive: boolean;
    status: StoreCouponStatus;
    created_at: string;
    updated_at: string;
}

export interface CouponProductSummary extends Record<string, unknown> {
    id: string;
    name: string;
}
