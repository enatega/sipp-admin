import {
    StoreEarningCards,
    StoreEarningFilter,
    StoreEarningGraph,
    StoreEarningViewItem,
    StoreEarningViewPagination,
    StorePaymentMethodStat,
    StoreZoneWiseEarning
} from '@/types/entities/store/deliveries/earning-report';

// ================= Earning Dashboard =================

export interface GetStoreEarningDashboardParams {
    period?: 'today' | 'this_week' | 'this_month' | 'all' | 'custom';
    startDate?: string;
    endDate?: string;
}

export interface GetStoreEarningDashboardResponse {
    cards: StoreEarningCards;
    graph: StoreEarningGraph;
    zoneWiseEarnings: StoreZoneWiseEarning[];
    paymentMethod: StorePaymentMethodStat[];
    filter: StoreEarningFilter;
}

// ================= Earning View =================
export interface GetStoreEarningViewParams {
    period?: 'today' | 'this_week' | 'this_month' | 'all' | 'custom';
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    search?: string;
}

export interface GetStoreEarningViewResponse {
    data: StoreEarningViewItem[];
    filter: StoreEarningFilter;
    pagination: StoreEarningViewPagination;
}
