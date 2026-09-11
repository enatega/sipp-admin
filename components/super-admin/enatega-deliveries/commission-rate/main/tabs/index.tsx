'use client';

import { lazy, Suspense, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryParams } from '@/hooks/use-query-params';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import ScrollableTabsNav from '@/components/shared/ScrollableTabsNav';
import { EditStoreCommissionDrawer } from './table/store-commisssion/edit-store-commission/EditStoreCommissionDrawer';
import { EditZoneCommissionDrawer } from './table/zone-commission/edit-zone/EditZoneCommissionDrawer';
import { StoreCommissionData, ZoneCommissionData } from './types';

const StoreCommissionTable = lazy(() =>
  import('./table/store-commisssion').then((mod) => ({
    default: mod.StoreCommissionTable,
  })),
);
const ZoneCommissionTable = lazy(() =>
  import('./table/zone-commission').then((mod) => ({
    default: mod.ZoneCommissionTable,
  })),
);

type Props = {
  activeTab: string;
  onChange: (value: string) => void;
};

export function CommissionRateTables({ activeTab, onChange }: Props) {
  const tTabs = useTranslations('commission-rate.tabs');
  const { getParam } = useQueryParams();
  const searchQuery = getParam('search') || '';

  const [zoneDrawerOpen, setZoneDrawerOpen] = useState(false);
  const [zoneRow, setZoneRow] = useState<ZoneCommissionData | null>(null);

  const [storeDrawerOpen, setStoreDrawerOpen] = useState(false);
  const [storeRow, setStoreRow] = useState<StoreCommissionData | null>(null);

  const tabs = [
    { value: 'zone-based', label: tTabs('zoneBased') },
    { value: 'store-level', label: tTabs('storeLevel') },
  ];

  const handleZoneEdit = (row: ZoneCommissionData) => {
    setZoneRow(row);
    setZoneDrawerOpen(true);
  };

  const handleStoreEdit = (row: StoreCommissionData) => {
    setStoreRow(row);
    setStoreDrawerOpen(true);
  };

  const tabContents = tabs.map((tab) => (
    <TabsContent key={tab?.value} value={tab?.value} className="w-full">
      {activeTab === tab?.value && (
        <Suspense
          fallback={
            <div className="flex justify-center p-4">
              <Spinner />
            </div>
          }
        >
          {tab?.value === 'zone-based' && (
            <ZoneCommissionTable
              searchQuery={searchQuery}
              onEdit={handleZoneEdit}
            />
          )}
          {tab?.value === 'store-level' && (
            <StoreCommissionTable
              searchQuery={searchQuery}
              onEdit={handleStoreEdit}
            />
          )}
        </Suspense>
      )}
    </TabsContent>
  ));

  return (
    <Tabs value={activeTab} onValueChange={onChange} className="w-full mt-6">
      {/* Scrollable Tabs Navigation */}
      <ScrollableTabsNav
        tabs={tabs}
        value={activeTab}
        onChange={onChange}
        className="mb-4"
      />

      {/* Tab Content */}
      {tabContents}

      {/* Central drawers for add/edit */}
      <EditZoneCommissionDrawer
        isOpen={zoneDrawerOpen}
        onClose={() => setZoneDrawerOpen(false)}
        row={zoneRow}
      />
      <EditStoreCommissionDrawer
        isOpen={storeDrawerOpen}
        onClose={() => setStoreDrawerOpen(false)}
        row={storeRow}
      />
    </Tabs>
  );
}
