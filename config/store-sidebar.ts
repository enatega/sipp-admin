import { getStoreBasePath, getStorePath, withBackToPath } from '@/lib/store';
import { adminRoutes } from '@/lib/routes';
import type { ShopMode } from '@/types';
import {
  ArrowLeft,
  LayoutDashboard,
  LineChart,
  LucideIcon,
  Package,
  ShoppingCart,
  Star,
  Store,
  Wallet,
} from 'lucide-react';

export interface SidebarMenu {
  id: string | number;
  name: string;
  path: string;
  icon?: LucideIcon;
  subMenus?: readonly SidebarMenu[];
  translationKey: string;
}

export const getStoreSidebarMenus = (
  storeId?: string,
  backToPath?: string,
  vendorId?: string,
  canGoToAdmin = false,
  shopMode?: ShopMode | null,
): SidebarMenu[] => {
  const basePath = getStoreBasePath(storeId);
  const withBackTo = (path: string) => withBackToPath(path, backToPath);
  const menus: SidebarMenu[] = [
    {
      id: 's1',
      name: 'Dashboard',
      translationKey: 'storeSidebar.dashboard',
      path: withBackTo(basePath),
      icon: LayoutDashboard,
    },
    {
      id: 's2',
      name: 'Store',
      translationKey: 'storeSidebar.store',
      path: '#',
      icon: Store,
      subMenus: [
        {
          id: 's2.1',
          name: 'Profile',
          translationKey: 'storeSidebar.profile',
          path: withBackTo(getStorePath(storeId, '/store/profile')),
        },
        {
          id: 's2.2',
          name: 'Timings',
          translationKey: 'storeSidebar.timings',
          path: withBackTo(getStorePath(storeId, '/store/timings')),
        },
        {
          id: 's2.3',
          name: 'Location',
          translationKey: 'storeSidebar.location',
          path: withBackTo(getStorePath(storeId, '/store/location')),
        },
        {
          id: 's2.4',
          name: 'Payments',
          translationKey: 'storeSidebar.payments',
          path: withBackTo(getStorePath(storeId, '/store/payments')),
        },
      ],
    },
    {
      id: 's3',
      name: 'Product Management',
      translationKey: 'storeSidebar.productManagement',
      path: '#',
      icon: Package,
      subMenus: [
        {
          id: 's3.1',
          name: 'Products',
          translationKey: 'storeSidebar.products',
          path: withBackTo(getStorePath(storeId, '/product-management/products')),
        },
        ...(shopMode === 'STORE_CHAIN'
          ? [
              {
                id: 's3.1a',
                name: 'Assigned Menu Products',
                translationKey: 'storeSidebar.assignedMenuProducts',
                path: withBackTo(
                  getStorePath(
                    storeId,
                    '/product-management/assigned-menu-products',
                  ),
                ),
              },
            ]
          : []),
        {
          id: 's3.2',
          name: 'Categories',
          translationKey: 'storeSidebar.categories',
          path: withBackTo(
            getStorePath(storeId, '/product-management/categories'),
          ),
        },
        {
          id: 's3.2',
          name: 'Deals',
          translationKey: 'storeSidebar.deals',
          path: withBackTo(
            getStorePath(storeId, '/product-management/deals'),
          ),
        },
        {
          id: 's3.3',
          name: 'Sub-Categories',
          translationKey: 'storeSidebar.subCategories',
          path: withBackTo(
            getStorePath(storeId, '/product-management/sub-categories'),
          ),
        },
        {
          id: 's3.4',
          name: 'Addons',
          translationKey: 'storeSidebar.addons',
          path: withBackTo(getStorePath(storeId, '/product-management/addons')),
        },
        {
          id: 's3.5',
          name: 'Options',
          translationKey: 'storeSidebar.options',
          path: withBackTo(getStorePath(storeId, '/product-management/options')),
        },
      ],
    },
    {
      id: 's4',
      name: 'Orders',
      translationKey: 'storeSidebar.orders',
      path: withBackTo(getStorePath(storeId, '/orders')),
      icon: ShoppingCart,
    },
    {
      id: 's6',
      name: 'Ratings & Reviews',
      translationKey: 'storeSidebar.ratingReviews',
      path: withBackTo(getStorePath(storeId, '/rating-reviews')),
      icon: Star,
    },
    {
      id: 's7',
      name: 'Coupons',
      translationKey: 'storeSidebar.coupons',
      path: withBackTo(getStorePath(storeId, '/coupons')),
      icon: LineChart,
    },
    {
      id: 's8',
      name: 'Wallet',
      translationKey: 'storeSidebar.wallet',
      path: '#',
      icon: Wallet,
      subMenus: [
        {
          id: 's7.1',
          name: 'Earning Reports',
          translationKey: 'storeSidebar.earningReports',
          path: withBackTo(getStorePath(storeId, '/wallet/earning-reports')),
        },
        {
          id: 's7.3',
          name: 'Wallet Transactions',
          translationKey: 'storeSidebar.walletTransactions',
          path: withBackTo(getStorePath(storeId, '/wallet/transactions')),
        },
        {
          id: 's7.2',
          name: 'Withdrawal Requests',
          translationKey: 'storeSidebar.withdrawalRequests',
          path: withBackTo(
            getStorePath(storeId, '/wallet/withdrawal-requests'),
          ),
        },
      ],
    },
  ];

  if (backToPath) {
    const isVendorBackPath = backToPath.startsWith('/vendor/deliveries/');
    menus.push({
      id: 's9',
      name: isVendorBackPath ? 'Back to Vendor Stores' : 'Back to Admin',
      translationKey: isVendorBackPath
        ? 'storeSidebar.backToVendorStores'
        : 'storeSidebar.backToAdmin',
      path: backToPath,
      icon: ArrowLeft,
    });
  } else if (vendorId) {
    menus.push({
      id: 's9',
      name: 'Back to Vendor Stores',
      translationKey: 'storeSidebar.backToVendorStores',
      path: `/vendor/deliveries/${vendorId}/stores`,
      icon: ArrowLeft,
    });
  } else if (canGoToAdmin) {
    menus.push({
      id: 's9',
      name: 'Back to Admin',
      translationKey: 'storeSidebar.backToAdmin',
      path: adminRoutes.deliveries.stores,
      icon: ArrowLeft,
    });
  }

  return menus;
};

export type StoreSidebarSearchItem = {
  id: string | number;
  path: string;
  translationKey: string;
  parentTranslationKey?: string;
};

export const storeSidebarSearchItems: StoreSidebarSearchItem[] = [];
