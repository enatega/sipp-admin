
export type OrdersType = 'mobile_app' | 'web' | 'pos' | string;
export type OrdersStatus =
    | 'scheduled'
    | 'pending'
    | 'accepted'
    | 'preparing'
    | 'ready'
    | 'in_progress'
    | 'rider_assigned'
    | 'picked_up'
    | 'out_for_delivery'
    | 'arrived'
    | 'delivered'
    | 'cancelled'
    | 'rejected'
    | 'failed'
    | string;

export interface OrderItem {
    orderId: string;
    customerName: string;
    customerPhone: string;
    customerProfile?: string;
    vendorName: string;
    storeName: string;
    orderType: OrdersType;
    /** Store orders API returns product name here instead of orderType */
    product?: string;
    amount: number;
    status: OrdersStatus;
    dateTime: string;
    pickupAddress: string;
    dropoffAddress: string;
    distance: string | null;
    riderUser?: {
        name?: string;
        id?: string;
        profile?: string | null;
    };
    riderId?: string | null;
    riderName?: string | null;
    riderPhone?: string | null;
    riderInfo?: {
        id?: string | null;
        name?: string | null;
        phone?: string | null;
        email?: string | null;
    } | null;
    pickupLocation?: { latitude: number; longitude: number } | null;
    dropoffLocation?: { latitude: number; longitude: number } | null;
    riderLocation?: { latitude: number; longitude: number } | null;
}

export interface OrdersResponse {
    data: OrderItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

// Detailed order API types (Order Detail)
export interface OrderProduct {
    // possible fields from backend (make optional to be safe)
    id?: string | number;
    itemName?: string;
    name?: string;
    title?: string;
    quantity?: number;
    qty?: number;
    price?: number;
    unitPrice?: number;
    finalPrice?: number;
    totalPrice?: number;
    image?: string | null;
    imageUrl?: string | null;
    selectedOptions?: unknown[];
    addons?: unknown[];
    addon?: unknown;
    duration?: string;
    notes?: string;
}

export interface OrderLog {
    status?: string;
    by?: string;
    date?: string;
    ipDevice?: string;
    notes?: string;
    // alternate backend field names (statusTimeline shape)
    state?: string;
    actor?: string;
    timestamp?: string;
    ip?: string;
    ip_device?: string;
    message?: string;
}

export interface OrderSummary {
    commissionSnapshotAvailable?: boolean;
    commissionNet?: number;
    vatOnCommission?: number;
    totalCommissionDebit?: number;
    sippAbsorbedVat?: number;
    // backend sometimes uses `id` instead of `orderId`
    id?: string | number;
    orderId?: string;
    status?: string;
    vendor?: string;
    storeName?: string;
    orderAmount?: number;
    riderEarnings?: number;
    riderDeliveryEarning?: number;
    riderPlatformCommission?: number;
    riderCommissionPercentage?: number;
    orderType?: string;
    paymentMethod?: string;
    storeCommission?: number;
    adminCommission?: number;
    dateTime?: string;
}

export interface PaymentInfo {
    commissionSnapshotAvailable?: boolean;
    commissionNet?: number;
    vatOnCommission?: number;
    totalCommissionDebit?: number;
    sippAbsorbedVat?: number;
    paymentMethod?: string;
    paymentStatus?: string;
    subtotal?: number;
    taxes?: number;
    discounts?: number;
    deliveryFee?: number;
    riderTip?: number;
    riderDeliveryEarning?: number;
    riderPlatformCommission?: number;
    riderCommissionPercentage?: number;
    adminCommission?: number;
    totalAmount?: number;
    storeEarnings?: number;
    couponApplied?: string | null;
    currency?: string;
}

export interface CustomerInfo {
    name?: string;
    avatar?: string | null;
    email?: string;
    phone?: string;
    rating?: number;
    totalReviews?: number;
    totalPastOrders?: number;
    totalSpending?: number;
}

export interface RiderInfo {
    name?: string;
    phone?: string;
    avatar?: string | null;
    rating?: number;
    totalReviews?: number;
    vehicleType?: string;
    riderUserId?: string;
    riderLocation?: { latitude: number; longitude: number };
}

export interface DeliveryInfo {
    pickupAddress?: string;
    dropoffAddress?: string;
    zone?: string;
    distance?: string | null;
    eta?: string | null;
    pickupLocation?: { latitude: number; longitude: number };
    deliveryLocation?: { latitude: number; longitude: number };
}

// Raw API response for order detail
export interface OrderDetailResponse {
    orderSummary?: OrderSummary;
    statusTimeline?: OrderLog[];
    items?: { products?: OrderProduct[]; totalPrice?: number };
    paymentInfo?: PaymentInfo;
    customerInfo?: CustomerInfo;
    riderInfo?: RiderInfo;
    deliveryInfo?: DeliveryInfo;
    orderLogs?: OrderLog[];
    [key: string]: unknown;
}

// Frontend order-detail shape (used by order-detail components)
export interface OrderDetail {
    orderId: string;
    summary: OrderSummary;
    items: OrderProduct[];
    payment: PaymentInfo | null;
    customer?: CustomerInfo;
    rider?: RiderInfo;
    delivery?: DeliveryInfo;
    // keep raw API field available for components that read it directly
    deliveryInfo?: DeliveryInfo;
    logs?: OrderLog[];
    // convenience top-level fields for UI
    vendor?: string;
    store?: string;
    storeImage?: string | null;
    product?: string;
    orderType?: string;
    zone?: string;
    amount?: number;
    currency?: string;
    pickupLocation?: { lat: number; lng: number } | null;
    dropoffLocation?: { lat: number; lng: number } | null;
    riderLocation?: { lat: number; lng: number } | null;
    riderAssigned?: boolean;
    status?: string;
    paymentMethod?: string | null;
    subtotal?: number;
    taxes?: number;
    discounts?: number;
    deliveryFee?: number;
    riderTip?: number;
    riderEarnings?: number;
    riderDeliveryEarning?: number;
    riderPlatformCommission?: number;
    riderCommissionPercentage?: number;
    adminCommission?: number;
    storeEarnings?: number;
    dateTime?: string;
    notes?: string;
    pickupAddress?: string;
    dropoffAddress?: string;
    distance?: string | null;
    eta?: string | null;
}


// --- Available Riders for order-level APIs ---
export interface AvailableRider {
    id: string;
    name?: string;
    avatar?: string | null;
    phone?: string;
    rating?: number;
    totalReviews?: number;
    distance?: number | string | null;
    distance_text?: string | null;
    is_available?: boolean;
    // Optional fields from API that some components access
    status?: string;
    profile?: string | null;
    averageRating?: number;
    score?: number;
    noOfReviews?: number;
    reviews?: number;
    // backend may return nested userProfile object
    userProfile?: {
        user?: {
            name?: string;
            profile?: string | null;
        };
    };
    [key: string]: unknown;
}

export type AvailableRiders = AvailableRider[];
