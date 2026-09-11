'use client';

import { lazy, Suspense, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useSyncedTab, type TabDef } from '@/hooks/use-synced-tabs';
import { Table, TableBody } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableShimmer } from '@/components/shared/TableShimmer';

// Lazy load review components
const ReviewsGiven = lazy(() =>
  import('./ReviewsGiven').then((mod) => ({
    default: mod.ReviewsGiven,
  })),
);
const ReviewsReceived = lazy(() =>
  import('./ReviewsReceived').then((mod) => ({
    default: mod.ReviewsReceived,
  })),
);

interface ReviewsProps {
  userId: string;
}

export function Reviews({ userId }: ReviewsProps) {
  const t = useTranslations('userDetail.tabs');

  const REVIEW_TAB_DEFS: TabDef[] = useMemo(
    () => [
      { value: 'given', label: t('reviewsGiven') },
      { value: 'received', label: t('reviewsReceived') },
    ],
    [t],
  );

  const { active, setActive, tabs } = useSyncedTab(REVIEW_TAB_DEFS, {
    defaultValue: 'given',
    paramName: 'type',
    mode: 'url-only',
    syncParamsOnChange: { page: '1' },
  });

  return (
    <Tabs value={active} onValueChange={setActive} className="w-full">
      <TabsList className="mb-6">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="given">
        <Suspense
          fallback={
            <div className="rounded-md border">
              <Table>
                <TableBody>
                  <TableShimmer limit={10} columns={6} />
                </TableBody>
              </Table>
            </div>
          }
        >
          <ReviewsGiven userId={userId} />
        </Suspense>
      </TabsContent>

      <TabsContent value="received">
        <Suspense
          fallback={
            <div className="rounded-md border">
              <Table>
                <TableBody>
                  <TableShimmer limit={10} columns={5} />
                </TableBody>
              </Table>
            </div>
          }
        >
          <ReviewsReceived userId={userId} />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
