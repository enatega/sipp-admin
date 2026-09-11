'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { FilterX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppButton } from '@/components/shared/AppButton';
import { RatingSelectFilter } from '@/components/shared/filters/RatingSelectFilter';
import { DateRangePicker } from '@/components/shared/form/DateRangePicker';
import { SearchInput } from '@/components/shared/SearchInput';

const Filters = () => {
  const t = useTranslations('vendorRatingReviews.table.filters');
  const { getParam, setParams } = useQueryParams();
  const [searchTerm, setSearchTerm] = useState<string>(
    getParam('search_store_name') || '',
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (getParam('search_store_name') || '')) {
        setParams({ search_store_name: searchTerm || null, page: '1' });
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, setParams, getParam]);

  const currentStartDate = getParam('start_date');
  const currentEndDate = getParam('end_date');

  const clearFilters = () => {
    setSearchTerm('');
    setParams({
      search_store_name: null,
      start_date: null,
      end_date: null,
      star_ratings: null,
      rating: null,
      page: '1',
    });
  };

  const showClearButton =
    getParam('search_store_name') ||
    getParam('start_date') ||
    getParam('end_date') ||
    getParam('star_ratings');

  return (
    <div className="flex gap-2 items-center sm:items-center">
      <div className="w-full sm:w-[320px]">
        <SearchInput
          inputClassName="h-10 sm:h-11"
          placeholder={t('searchPlaceholder')}
          text={searchTerm}
          onChangeText={setSearchTerm}
        />
      </div>

      <div className="w-full sm:w-auto">
        <DateRangePicker
          placeholder={t('datePlaceholder')}
          className="shadow-sm w-full sm:w-auto"
          date={
            currentStartDate && currentEndDate
              ? {
                  from: parseISO(currentStartDate),
                  to: parseISO(currentEndDate),
                }
              : undefined
          }
          onDateChange={(range) => {
            setParams({
              start_date: range?.from ? format(range.from, 'yyyy-MM-dd') : null,
              end_date: range?.to ? format(range.to, 'yyyy-MM-dd') : null,
              page: '1',
            });
          }}
        />
      </div>

      <div className="w-full sm:w-auto">
        <RatingSelectFilter
          paramKey="star_ratings"
          placeholder={t('ratingPlaceholder')}
          mode="threshold"
        />
      </div>

      {showClearButton && (
        <AppButton
          variant="secondary"
          onClick={clearFilters}
          className="text-primary/70 w-full sm:w-auto"
        >
          <FilterX size={16} className="mr-2 !h-10 sm:!h-11" />
          {t('clear')}
        </AppButton>
      )}
    </div>
  );
};

export default Filters;
