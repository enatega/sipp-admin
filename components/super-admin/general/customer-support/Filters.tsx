'use client';

import { format, parseISO } from 'date-fns';
import { FilterX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppButton } from '@/components/shared/AppButton';
import { DateRangePicker } from '@/components/shared/form/DateRangePicker';
import SearchUrl from '@/components/shared/SearchUrl';

const Filters = () => {
  const t = useTranslations('customerSupport.filters');
  // const tTypeOptions = useTranslations('customerSupport.filters.typeOptions');
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
      creatorType: null,
      customerId: null,
    });
  };

  const showClearButton =
    getParam('search') ||
    currentStartDate ||
    currentEndDate ||
    currentTicketTypes.length > 0 ||
    getParam('status') ||
    getParam('priority') ||
    getParam('creatorType');

  // const typeOptions = [
  //   { key: tTypeOptions('foods'), value: 'LO Foods' },
  //   { key: tTypeOptions('drive'), value: 'LO Drive' },
  //   { key: tTypeOptions('hotels'), value: 'LO Hotels' },
  //   { key: tTypeOptions('tickets'), value: 'LO Tickets' },
  // ];

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <div className="w-full min-w-0 sm:w-auto sm:min-w-[320px]">
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

      <label className="sr-only" htmlFor="support-creator-filter">{t('creatorPlaceholder')}</label>
      <select
        id="support-creator-filter"
        className="h-11 rounded-md border bg-white px-3 text-sm"
        value={getParam('creatorType') ?? ''}
        onChange={(event) => setParams({ creatorType: event.target.value || null, customerId: null, page: '1' })}
      >
        <option value="">{t('creators.all')}</option>
        <option value="customer">{t('creators.customer')}</option>
        <option value="store">{t('creators.store')}</option>
        <option value="rider">{t('creators.rider')}</option>
      </select>

      <label className="sr-only" htmlFor="support-priority-filter">{t('priorityPlaceholder')}</label>
      <select
        id="support-priority-filter"
        className="h-11 rounded-md border bg-white px-3 text-sm"
        value={getParam('priority') ?? ''}
        onChange={(event) => setParams({ priority: event.target.value || null, page: '1' })}
      >
        <option value="">{t('priorities.all')}</option>
        <option value="low">{t('priorities.low')}</option>
        <option value="medium">{t('priorities.medium')}</option>
        <option value="high">{t('priorities.high')}</option>
        <option value="urgent">{t('priorities.critical')}</option>
      </select>

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

      {showClearButton && (
        <AppButton
          variant="secondary"
          onClick={clearFilters}
          className="text-ink/70"
        >
          <FilterX size={16} className="mr-2 !h-11" />
          {t('clear')}
        </AppButton>
      )}
    </div>
  );
};

export default Filters;
