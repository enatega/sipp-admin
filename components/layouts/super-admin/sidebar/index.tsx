'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminBranding } from '@/contexts/super-admin/enatega-deliveries/settings/admin-branding-context';
import { getFilteredSidebarMenus } from '@/config/sidebar';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
} from '@/components/ui/sidebar';
import MenuItem from './MenuItem';
import SubMenuItem from './SubMenuItem';

type SubItem = { path: string; subMenus?: SubItem[] };

function stripQuery(path: string) {
  const q = path.indexOf('?');
  return q === -1 ? path : path.slice(0, q);
}

interface Props {
  containerClass?: string;
}

export function AppSidebar({ containerClass }: Props) {
  const pathname = usePathname();
  const current = stripQuery(pathname ?? '');
  const {
    logo,
    appName,
    appNameClassName,
    isLoading: isBrandingLoading,
  } = useAdminBranding();
  const [failedLogoSrc, setFailedLogoSrc] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const filteredMenus = getFilteredSidebarMenus();

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(t);
  }, []);

  const isSubItemActive = (subItems?: SubItem[]): boolean =>
    subItems?.some((item) => {
      const subPath = stripQuery(item.path);
      return (
        current === subPath ||
        current.startsWith(subPath + '/') ||
        isSubItemActive(item.subMenus)
      );
    }) ?? false;

  return (
    <Sidebar
      className={cn('z-50 w-[250px] ', containerClass)}
      collapsible="offcanvas"
    >
      <SidebarHeader className="p-0 pt-2">
        <div className="pl-2 border-b pb-3 pt-1">
          <Link
            href="/"
            className="block h-[48px] w-full max-w-[220px] relative"
          >
            {!mounted || isBrandingLoading ? (
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
      <SidebarContent className="pb-10">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-2 mt-4 px-2">
              {filteredMenus.map((item, index) => {
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
}
