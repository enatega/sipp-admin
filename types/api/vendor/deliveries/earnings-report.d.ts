import { VendorEarningItem } from '@/types/entities/vendor/deliveries/earnings-report';

export interface VendorEarningSummaryResponse {
    cards: {
        earnings: {
            total_earnings: number;
            earnings_change: string;
        };
        orders: {
            total_orders: number;
            orders_change: string;
        };
        stores: {
            total_stores: number;
            stores_change: string;
        };
    };
}
export interface VendorEarningViewPayload {
    vendorId: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    search?: string;
    storeID?: string;
    zoneId?: string;
    status?: string;
}

export type { VendorEarningItem };

export interface VendorEarningViewResponse {
    data: VendorEarningItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
