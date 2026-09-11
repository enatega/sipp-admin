'use client';

import { FilterX } from 'lucide-react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppButton } from '@/components/shared/AppButton';
import { AppSelect } from '@/components/shared/form/AppSelect';
import SearchUrl from '@/components/shared/SearchUrl';
import { useTranslations } from 'next-intl';

const Filters = () => {
  const { getParam, setParams } = useQueryParams();
  const t = useTranslations('roleAndPermissions.filters');
  const statusOptions = [
    { key: t('statusActive'), value: 'active' },
    { key: t('statusInactive'), value: 'inactive' },
  ];

  const currentStatus = getParam('status');

  const clearFilters = () => {
    setParams({
      search: null,
      modules: null,
      status: null,
      page: '1',
    });
  };

  const showClearButton = getParam('search') || getParam('status');

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <div className="w-[320px]">
        <SearchUrl
          inputClassName="h-11"
          placeholder={t('searchPlaceholder')}
        />
      </div>

      <AppSelect
        name="status"
        options={statusOptions}
        value={currentStatus || ''}
        onValueChange={(status) => {
          setParams({
            status: status || null,
            page: '1',
          });
        }}
        placeholder={t('statusPlaceholder')}
        className="shadow-sm rounded-sm"
      />

      {showClearButton && (
        <AppButton
          variant="secondary"
          onClick={clearFilters}
          className="text-primary/70"
        >
          <FilterX size={16} className="mr-2 !h-11" />
          {t('clear')}
        </AppButton>
      )}
    </div>
  );
};

export default Filters;
