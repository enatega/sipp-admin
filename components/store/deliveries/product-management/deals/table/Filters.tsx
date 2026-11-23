'use client';

import { useEffect, useState } from 'react';
import { FilterX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppButton } from '@/components/shared/AppButton';
import { SearchInput } from '@/components/shared/SearchInput';

const Filters = () => {
  const tFilters = useTranslations('deals.filters');
  const { getParam, setParams } = useQueryParams();

  const [searchTerm, setSearchTerm] = useState<string>('');

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

  const showClearButton = getParam('search');

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <div className="w-[320px]">
        <SearchInput
          inputClassName="h-11"
          placeholder={tFilters('searchPlaceholder')}
          text={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text);
          }}
        />
      </div>

      {showClearButton && (
        <AppButton variant="secondary" onClick={clearFilters} className="text-primary/70">
          <FilterX size={16} className="mr-2" />
          {tFilters('clearFilters')}
        </AppButton>
      )}
    </div>
  );
};

export default Filters;
