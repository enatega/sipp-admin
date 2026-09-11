// Cards

export interface VendorDashboardCard {
    value: number;
    change: number;
}

export interface VendorDashboardCards {
    totalSales: VendorDashboardCard;
    totalOrders: VendorDashboardCard;
    completedOrders: VendorDashboardCard;
    totalStore: VendorDashboardCard;
}

// Peak Hours

export interface VendorPeakHour {
    hour: string;
    orders: number;
}

// Category Sales

export interface VendorCategoryChartItem {
    type: string;
    value: number;
    percentage: number;
}

export interface VendorCategorySales {
    totalSales: number;
    totalRevenue: number;
    chart: VendorCategoryChartItem[];
}

// Graph

export interface VendorGraphPoint {
    t: string;
    v: number;
}

export interface VendorGraphSeries {
    key: string;
    label: string;
    axis: string;
    unit: string;
    points: VendorGraphPoint[];
}

export interface VendorGraphMeta {
    granularity: string;
}

export interface VendorGraph {
    meta: VendorGraphMeta;
    series: VendorGraphSeries[];
}

export interface VendorDashboardFilter {
    period: 'today' | 'this_week' | 'this_month' | 'all' | 'custom';
    startDate: string | null;
    endDate: string | null;
}

// Recent Orders

export interface VendorUser {
    id: string;
    name: string;
    image: string | null;
}

export interface VendorUserWrapper {
    id: string;
    user: VendorUser;
}

export type VendorOrderStatus =
    | 'pending'
    | 'in_progress'
    | 'ongoing'
    | 'completed'
    | 'cancelled';

export interface VendorRecentOrder {
    orderId: string;
    customer: VendorUserWrapper;
    storeName: string;
    productName: string;
    workerRider: VendorUserWrapper | null;
    status: VendorOrderStatus;
    amount: number;
    createdAt: string;
}
