
export interface StoreEarningCardStat {
    value: number;
    change: number;
}

export interface StoreEarningCards {
    totalEarnings: StoreEarningCardStat;
    totalCommission: StoreEarningCardStat;
    pendingWithdrawals: StoreEarningCardStat;
}


export type StoreEarningGraphGranularity = 'day' | 'week' | 'month' | 'year';

export interface StoreEarningGraphMeta {
    granularity: StoreEarningGraphGranularity;
}

export type StoreEarningGraphAxis = 'y' | 'y1';
export type StoreEarningGraphUnit = 'count' | 'currency';

export interface StoreEarningGraphPoint {
    t: string; // ISO date string
    v: number;
}

export interface StoreEarningGraphSeries {
    key: string;
    label: string;
    axis: StoreEarningGraphAxis;
    unit: StoreEarningGraphUnit;
    points: StoreEarningGraphPoint[];
}

export interface StoreEarningGraph {
    meta: StoreEarningGraphMeta;
    series: StoreEarningGraphSeries[];
}


export interface StoreZoneWiseEarning {
    name: string;
    orders: number;
    revenue: number;
}

export interface StorePaymentMethodStat {
    [key: string]: unknown;
    name: string;
    value: number;
    percentage: number;
}

export interface StoreEarningFilter {
    period: string;
    startDate: string | null;
    endDate: string | null;
}

export interface StoreEarningViewItem {
    [key: string]: unknown;
    orderId: string;
    customerName: string;
    customerImage: string;
    zoneType: string;
    vendorName: string;
    orderAmount: number;
    storeName: string;
    commissionValue: number;
    commissionSnapshotAvailable?: boolean;
    commissionNet?: number;
    vatOnCommission?: number;
    totalCommissionDebit?: number;
    deliveryFee: number;
    riderTip?: number;
    netIncome?: number;
    paymentMethod: string;
    dateTime: string;
    status: string;
}

export interface StoreEarningViewPagination {
    total: number;
    limit: number;
    page: number;
    hasNext: boolean;
    hasPrevious: boolean;
}
