'use client';

import { useTranslations } from 'next-intl';
import { TabDef, useSyncedTab } from '@/hooks/use-synced-tabs';
import { Heading } from '@/components/shared/Heading';

const CustomerLoyaltyFilters = () => {
  const t = useTranslations('deliveriesCustomerLoyaltyAndReferrals.filters');

  const tabs: TabDef[] = [
    {
      label: t('customerTab'),
      value: 'customer',
    },
    {
      label: t('riderTab'),
      value: 'rider',
    },
  ];

  const { active, setActive } = useSyncedTab(tabs, {
    paramName: 'type',
    mode: 'url-only',
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Heading title={t('title')} />
        <div className="flex items-center gap-2 bg-accent/50 p-2 rounded-lg w-fit min-w-min border">
          {tabs.map((item) => (
            <button
              key={item.value}
              onClick={() => setActive(item.value)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                active === item.value
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerLoyaltyFilters;
