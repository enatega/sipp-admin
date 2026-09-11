import type {
  StoreCustomerGrowth,
  StoreDashboardCards,
  StoreDashboardFilter,
  StoreDashboardPeriod,
  StoreGraph,
  StorePeakHour,
  StoreRecentOrder,
} from '@/types/entities/store/deliveries/dashboard';

export interface GetStoreDashboardResponse {
  cards: StoreDashboardCards;
  peakHours: StorePeakHour[];
  customerGrowth: StoreCustomerGrowth;
  graph: StoreGraph;
  recentOrders: StoreRecentOrder[];
  filter: StoreDashboardFilter;
}

export interface GetStoreDashboardParams {
  storeId: string;
  period?: StoreDashboardPeriod;
  startDate?: string;
  endDate?: string;
}
