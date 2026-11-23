import type { PermissionsResponse } from '@/types';

export interface RolePermissionModule {
  id: string;
  name: string;
  subModules: {
    id: string;
    name: string;
    permissions: { id: string; name: string; description?: string }[];
  }[];
}

const MODULE_NAMES: Record<string, string> = {
  users: 'Users',
  zones: 'Zones',
  role_permissions: 'Roles and Permissions',
  notifications: 'Notifications',
  customer_support: 'Customer Support',
  dashboard: 'Dashboard',
  vendors: 'Vendors',
  stores: 'Stores',
  riders: 'Riders',
  orders: 'Orders',
  coupons: 'Discounts/Offers',
  delivery_fee_settings: 'Delivery Fee',
  shop_types: 'Shop Types, Favourite Foods & Home Sequence',
  tax_rates: 'Tax Rates',
  store_commissions: 'Commission Rate',
  loyalty_referral: 'Customer Loyalty and Referrals',
  subscription_plans: 'Subscription Plans',
  banners: 'Banners',
  live_tracking: 'Live Tracking',
  settings: 'Settings',
  earnings: 'Earnings Reports',
  withdrawal_requests: 'Withdrawal Requests',
  refund_responsibilities: 'Refund & Responsibilities',
  products: 'Products (Store)',
  categories: 'Categories (Store)',
  addons: 'Add-ons (Store)',
  deals: 'Deals (Store)',
  reviews: 'Reviews',
  zone_commissions: 'Zone Commissions (API)',
  global_commissions: 'Global Commissions (API)',
  advanced: 'Other SIPP API actions',
};

const MODULE_ORDER = Object.keys(MODULE_NAMES);
const MODULE_ALIASES: Record<string, string> = {
  custom_support: 'customer_support',
  vendor: 'vendors',
  store: 'stores',
  rider: 'riders',
  earning: 'earnings',
  withdraw_requests: 'withdrawal_requests',
};

const GENERAL_PERMISSION_MODULES: Record<string, string> = {
  view_support_tickets: 'customer_support',
  reply_support_tickets: 'customer_support',
  close_support_tickets: 'customer_support',
  delete_support_tickets: 'customer_support',
};

function displayName(value: string): string {
  return value
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function systemDeliveryModule(name: string): string {
  if (name.includes('zone_commission')) return 'zone_commissions';
  if (name.includes('global_commission')) return 'global_commissions';
  if (name.includes('product')) return 'products';
  if (name.includes('rider_review')) return 'reviews';
  if (name.includes('rider')) return 'riders';
  return 'advanced';
}

/** Keep permission IDs intact while making the role editor match SIPP navigation. */
export function presentRolePermissions(
  data: PermissionsResponse,
): RolePermissionModule[] {
  const sections = new Map<
    string,
    Map<string, Map<string, { id: string; name: string; description?: string }>>
  >();

  for (const [mainModule, modules] of Object.entries(data)) {
    for (const [rawModule, permissions] of Object.entries(modules)) {
      for (const permission of permissions) {
        const systemDelivery =
          mainModule === 'system' && permission.name.startsWith('delivery_');
        const generalAction = Boolean(
          GENERAL_PERMISSION_MODULES[permission.name],
        );
        if (
          !systemDelivery &&
          !generalAction &&
          mainModule !== 'general' &&
          mainModule !== 'general-delivery'
        )
          continue;

        const section =
          generalAction || mainModule === 'general'
            ? 'general'
            : 'general-delivery';
        const moduleKey = systemDelivery
          ? systemDeliveryModule(permission.name)
          : GENERAL_PERMISSION_MODULES[permission.name] ||
            MODULE_ALIASES[rawModule] ||
            rawModule;
        const name = displayName(
          permission.name
            .replace(/^delivery_/, '')
            .replace(/^super_admin_/, ''),
        );
        const description = permission.description?.startsWith(
          'Demo Super Admin',
        )
          ? `Can ${name.toLowerCase()}`
          : permission.description;

        if (!sections.has(section)) sections.set(section, new Map());
        const sectionModules = sections.get(section)!;
        if (!sectionModules.has(moduleKey))
          sectionModules.set(moduleKey, new Map());
        sectionModules
          .get(moduleKey)!
          .set(permission.id, { id: permission.id, name, description });
      }
    }
  }

  return ['general', 'general-delivery']
    .filter((section) => sections.has(section))
    .map((section) => ({
      id: section,
      name: section === 'general' ? 'General' : 'SIPP Deliveries',
      subModules: [...sections.get(section)!.entries()]
        .sort(([left], [right]) => {
          const leftIndex = MODULE_ORDER.indexOf(left);
          const rightIndex = MODULE_ORDER.indexOf(right);
          return (
            (leftIndex < 0 ? Infinity : leftIndex) -
              (rightIndex < 0 ? Infinity : rightIndex) ||
            left.localeCompare(right)
          );
        })
        .map(([moduleKey, permissions]) => ({
          id: moduleKey,
          name: MODULE_NAMES[moduleKey] || displayName(moduleKey),
          permissions: [...permissions.values()],
        })),
    }));
}
