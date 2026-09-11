'use client';

import { format, parseISO } from 'date-fns';
import { FilterX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppButton } from '@/components/shared/AppButton';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { DateRangePicker } from '@/components/shared/form/DateRangePicker';
import SearchUrl from '@/components/shared/SearchUrl';

const Filters = () => {
  const t = useTranslations('customerSupport.filters');
  // const tTypeOptions = useTranslations('customerSupport.filters.typeOptions');
  const tPriorities = useTranslations('customerSupport.filters.priorities');
  const { getParam, setParams, getAllParams } = useQueryParams();

  const currentStartDate = getParam('from');
  const currentEndDate = getParam('to');

  // Get ticketType as array
  const allParams = getAllParams();
  const ticketTypeParam = allParams['ticketType'];
  const currentTicketTypes = ticketTypeParam
    ? Array.isArray(ticketTypeParam)
      ? ticketTypeParam
      : [ticketTypeParam]
    : [];

  const clearFilters = () => {
    setParams({
      search: null,
      from: null,
      to: null,
      ticketType: null,
      status: null,
      priority: null,
    });
  };

  const showClearButton =
    getParam('search') ||
    currentStartDate ||
    currentEndDate ||
    currentTicketTypes.length > 0 ||
    getParam('status') ||
    getParam('priority');

  // const typeOptions = [
  //   { key: tTypeOptions('foods'), value: 'LO Foods' },
  //   { key: tTypeOptions('drive'), value: 'LO Drive' },
  //   { key: tTypeOptions('hotels'), value: 'LO Hotels' },
  //   { key: tTypeOptions('tickets'), value: 'LO Tickets' },
  // ];

  const priorityOptions = [
    { key: tPriorities('all'), value: 'all' },
    { key: tPriorities('low'), value: 'low' },
    { key: tPriorities('medium'), value: 'medium' },
    { key: tPriorities('high'), value: 'high' },
    { key: tPriorities('urgent'), value: 'urgent' },
  ];

  const currentPriority = getParam('priority') ?? undefined;

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <div className=" min-w-[400px]">
        <SearchUrl inputClassName="h-11" placeholder={t('searchPlaceholder')} />
      </div>

      <div className="w-fit">
        <DateRangePicker
          placeholder={t('datePlaceholder')}
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
              from: range?.from ? format(range.from, 'yyyy-MM-dd') : null,
              to: range?.to ? format(range.to, 'yyyy-MM-dd') : null,
              page: '1',
            });
          }}
        />
      </div>

      {/* <MultiSelect
        options={typeOptions}
        selected={currentTicketTypes}
        onChange={(newTypes) => {
          setParams({
            ticketType: newTypes.length > 0 ? newTypes.join(',') : null,
            page: '1',
          });
        }}
        placeholder={t('typePlaceholder')}
        className="shadow-sm cursor-pointer"
      /> */}

      <div className="w-[200px]">
        <AppSelect
          name="priority"
          options={priorityOptions}
          value={currentPriority}
          onValueChange={(val) => {
            setParams({
              priority: val === 'all' ? null : val,
              page: '1',
            });
          }}
          placeholder={t('priorityPlaceholder')}
          className="shadow-sm"
        />
      </div>

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
