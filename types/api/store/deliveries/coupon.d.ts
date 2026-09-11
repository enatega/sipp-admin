import { MessageResponse } from "@/types/api/common";
import { CouponProductSummary, StoreCoupon, StoreCouponDiscountType, StoreCouponStatus } from "@/types/entities/store/deliveries/coupons";
import { Coupon } from "@/types/entities/super-admin/coupons";


export type StoreCouponDeliveryType = "ALL" | "PICKUP" | "DELIVERY";

export type StoreCouponPaymentMethod = "COD" | "CARD";

export type StoreCouponDiscountFilterType = "ALL" | "FIXED" | "PERCENTAGE";


export type StoreCouponStatusFilter =
    | "active"
    | "expired"
    | "inactive"
    | "all";

export interface GetCouponsQueryParams {
    store_id: string;
    page?: number;
    limit?: number;
    delivery_type?: StoreCouponDeliveryType;
    payment_method?: StoreCouponPaymentMethod;
    discount_type?: StoreCouponDiscountFilterType;
    search?: string;
    startDate?: string; // ISO string
    endDate?: string;   // ISO string
    status?: StoreCouponStatusFilter;
}

export interface GetCouponsResponse {
    data: StoreCoupon[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface DeleteStoreCouponResponse {
    message: string;
}

//  Add New Coupon

export interface PostCouponPayload {
    name: string;
    code: string;
    description: string;
    discount_type: StoreCouponDiscountType;
    discount_value: number;
    max_discount_cap: number;
    min_order_value: number;
    total_usage_limit: number;
    applies_to_products: string[];
    usage_per_user: number;
    start_date: string;
    end_date: string;
    active_immediately: boolean;
    status: StoreCouponStatus;
    payment_method: StoreCouponPaymentMethod[] | string[];
    delivery_type: StoreCouponDeliveryType[] | string[];
    for_new_users: boolean;
    only_premium_shops?: boolean;
}

export interface StoreCouponEntity {
    id: string;
    name: string;
    title: string;
    discount_code: string;
    description: string;
    discount_type: StoreCouponDiscountType;
    value: number;
    max_discount_cap: number;
    min_order_value: number;
    usage_limit: number;
    usage_per_user: number;
    applies_to_products: {
        id: string;
        name: string;
        image: string;
    }[];
    start_date: string;
    end_date: string;
    validity: {
        start_date: string;
        end_date: string;
    };
    active_immediately: boolean;
    isActive: boolean;
    status: StoreCouponStatus;
    payment_method: StoreCouponPaymentMethod[];
    delivery_type: StoreCouponDeliveryType[];
    for_new_users: boolean;
    vendor_id: string | null;
    createdAt: string;
    updatedAt: string;
}


export interface AddStoreCouponResponse {
    message: string;
    data: StoreCouponEntity;
}

export interface GetStoreProductsResponse {
    data: CouponProductSummary[];
    count: number;
}


export interface UpdateCouponPayload {
    name: string;
    code: string;
    description: string;
    discount_type: "PERCENTAGE" | "FIXED";
    discount_value: number;
    max_discount_cap: number;
    min_order_value: number;
    total_usage_limit: number;
    applies_to_products: string[];
    usage_per_user: number;
    active_immediately: boolean;
    payment_method: string[];
    delivery_type: string[];
    for_new_users: boolean;
    only_premium_shops: boolean;
    start_date: string;
    end_date: string;
    status: "active" | "inactive";
}

export interface UpdateCouponResponse extends MessageResponse {
    data: Coupon;
}

export type GetStoreCouponByIdResponse = StoreCouponEntity;
