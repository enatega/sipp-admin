'use client';

import { usePathname } from 'next/navigation';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { StoreNotificationCenter } from '@/components/store/deliveries/notifications/StoreNotificationCenter';
import { StoreOrderAlerts } from '@/components/store/deliveries/notifications/StoreOrderAlerts';
import { useStoreOwnerSession } from '@/hooks/use-store-owner-session';
import { getStoreIdFromPath } from '@/lib/store';
import { AppHeader } from '../../super-admin/header';
import { StoreSidebar } from './sidebar';

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  const storeId = getStoreIdFromPath(usePathname());
  // New-order sound and the store inbox belong to the store's own login,
  // not to an admin or vendor who opened this store's dashboard.
  const isStoreOwner = useStoreOwnerSession(storeId);

  return (
    <SidebarProvider>
      <StoreSidebar />
      <SidebarInset className="flex flex-col w-full h-screen overflow-hidden">
        <AppHeader
          notifications={
            isStoreOwner && storeId ? (
              <StoreNotificationCenter storeId={storeId} compact />
            ) : undefined
          }
        />
        <main className="p-4 mt-[72px] flex-1 overflow-y-auto">{children}</main>
      </SidebarInset>
      {isStoreOwner && storeId ? <StoreOrderAlerts storeId={storeId} /> : null}
    </SidebarProvider>
  );
};

export default StoreLayout;
