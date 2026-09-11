'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useSyncedTab, type TabDef } from '@/hooks/use-synced-tabs';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import ScrollableTabsNav from '@/components/shared/ScrollableTabsNav';
import { VendorTable } from '../table';

export default function VendorTabs() {
  const t = useTranslations('lumiFood.vendors.tabs');

  const TAB_DEFS: TabDef[] = [
    { value: 'all', label: t('all') },
    { value: 'pending', label: t('pending') },
    { value: 'approved', label: t('approved') },
    { value: 'rejected', label: t('rejected') },
    { value: 'blocked', label: t('blocked') },
  ];

  const { active, setActive, tabs } = useSyncedTab(TAB_DEFS, {
    defaultValue: 'all',
    paramName: 'tab',
    mode: 'url-only',
    syncParamsOnChange: { page: '1' },
  });

  return (
    <Tabs value={active} onValueChange={setActive}>
      <ScrollableTabsNav
        tabs={tabs}
        value={active}
        onChange={setActive}
        className=""
      />
      <TabsContent value={active} className="mt-4">
        <React.Suspense fallback={<div className="p-4">{t('loading')}...</div>}>
          <VendorTable activeTab={active} />
        </React.Suspense>
      </TabsContent>
    </Tabs>
  );
}
