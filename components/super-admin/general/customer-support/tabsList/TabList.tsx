'use client';

import React from 'react';
import { ApiErrorResponse } from '@/types';
import { useTranslations } from 'next-intl';
import {
  CustomerSupportGroupedByCustomer,
  CustomerSupportGroupedTickets,
} from '@/types/api/super-admin/general/customerSupport.api';
import { useSyncedTab, type TabDef } from '@/hooks/use-synced-tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NoDataFound from '@/components/shared/NoDataFound';
import { TabItem } from './TabItem';

type Props = {
  grouped?: CustomerSupportGroupedTickets;
  isLoading?: boolean;
  isError?: boolean;
  isFetching?: boolean;
  error?: ApiErrorResponse | null;
  selectedItemId?: string | null;
  onSelect?: (item: CustomerSupportGroupedByCustomer) => void;
};

export const TabList: React.FC<Props> = ({
  grouped,
  selectedItemId = null,
  onSelect,
}) => {
  const t = useTranslations('customerSupport.tabs');
  const TABS = [
    { key: 'all', label: t('all'), value: '' },
    {
      key: 'in_progress',
      label: t('inProgress'),
      value: 'in_progress',
    },
    {
      key: 'resolved',
      label: t('resolved'),
      value: 'resolved',
    },
    {
      key: 'opened',
      label: t('opened'),
      value: 'opened',
    },
  ] as const;

  const TAB_DEFS: TabDef[] = TABS.map((item) => ({
    value: item.value,
    label: item.label,
  }));

  const { active: tabValue, setActive } = useSyncedTab(
    TAB_DEFS,
    {
      defaultValue: '',
      paramName: 'status',
      mode: 'url-only',
      syncParamsOnChange: { page: '1' },
    }
  );

  const groups = [
    { key: t('today'), items: grouped?.today || [] },
    { key: t('yesterday'), items: grouped?.yesterday || [] },
    { key: t('older'), items: grouped?.older || [] },
  ].filter((g) => g.items.length > 0);

  return (
    <Tabs
      value={tabValue}
      onValueChange={setActive}
      className="space-y-0"
    >
      <TabsList className="bg-muted rounded-md grid grid-cols-4 gap-1 w-full">
        {TABS.map((tab) => (
          <TabsTrigger key={tab.key} value={tab.value} className="text-sm">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map((tab) => (
        <TabsContent key={tab.key} value={tab.value} className="p-0">
          <Accordion type="multiple" defaultValue={groups.map((g) => g.key)}>
            {groups.map((g) => (
              <AccordionItem key={g.key} value={g.key} className="border-b-0">
                <AccordionTrigger className="flex justify-between items-center px-3 py-2 focus:ring-0 data-[state=open]:bg-transparent hover:no-underline">
                  <div className="font-medium text-sm">{g.key}</div>
                </AccordionTrigger>
                <AccordionContent className="border rounded-md pb-0 max-h-[650px] overflow-y-auto">
                  {g.items.map((it, idx) => (
                    <TabItem
                      key={it.id}
                      item={it}
                      isLast={idx === g.items.length - 1}
                      isSelected={selectedItemId === it.id}
                      onClick={() => onSelect?.(it)}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {groups.length === 0 && (
            <div className="p-4">
              <NoDataFound
                title={t('noTickets')}
                subtitle={t('noTicketsSubtitle')}
              />
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default TabList;
