import type {
  StoreCustomerGrowth,
  StoreDashboardCards,
  StoreGraphMeta,
  StoreGraphSeries,
  StorePeakHour,
  StoreRecentOrder,
} from '@/types';

export interface IStoreDashboardStats {
  data?: StoreDashboardCards;
  isLoading: boolean;
}

export interface IStoreRevenueChart {
  series?: StoreGraphSeries[];
  meta?: StoreGraphMeta;
  isLoading: boolean;
}

export interface IStoreDeliveryStatusChart {
  data?: StoreCustomerGrowth;
  isLoading: boolean;
}

export interface IStoreZonePerformanceChart {
  data?: StorePeakHour[];
  isLoading: boolean;
}

export interface IStoreOrdersTable {
  data?: StoreRecentOrder[];
  isLoading: boolean;
}
