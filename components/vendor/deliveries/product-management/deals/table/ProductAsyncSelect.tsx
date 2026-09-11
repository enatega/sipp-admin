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
import { useTranslations } from 'next-intl';
import { useGetDealDropdownProducts } from '@/hooks/api/vendor/deliveries/product-management/deals';
import {
  resolveFormikError,
  type ErrorStrategy,
} from '@/lib/resolveFormikError';
import { formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';
import type { DealDropdownProduct } from '@/types';
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

type ProductAsyncSelectProps = {
  name: string;
  vendorId?: string;
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
  initialSelectedProduct?: DealDropdownProduct | null;
  onProductChange?: (product: DealDropdownProduct | null) => void;
  currencySymbol?: string;
};

const mergeProducts = (
  existing: DealDropdownProduct[],
  incoming: DealDropdownProduct[],
  initialSelectedProduct?: DealDropdownProduct | null,
) => {
  const merged = new Map<string, DealDropdownProduct>();

  if (initialSelectedProduct) {
    merged.set(initialSelectedProduct.id, initialSelectedProduct);
  }

  existing.forEach((product) => {
    merged.set(product.id, product);
  });

  incoming.forEach((product) => {
    merged.set(product.id, product);
  });

  return Array.from(merged.values());
};

export default function ProductAsyncSelect({
  name,
  vendorId,
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
  initialSelectedProduct,
  onProductChange,
  currencySymbol,
}: ProductAsyncSelectProps) {
  const tForm = useTranslations('deals.form');
  const resolvedCurrencySymbol = currencySymbol || '$';
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [offset, setOffset] = React.useState(0);
  const [allProducts, setAllProducts] = React.useState<DealDropdownProduct[]>(
    initialSelectedProduct ? [initialSelectedProduct] : [],
  );
  const [hasMore, setHasMore] = React.useState(true);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const formik = React.useContext(
    FormikContext as unknown as React.Context<
      FormikContextType<FormikValues> | undefined
    >,
  );
  const hasFormik = Boolean(formik && name);

  const selectedProductId = hasFormik ? String(formik!.values[name] || '') : '';

  const formikError = resolveFormikError(
    formik,
    name as string | undefined,
    showErrorStrategy,
  );
  const error = errorProp ?? formikError;

  React.useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => {
      window.clearTimeout(handler);
    };
  }, [search]);

  React.useEffect(() => {
    setOffset(0);
  }, [debouncedSearch]);

  React.useEffect(() => {
    if (initialSelectedProduct) {
      setAllProducts((current) =>
        mergeProducts(current, [], initialSelectedProduct),
      );
    }
  }, [initialSelectedProduct]);

  React.useEffect(() => {
    if (open && inputRef.current) {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const queryParams = vendorId
    ? {
        vendorId,
        offset,
        limit: DEAL_DROPDOWN_PAGE_SIZE,
        search: debouncedSearch || undefined,
      }
    : null;

  const { data, isLoading, isFetching, isError, refetch } =
    useGetDealDropdownProducts(queryParams, {
      enabled: open && !!vendorId,
    });

  React.useEffect(() => {
    if (!data) return;

    const reachedEnd = !data.hasNextPage;
    setHasMore(!reachedEnd);
    setAllProducts((current) =>
      offset === 0
        ? mergeProducts([], data.data, initialSelectedProduct)
        : mergeProducts(current, data.data, initialSelectedProduct),
    );
  }, [data, initialSelectedProduct, offset]);

  const isFetchingMore = isFetching && offset > 0;
  const isLoadingInitial =
    (isLoading || (isFetching && offset === 0)) && allProducts.length === 0;

  const selectedProduct =
    allProducts.find((product) => product.id === selectedProductId) ||
    (initialSelectedProduct?.id === selectedProductId
      ? initialSelectedProduct
      : null);

  const generatedId = React.useId();
  const inputId = name ? `${name}-product-async-input` : generatedId;
  const helperId = error || helperText ? `${inputId}-helper` : undefined;

  const renderProductText = (product: DealDropdownProduct) => {
    const numericPrice = toNumberOrNull(product.price);

    if (numericPrice === null) {
      return product.name;
    }

    return `${product.name} (${formatCurrency(numericPrice, resolvedCurrencySymbol)})`;
  };

  const handleSelect = (product: DealDropdownProduct) => {
    if (!hasFormik) return;

    formik!.setFieldValue(name, product.id);
    setSearch('');
    setDebouncedSearch('');
    setOffset(0);
    setOpen(false);
    onProductChange?.(product);
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
            disabled={disabled || !vendorId}
            className={cn(
              'flex h-11 w-full items-center justify-between rounded-[12px] border bg-transparent px-3 text-sm',
              error
                ? 'border-destructive'
                : open && !disabled
                  ? 'border-primary'
                  : 'border-stroke',
              (disabled || !vendorId) && 'cursor-not-allowed opacity-70 bg-light',
              inputContainerClassName,
              className,
            )}
          >
            <span
              className={cn(
                'truncate text-left',
                selectedProduct
                  ? 'text-foreground'
                  : 'text-muted-foreground font-normal',
              )}
            >
              {selectedProduct
                ? renderProductText(selectedProduct)
                : placeholder || tForm('productPlaceholder')}
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
                    placeholder={tForm('productSearchPlaceholder')}
                    className="h-10 w-full rounded-lg border border-stroke bg-transparent pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                    aria-invalid={!!error}
                    aria-describedby={helperId}
                    disabled={disabled}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={disabled || isFetching}
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
              {isError ? (
                <div className="flex flex-col items-center gap-3 p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Failed to load products
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
                  Loading products...
                </div>
              ) : allProducts.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No products found
                </div>
              ) : (
                <CommandGroup>
                  {allProducts.map((product) => (
                    <CommandItem
                      key={product.id}
                      value={`${product.id} ${product.name}`}
                      className="cursor-pointer px-3 py-2.5"
                      onSelect={() => handleSelect(product)}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate">{product.name}</p>
                          {toNumberOrNull(product.price) !== null && (
                            <p className="truncate text-xs text-muted-foreground">
                              {formatCurrency(
                                toNumberOrNull(product.price) as number,
                                currencySymbol,
                              )}
                            </p>
                          )}
                        </div>
                        {selectedProductId === product.id && (
                          <Check className="size-4 text-primary" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
                  {isFetchingMore && (
                    <CommandItem disabled>
                      <div className="flex w-full items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Loading more products...
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
