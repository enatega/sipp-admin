'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useSyncedTab, type TabDef } from '@/hooks/use-synced-tabs';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import ScrollableTabsNav from '@/components/shared/ScrollableTabsNav';
import { ProductsTable } from './ProductsTable';

export default function ProductsTabs() {
  const t = useTranslations('products.tabs');

  const TAB_DEFS: TabDef[] = [
    { value: 'all', label: t('all') },
    { value: 'in_stock', label: t('inStock') },
    { value: 'out_of_stock', label: t('outOfStock') },
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
          <ProductsTable />
        </React.Suspense>
      </TabsContent>
    </Tabs>
  );
}
