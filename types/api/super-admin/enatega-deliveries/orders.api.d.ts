import { OrdersResponse } from '@/types';
import { AvailableRider } from '@/types/entities/super-admin/enatega-deliveries/orders';

export interface SimpleStoreItem {
    id: string;
    storename: string;
}

export type GetSimpleStoresListResponse = SimpleStoreItem[];

export interface OrderRiderFilterOption {
    id: string;
    name: string;
    phone: string | null;
}

export type GetOrderRiderFilterOptionsResponse = OrderRiderFilterOption[];

export interface GetOrdersQueryParams {
    deliveryIssue?: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    vendorId?: string;
    storeId?: string;
    riderId?: string;
    orderType?: string;
    categoryId?: string;
    modeScope?: string;
}
export interface OrderItemData {
    deliveryIssueCount?: number;
    orderId: string;
    riderId: string | null;
    customerName: string;
    customerPhone: string;
    customerProfile: string;
    vendorName: string;
    storeName: string;
    riderName: string | null;
    riderProfile?: string;
    orderType: string;
    amount: number;
    status: string;
    paymentStatus?: string | null;
    storeAcceptanceRemindedAt?: string | null;
    dateTime: string;
    storeTimezone?: string | null;
}

export type GetOrdersResponse = OrdersResponse;

export type OrdersItem = OrderItemData;

export interface GetAvailableRidersResponse {
    riders: AvailableRider[];
}

export interface AssignRiderResponse {
    message: string;
}
