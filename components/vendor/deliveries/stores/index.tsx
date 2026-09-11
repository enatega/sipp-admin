'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useSyncedTab, type TabDef } from '@/hooks/use-synced-tabs';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import ScrollableTabsNav from '@/components/shared/ScrollableTabsNav';
import Header from './Header';
import VendorStoresTable from './table';

export function VendorStores() {
  const t = useTranslations('vendorDeliveriesStores');
  const TAB_DEFS: TabDef[] = [
    { value: 'all', label: t('tabs.allStatus') },
    { value: 'pending', label: t('tabs.pending') },
    { value: 'approved', label: t('tabs.approved') },
    { value: 'rejected', label: t('tabs.rejected') },
    { value: 'active', label: t('tabs.active') },
    { value: 'blocked', label: t('tabs.blocked') },
  ];

  const { active, setActive, tabs } = useSyncedTab(TAB_DEFS, {
    defaultValue: 'all',
    paramName: 'tabStatus',
    mode: 'url-only',
    syncParamsOnChange: { page: '1' },
  });

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
              <React.Suspense fallback={<div className="p-4">{t('loading')}</div>}>
                <VendorStoresTable />
              </React.Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
