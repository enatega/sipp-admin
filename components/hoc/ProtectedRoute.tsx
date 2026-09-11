'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  getFilteredSidebarMenus,
  getFirstAccessibleRoute,
} from '@/config/sidebar';
import { getStorePath } from '@/lib/store';
import {
  getAdminProfiles,
  getShopMode,
  getStoreDashboardPath,
  getStoreProfileId,
  getUser,
  getVendorDashboardPath,
  getVendorProfileId,
  hasAdminProfile,
  hasPermission,
  hasRoutePermission,
} from '@/lib/user';
import NoPermission from '@/components/no-permission';
import EnategaLoader from '@/components/shared/EnategaLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'admin' | 'vendor' | 'store';
  vendorId?: string;
  storeId?: string;
  permission?: string;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  role,
  vendorId,
  storeId,
  permission,
  fallbackPath,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const user = useMemo(() => (isHydrated ? getUser() : null), [isHydrated]);
  const profiles = useMemo(
    () => (isHydrated ? getAdminProfiles() : null),
    [isHydrated],
  );

  const { redirectTo, showNoPermission } = useMemo(() => {
    if (!isHydrated) {
      return { redirectTo: null as string | null, showNoPermission: false };
    }

    if (!user) {
      return { redirectTo: '/login', showNoPermission: false };
    }

    if (user.must_change_pass) {
      return { redirectTo: '/login/update-password', showNoPermission: false };
    }

    const adminAllowed = hasAdminProfile(profiles);
    const vendorProfileId = getVendorProfileId(profiles);
    const storeProfileId = getStoreProfileId(profiles);

    if (
      (role === 'vendor' || role === 'store') &&
      adminAllowed &&
      permission &&
      !hasPermission(permission)
    ) {
      return {
        redirectTo: fallbackPath || getFirstAccessibleRoute(),
        showNoPermission: false,
      };
    }

    //  ADMIN
    if (role === 'admin') {
      const accessibleMenus = getFilteredSidebarMenus();

      if (accessibleMenus.length === 0) {
        return { redirectTo: null, showNoPermission: true };
      }

      if (permission && !hasPermission(permission)) {
        return {
          redirectTo: fallbackPath || getFirstAccessibleRoute(),
          showNoPermission: false,
        };
      }

      if (!hasRoutePermission(pathname)) {
        return {
          redirectTo: fallbackPath || getFirstAccessibleRoute(),
          showNoPermission: false,
        };
      }

      return { redirectTo: null, showNoPermission: false };
    }

    //  VENDOR
    if (role === 'vendor') {
      if (!adminAllowed && !vendorProfileId) {
        return { redirectTo: '/login', showNoPermission: false };
      }

      if (!adminAllowed && vendorId && vendorId !== vendorProfileId) {
        const vendorDashboardPath = getVendorDashboardPath(profiles);
        return {
          redirectTo: vendorDashboardPath || '/vendor/deliveries',
          showNoPermission: false,
        };
      }

      const shopMode = getShopMode();
      const isStoreChainOnlyRoute =
        pathname.startsWith('/vendor/deliveries/') &&
        /\/vendor\/deliveries\/[^/]+\/(menu-template|product-management)(\/|$)/.test(
          pathname,
        );

      if (
        isStoreChainOnlyRoute &&
        shopMode !== 'STORE_CHAIN' &&
        !adminAllowed
      ) {
        const resolvedVendorId = vendorId || vendorProfileId;
        return {
          redirectTo: resolvedVendorId
            ? `/vendor/deliveries/${resolvedVendorId}`
            : '/vendor/deliveries',
          showNoPermission: false,
        };
      }

      return { redirectTo: null, showNoPermission: false };
    }

    //  STORE
    if (role === 'store') {
      if (!adminAllowed && !vendorProfileId && !storeProfileId) {
        return { redirectTo: '/login', showNoPermission: false };
      }

      const storeDashboardPath = getStoreDashboardPath(profiles);

      if (
        !adminAllowed &&
        !vendorProfileId &&
        storeId &&
        storeId !== storeProfileId
      ) {
        return {
          redirectTo:
            storeDashboardPath || getStorePath(storeProfileId ?? undefined),
          showNoPermission: false,
        };
      }

      return { redirectTo: null, showNoPermission: false };
    }

    return { redirectTo: null, showNoPermission: false };
  }, [
    fallbackPath,
    isHydrated,
    pathname,
    permission,
    profiles,
    role,
    storeId,
    user,
    vendorId,
  ]);

  useEffect(() => {
    if (!isHydrated || !redirectTo) return;
    router.replace(redirectTo);
  }, [isHydrated, redirectTo, router]);

  if (!isHydrated || redirectTo) {
    return <EnategaLoader />;
  }

  if (showNoPermission) {
    return <NoPermission />;
  }

  return <>{children}</>;
};

export { ProtectedRoute };
