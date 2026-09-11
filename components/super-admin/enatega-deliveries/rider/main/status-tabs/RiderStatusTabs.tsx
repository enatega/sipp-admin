'use client';

import * as React from 'react';
import { useSyncedTab, type TabDef } from '@/hooks/use-synced-tabs';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import ScrollableTabsNav from '@/components/shared/ScrollableTabsNav';
import { RiderTable } from '../rider-table';

export default function RiderStatusTabs() {
  const t = useTranslations('driverManagement.driversTable');

  const TAB_DEFS: TabDef[] = [
    { value: 'all', label: t('allDriversTab') },
    { value: 'pending', label: t('pendingTab') },
    { value: 'approved', label: t('approvedTab') },
    { value: 'rejected', label: t('rejectedTab') },
    { value: 'blocked', label: t('blockedTab') },
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
        <React.Suspense fallback={<div className="p-4">{t('loading')}</div>}>
          <RiderTable />
        </React.Suspense>
      </TabsContent>
    </Tabs>
  );
}
