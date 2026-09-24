export const adminModuleBasePaths = { deliveries: '/deliveries' } as const;
export const legacyAdminModuleBasePaths = {
  deliveries: '/enatega-deliveries',
} as const;

const withSuffix = (suffix = ''): string =>
  adminModuleBasePaths.deliveries + suffix;

export const adminRoutes = {
  deliveries: {
    base: adminModuleBasePaths.deliveries,
    dashboard: withSuffix('/dashboard'),
    vendors: withSuffix('/vendors'),
    stores: withSuffix('/stores'),
    riders: withSuffix('/riders'),
    orders: withSuffix('/orders'),
    discountsOffers: withSuffix('/discounts-offers'),
    deliveryFee: withSuffix('/delivery-fee'),
    shopTypes: withSuffix('/shop-types'),
    taxRates: withSuffix('/tax-rates'),
    commissionRate: withSuffix('/commission-rate'),
    earningsReports: withSuffix('/earnings-reports'),
    withdrawalRequests: withSuffix('/withdrawal-requests'),
    customerLoyaltyAndReferrals: withSuffix('/customer-loyalty-and-referrals'),
    subscriptionPlans: withSuffix('/subscription-plans'),
    banners: withSuffix('/banners'),
    liveTracking: withSuffix('/live-tracking'),
    refundAndResponsibilities: withSuffix('/refund-and-responsibilities'),
    reporting: {
      base: withSuffix('/reporting'),
      salesOrders: withSuffix('/reporting/sales-orders'),
      taxCommission: withSuffix('/reporting/tax-commission'),
      cancellations: withSuffix('/reporting/cancellations'),
      financialPayouts: withSuffix('/reporting/financial-payouts'),
      customersPromotions: withSuffix('/reporting/customers-promotions'),
    },
    settings: withSuffix('/settings'),
  },
} as const;

export const canonicalizeAdminPath = (path: string): string => {
  const legacyBase = legacyAdminModuleBasePaths.deliveries;
  if (path === legacyBase || path.startsWith(legacyBase + '/')) {
    return path.replace(legacyBase, adminModuleBasePaths.deliveries);
  }
  return path;
};

export const buildScopedDeliveriesAdminPathFromCurrent = (
  _currentPath: string,
  legacyPath: string,
): string => canonicalizeAdminPath(legacyPath);
