'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { FilterX } from 'lucide-react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppButton } from '@/components/shared/AppButton';
import { DateRangePicker } from '@/components/shared/form/DateRangePicker';
import { SearchInput } from '@/components/shared/SearchInput';

export default function Filters() {
  const { getParam, setParams } = useQueryParams();
  const [searchTerm, setSearchTerm] = useState(
    getParam('deliveriesSearch') || '',
  );

  useEffect(() => {
    const handler = window.setTimeout(() => {
      if (searchTerm !== (getParam('deliveriesSearch') || '')) {
        setParams({
          deliveriesSearch: searchTerm || null,
          deliveriesPage: '1',
        });
      }
    }, 500);

    return () => window.clearTimeout(handler);
  }, [getParam, searchTerm, setParams]);

  const currentStartDate = getParam('deliveriesStartDate');
  const currentEndDate = getParam('deliveriesEndDate');

  const clearFilters = () => {
    setSearchTerm('');
    setParams({
      deliveriesSearch: null,
      deliveriesStartDate: null,
      deliveriesEndDate: null,
      deliveriesPage: '1',
    });
  };

  const showClearButton =
    !!getParam('deliveriesSearch') || !!currentStartDate || !!currentEndDate;

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <div className="w-[320px]">
        <SearchInput
          inputClassName="h-11"
          placeholder="Search zone title or description"
          text={searchTerm}
          onChangeText={setSearchTerm}
        />
      </div>

      <DateRangePicker
        placeholder="Select date range"
        className="shadow-sm"
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
            deliveriesStartDate: range?.from
              ? format(range.from, 'yyyy-MM-dd')
              : null,
            deliveriesEndDate: range?.to ? format(range.to, 'yyyy-MM-dd') : null,
            deliveriesPage: '1',
          });
        }}
      />

      {showClearButton ? (
        <AppButton
          variant="secondary"
          onClick={clearFilters}
          className="text-primary/70"
        >
          <FilterX size={16} className="mr-2 !h-11" />
          Clear Filters
        </AppButton>
      ) : null}
    </div>
  );
}
