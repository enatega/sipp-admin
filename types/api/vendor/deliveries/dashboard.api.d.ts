import {
    VendorCategorySales,
    VendorDashboardCards,
    VendorDashboardFilter,
    VendorGraph,
    VendorPeakHour,
    VendorRecentOrder,
} from '@/types/entities/vendor/deliveries/dashboard';

export interface GetVendorDashboardResponse {
    cards: VendorDashboardCards;
    peakHours: VendorPeakHour[];
    categorySales: VendorCategorySales;
    graph: VendorGraph;
    recentOrders: VendorRecentOrder[];
    filter: VendorDashboardFilter;
}

// ================= QUERY PARAMS =================

export type VendorDashboardPeriod =
    | 'today'
    | 'this_week'
    | 'this_month'
    | 'all'
    | 'custom';

export interface GetVendorDashboardParams {
    vendorId: string; // required (path param)
    period?: VendorDashboardPeriod;
    startDate?: string;
    endDate?: string;
}
