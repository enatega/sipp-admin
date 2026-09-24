export type AdminReportKey =
  | 'sales/orders'
  | 'sales/restaurants'
  | 'sales/products'
  | 'tax/product'
  | 'tax/commission'
  | 'cancellations'
  | 'restaurants/financial-summary'
  | 'couriers/earnings'
  | 'customers/lifetime'
  | 'promotions';

export interface AdminReportQuery {
  dateFrom?: string;
  dateTo?: string;
  zoneId?: string;
  storeId?: string;
  paymentMethod?: 'cash' | 'card' | 'wallet';
  orderStatus?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export type AdminReportRow = Record<string, unknown>;

export interface AdminReportMeta {
  timezone: string;
  dateFrom: string | null;
  dateTo: string | null;
  dateBasis: string;
  knownLimitations?: string[];
  scope?: string;
}

export interface AdminReportResponse {
  data: AdminReportRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  meta: AdminReportMeta;
}

export interface SalesReportSummary {
  totalOrders: number;
  deliveredOrders: number;
  grossSales: number;
  discounts: number;
  productTax: number;
  deliveryFees: number;
  packingCharges: number;
  riderTips: number;
}

export interface SalesReportSummaryResponse {
  summary: SalesReportSummary;
  meta: AdminReportMeta;
}

export type TaxCommissionReportKey = 'tax/product' | 'tax/commission';

export interface ProductTaxReportSummary {
  deliveredOrders: number;
  grossProductAmount: number;
  netProductAmount: number;
  productTax: number;
}

export interface CommissionTaxReportSummary {
  deliveredOrders: number;
  commissionBase: number;
  commissionNet: number;
  commissionVat: number;
  totalCommissionDebit: number;
  absorbedVat: number;
}

export interface TaxCommissionReportSummaryResponse {
  summary: ProductTaxReportSummary | CommissionTaxReportSummary;
  meta: AdminReportMeta;
}
