import { VendorCategorySales, VendorPeakHour } from '@/types/entities/vendor/deliveries/dashboard';

// Vendor Card Data Types
export interface VendorCardDataValue {
  value: string;
  changePercent: string;
}

export interface VendorCardsData {
  totalOrders: VendorCardDataValue;
  completedDeliveries: VendorCardDataValue;
  totalRevenue: VendorCardDataValue;
  activeDrivers: VendorCardDataValue;
}

// Chart Time Series Types
export interface VendorPoint {
  t: string;
  v: number;
}

export interface VendorSeries {
  key: string;
  label: string;
  unit: string;
  points: VendorPoint[];
}

export interface VendorMeta {
  granularity: string;
}

// Delivery Status Distribution Types
export interface VendorDeliveryStatusDistribution {
  status: string;
  count: number;
  revenue: number;
  percentage: number;
}

// Zone Performance Types
export interface VendorZonePerformance {
  zoneId: string;
  zoneName: string;
  deliveryCount: number;
  deliveryRevenue: number;
}

// Order Item Types
export type VendorOrderStatus =
  | 'pending'
  | 'in_progress'
  | 'ongoing'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface VendorOrderItem {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone?: string;
  address: string;
  status: VendorOrderStatus;
  amount: number;
  date: string;
  zone: string;
  driverName?: string;
  driverPhone?: string;
  [key: string]: unknown; // Index signature for DownloadButtons compatibility
}

// Pagination Response Types
export interface VendorPagination {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
}

export interface GetVendorOrdersResponse {
  data: VendorOrderItem[];
  pagination: VendorPagination;
}

// Component Props Types
export interface IVendorDashboardStats {
  data?: VendorCardsData;
  isLoading: boolean;
}

export interface IVendorRevenueChart {
  series?: VendorSeries[];
  meta?: VendorMeta;
  isLoading: boolean;
}

export interface IVendorDeliveryStatusChart {
  data?: VendorCategorySales;
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
}

export interface IVendorZonePerformanceChart {
  data?: VendorZonePerformance[];
  isLoading: boolean;
}

export interface IVendorOrdersTable {
  data?: GetVendorOrdersResponse;
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
}

export interface IVendorPeakHoursChart {
  data?: VendorPeakHour[];
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
}
