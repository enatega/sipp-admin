'use client';

import { useEffect, useState } from 'react';
import { FilterX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppButton } from '@/components/shared/AppButton';
import { SearchInput } from '@/components/shared/SearchInput';

const Filters = () => {
  const t = useTranslations('categories');
  const { getParam, setParams } = useQueryParams();

  const [searchTerm, setSearchTerm] = useState<string>(getParam('search') || '');

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (getParam('search') || '')) {
        setParams({ search: searchTerm || null, page: '1' });
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, setParams, getParam]);

  const clearFilters = () => {
    setSearchTerm('');
    setParams({
      search: null,
      page: '1',
    });
  };

  const showClearButton = Boolean(getParam('search'));

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <div className="w-[320px]">
        <SearchInput
          inputClassName="h-11"
          placeholder={t('searchPlaceholder')}
          text={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text);
          }}
        />
      </div>

      {showClearButton && (
        <AppButton variant="secondary" onClick={clearFilters} className="text-primary/70">
          <FilterX size={16} className="mr-2 !h-11" />
          {t('clearFilters')}
        </AppButton>
      )}
    </div>
  );
};

export default Filters;
