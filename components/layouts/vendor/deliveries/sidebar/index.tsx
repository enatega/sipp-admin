'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminBranding } from '@/contexts/super-admin/enatega-deliveries/settings/admin-branding-context';
import { getVendorSidebarMenus } from '@/config/vendor-sidebar';
import { toAbsoluteUrl } from '@/lib/helpers';
import {
  getAdminProfiles,
  getShopMode,
  hasAdminProfile,
  hasPermission,
} from '@/lib/user';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
} from '@/components/ui/sidebar';
import MenuItem from '@/components/layouts/super-admin/sidebar/MenuItem';
import SubMenuItem from '@/components/layouts/super-admin/sidebar/SubMenuItem';

type SubItem = { path: string };

function stripQuery(path: string) {
  const q = path.indexOf('?');
  return q === -1 ? path : path.slice(0, q);
}

const VendorSidebar = () => {
  const pathname = usePathname();
  const current = stripQuery(pathname ?? '');
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const canGoToAdmin = useMemo(() => {
    if (!isHydrated) return false;
    return hasAdminProfile(getAdminProfiles());
  }, [isHydrated]);
  const shopMode = useMemo(
    () => (isHydrated ? getShopMode() : null),
    [isHydrated],
  );
  const pathSegments = current.split('/').filter(Boolean);
  const vendorId =
    pathSegments[0] === 'vendor' && pathSegments[1] === 'deliveries'
      ? pathSegments[2]
      : undefined;
  const vendorSidebarMenus = getVendorSidebarMenus(
    vendorId,
    canGoToAdmin,
    shopMode,
  ).filter(
    (item) =>
      !canGoToAdmin ||
      item.id !== 'v6' ||
      hasPermission('general-delivery.store_reviews'),
  );
  const vendorBasePath = vendorId
    ? `/vendor/deliveries/${vendorId}`
    : '/vendor/deliveries';
  const {
    logo,
    appName,
    appNameClassName,
    isLoading: isBrandingLoading,
  } = useAdminBranding();
  const [failedLogoSrc, setFailedLogoSrc] = useState<string | null>(null);

  const isSubItemActive = (subItems?: SubItem[]) =>
    subItems?.some((item) => {
      const subPath = stripQuery(item.path);
      return current === subPath || current.startsWith(subPath + '/');
    }) ?? false;

  return (
    <Sidebar className={cn('z-50 w-[250px]')} collapsible="offcanvas">
      <SidebarHeader className="p-0 pt-2">
        <div className="pl-2 border-b pb-3 pt-1">
          <Link
            href={vendorBasePath}
            className="block h-[48px] w-full max-w-[220px] relative"
          >
            {isBrandingLoading ? (
              <div className="h-full w-full rounded bg-muted animate-pulse" />
            ) : !logo || failedLogoSrc === logo ? (
              <span
                className={`flex h-full w-full items-center whitespace-nowrap ${appNameClassName}`}
              >
                {appName}
              </span>
            ) : (
              <Image
                src={toAbsoluteUrl(logo)}
                fill
                alt={appName}
                className="object-contain object-left"
                unoptimized={!!logo}
                onError={() => setFailedLogoSrc(logo)}
              />
            )}
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-2 mt-4 px-2">
              {vendorSidebarMenus.map((item, index) => {
                const hasSubItems = !!item.subMenus?.length;
                const isSubMenuActive = isSubItemActive(
                  item.subMenus as SubItem[] | undefined,
                );
                const isActive = stripQuery(item.path) === current;

                return (
                  <div key={index}>
                    {!hasSubItems ? (
                      <MenuItem item={item} isActive={isActive} />
                    ) : (
                      <SubMenuItem
                        item={item}
                        isSubMenuActive={isSubMenuActive}
                      />
                    )}
                  </div>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export { VendorSidebar };
