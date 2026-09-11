'use client';

import * as React from 'react';
import { FormikContext, type FormikContextType, type FormikValues } from 'formik';
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
import {
  useGetVendorAddonsDropdown,
} from '@/hooks/api/vendor/deliveries/product-management/dropdowns';
import { useCreateAddon } from '@/hooks/api/vendor/deliveries/product-management/addons';
import { handleApiError } from '@/lib/toast-error';
import {
  resolveFormikError,
  type ErrorStrategy,
} from '@/lib/resolveFormikError';
import { cn } from '@/lib/utils';
import type { AddonFormValues, ApiErrorResponse, VendorDropdownOption } from '@/types';
import { Badge } from '@/components/ui/badge';
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
import { AddAddonDrawer } from '@/components/vendor/deliveries/product-management/addons/add-addon';

const PAGE_SIZE = 100;

type VendorAddonsAsyncMultiSelectProps = {
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
  initialSelectedAddons?: VendorDropdownOption[] | null;
};

const mergeAddons = (
  existing: VendorDropdownOption[],
  incoming: VendorDropdownOption[],
  initialSelectedAddons?: VendorDropdownOption[] | null,
) => {
  const merged = new Map<string, VendorDropdownOption>();

  initialSelectedAddons?.forEach((addon) => {
    merged.set(addon.id, addon);
  });

  existing.forEach((addon) => {
    merged.set(addon.id, addon);
  });

  incoming.forEach((addon) => {
    merged.set(addon.id, addon);
  });

  return Array.from(merged.values());
};

export default function VendorAddonsAsyncMultiSelect({
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
  initialSelectedAddons,
}: VendorAddonsAsyncMultiSelectProps) {
  const tStoreAddons = useTranslations('storeAddons');
  const tStoreAddonsForm = useTranslations('storeAddons.form');
  const tStoreAddonsErrors = useTranslations('storeAddons.errors');
  const tStoreAddonsTable = useTranslations('storeAddons.table');
  const tSearchInput = useTranslations('searchInput');
  const [open, setOpen] = React.useState(false);
  const [addAddonOpen, setAddAddonOpen] = React.useState(false);
  const [offset, setOffset] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [allAddons, setAllAddons] = React.useState<VendorDropdownOption[]>(
    initialSelectedAddons ?? [],
  );
  const [hasMore, setHasMore] = React.useState(true);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { mutateAsync: createAddon } = useCreateAddon();

  const formik = React.useContext(
    FormikContext as unknown as React.Context<
      FormikContextType<FormikValues> | undefined
    >,
  );
  const hasFormik = Boolean(formik && name);

  const selectedAddonIds: string[] = hasFormik
    ? (Array.isArray(formik!.values[name]) ? formik!.values[name] : [])
    : [];

  const formikError = resolveFormikError(
    formik,
    name as string | undefined,
    showErrorStrategy,
  );
  const error = errorProp ?? formikError;

  React.useEffect(() => {
    if (initialSelectedAddons?.length) {
      setAllAddons((current) => mergeAddons(current, [], initialSelectedAddons));
    }
  }, [initialSelectedAddons]);

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
    if (open && inputRef.current) {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const queryParams = vendorId
    ? {
        vendorId,
        offset,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
      }
    : null;

  const { data, isLoading, isFetching, isError, refetch } =
    useGetVendorAddonsDropdown(queryParams, {
      enabled: (open || selectedAddonIds.length > 0) && !!vendorId,
    });

  React.useEffect(() => {
    if (!data) return;

    setHasMore(data.hasMore);
    setAllAddons((current) =>
      offset === 0
        ? mergeAddons([], data.data, initialSelectedAddons)
        : mergeAddons(current, data.data, initialSelectedAddons),
    );
  }, [data, initialSelectedAddons, offset]);

  const isFetchingMore = isFetching && offset > 0;
  const isLoadingInitial =
    (isLoading || (isFetching && offset === 0)) && allAddons.length === 0;

  const selectedAddons = selectedAddonIds
    .map(
      (selectedId) =>
        allAddons.find((addon) => addon.id === selectedId) ?? {
          id: selectedId,
          name: selectedId,
        },
    )
    .filter(Boolean) as VendorDropdownOption[];

  const firstSelectedAddon = selectedAddons[0] ?? null;
  const generatedId = React.useId();
  const inputId = name ? `${name}-addons-async-input` : generatedId;
  const helperId = error || helperText ? `${inputId}-helper` : undefined;

  const handleToggleAddon = (addonId: string) => {
    if (!hasFormik) return;

    const nextValue = selectedAddonIds.includes(addonId)
      ? selectedAddonIds.filter((selectedId) => selectedId !== addonId)
      : [...selectedAddonIds, addonId];

    formik!.setFieldValue(name, nextValue);
  };

  const handleRemove = (addonId: string) => {
    if (!hasFormik) return;

    formik!.setFieldValue(
      name,
      selectedAddonIds.filter((selectedId) => selectedId !== addonId),
    );
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

  const handleCreateAddon = async (values: AddonFormValues) => {
    if (!vendorId) {
      return;
    }

    try {
      const createdAddon = await createAddon({
        vendor_id: vendorId,
        name: values.name.trim(),
        description: values.description.trim(),
        requiredCheck: values.requiredCheck,
        selectionType: values.selectionType as 'single' | 'multi',
        price: Number(values.price ?? 0),
        minSelect: Number(values.minSelect ?? 0),
        maxSelect: Number(values.maxSelect ?? 0),
        status: values.status ?? true,
        type: 'add-on',
        dependsOnVariationId: values.dependsOnVariationId ?? null,
        optionIds: values.optionIds,
      });

      const createdOption: VendorDropdownOption = {
        id: createdAddon.id,
        name: createdAddon.name,
      };

      setAllAddons((current) =>
        mergeAddons(current, [createdOption], initialSelectedAddons),
      );

      if (hasFormik) {
        const nextValue = selectedAddonIds.includes(createdAddon.id)
          ? selectedAddonIds
          : [...selectedAddonIds, createdAddon.id];
        formik!.setFieldValue(name, nextValue);
      }

      setSearch('');
      setDebouncedSearch('');
      setOffset(0);
      setHasMore(true);
      setAddAddonOpen(false);
      void refetch();
    } catch (createError) {
      handleApiError(createError as ApiErrorResponse);
    }
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
              'flex min-h-11 w-full items-center justify-between rounded-[12px] border bg-transparent px-3 py-2 text-sm',
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
            <div className="flex flex-1 flex-wrap gap-1.5 text-left">
              {selectedAddons.length > 0 && firstSelectedAddon ? (
                <>
                  <Badge variant="secondary" className="max-w-[180px] gap-1">
                    <span className="truncate">{firstSelectedAddon.name}</span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleRemove(firstSelectedAddon.id);
                      }}
                    >
                      <X className="size-3" />
                    </span>
                  </Badge>
                  {selectedAddons.length > 1 && (
                    <Badge variant="secondary">+{selectedAddons.length - 1}</Badge>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">
                  {placeholder || tStoreAddons('title')}
                </span>
              )}
            </div>
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
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{label || tStoreAddons('title')}</span>
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
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(event) => {
                    if (offset !== 0) {
                      setOffset(0);
                    }
                    setSearch(event.target.value);
                  }}
                  placeholder={tStoreAddons('searchPlaceholder')}
                  className="h-10 w-full rounded-lg border border-stroke bg-transparent pl-9 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                  aria-invalid={!!error}
                  aria-describedby={helperId}
                  disabled={disabled}
                />
                {search && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={tSearchInput('clearSearch')}
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              {selectedAddons.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selectedAddons.map((addon) => (
                    <Badge key={addon.id} variant="secondary" className="gap-1">
                      <span className="max-w-[160px] truncate">{addon.name}</span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleRemove(addon.id);
                        }}
                      >
                        <X className="size-3" />
                      </span>
                    </Badge>
                  ))}
                </div>
              )}
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
                    {tStoreAddonsErrors('fetchFailed')}
                  </p>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium text-primary"
                  >
                    <RefreshCw className="size-4" />
                    {tStoreAddonsForm('optionsRefresh')}
                  </button>
                </div>
              ) : isLoadingInitial ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {tStoreAddonsForm('optionsLoading')}
                </div>
              ) : allAddons.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {tStoreAddonsTable('noDataTitle')}
                </div>
              ) : (
                <CommandGroup>
                  {allAddons.map((addon) => (
                    <CommandItem
                      key={addon.id}
                      value={`${addon.id} ${addon.name}`}
                      className="cursor-pointer px-3 py-2.5"
                      onSelect={() => handleToggleAddon(addon.id)}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="truncate">{addon.name}</span>
                        {selectedAddonIds.includes(addon.id) && (
                          <Check className="size-4 text-primary" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
                  {isFetchingMore && (
                    <CommandItem disabled>
                      <div className="flex w-full items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        {tStoreAddonsForm('optionsLoadingMore')}
                      </div>
                    </CommandItem>
                  )}
                  {!hasMore && !isFetchingMore && (
                    <CommandItem disabled>
                      <div className="w-full py-2 text-center text-sm text-muted-foreground">
                        {tStoreAddonsForm('optionsReachedEnd')}
                      </div>
                    </CommandItem>
                  )}
                </CommandGroup>
              )}
            </CommandList>
            <div className="border-t p-2">
              <button
                type="button"
                onClick={() => setAddAddonOpen(true)}
                disabled={disabled || !vendorId}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-stroke px-3 py-2 text-sm font-medium text-primary transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="size-4" />
                {tStoreAddonsForm('addNewAddon')}
              </button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {(error || helperText) && (
        <p
          id={helperId}
          className={cn('text-sm mt-1', error ? 'text-destructive' : 'text-mute')}
        >
          {error ?? helperText}
        </p>
      )}

      <AddAddonDrawer
        isOpen={addAddonOpen}
        onClose={() => setAddAddonOpen(false)}
        onSubmit={handleCreateAddon}
      />
    </div>
  );
}
