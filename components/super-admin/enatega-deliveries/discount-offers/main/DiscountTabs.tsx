'use client';

import * as React from 'react';
import { Coupon } from '@/types';
import { useTranslations } from 'next-intl';
import { ApiErrorResponse } from '@/types/api/common';
import { useSyncedTab, type TabDef } from '@/hooks/use-synced-tabs';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { DownloadButtons } from '@/components/shared/DownloadButtons';
import ScrollableTabsNav from '@/components/shared/ScrollableTabsNav';
import { getDownloadColumns } from './constants';
import { DiscountTable } from './discount-table/DiscountTable';
import { Filters } from './Filters';

interface DiscountTabsProps {
  basePath?: string;
  /** The coupon rows already mapped to the Coupon shape. */
  coupons: Coupon[];
  /** True while the list request is in-flight. */
  isLoading: boolean;
  /** True if the list request errored. */
  isError: boolean;
  /** The error object when isError is true. */
  error: ApiErrorResponse | null;
  /** Called with the coupon id when the user confirms deletion. */
  onDelete: (id: string) => Promise<void>;
  /** True while the delete mutation is in-flight. */
  isPending: boolean;
  /** Pagination metadata. */
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
  };
}

export function DiscountTabs({
  basePath,
  coupons,
  isLoading,
  isError,
  error,
  onDelete,
  isPending,
  pagination,
}: DiscountTabsProps) {
  const tTabs = useTranslations('lumiFood.discountsOffers.tabs');
  const tTable = useTranslations('lumiFood.discountsOffers.table');
  const tCommon = useTranslations('common');
  const TAB_DEFS: TabDef[] = [
    { value: 'all', label: tTabs('all') },
    { value: 'active', label: tTabs('active') },
    { value: 'inactive', label: tTabs('inactive') },
    { value: 'expired', label: tTabs('expired') },
  ];

  const { active, setActive, tabs } = useSyncedTab(TAB_DEFS, {
    defaultValue: 'all',
    paramName: 'tab',
    mode: 'url-only',
    syncParamsOnChange: { page: '1' },
  });
  const downloadColumns = getDownloadColumns(tTable);
  return (
    <>
      <Tabs value={active} onValueChange={setActive}>
        <ScrollableTabsNav
          tabs={tabs}
          value={active}
          onChange={setActive}
          className="mb-4"
        />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Filters />
          <DownloadButtons<Coupon>
            fileName="coupons_report"
            data={coupons}
            columns={downloadColumns}
          />
        </div>
        <TabsContent value={active}>
          <React.Suspense
            fallback={<div className="p-4">{tCommon('loading')}</div>}
          >
            <DiscountTable
              basePath={basePath}
              coupons={coupons}
              isLoading={isLoading}
              isError={isError}
              error={error}
              onDelete={onDelete}
              isPending={isPending}
              pagination={pagination}
            />
          </React.Suspense>
        </TabsContent>
      </Tabs>
    </>
  );
}
