import { LayoutDashboard, LucideIcon, Settings, Utensils } from 'lucide-react';
import { deployment } from '@/config/deployment';
import { adminRoutes } from '@/lib/routes';
import { getRoleAndPermissions, hasPermission } from '@/lib/user';

export interface SidebarMenu {
  id: string | number;
  name: string;
  path: string;
  icon?: LucideIcon;
  subMenus?: readonly SidebarMenu[];
  translationKey: string;
  permission?: string;
}

export const sidebarMenus: SidebarMenu[] = [
  {
    id: 1,
    name: 'Dashboard',
    translationKey: 'sidebar.dashboard',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    id: 2,
    name: 'General',
    translationKey: 'sidebar.general',
    path: '#',
    icon: Settings,
    permission: 'general',
    subMenus: [
      {
        id: 2.1,
        name: 'Users',
        translationKey: 'sidebar.users',
        path: '/general/users',
        permission: 'general.users',
      },
      {
        id: 2.2,
        name: 'Zones',
        translationKey: 'sidebar.zones',
        path: '/general/zones',
        permission: 'general.zones',
      },
      {
        id: 2.3,
        name: 'Roles and Permissions',
        translationKey: 'sidebar.rolesAndPermissions',
        path: '/general/role-and-permissions',
        permission: 'general.role_permissions',
      },
      {
        id: 2.4,
        name: 'Notifications',
        translationKey: 'sidebar.notifications',
        path: '/general/notifications',
        permission: 'general.notifications',
      },
      {
        id: 2.5,
        name: 'Customer Support',
        translationKey: 'sidebar.customerSupport',
        path: '/general/customer-support',
        permission: 'general.custom_support',
      },
    ],
  },
  {
    id: 3,
    name: deployment.moduleLabels.deliveries,
    translationKey: 'modules.deliveries',
    path: '#',
    icon: Utensils,
    permission: 'general-delivery.dashboard',
    subMenus: [
      {
        id: 3.1,
        name: 'Dashboard',
        translationKey: 'sidebar.dashboard',
        path: adminRoutes.deliveries.dashboard,
        permission: 'general-delivery.dashboard',
      },
      {
        id: 3.2,
        name: 'Vendors',
        translationKey: 'sidebar.vendors',
        path: adminRoutes.deliveries.vendors,
        permission: 'general-delivery.vendor',
      },
      {
        id: 3.3,
        name: 'Stores',
        translationKey: 'sidebar.stores',
        path: adminRoutes.deliveries.stores,
        permission: 'general-delivery.store',
      },
      {
        id: 3.4,
        name: 'Riders',
        translationKey: 'sidebar.riders',
        path: adminRoutes.deliveries.riders,
        permission: 'general-delivery.rider',
      },
      {
        id: 3.5,
        name: 'Orders',
        translationKey: 'sidebar.orders',
        path: adminRoutes.deliveries.orders,
        permission: 'general-delivery.orders',
      },
      {
        id: 3.6,
        name: 'Discounts/Offers',
        translationKey: 'sidebar.discountsOffers',
        path: adminRoutes.deliveries.discountsOffers,
        permission: 'general-delivery.coupons',
      },
      {
        id: 3.7,
        name: 'Delivery Fee',
        translationKey: 'sidebar.deliveryFee',
        path: adminRoutes.deliveries.deliveryFee,
        permission: 'general-delivery.delivery_fee_settings',
      },
      {
        id: 3.8,
        name: 'Shop Types',
        translationKey: 'sidebar.shopTypes',
        path: adminRoutes.deliveries.shopTypes,
        permission: 'general-delivery.shop_types',
      },
      {
        id: 3.81,
        name: 'Tax Rates',
        translationKey: 'taxRates.title',
        path: adminRoutes.deliveries.taxRates,
        permission: 'general-delivery.tax_rates',
      },
      {
        id: 3.9,
        name: 'Commission Rate',
        translationKey: 'sidebar.commissionRate',
        path: adminRoutes.deliveries.commissionRate,
        permission: 'general-delivery.store_commissions',
      },
      {
        id: 3.1,
        name: 'Earnings Reports',
        translationKey: 'sidebar.earningsReports',
        path: adminRoutes.deliveries.earningsReports,
        permission: 'general-delivery.earning',
      },
      {
        id: 3.11,
        name: 'Withdrawal Requests',
        translationKey: 'sidebar.withdrawalRequests',
        path: adminRoutes.deliveries.withdrawalRequests,
        permission: 'general-delivery.withdraw_requests',
      },
      {
        id: 3.12,
        name: 'Customer Loyalty and Referrals',
        translationKey: 'sidebar.customerLoyaltyAndReferrals',
        path: adminRoutes.deliveries.customerLoyaltyAndReferrals,
        permission: 'general-delivery.loyalty_referral',
      },
      {
        id: 3.13,
        name: 'Subscription Plans',
        translationKey: 'sidebar.subscriptionPlans',
        path: adminRoutes.deliveries.subscriptionPlans,
        permission: 'general-delivery.subscription_plans',
      },
      {
        id: 3.14,
        name: 'Banners',
        translationKey: 'sidebar.banners',
        path: adminRoutes.deliveries.banners,
      },
      {
        id: 3.15,
        name: 'Live Tracking',
        translationKey: 'sidebar.liveTracking',
        path: adminRoutes.deliveries.liveTracking,
        permission: 'general-delivery.live_tracking',
      },
      {
        id: 3.16,
        name: 'Refund & Responsibilities',
        translationKey: 'sidebar.refundAndResponsibilities',
        path: adminRoutes.deliveries.refundAndResponsibilities,
        permission: 'general-delivery.refund_responsibilities',
      },
      {
        id: 3.17,
        name: 'Settings',
        translationKey: 'navigation.settings',
        path: adminRoutes.deliveries.settings,
      },
    ],
  },
];

export type SidebarSearchItem = {
  id: string | number;
  path: string;
  translationKey: string;
  parentTranslationKey?: string;
};

const buildSidebarSearchItems = (
  menus: readonly SidebarMenu[],
): SidebarSearchItem[] =>
  menus.flatMap((item) => {
    const items: SidebarSearchItem[] = [];
    if (item.path && item.path !== '#' && hasPermission(item.permission)) {
      items.push({
        id: item.id,
        path: item.path,
        translationKey: item.translationKey,
      });
    }
    item.subMenus?.forEach((subItem) => {
      if (!hasPermission(subItem.permission)) return;
      items.push({
        id: subItem.id,
        path: subItem.path,
        translationKey: subItem.translationKey,
        parentTranslationKey: item.translationKey,
      });
    });
    return items;
  });

export const getFilteredSidebarMenus = (): SidebarMenu[] => {
  if (!getRoleAndPermissions()) return [];
  const filterMenus = (menus: readonly SidebarMenu[]): SidebarMenu[] =>
    menus.reduce<SidebarMenu[]>((items, menu) => {
      if (menu.subMenus?.length) {
        const subMenus = filterMenus(menu.subMenus);
        if (subMenus.length) items.push({ ...menu, subMenus });
      } else if (hasPermission(menu.permission)) {
        items.push(menu);
      }
      return items;
    }, []);
  return filterMenus(sidebarMenus);
};

export const getFirstAccessibleRoute = (): string => {
  for (const menu of getFilteredSidebarMenus()) {
    if (menu.subMenus?.length) return menu.subMenus[0].path;
    if (menu.path && menu.path !== '#') return menu.path;
  }
  return '/';
};

export const sidebarSearchItems: SidebarSearchItem[] = sidebarMenus.flatMap(
  (item) => {
    const items: SidebarSearchItem[] = [];
    if (item.path && item.path !== '#')
      items.push({
        id: item.id,
        path: item.path,
        translationKey: item.translationKey,
      });
    item.subMenus?.forEach((subItem) =>
      items.push({
        id: subItem.id,
        path: subItem.path,
        translationKey: subItem.translationKey,
        parentTranslationKey: item.translationKey,
      }),
    );
    return items;
  },
);

export const getFilteredSidebarSearchItems = (): SidebarSearchItem[] =>
  buildSidebarSearchItems(getFilteredSidebarMenus());
