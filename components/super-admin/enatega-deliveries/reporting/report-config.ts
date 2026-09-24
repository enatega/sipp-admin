import type { AdminReportKey } from '@/types/api/super-admin/enatega-deliveries/reporting/reporting.api';

export type ReportValueFormat =
  | 'text'
  | 'currency'
  | 'number'
  | 'percentage'
  | 'date'
  | 'status'
  | 'boolean';

export type ReportColumn = {
  label: string;
  keys: readonly string[];
  format?: ReportValueFormat;
};

export type ReportTab = {
  key: AdminReportKey;
  label: string;
  description: string;
  fileName: string;
  columns: ReportColumn[];
};

export type ReportPageConfig = {
  title: string;
  description: string;
  tabs: ReportTab[];
  showSalesSummary?: boolean;
};

const city = { label: 'City / Zone', keys: ['city.name', 'city'], format: 'text' } as const;
const store = { label: 'Restaurant', keys: ['storeName', 'name'], format: 'text' } as const;

export const REPORT_PAGE_CONFIGS: Record<
  | 'salesOrders'
  | 'taxCommission'
  | 'cancellations'
  | 'financialPayouts'
  | 'customersPromotions',
  ReportPageConfig
> = {
  salesOrders: {
    title: 'Sales & Orders',
    description: 'Detailed order, restaurant sales and product performance reporting.',
    showSalesSummary: true,
    tabs: [
      {
        key: 'sales/orders',
        label: 'Detailed Orders',
        description: 'Line-by-line financial and fulfilment details for every order.',
        fileName: 'detailed-orders-report',
        columns: [
          { label: 'Order ID', keys: ['orderId'] },
          { label: 'Delivered at', keys: ['deliveredAt', 'createdAt'], format: 'date' },
          { label: 'Customer', keys: ['customerName'] },
          store,
          city,
          { label: 'Payment method', keys: ['paymentMethod'], format: 'status' },
          { label: 'Payment status', keys: ['paymentStatus'], format: 'status' },
          { label: 'Order status', keys: ['status'], format: 'status' },
          { label: 'Subtotal', keys: ['subtotal'], format: 'currency' },
          { label: 'Discount', keys: ['discount'], format: 'currency' },
          { label: 'Product tax', keys: ['productTax'], format: 'currency' },
          { label: 'Delivery fee', keys: ['deliveryFee'], format: 'currency' },
          { label: 'Packing charges', keys: ['packingCharges'], format: 'currency' },
          { label: 'Rider tip', keys: ['riderTip'], format: 'currency' },
          { label: 'Total amount', keys: ['totalAmount'], format: 'currency' },
        ],
      },
      {
        key: 'sales/restaurants',
        label: 'Restaurant Sales',
        description: 'Sales and net earnings grouped by restaurant.',
        fileName: 'restaurant-sales-report',
        columns: [
          store,
          city,
          { label: 'Delivered orders', keys: ['deliveredOrders'], format: 'number' },
          { label: 'Gross sales', keys: ['grossSales'], format: 'currency' },
          { label: 'Discounts', keys: ['discounts'], format: 'currency' },
          { label: 'Product tax', keys: ['productTax'], format: 'currency' },
          { label: 'Commission', keys: ['totalCommission'], format: 'currency' },
          { label: 'Net store earnings', keys: ['netStoreEarnings'], format: 'currency' },
        ],
      },
      {
        key: 'sales/products',
        label: 'Product Sales & Best Sellers',
        description: 'Products ranked by quantity sold, including gross product sales.',
        fileName: 'product-sales-report',
        columns: [
          { label: 'Product', keys: ['productName'] },
          store,
          city,
          { label: 'Quantity sold', keys: ['quantitySold'], format: 'number' },
          { label: 'Gross product sales', keys: ['grossProductSales'], format: 'currency' },
        ],
      },
    ],
  },
  taxCommission: {
    title: 'Tax & Commission',
    description: 'Product VAT/tax and platform commission breakdowns.',
    tabs: [
      {
        key: 'tax/product',
        label: 'VAT / Product Tax',
        description: 'Inclusive product tax collected on delivered orders.',
        fileName: 'product-tax-report',
        columns: [
          { label: 'Order ID', keys: ['orderId'] },
          { label: 'Delivered at', keys: ['deliveredAt'], format: 'date' },
          store,
          city,
          { label: 'Tax mode', keys: ['taxMode'], format: 'status' },
          { label: 'Gross product amount', keys: ['grossProductAmount'], format: 'currency' },
          { label: 'Net product amount', keys: ['netProductAmount'], format: 'currency' },
          { label: 'Product tax', keys: ['productTax'], format: 'currency' },
          { label: 'Tax snapshot', keys: ['taxSnapshotAvailable'], format: 'boolean' },
        ],
      },
      {
        key: 'tax/commission',
        label: 'Commission',
        description: 'Commission base, rate, VAT and total deduction per order.',
        fileName: 'commission-report',
        columns: [
          { label: 'Order ID', keys: ['orderId'] },
          { label: 'Delivered at', keys: ['deliveredAt', 'date'], format: 'date' },
          store,
          city,
          { label: 'Commission base', keys: ['commissionBase'], format: 'currency' },
          { label: 'Commission rate', keys: ['commissionRate'], format: 'percentage' },
          { label: 'Commission net', keys: ['commissionNet'], format: 'currency' },
          { label: 'Commission VAT rate', keys: ['commissionVatRate'], format: 'percentage' },
          { label: 'VAT on commission', keys: ['commissionVat'], format: 'currency' },
          { label: 'Total deduction', keys: ['totalCommissionDebit'], format: 'currency' },
          { label: 'Absorbed VAT', keys: ['absorbedVat'], format: 'currency' },
          { label: 'Snapshot', keys: ['snapshotAvailable'], format: 'boolean' },
        ],
      },
    ],
  },
  cancellations: {
    title: 'Cancellations',
    description: 'Cancelled orders, reasons and responsible account details.',
    tabs: [
      {
        key: 'cancellations',
        label: 'Cancellation Report',
        description: 'All cancelled orders matching the selected filters.',
        fileName: 'cancellation-report',
        columns: [
          { label: 'Order ID', keys: ['orderId'] },
          { label: 'Cancelled at', keys: ['cancelledAt'], format: 'date' },
          { label: 'Created at', keys: ['createdAt'], format: 'date' },
          store,
          city,
          { label: 'Customer', keys: ['customerName'] },
          { label: 'Payment method', keys: ['paymentMethod'], format: 'status' },
          { label: 'Status', keys: ['status'], format: 'status' },
          { label: 'Cancellation reason', keys: ['reason'] },
          { label: 'Cancelled by', keys: ['cancelledBy'] },
          { label: 'Order amount', keys: ['totalAmount'], format: 'currency' },
        ],
      },
    ],
  },
  financialPayouts: {
    title: 'Financial & Payouts',
    description: 'Restaurant financial position and courier earnings and payouts.',
    tabs: [
      {
        key: 'restaurants/financial-summary',
        label: 'Restaurant Financial Summary',
        description: 'Sales, deductions, withdrawals and current wallet balance by restaurant.',
        fileName: 'restaurant-financial-summary-report',
        columns: [
          store,
          city,
          { label: 'Delivered orders', keys: ['deliveredOrders'], format: 'number' },
          { label: 'Total sales', keys: ['totalSales'], format: 'currency' },
          { label: 'Commission net', keys: ['commissionNet'], format: 'currency' },
          { label: 'Commission VAT', keys: ['commissionVat'], format: 'currency' },
          { label: 'Total commission deduction', keys: ['totalCommissionDeduction'], format: 'currency' },
          { label: 'Store net earnings', keys: ['storeNetEarnings'], format: 'currency' },
          { label: 'Approved withdrawals', keys: ['approvedWithdrawals'], format: 'currency' },
          { label: 'Pending withdrawals', keys: ['pendingWithdrawals'], format: 'currency' },
          { label: 'Current wallet balance', keys: ['currentWalletBalance'], format: 'currency' },
        ],
      },
      {
        key: 'couriers/earnings',
        label: 'Courier Earnings & Payouts',
        description: 'Courier delivery earnings, deductions, payouts and wallet balances.',
        fileName: 'courier-earnings-payout-report',
        columns: [
          { label: 'Courier', keys: ['riderName', 'name'] },
          city,
          { label: 'Deliveries', keys: ['deliveries'], format: 'number' },
          { label: 'Delivery fees', keys: ['deliveryFees'], format: 'currency' },
          { label: 'Courier delivery earnings', keys: ['riderDeliveryEarnings'], format: 'currency' },
          { label: 'Tips', keys: ['tips'], format: 'currency' },
          { label: 'Platform delivery commission', keys: ['platformDeliveryCommission'], format: 'currency' },
          { label: 'Approved payouts', keys: ['approvedPayouts'], format: 'currency' },
          { label: 'Pending payouts', keys: ['pendingPayouts'], format: 'currency' },
          { label: 'Current wallet balance', keys: ['currentWalletBalance'], format: 'currency' },
        ],
      },
    ],
  },
  customersPromotions: {
    title: 'Customers & Promotions',
    description: 'Customer lifetime order value and promotion performance.',
    tabs: [
      {
        key: 'customers/lifetime',
        label: 'Customer Lifetime Value',
        description: 'Post-launch order history and value grouped by customer.',
        fileName: 'customer-lifetime-value-report',
        columns: [
          { label: 'Customer', keys: ['customerName', 'name'] },
          { label: 'Email', keys: ['email'] },
          { label: 'Phone', keys: ['phone'] },
          { label: 'First order', keys: ['firstOrderAt'], format: 'date' },
          { label: 'Last order', keys: ['lastOrderAt'], format: 'date' },
          { label: 'Total orders', keys: ['totalOrders'], format: 'number' },
          { label: 'Delivered orders', keys: ['deliveredOrders'], format: 'number' },
          { label: 'Cancelled orders', keys: ['cancelledOrders'], format: 'number' },
          { label: 'Lifetime value', keys: ['lifetimeValue'], format: 'currency' },
          { label: 'Average order value', keys: ['averageOrderValue'], format: 'currency' },
        ],
      },
      {
        key: 'promotions',
        label: 'Coupons & Discounts',
        description: 'Coupon, deal and other discount usage and sales impact.',
        fileName: 'coupon-discount-report',
        columns: [
          { label: 'Promotion type', keys: ['promotionType'], format: 'status' },
          { label: 'Promotion code', keys: ['promotionCode'] },
          { label: 'Orders', keys: ['orders'], format: 'number' },
          { label: 'Total discount', keys: ['totalDiscount'], format: 'currency' },
          { label: 'Gross sales', keys: ['grossSales'], format: 'currency' },
        ],
      },
    ],
  },
};

export type ReportPageName = keyof typeof REPORT_PAGE_CONFIGS;
