'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryParams } from '@/hooks/use-query-params';
import { SearchInput } from '@/components/shared/SearchInput';

export default function Filters() {
  const { getParam, setParams } = useQueryParams();
  const t = useTranslations('vendorMenuTemplate.table');
  const [searchTerm, setSearchTerm] = useState<string>(getParam('search') || '');

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (getParam('search') || '')) {
        setParams({ search: searchTerm || null, page: '1' });
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [getParam, searchTerm, setParams]);

  return (
    <div className="w-[320px]">
      <SearchInput
        inputClassName="h-11"
        placeholder={t('searchPlaceholder')}
        text={searchTerm}
        onChangeText={setSearchTerm}
      />
    </div>
  );
}
