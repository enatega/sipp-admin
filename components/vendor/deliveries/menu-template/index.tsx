'use client';

import * as React from 'react';
import { type TabDef, useSyncedTab } from '@/hooks/use-synced-tabs';
import { useTranslations } from 'next-intl';
import ScrollableTabsNav from '@/components/shared/ScrollableTabsNav';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import Header from './Header';
import VendorMenuTemplateTable from './table';

export default function VendorMenuTemplate() {
  const t = useTranslations('vendorMenuTemplate');
  const TAB_DEFS: TabDef[] = [
    { value: 'all', label: t('tabs.all') },
    { value: 'newly-added', label: t('tabs.newlyAdded') },
  ];

  const { active, setActive, tabs } = useSyncedTab(TAB_DEFS, {
    defaultValue: 'all',
    paramName: 'tabStatus',
    mode: 'url-only',
    syncParamsOnChange: { page: '1' },
  });

  return (
    <div className="space-y-4">
      <Header />
      <Tabs value={active} onValueChange={setActive}>
        <ScrollableTabsNav
          tabs={tabs}
          value={active}
          onChange={setActive}
          className="mb-4"
        />
        <TabsContent value={active}>
          <VendorMenuTemplateTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
