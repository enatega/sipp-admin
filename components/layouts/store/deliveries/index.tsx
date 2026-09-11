'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppHeader } from '../../super-admin/header';
import { StoreSidebar } from './sidebar';

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <StoreSidebar />
      <SidebarInset className="flex flex-col w-full h-screen overflow-hidden">
        <AppHeader />
        <main className="p-4 mt-[72px] flex-1 overflow-y-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default StoreLayout;
