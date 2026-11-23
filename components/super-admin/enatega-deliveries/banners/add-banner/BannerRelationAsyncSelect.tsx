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
import {
  resolveFormikError,
  type ErrorStrategy,
} from '@/lib/resolveFormikError';
import { cn } from '@/lib/utils';
import {
  useGetBannerProductsDropdown,
  useGetBannerShopTypesDropdown,
  useGetBannerStoresDropdown,
} from '@/hooks/api/super-admin/enatega-deliveries/banners';
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

const PAGE_SIZE = 10;

type RelationOption = {
  id: string;
  name: string;
};

type RelationType = 'store' | 'product' | 'shop_type';

interface BannerRelationAsyncSelectProps {
  name: string;
  relationType: RelationType;
  label: string;
  placeholder: string;
  requiredAsterisk?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  showErrorStrategy?: ErrorStrategy;
  initialSelectedOption?: RelationOption | null;
}

const mergeItems = (
  existing: RelationOption[],
  incoming: RelationOption[],
  initialSelectedOption?: RelationOption | null,
) => {
  const merged = new Map<string, RelationOption>();

  if (initialSelectedOption) {
    merged.set(initialSelectedOption.id, initialSelectedOption);
  }

  existing.forEach((item) => merged.set(item.id, item));
  incoming.forEach((item) => merged.set(item.id, item));

  return Array.from(merged.values());
};

export function BannerRelationAsyncSelect({
  name,
  relationType,
  label,
  placeholder,
  requiredAsterisk,
  disabled,
  error: errorProp,
  helperText,
  showErrorStrategy = 'touchedOrSubmit',
  initialSelectedOption,
}: BannerRelationAsyncSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [offset, setOffset] = React.useState(0);
  const [items, setItems] = React.useState<RelationOption[]>(
    initialSelectedOption ? [initialSelectedOption] : [],
  );
  const [hasMore, setHasMore] = React.useState(true);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const formik = React.useContext(
    FormikContext as unknown as React.Context<
      FormikContextType<FormikValues> | undefined
    >,
  );

  const hasFormik = Boolean(formik && name);
  const selectedId = hasFormik ? String(formik!.values[name] || '') : '';

  const formikError = resolveFormikError(
    formik,
    name as string | undefined,
    showErrorStrategy,
  );
  const error = errorProp ?? formikError;

  React.useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => {
      window.clearTimeout(handler);
    };
  }, [search]);

  React.useEffect(() => {
    setOffset(0);
  }, [debouncedSearch, relationType]);

  React.useEffect(() => {
    if (initialSelectedOption) {
      setItems((current) => mergeItems(current, [], initialSelectedOption));
    }
  }, [initialSelectedOption]);

  React.useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const storesQuery = useGetBannerStoresDropdown(
    {
      offset,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
    },
    {
      enabled: open && relationType === 'store',
    },
  );

  const productsQuery = useGetBannerProductsDropdown(
    {
      offset,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
    },
    {
      enabled: open && relationType === 'product',
    },
  );

  const shopTypesQuery = useGetBannerShopTypesDropdown(
    {
      offset,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
    },
    {
      enabled: open && relationType === 'shop_type',
    },
  );

  const activeQuery =
    relationType === 'store'
      ? storesQuery
      : relationType === 'product'
        ? productsQuery
        : shopTypesQuery;

  const { data, isLoading, isFetching, isError, refetch } = activeQuery;

  React.useEffect(() => {
    if (!data) return;

    const incoming = (data.data || []).map((item) => ({
      id: item.id,
      name: item.name || item.id,
    }));

    setHasMore(Boolean(data.hasMore));
    setItems((current) =>
      offset === 0
        ? mergeItems([], incoming, initialSelectedOption)
        : mergeItems(current, incoming, initialSelectedOption),
    );
  }, [data, initialSelectedOption, offset]);

  const selectedItem =
    items.find((item) => item.id === selectedId) ||
    (initialSelectedOption?.id === selectedId ? initialSelectedOption : null);

  const generatedId = React.useId();
  const inputId = `${name}-${generatedId}`;
  const helperId = error || helperText ? `${inputId}-helper` : undefined;

  const handleSelect = (item: RelationOption) => {
    if (!hasFormik) return;

    formik!.setFieldValue(name, item.id);
    setSearch('');
    setDebouncedSearch('');
    setOffset(0);
    setOpen(false);
  };

  const handleLoadMore = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const reachedBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 40;

    if (reachedBottom && hasMore && !isFetching) {
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

  const isFetchingMore = isFetching && offset > 0;
  const isLoadingInitial =
    (isLoading || (isFetching && offset === 0)) && items.length === 0;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-[15px] font-medium">
        {label}
        {requiredAsterisk && <span className="text-destructive ml-1">*</span>}
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={inputId}
            type="button"
            disabled={disabled}
            className={cn(
              'flex h-11 w-full items-center justify-between rounded-[12px] border bg-transparent px-3 text-sm',
              error
                ? 'border-destructive'
                : open
                  ? 'border-primary'
                  : 'border-stroke',
              disabled && 'cursor-not-allowed opacity-70 bg-light',
            )}
            aria-describedby={helperId}
          >
            <span
              className={cn(
                'truncate text-left',
                selectedItem ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {selectedItem?.name || placeholder}
            </span>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          <Command className="bg-transparent" shouldFilter={false}>
            <div className="border-b p-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <CommandPrimitive.Input
                    ref={inputRef}
                    value={search}
                    onValueChange={setSearch}
                    placeholder={`Search ${label.toLowerCase()}...`}
                    className="h-10 w-full rounded-lg border border-stroke bg-transparent pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isFetching}
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-stroke px-3 text-sm font-medium text-primary disabled:opacity-60"
                >
                  <RefreshCw
                    className={cn('size-4', isFetching && 'animate-spin')}
                  />
                </button>
              </div>
            </div>

            <div
              className="max-h-[280px] overflow-y-auto overscroll-contain"
              onScroll={handleLoadMore}
              onWheel={(event) => event.stopPropagation()}
            >
              <CommandList className="overflow-visible">
                {isError ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Failed to load options
                  </div>
                ) : isLoadingInitial ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : items.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No results found
                  </div>
                ) : (
                  <CommandGroup>
                    {items.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={`${item.id} ${item.name}`}
                        className="cursor-pointer px-3 py-2.5"
                        onSelect={() => handleSelect(item)}
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <span className="truncate">{item.name}</span>
                          {selectedId === item.id && (
                            <Check className="size-4 text-primary" />
                          )}
                        </div>
                      </CommandItem>
                    ))}

                    {isFetchingMore && (
                      <CommandItem disabled>
                        <div className="flex w-full items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                          <Loader2 className="size-4 animate-spin" />
                          Loading more...
                        </div>
                      </CommandItem>
                    )}
                  </CommandGroup>
                )}
              </CommandList>
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
    </div>
  );
}
