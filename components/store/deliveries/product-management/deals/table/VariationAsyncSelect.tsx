'use client';

import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import {
  FormikContext,
  type FormikContextType,
  type FormikValues,
} from 'formik';
import {
  Check,
  ChevronsUpDown,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useGetDealDropdownVariations } from '@/hooks/api/store/deliveries/product-management/deals';
import { formatCurrency } from '@/lib/formatCurrency';
import {
  resolveFormikError,
  type ErrorStrategy,
} from '@/lib/resolveFormikError';
import { cn } from '@/lib/utils';
import type { DealDropdownVariation } from '@/types';
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
import { DEAL_DROPDOWN_PAGE_SIZE, toNumberOrNull } from './dealDrawer.utils';

const VARIATION_SEARCH_PLACEHOLDER = 'Search variations...';

type VariationAsyncSelectProps = {
  name: string;
  storeId?: string;
  productId?: string;
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
  initialSelectedVariation?: DealDropdownVariation | null;
  onVariationChange?: (variation: DealDropdownVariation | null) => void;
  currencySymbol?: string;
};

const mergeVariations = (
  existing: DealDropdownVariation[],
  incoming: DealDropdownVariation[],
  initialSelectedVariation?: DealDropdownVariation | null,
) => {
  const merged = new Map<string, DealDropdownVariation>();

  if (initialSelectedVariation) {
    merged.set(initialSelectedVariation.id, initialSelectedVariation);
  }

  existing.forEach((variation) => {
    merged.set(variation.id, variation);
  });

  incoming.forEach((variation) => {
    merged.set(variation.id, variation);
  });

  return Array.from(merged.values());
};

export default function VariationAsyncSelect({
  name,
  storeId,
  productId,
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
  initialSelectedVariation,
  onVariationChange,
  currencySymbol,
}: VariationAsyncSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [offset, setOffset] = React.useState(0);
  const [allVariations, setAllVariations] = React.useState<DealDropdownVariation[]>(
    initialSelectedVariation ? [initialSelectedVariation] : [],
  );
  const [hasMore, setHasMore] = React.useState(true);
  const previousProductIdRef = React.useRef<string | undefined>(productId);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const formik = React.useContext(
    FormikContext as unknown as React.Context<
      FormikContextType<FormikValues> | undefined
    >,
  );
  const hasFormik = Boolean(formik && name);

  const selectedVariationId = hasFormik
    ? String(formik!.values[name] || '')
    : '';

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
    if (initialSelectedVariation) {
      setAllVariations((current) =>
        mergeVariations(current, [], initialSelectedVariation),
      );
    }
  }, [initialSelectedVariation]);

  React.useEffect(() => {
    if (open && inputRef.current) {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  React.useEffect(() => {
    const previousProductId = previousProductIdRef.current;

    if (previousProductId !== productId) {
      setOffset(0);
      setSearch('');
      setDebouncedSearch('');
      setHasMore(true);
      setAllVariations(initialSelectedVariation ? [initialSelectedVariation] : []);

      if (hasFormik && previousProductId && formik!.values[name]) {
        formik!.setFieldValue(name, '');
        onVariationChange?.(null);
      }
    }

    previousProductIdRef.current = productId;
  }, [formik, hasFormik, initialSelectedVariation, name, onVariationChange, productId]);

  const queryParams = storeId && productId
    ? {
        storeId,
        productId,
        offset,
        limit: DEAL_DROPDOWN_PAGE_SIZE,
        search: debouncedSearch || undefined,
      }
    : null;

  const { data, isLoading, isFetching, isError, refetch } =
    useGetDealDropdownVariations(queryParams, {
      enabled: open && !!storeId && !!productId,
    });

  React.useEffect(() => {
    if (!data) return;

    const reachedEnd = !data.hasNextPage;
    setHasMore(!reachedEnd);
    setAllVariations((current) =>
      offset === 0
        ? mergeVariations([], data.data, initialSelectedVariation)
        : mergeVariations(current, data.data, initialSelectedVariation),
    );
  }, [data, initialSelectedVariation, offset]);

  const isFetchingMore = isFetching && offset > 0;
  const isLoadingInitial =
    (isLoading || (isFetching && offset === 0)) && allVariations.length === 0;

  const selectedVariation =
    allVariations.find((variation) => variation.id === selectedVariationId) ||
    (initialSelectedVariation?.id === selectedVariationId
      ? initialSelectedVariation
      : null);

  const generatedId = React.useId();
  const inputId = name ? `${name}-variation-async-input` : generatedId;
  const helperId = error || helperText ? `${inputId}-helper` : undefined;

  const renderVariationText = (variation: DealDropdownVariation) => {
    const numericPrice = toNumberOrNull(variation.price);

    if (numericPrice === null) {
      return variation.name;
    }

    return `${variation.name} (${formatCurrency(numericPrice, currencySymbol)})`;
  };

  const handleSelect = (variation: DealDropdownVariation) => {
    if (!hasFormik) return;

    formik!.setFieldValue(name, variation.id);
    setSearch('');
    setDebouncedSearch('');
    setOffset(0);
    setOpen(false);
    onVariationChange?.(variation);
  };

  const handleLoadMore = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const reachedBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 40;

    if (reachedBottom && hasMore && !isFetching && !isLoadingInitial) {
      setOffset((current) => current + DEAL_DROPDOWN_PAGE_SIZE);
    }
  };

  const handleRefresh = () => {
    if (offset === 0) {
      void refetch();
      return;
    }

    setOffset(0);
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
            disabled={disabled || !storeId || !productId}
            className={cn(
              'flex h-11 w-full items-center justify-between rounded-[12px] border bg-transparent px-3 text-sm',
              error
                ? 'border-destructive'
                : open && !disabled
                  ? 'border-primary'
                  : 'border-stroke',
              (disabled || !storeId || !productId) &&
                'cursor-not-allowed opacity-70 bg-light',
              inputContainerClassName,
              className,
            )}
          >
            <span
              className={cn(
                'truncate text-left',
                selectedVariation
                  ? 'text-foreground'
                  : 'text-muted-foreground font-normal',
              )}
            >
              {selectedVariation
                ? renderVariationText(selectedVariation)
                : placeholder || 'Select variation'}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            window.setTimeout(() => inputRef.current?.focus(), 0);
          }}
          onWheel={(event) => {
            event.stopPropagation();
          }}
        >
          <Command className="overflow-visible bg-transparent" shouldFilter={false}>
            <div className="border-b p-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <CommandPrimitive.Input
                    ref={inputRef}
                    value={search}
                    onValueChange={setSearch}
                    placeholder={VARIATION_SEARCH_PLACEHOLDER}
                    className="h-10 w-full rounded-lg border border-stroke bg-transparent pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                    aria-invalid={!!error}
                    aria-describedby={helperId}
                    disabled={disabled || !productId}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={disabled || isFetching || !productId}
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-stroke px-3 text-sm font-medium text-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} />
                </button>
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
              {!productId ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Select product first
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center gap-3 p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Failed to load variations
                  </p>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium text-primary"
                  >
                    <RefreshCw className="size-4" />
                    Refresh
                  </button>
                </div>
              ) : isLoadingInitial ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading variations...
                </div>
              ) : allVariations.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No variations found
                </div>
              ) : (
                <CommandGroup>
                  {allVariations.map((variation) => (
                    <CommandItem
                      key={variation.id}
                      value={`${variation.id} ${variation.name}`}
                      className="cursor-pointer px-3 py-2.5"
                      onSelect={() => handleSelect(variation)}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate">{variation.name}</p>
                          {toNumberOrNull(variation.price) !== null && (
                            <p className="truncate text-xs text-muted-foreground">
                              {formatCurrency(
                                toNumberOrNull(variation.price) as number,
                                currencySymbol,
                              )}
                            </p>
                          )}
                        </div>
                        {selectedVariationId === variation.id && (
                          <Check className="size-4 text-primary" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
                  {isFetchingMore && (
                    <CommandItem disabled>
                      <div className="flex w-full items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Loading more variations...
                      </div>
                    </CommandItem>
                  )}
                  {!hasMore && !isFetchingMore && (
                    <CommandItem disabled>
                      <div className="w-full py-2 text-center text-sm text-muted-foreground">
                        You have reached the end of the list
                      </div>
                    </CommandItem>
                  )}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {(error || helperText) && (
        <p
          id={helperId}
          className={cn('mt-1 text-sm', error ? 'text-destructive' : 'text-mute')}
        >
          {error ?? helperText}
        </p>
      )}
    </div>
  );
}
