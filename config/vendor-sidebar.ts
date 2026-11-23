import { adminRoutes } from '@/lib/routes';
import {
  ArrowLeft,
  LayoutDashboard,
  LayoutTemplate,
  LucideIcon,
  Package,
  Star,
  Store,
  User,
  Wallet,
} from 'lucide-react';
import type { ShopMode } from '@/types';

export interface SidebarMenu {
  id: string | number;
  name: string;
  path: string;
  icon?: LucideIcon;
  subMenus?: readonly SidebarMenu[];
  translationKey: string;
}

export const getVendorSidebarMenus = (
  vendorId?: string,
  canGoToAdmin = false,
  shopMode?: ShopMode | null,
): SidebarMenu[] => {
  const basePath = vendorId
    ? `/vendor/deliveries/${vendorId}`
    : '/vendor/deliveries';

  const menus: SidebarMenu[] = [
    {
      id: 'v1',
      name: 'Dashboard',
      translationKey: 'vendorSidebar.dashboard',
      path: basePath,
      icon: LayoutDashboard,
    },
    {
      id: 'v2',
      name: 'Profile',
      translationKey: 'vendorSidebar.profile',
      path: `${basePath}/profile`,
      icon: User,
    },
    {
      id: 'v3',
      name: 'Stores',
      translationKey: 'vendorSidebar.stores',
      path: `${basePath}/stores`,
      icon: Store,
    },
    ...(shopMode === 'STORE_CHAIN'
      ? [
          {
            id: 'v4',
            name: 'Product Management',
            translationKey: 'vendorSidebar.productManagement',
            path: '#',
            icon: Package,
            subMenus: [
              {
                id: 'v4.1',
                name: 'Products',
                translationKey: 'vendorSidebar.products',
                path: `${basePath}/product-management/products`,
              },
              {
                id: 'v4.2',
                name: 'Categories',
                translationKey: 'vendorSidebar.categories',
                path: `${basePath}/product-management/categories`,
              },
              {
                id: 'v4.3',
                name: 'Deals',
                translationKey: 'vendorSidebar.deals',
                path: `${basePath}/product-management/deals`,
              },
              {
                id: 'v4.4',
                name: 'Sub-Categories',
                translationKey: 'vendorSidebar.subCategories',
                path: `${basePath}/product-management/sub-categories`,
              },
              {
                id: 'v4.5',
                name: 'Addons',
                translationKey: 'vendorSidebar.addons',
                path: `${basePath}/product-management/addons`,
              },
              {
                id: 'v4.6',
                name: 'Options',
                translationKey: 'vendorSidebar.options',
                path: `${basePath}/product-management/options`,
              },
            ],
          },
          {
            id: 'v44',
            name: 'Menu Template',
            translationKey: 'vendorSidebar.menuTemplate',
            path: `${basePath}/menu-template`,
            icon: LayoutTemplate,
          },
        ]
      : []),

    {
      id: 'v5',
      name: 'Wallet',
      translationKey: 'vendorSidebar.wallet',
      path: '#',
      icon: Wallet,
      subMenus: [
        {
          id: 'v5.1',
          name: 'Earnings',
          translationKey: 'vendorSidebar.earnings',
          path: `${basePath}/wallet/earnings`,
        },
        {
          id: 'v5.2',
          name: 'Withdrawal Request',
          translationKey: 'vendorSidebar.withdrawalRequest',
          path: `${basePath}/wallet/withdrawal-request`,
        },
      ],
    },
    {
      id: 'v6',
      name: 'Rating & Reviews',
      translationKey: 'vendorSidebar.ratingReviews',
      path: `${basePath}/rating-reviews`,
      icon: Star,
    },
  ];

  if (canGoToAdmin) {
    menus.push({
      id: 'v7',
      name: 'Back to Admin',
      translationKey: 'vendorSidebar.backToAdmin',
      path: adminRoutes.deliveries.vendors,
      icon: ArrowLeft,
    });
  }

  return menus;
};

export type VendorSidebarSearchItem = {
  id: string | number;
  path: string;
  translationKey: string;
  parentTranslationKey?: string;
};

export const vendorSidebarSearchItems: VendorSidebarSearchItem[] = [];
