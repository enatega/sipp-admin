export interface StoreDashboardCard {
  value: number;
  change: number;
}

export interface StoreDashboardCards {
  totalSales: StoreDashboardCard;
  totalOrders: StoreDashboardCard;
  storeRating: StoreDashboardCard;
  cancelledOrders: StoreDashboardCard;
  walletBalance: StoreDashboardCard;
}

export interface StorePeakHour {
  hour: string;
  orders: number;
}

export interface StoreCustomerGrowthChartItem {
  type: string;
  value: number;
  percentage: number;
}

export interface StoreCustomerGrowth {
  totalSales: number;
  totalRevenue: number;
  chart: StoreCustomerGrowthChartItem[];
}

export interface StoreGraphPoint {
  t: string;
  v: number;
}

export interface StoreGraphSeries {
  key: string;
  label: string;
  axis: string;
  unit: string;
  points: StoreGraphPoint[];
}

export interface StoreGraphMeta {
  granularity: string;
}

export interface StoreGraph {
  meta: StoreGraphMeta;
  series: StoreGraphSeries[];
}

export type StoreDashboardPeriod =
  | 'all'
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'custom';

export interface StoreDashboardFilter {
  period: StoreDashboardPeriod;
  startDate: string | null;
  endDate: string | null;
}

export interface StoreDashboardUser {
  id: string;
  name: string;
  image: string | null;
}

export interface StoreDashboardUserWrapper {
  id: string;
  user: StoreDashboardUser;
}

export type StoreOrderStatus =
  | 'pending'
  | 'in_progress'
  | 'ongoing'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface StoreRecentOrder {
  orderId: string;
  customer: StoreDashboardUserWrapper;
  productName: string;
  workerRider: StoreDashboardUserWrapper | null;
  status: StoreOrderStatus;
  amount: number;
  createdAt: string;
}
