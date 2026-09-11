export type VendorEarningStatus = 'completed' | 'cancelled' | 'pending';

export interface VendorEarningItem {
    order_id: string;
    customer_name: string;
    store_name: string;
    amount: number;
    zone_name: string;
    status: VendorEarningStatus
    date_time: string;
    [key: string]: unknown;
}

