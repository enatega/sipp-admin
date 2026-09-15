'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAdminBranding } from '@/contexts/super-admin/enatega-deliveries/settings/admin-branding-context';
import { getStoreSidebarMenus } from '@/config/store-sidebar';
import { toAbsoluteUrl } from '@/lib/helpers';
import {
  getStoreBasePath,
  getStoreIdFromPath,
  withBackToPath,
} from '@/lib/store';
import {
  getAdminProfiles,
  getShopMode,
  getVendorProfileId,
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

const StoreSidebar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = stripQuery(pathname ?? '');
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const profiles = useMemo(
    () => (isHydrated ? (getAdminProfiles() ?? undefined) : undefined),
    [isHydrated],
  );
  const shopMode = isHydrated ? getShopMode() : null;
  const canGoToAdmin = useMemo(() => hasAdminProfile(profiles), [profiles]);
  const vendorProfileId = useMemo(
    () => getVendorProfileId(profiles) ?? undefined,
    [profiles],
  );
  const storeId = getStoreIdFromPath(current);
  const explicitBackToPath = searchParams.get('backTo') ?? undefined;
  const storeBasePath = getStoreBasePath(storeId);
  const storeHomePath = withBackToPath(storeBasePath, explicitBackToPath);
  const storeSidebarMenus = getStoreSidebarMenus(
    storeId,
    explicitBackToPath,
    vendorProfileId,
    canGoToAdmin,
    shopMode,
  ).filter((item) => {
    if (!canGoToAdmin) return true;
    if (item.id === 's6')
      return hasPermission('general-delivery.store_reviews');
    if (item.id !== 's8') return true;

    item.subMenus = item.subMenus?.filter((subItem) =>
      subItem.id === 's7.1'
        ? hasPermission('general-delivery.earning')
        : hasPermission('general-delivery.withdraw_requests'),
    );
    return Boolean(item.subMenus?.length);
  });
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
        <div className="border-b px-4 pb-4 pt-2">
          <Link
            href={storeHomePath}
            className="block h-[39px] w-full max-w-[190px] relative"
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
                className="object-contain scale-200 "
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
              {storeSidebarMenus.map((item, index) => {
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

export { StoreSidebar };
