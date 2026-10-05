'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useSyncedTab, type TabDef } from '@/hooks/use-synced-tabs';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import ScrollableTabsNav from '@/components/shared/ScrollableTabsNav';
import Header from './Header';
import StoresTable from './table';

export function Stores() {
  const t = useTranslations('lumiFood.stores.tabs');
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
