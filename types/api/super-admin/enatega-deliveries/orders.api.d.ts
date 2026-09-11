import { OrdersResponse } from '@/types';
import { AvailableRider } from '@/types/entities/super-admin/enatega-deliveries/orders';

export interface SimpleStoreItem {
    id: string;
    storename: string;
}

export type GetSimpleStoresListResponse = SimpleStoreItem[];

export interface GetOrdersQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    vendorId?: string;
    storeId?: string;
    orderType?: string;
    categoryId?: string;
    modeScope?: string;
}
export interface OrderItemData {
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
    dateTime: string;
}

export type GetOrdersResponse = OrdersResponse;

export type OrdersItem = OrderItemData;

export interface GetAvailableRidersResponse {
    riders: AvailableRider[];
}

export interface AssignRiderResponse {
    message: string;
}
