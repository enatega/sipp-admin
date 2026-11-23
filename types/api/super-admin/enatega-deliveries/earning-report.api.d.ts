import {
  DashboardCards,
  DashboardGraph,
  EarningReportFilter,
  EarningReportItem,
  EarningReportPagination,
  PaymentMethodStat,
  StoreTypeEarning,
  ZoneWiseEarning,
} from '@/types/entities/super-admin/enatega-deliveries/earning-report';

//=============== Earning Dashboard =================

export interface GetEarningDashboardParams {
  period?: 'today' | 'this_week' | 'this_month' | 'all' | 'custom';
  startDate?: string;
  endDate?: string;
  storeId?: string;
  modeScope?: string;
}

export interface GetEarningDashboardResponse {
  cards: DashboardCards;
  graph: DashboardGraph;
  zoneWiseEarnings: ZoneWiseEarning[];
  paymentMethod: PaymentMethodStat[];
  storeTypeEarning: StoreTypeEarning[];
}

// ================== Earning View =================

export interface GetEarningViewParams {
  period?: 'today' | 'week' | 'month' | 'year' | 'all' | 'custom';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  shopTypeId?: string;
  search?: string;
  storeId?: string;
  modeScope?: string;
}

export interface GetEarningViewResponse {
  data: EarningReportItem[];
  filter: EarningReportFilter;
  pagination: EarningReportPagination;
}
