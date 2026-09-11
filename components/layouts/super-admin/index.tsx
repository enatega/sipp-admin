'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppHeader } from './header';
import { AppSidebar } from './sidebar';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col w-full h-screen overflow-hidden">
        <AppHeader />
        <main className="p-4 mt-[72px] flex-1 overflow-y-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;
