'use client';

import React, { Suspense, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useSyncedTab, type TabDef } from '@/hooks/use-synced-tabs';
import { Tabs } from '@/components/ui/tabs';
import EnategaLoader from '@/components/shared/EnategaLoader';
import ScrollableTabsNav from '@/components/shared/ScrollableTabsNav';
import { Filters } from './filters';

const RiderWithdrawalTable = React.lazy(
  () => import('./tables/RiderWithdrawalRequest'),
);
const StoreWithdrawalTable = React.lazy(
  () => import('./tables/StoreWithdrawalRequest'),
);
const VendorWithdrawalTable = React.lazy(
  () => import('./tables/VendorWithdrawalRequest'),
);

const TABLE_MAP: Record<string, React.ComponentType> = {
  vendor_withdrawals: VendorWithdrawalTable,
  store_withdrawals: StoreWithdrawalTable,
  rider_withdrawals: RiderWithdrawalTable,
};

export function WithdrawalRequestTabs() {
  const tTabs = useTranslations('withdrawalRequests.tabs');

  const TAB_DEFS: TabDef[] = [
    { value: 'vendor_withdrawals', label: tTabs('vendorWithdrawals') },
    { value: 'store_withdrawals', label: tTabs('storeWithdrawals') },
    { value: 'rider_withdrawals', label: tTabs('riderWithdrawals') },
  ];

  const { active, setActive, tabs } = useSyncedTab(TAB_DEFS, {
    defaultValue: 'vendor_withdrawals',
    paramName: 'status',
    mode: 'url-only',
    syncParamsOnChange: { page: '1' },
  });

  const ActiveTable = useMemo(() => TABLE_MAP[active], [active]);

  return (
    <Tabs
      value={active}
      onValueChange={setActive}
      className="w-full space-y-4 mb-4"
    >
      <ScrollableTabsNav
        tabs={tabs}
        value={active}
        onChange={setActive}
        className="mb-4"
      />
      <Filters />
      <Suspense fallback={<EnategaLoader />}>
        {ActiveTable && <ActiveTable />}
      </Suspense>
    </Tabs>
  );
}
