'use client';

import { useTranslations } from 'next-intl';
import { useGetCommissionRate } from '@/hooks/api/super-admin/enatega-deliveries/commission-rate';
import { Heading } from '@/components/shared/Heading';
import SearchUrl from '@/components/shared/SearchUrl';
import { useSyncedTab, type TabDef } from '@/hooks/use-synced-tabs';
import { GlobalCommissionSettings } from './GlobalCommissionSettings';
import { CommissionRateTables } from './tabs';

export function CommissionRateMain() {
  const t = useTranslations('commission-rate');
  const tTabs = useTranslations('commission-rate.tabs');
  const tFilters = useTranslations('commission-rate.filters');
  const { data, isLoading, error } = useGetCommissionRate();

  const TAB_DEFS: TabDef[] = [
    { value: 'zone-based', label: tTabs('zoneBased') },
    { value: 'store-level', label: tTabs('storeLevel') },
  ];

  const { active: activeTab, setActive: setActiveTab } = useSyncedTab(TAB_DEFS, {
    defaultValue: 'zone-based',
    paramName: 'tab',
    mode: 'url-only',
    syncParamsOnChange: { page: '1' },
  });

  const title = activeTab === 'zone-based' ? t('title') : t('storeLevelTitle');
  const placeholder =
    activeTab === 'zone-based'
      ? tFilters('searchByZone')
      : tFilters('searchByStore');

  return (
    <>
      <div className="flex items-center flex-wrap justify-between">
        <Heading title={title} />
        <SearchUrl
          containerClass="max-w-[400px] w-full"
          placeholder={placeholder}
        />
      </div>

      <GlobalCommissionSettings
        activeTab={activeTab}
        data={data}
        isLoading={isLoading}
        error={error ?? null}
      />

      <CommissionRateTables activeTab={activeTab} onChange={setActiveTab} />
    </>
  );
}
