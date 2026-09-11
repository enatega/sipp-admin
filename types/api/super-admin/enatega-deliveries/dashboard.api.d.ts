export interface EnategaDeliveriesDashboardCard {
  value: number;
  change: number;
}

export interface EnategaDeliveriesDashboardCards {
  totalRevenue: EnategaDeliveriesDashboardCard;
  totalOrders: EnategaDeliveriesDashboardCard;
  totalVendors: EnategaDeliveriesDashboardCard;
  totalStores: EnategaDeliveriesDashboardCard;
  activeRiders: EnategaDeliveriesDashboardCard;
}

export interface EnategaDeliveriesDashboardPieChartItem
  extends Record<string, unknown> {
  name: string;
  value: number;
  revenue: number;
  percentage: number;
}

export interface EnategaDeliveriesDashboardPoint {
  t: string;
  v: number;
}

export interface EnategaDeliveriesDashboardSeries {
  key: string;
  label: string;
  axis: string;
  unit: string;
  points: EnategaDeliveriesDashboardPoint[];
}

export interface EnategaDeliveriesDashboardGraphMeta {
  granularity: string;
}

export interface EnategaDeliveriesDashboardGraph {
  meta: EnategaDeliveriesDashboardGraphMeta;
  series: EnategaDeliveriesDashboardSeries[];
}

export interface EnategaDeliveriesDashboardUser {
  id: string;
  name: string;
  image: string | null;
}

export interface EnategaDeliveriesDashboardParty {
  id: string;
  user: EnategaDeliveriesDashboardUser;
}

export interface EnategaDeliveriesDashboardRecentOrder {
  orderId: string;
  module: string;
  serviceType: string;
  customer: EnategaDeliveriesDashboardParty;
  workerRider: EnategaDeliveriesDashboardParty | null;
  location: string;
  status: string;
  amount: number;
  paymentMethod: string;
  createdAt: string;
}

export interface EnategaDeliveriesDashboardTopVendor {
  vendorId: string;
  vendorName: string;
  orders: number;
  revenue: number;
  rating: number;
}

export interface EnategaDeliveriesDashboardTopStore {
  storeId: string;
  storeName: string;
  orders: number;
  revenue: number;
  rating: number;
}

export interface EnategaDeliveriesDashboardTopZone {
  zoneId: string;
  zoneName: string;
  orders: number;
  revenue: number;
}

export interface EnategaDeliveriesDashboardFilter {
  period: string;
  startDate: string | null;
  endDate: string | null;
}

export interface EnategaDeliveriesDashboardResponse {
  cards: EnategaDeliveriesDashboardCards;
  pieChart: EnategaDeliveriesDashboardPieChartItem[];
  graph: EnategaDeliveriesDashboardGraph;
  recentOrders: EnategaDeliveriesDashboardRecentOrder[];
  topVendors: EnategaDeliveriesDashboardTopVendor[];
  topStores: EnategaDeliveriesDashboardTopStore[];
  topZones: EnategaDeliveriesDashboardTopZone[];
  filter: EnategaDeliveriesDashboardFilter;
}
