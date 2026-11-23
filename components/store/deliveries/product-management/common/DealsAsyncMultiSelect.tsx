'use client';

import * as React from 'react';
import {
  FormikContext,
  type FormikContextType,
  type FormikValues,
} from 'formik';
import {
  Check,
  ChevronsUpDown,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useGetActiveDeals } from '@/hooks/api/store/deliveries/product-management/deals';
import {
  resolveFormikError,
  type ErrorStrategy,
} from '@/lib/resolveFormikError';
import { cn } from '@/lib/utils';
import type { ActiveDealOption, DealFormValues } from '@/types';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import AddDealDrawer from '@/components/store/deliveries/product-management/deals/add-deal/AddDealDrawer';

const PAGE_SIZE = 100;

type DealsAsyncMultiSelectProps = {
  name: string;
  storeId?: string;
  label?: string;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  containerClassName?: string;
  inputContainerClassName?: string;
  error?: string;
  helperText?: string;
  showErrorStrategy?: ErrorStrategy;
  disabled?: boolean;
  requiredAsterisk?: boolean;
  initialSelectedDeal?: ActiveDealOption | null;
  onDealChange?: (deal: ActiveDealOption | null) => void;
};

const mergeDeals = (
  existing: ActiveDealOption[],
  incoming: ActiveDealOption[],
  initialSelectedDeal?: ActiveDealOption | null,
) => {
  const merged = new Map<string, ActiveDealOption>();

  if (initialSelectedDeal?.id) {
    merged.set(initialSelectedDeal.id, initialSelectedDeal);
  }

  existing.forEach((deal) => {
    merged.set(deal.id, deal);
  });

  incoming.forEach((deal) => {
    merged.set(deal.id, deal);
  });

  return Array.from(merged.values());
};

export default function DealsAsyncMultiSelect({
  name,
  storeId,
  label,
  placeholder,
  className,
  labelClassName,
  containerClassName,
  inputContainerClassName,
  error: errorProp,
  helperText,
  showErrorStrategy = 'touchedOrSubmit',
  disabled,
  requiredAsterisk,
  initialSelectedDeal,
  onDealChange,
}: DealsAsyncMultiSelectProps) {
  const tStep1 = useTranslations('products.addProduct.step1');
  const tDealsForm = useTranslations('deals.form');
  const tDealsTable = useTranslations('deals.table');
  const [open, setOpen] = React.useState(false);
  const [offset, setOffset] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [addDealOpen, setAddDealOpen] = React.useState(false);
  const [allDeals, setAllDeals] = React.useState<ActiveDealOption[]>(
    initialSelectedDeal ? [initialSelectedDeal] : [],
  );
  const [hasMore, setHasMore] = React.useState(true);

  const formik = React.useContext(
    FormikContext as unknown as React.Context<
      FormikContextType<FormikValues> | undefined
    >,
  );
  const hasFormik = Boolean(formik && name);

  const selectedDealId = hasFormik ? String(formik!.values[name] || '') : '';

  const formikError = resolveFormikError(
    formik,
    name as string | undefined,
    showErrorStrategy,
  );
  const error = errorProp ?? formikError;

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  React.useEffect(() => {
    setOffset(0);
  }, [debouncedSearch]);

  React.useEffect(() => {
    if (initialSelectedDeal) {
      setAllDeals((current) => mergeDeals(current, [], initialSelectedDeal));
    }
  }, [initialSelectedDeal]);

  const queryParams = storeId
    ? {
        store_id: storeId,
        offset,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
      }
    : null;

  const { data, isLoading, isFetching, isError, refetch } = useGetActiveDeals(
    queryParams,
    {
      enabled: open && !!storeId,
    },
  );

  React.useEffect(() => {
    if (!data) return;

    setHasMore(data.hasMore);
    setAllDeals((current) =>
      offset === 0
        ? mergeDeals([], data.data, initialSelectedDeal)
        : mergeDeals(current, data.data, initialSelectedDeal),
    );
  }, [data, initialSelectedDeal, offset]);

  const isFetchingMore = isFetching && offset > 0;
  const isLoadingInitial =
    (isLoading || (isFetching && offset === 0)) && allDeals.length === 0;

  const selectedDeal =
    allDeals.find((deal) => deal.id === selectedDealId) ||
    (initialSelectedDeal?.id === selectedDealId ? initialSelectedDeal : null);

  const generatedId = React.useId();
  const inputId = name ? `${name}-deals-async-input` : generatedId;
  const helperId = error || helperText ? `${inputId}-helper` : undefined;

  const setSelectedDeal = (deal: ActiveDealOption | null) => {
    onDealChange?.(deal);
    if (!hasFormik) return;

    formik!.setFieldValue(name, deal?.id || '');
  };

  const handleLoadMore = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const reachedBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 40;

    if (reachedBottom && hasMore && !isFetching && !isLoadingInitial) {
      setOffset((current) => current + PAGE_SIZE);
    }
  };

  const handleRefresh = () => {
    if (offset === 0) {
      void refetch();
      return;
    }

    setOffset(0);
  };

  const handleClearSearch = () => {
    if (!search) return;

    setSearch('');
    if (offset !== 0) {
      setOffset(0);
    }
  };

  const handleDealCreated = (values: DealFormValues) => {
    void values;
    setSearch('');
    setDebouncedSearch('');
    setOffset(0);
    setHasMore(true);
    void refetch();
  };

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn('text-[15px] font-medium', labelClassName)}
        >
          {label}
          {requiredAsterisk && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={inputId}
            type="button"
            disabled={disabled || !storeId}
            className={cn(
              'flex min-h-11 w-full items-center justify-between rounded-[12px] border bg-transparent px-3 py-2 text-sm',
              error
                ? 'border-destructive'
                : open && !disabled
                  ? 'border-primary'
                  : 'border-stroke',
              (disabled || !storeId) && 'cursor-not-allowed opacity-70 bg-light',
              inputContainerClassName,
              className,
            )}
          >
            <div className="flex flex-1 flex-wrap gap-1 text-left">
              {selectedDeal ? (
                <span className="max-w-[240px] truncate">{selectedDeal.deal_name}</span>
              ) : (
                <span className="text-muted-foreground">
                  {placeholder || tStep1('dealsPlaceholder')}
                </span>
              )}
            </div>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          onWheel={(event) => {
            event.stopPropagation();
          }}
        >
          <Command className="overflow-visible bg-transparent" shouldFilter={false}>
            <div className="border-b p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">
                  {tStep1('dealsLabel')}
                </span>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={disabled || isFetching}
                  className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-stroke px-3 text-sm font-medium text-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    className={cn('size-4', isFetching && 'animate-spin')}
                  />
                </button>
              </div>
              <div className="relative mt-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => {
                    if (offset !== 0) {
                      setOffset(0);
                    }
                    setSearch(event.target.value);
                  }}
                  placeholder={tDealsForm('dealSearchPlaceholder')}
                  className="h-10 w-full rounded-lg border border-stroke bg-transparent pl-9 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
                {search && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={tDealsForm('optionsClearSearch')}
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>

            <CommandList
              className="max-h-[280px] overflow-y-auto overscroll-contain"
              style={{ overflowY: 'auto', touchAction: 'pan-y' }}
              onMouseDown={(event) => event.stopPropagation()}
              onWheel={(event) => {
                event.stopPropagation();
              }}
              onScroll={handleLoadMore}
            >
              {isError ? (
                <div className="flex flex-col items-center gap-3 p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {tDealsTable('fetchFailedTitle')}
                  </p>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium text-primary"
                  >
                    <RefreshCw className="size-4" />
                    {tDealsForm('optionsRefresh')}
                  </button>
                </div>
              ) : isLoadingInitial ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {tDealsForm('optionsLoading')}
                </div>
              ) : allDeals.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {tDealsTable('noDataTitle')}
                </div>
              ) : (
                <CommandGroup>
                  {allDeals.map((deal) => (
                    <CommandItem
                      key={deal.id}
                      value={`${deal.id} ${deal.deal_name}`}
                      className="cursor-pointer px-3 py-2.5"
                      onSelect={() => {
                        setSelectedDeal(deal);
                        setOpen(false);
                      }}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="truncate">{deal.deal_name}</span>
                        {selectedDealId === deal.id && (
                          <Check className="size-4 text-primary" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
                  {isFetchingMore && (
                    <CommandItem disabled>
                      <div className="flex w-full items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        {tDealsForm('optionsLoadingMore')}
                      </div>
                    </CommandItem>
                  )}
                  {!hasMore && !isFetchingMore && (
                    <CommandItem disabled>
                      <div className="w-full py-2 text-center text-sm text-muted-foreground">
                        {tDealsForm('optionsReachedEnd')}
                      </div>
                    </CommandItem>
                  )}
                </CommandGroup>
              )}
            </CommandList>

            <div className="border-t p-2 space-y-2">
              {selectedDealId ? (
                <button
                  type="button"
                  onClick={() => setSelectedDeal(null)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-stroke px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="size-4" />
                  {tDealsForm('clearSelectedDeal')}
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => setAddDealOpen(true)}
                disabled={disabled || !storeId}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-stroke px-3 py-2 text-sm font-medium text-primary transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="size-4" />
                {tDealsForm('addNewDeal')}
              </button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {(error || helperText) && (
        <p
          id={helperId}
          className={cn(
            'text-sm mt-1',
            error ? 'text-destructive' : 'text-mute',
          )}
        >
          {error ?? helperText}
        </p>
      )}

      <AddDealDrawer
        open={addDealOpen}
        onOpenChange={(nextOpen) => {
          setAddDealOpen(nextOpen);
          if (!nextOpen) {
            setOffset(0);
            void refetch();
          }
        }}
        onSubmit={handleDealCreated}
      />
    </div>
  );
}
