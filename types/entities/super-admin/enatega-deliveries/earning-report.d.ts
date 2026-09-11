import { TLimitType } from "@/components/shared/TableShimmer";

// Card item (used inside cards object)
export interface DashboardCardStat {
    value: number;
    change: number;
}

// Cards section
export interface DashboardCards {
    totalOrders: DashboardCardStat;
    totalEarnings: DashboardCardStat;
    totalSales: DashboardCardStat;
    totalCommission: DashboardCardStat;
    totalWithdrawals: DashboardCardStat;
}

// ================= GRAPH =================

export type GraphGranularity = 'day' | 'week' | 'month' | 'year';

export interface GraphMeta {
    granularity: GraphGranularity;
}

export type GraphAxis = 'y' | 'y1';
export type GraphUnit = 'count' | 'currency';

export interface GraphPoint {
    t: string; // ISO date string
    v: number;
}

export interface GraphSeries {
    key: string;
    label: string;
    axis: GraphAxis;
    unit: GraphUnit;
    points: GraphPoint[];
}

export interface DashboardGraph {
    meta: GraphMeta;
    series: GraphSeries[];
}

// ================= ZONE WISE =================

export interface ZoneWiseEarning {
    name: string;
    orders: number;
    revenue: number;
}

// ================= PAYMENT METHOD =================

export interface PaymentMethodStat {
    [key: string]: unknown;
    name: string;
    value: number;
    percentage: number;
}

// ================= STORE TYPE =================

export interface StoreTypeEarning {
    name: string;
    orders: number;
    revenue: number;
}


// ================== Earning View ===============

// ================= ORDER ITEM =================

export type OrderStatus =
    | 'pending'
    | 'accepted'
    | 'in_progress'
    | 'delivered'
    | 'cancelled';

export interface EarningReportItem {
    [key: string]: unknown;
    orderId: string;
    customerName: string;
    customerImage: string | null;
    zoneType: string;
    vendorName: string;
    orderAmount: number;
    storeName: string;
    commissionValue: number;
    deliveryFee: number;
    paymentMethod: string;
    dateTime: string; // ISO string
    status: OrderStatus;
}

// ================= FILTER =================

export type ReportPeriod =
    | 'today'
    | 'week'
    | 'month'
    | 'year'
    | 'all';

export interface EarningReportFilter {
    period: ReportPeriod;
    startDate: string | null;
    endDate: string | null;
}

// ================= PAGINATION =================

export interface EarningReportPagination {
    total: number;
    limit: TLimitType;
    page: number;
}