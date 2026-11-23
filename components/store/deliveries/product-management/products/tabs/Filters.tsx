'use client';

import { useEffect, useState } from 'react';
import { FilterX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppButton } from '@/components/shared/AppButton';
import { SearchInput } from '@/components/shared/SearchInput';

const Filters = () => {
  const t = useTranslations('products');
  const { getParam, setParams } = useQueryParams();
  const currentSearch = getParam('search') || '';

  const [searchTerm, setSearchTerm] = useState<string>(currentSearch);

  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== currentSearch) {
        setParams({ search: searchTerm || null, page: '1' });
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [currentSearch, searchTerm, setParams]);

  const clearFilters = () => {
    setSearchTerm('');
    setParams({
      search: null,
      page: '1',
    });
  };

  const showClearButton = currentSearch;

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <div className="w-[320px]">
        <SearchInput
          inputClassName="h-11"
          placeholder={t('filters.searchPlaceholder')}
          text={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text);
          }}
        />
      </div>

      {showClearButton && (
        <AppButton variant="secondary" onClick={clearFilters} className="text-primary/70">
          <FilterX size={16} className="mr-2" />
          {t('filters.clearFilters')}
        </AppButton>
      )}
    </div>
  );
};

export default Filters;
