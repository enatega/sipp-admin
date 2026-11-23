import { Coupon, CouponStatus, DeliveryType, DiscountType, PaymentMethod } from "@/types";
export interface GetAllCouponsResponse {
    data: Coupon[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface GetCouponByIdResponse {
    message: string;
    data: Coupon
}


export interface DeleteCouponPayload {
    id: string;
}

export interface DeleteCouponResponse {
    message: string;
}

export interface UpdateCouponPayload {
    id: string; // required
    name?: string;
    description?: string;
    discount_type?: 'PERCENTAGE' | 'FIXED' | 'FREE_DELIVERY';
    discount_value?: number;
    max_discount_cap?: number;
    min_order_value?: number;
    total_usage_limit?: number;
    applies_to_products?: string[];
    usage_per_user?: number;
    active_immediately?: boolean;
    payment_method?: string[];
    delivery_type?: string[];
    for_new_users?: boolean;
    only_premium_shops?: boolean;
    store_id?: string[];
    start_date?: string;
    end_date?: string;
    status?: 'active' | 'inactive';
}

export interface UpdatedCouponData {
    id: string;
    name: string;
    code: string;
    description: string;
    discount_type: DiscountType;
    discount_value: number;
    max_discount_cap: number | null;
    min_order_value: number;
    total_usage_limit: number;
    applies_to_products: string[] | null;
    usage_per_user: number;
    start_date: string; // ISO date string
    end_date: string;   // ISO date string
    active_immediately: boolean;
    isActive: boolean;
    status: CouponStatus;
    payment_method: PaymentMethod[];
    delivery_type: DeliveryType[];
    for_new_users: boolean;
    only_premium_shops: boolean;
    store_id: string[];
    vendor_id: string | null;
    createdAt: string;  // ISO date string
    updatedAt: string;  // ISO date string
}

export interface UpdateCouponResponse {
    message: string;
    data: UpdatedCouponData;
}




export interface CreateCouponPayload {
    name: string;
    code: string;
    description?: string;
    discount_type: 'PERCENTAGE' | 'FIXED' | 'FREE_DELIVERY';
    discount_value: number;
    max_discount_cap?: number;
    min_order_value?: number;
    total_usage_limit?: number;
    applies_to_products?: string[];
    usage_per_user?: number;
    start_date: string;
    end_date: string;
    active_immediately?: boolean;
    status: 'active' | 'inactive';
    payment_method: string[];
    delivery_type: string[];
    for_new_users?: boolean;
    only_premium_shops?: boolean;
    store_id?: string[];
}
export interface CreateCouponResponse {
    message: string;
    data: CreatedCoupon;
}

export interface CreatedCoupon {
    id: string;
    name: string;
    code: string;
    description: string;
    discount_type: DiscountType;
    discount_value: number;
    max_discount_cap: number | null;
    min_order_value: number;
    total_usage_limit: number;
    usage_per_user: number;
    start_date: string; // ISO date string
    end_date: string;   // ISO date string
    active_immediately: boolean;
    isActive: boolean;
    status: CouponStatus;
    payment_method: PaymentMethod[];
    delivery_type: DeliveryType[];
    for_new_users: boolean;
    only_premium_shops: boolean;
    store_id: string[];
    applies_to_products: string[] | null;
    vendor_id: string | null;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
}


/* Coupon usage (shared by the admin and store coupon lists) */

export interface CouponUsageCustomer {
    customer_id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    used_count: number;
    total_discount: number;
    last_used_at: string;
    /** True once this customer has used the coupon `usage_per_user` times. */
    limit_reached: boolean;
}

export interface CouponUsageOrder {
    id: string;
    customer_id: string;
    customer_name: string | null;
    store_id: string | null;
    store_name: string | null;
    status: string;
    payment_status: string;
    discount_amount: number;
    total_amount: number;
    created_at: string;
}

export interface CouponUsageResponse {
    coupon: {
        id: string;
        code: string;
        title: string;
        status: CouponStatus;
        total_usage_limit: number;
        usage_per_user: number;
    };
    summary: {
        used_count: number;
        remaining: number | null;
        limit_reached: boolean;
        unique_customers: number;
        total_discount: number;
    };
    customers: CouponUsageCustomer[];
    orders: {
        data: CouponUsageOrder[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
