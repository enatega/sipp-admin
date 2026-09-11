'use client';

import * as React from 'react';
import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { CirclePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  buildScopedDeliveriesAdminPathFromCurrent,
} from '@/lib/routes';
import { getShopMode } from '@/lib/user';
import { useGetShopMode } from '@/hooks/api/super-admin/enatega-deliveries/settings-profile';
import { useGetAllDeliveryStores } from '@/hooks/api/super-admin/enatega-deliveries/stores';
import { useSyncedTab, type TabDef } from '@/hooks/use-synced-tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { AppButton } from '@/components/shared/AppButton';
import DisplayError from '@/components/shared/DisplayError';
import EnategaLoader from '@/components/shared/EnategaLoader';
import { Heading } from '@/components/shared/Heading';
import NoDataFound from '@/components/shared/NoDataFound';
import ScrollableTabsNav from '@/components/shared/ScrollableTabsNav';
import Header from './Header';
import StoreCard from './StoreCard';
import StoresTable from './table';

export function Stores() {
  const pathname = usePathname();
  const t = useTranslations('lumiFood.stores.tabs');
  const tPages = useTranslations('lumiFood.stores.pages');
  const tTable = useTranslations('lumiFood.stores.table');
  const tStoreChain = useTranslations('lumiFood.stores.storeChain');

  // Fetch shop mode from API
  const { data: shopModeData, isLoading: isShopModeLoading } = useGetShopMode();

  // Fetch stores
  const {
    data: storesResponse,
    isLoading: isStoresLoading,
    isError,
  } = useGetAllDeliveryStores();

  // Get shop mode from localStorage (for instant access)
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const localShopMode = isHydrated ? getShopMode() : null;
  const shopMode = shopModeData?.shop_mode || localShopMode;
  const isSingleVendorMode = shopMode === 'SINGLE_VENDOR';
  const isStoreChain = shopMode === 'STORE_CHAIN';
  const showCardView = isSingleVendorMode;
  const addStorePath = buildScopedDeliveriesAdminPathFromCurrent(
    pathname,
    '/enatega-deliveries/stores/add-store',
  );

  const stores = storesResponse?.data || [];
  const TAB_DEFS: TabDef[] = [
    { value: 'all', label: t('all') },
    { value: 'available', label: t('active') },
    { value: 'pending', label: t('pending') },
    { value: 'approved', label: t('approved') },
    { value: 'blocked', label: t('blocked') },
    { value: 'rejected', label: t('rejected') },
  ];

  const { active, setActive, tabs } = useSyncedTab(TAB_DEFS, {
    defaultValue: 'all',
    paramName: 'status',
    mode: 'url-only',
    syncParamsOnChange: { page: '1' },
  });

  // Show loader while checking shop mode
  if (!isHydrated || (isShopModeLoading && !shopMode)) {
    return <EnategaLoader />;
  }

  // SINGLE_VENDOR or STORE_CHAIN mode: Show store card with details
  if (showCardView) {
    if (isStoresLoading) {
      return <EnategaLoader />;
    }

    if (isError) {
      return (
        <div className="space-y-6">
          <Heading title={tPages('title')} />
          <DisplayError
            title="Failed to load stores"
            message="Unable to load stores. Please try again later."
          />
        </div>
      );
    }

    if (stores.length === 0) {
      return (
        <div className="space-y-6">
          <Heading title={tPages('title')} />
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CirclePlus className="w-5 h-5" />
                {tStoreChain('title')}
              </CardTitle>
              <CardDescription>{tStoreChain('description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NoDataFound title={tTable('noDataTitle')} />
              <div className="flex justify-end">
                <Link href={addStorePath}>
                  <AppButton leftIcon={<CirclePlus size={16} />}>
                    {tPages('addButton')}
                  </AppButton>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Show store details card
    const store = stores[0];

    return (
      <div className="space-y-6">
        <Heading title={tPages('title')} />
        <StoreCard store={store} />
      </div>
    );
  }

  // Other modes: Show full stores list with tabs and table
  return (
    <>
      <div className="space-y-4">
        <Header />
        <div>
          <Tabs value={active} onValueChange={setActive}>
            <ScrollableTabsNav
              tabs={tabs}
              value={active}
              onChange={setActive}
              className="mb-4"
            />
            <TabsContent value={active}>
              <React.Suspense
                fallback={<div className="p-4">{t('loading')}...</div>}
              >
                <StoresTable />
              </React.Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
