'use client';

import { useTranslations } from 'next-intl';
import { useQueryParams } from '@/hooks/use-query-params';
import { ClearFiltersButton } from '@/components/shared/filters/ClearFiltersButton';
import { AppSelect } from '@/components/shared/form/AppSelect';
import SearchUrl from '@/components/shared/SearchUrl';

export function Filters() {
  const { getParam, setParams } = useQueryParams();
  const t = useTranslations('lumiFood.shopTypes.filters');
  const tStatus = useTranslations('lumiFood.shopTypes.filters.statusOptions');

  const shopStatus = getParam('status');

  const statusOptions = [
    { key: tStatus('active'), value: 'active' },
    { key: tStatus('inactive'), value: 'inactive' },
  ];

  const validStatuses = ['active', 'inactive'];

  return (
    <div className="flex items-center gap-3 mt-5">
      <SearchUrl
        placeholder={t('searchPlaceholder')}
        containerClass="max-w-sm"
      />
      <AppSelect
        key={shopStatus || 'empty'} // Force re-mount when shopStatus is null/undefined to reset the select
        name="status"
        placeholder={t('statusPlaceholder')}
        options={statusOptions}
        value={
          validStatuses.includes(String(shopStatus))
            ? (shopStatus as string)
            : undefined
        }
        onValueChange={(value) => {
          const v = String(value);
          setParams({
            status: validStatuses.includes(v) ? v : null,
            page: '1',
          });
        }}
        containerClassName="min-w-[150px]"
        className="shadow-sm"
      />
      <ClearFiltersButton paramKeys={['search', 'status', 'active_status']} />
    </div>
  );
}
