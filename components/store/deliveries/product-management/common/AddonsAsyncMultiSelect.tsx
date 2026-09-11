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
import {
  useCreateAddon,
  useGetAddonsDropdown,
} from '@/hooks/api/store/deliveries/product-management/addons';
import { handleApiError } from '@/lib/toast-error';
import {
  resolveFormikError,
  type ErrorStrategy,
} from '@/lib/resolveFormikError';
import { cn } from '@/lib/utils';
import type {
  Addon,
  AddonFormValues,
  ApiErrorResponse,
} from '@/types';
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
import { AddAddonDrawer } from '@/components/store/deliveries/product-management/addons/add-addon';

const PAGE_SIZE = 100;

type AddonsAsyncMultiSelectProps = {
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
  initialSelectedAddons?: Addon[] | null;
};

const mergeAddons = (
  existing: Addon[],
  incoming: Addon[],
  initialSelectedAddons?: Addon[] | null,
) => {
  const merged = new Map<string, Addon>();

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

export default function AddonsAsyncMultiSelect({
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
  initialSelectedAddons,
}: AddonsAsyncMultiSelectProps) {
  const tForm = useTranslations('products.form');
  const tStoreAddons = useTranslations('storeAddons');
  const tStoreAddonsForm = useTranslations('storeAddons.form');
  const tStoreAddonsErrors = useTranslations('storeAddons.errors');
  const tStoreAddonsTable = useTranslations('storeAddons.table');
  const [open, setOpen] = React.useState(false);
  const [offset, setOffset] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [addAddonOpen, setAddAddonOpen] = React.useState(false);
  const [allAddons, setAllAddons] = React.useState<Addon[]>(
    initialSelectedAddons ?? [],
  );
  const [hasMore, setHasMore] = React.useState(true);
  const { mutateAsync: createAddon, isPending: isCreatingAddon } =
    useCreateAddon();

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

  const queryParams = storeId
    ? {
        store_id: storeId,
        offset,
        size: PAGE_SIZE,
        search: debouncedSearch || undefined,
      }
    : null;

  const { data, isLoading, isFetching, isError, refetch } =
    useGetAddonsDropdown(queryParams, {
      enabled: open && !!storeId,
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
    .map((selectedId) => allAddons.find((addon) => addon.id === selectedId))
    .filter(Boolean) as Addon[];

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
    if (!storeId) {
      return;
    }

    try {
      const createdAddons = await createAddon({
        store_id: storeId,
        name: values.name.trim(),
        description: values.description.trim(),
        requiredCheck: values.requiredCheck,
        selectionType: values.selectionType as 'single' | 'multi',
        type: 'add-on',
        optionIds: values.optionIds,
      });

      const firstCreatedAddon = createdAddons[0];

      if (firstCreatedAddon) {
        const createdAddon: Addon = {
          ...firstCreatedAddon,
          store_id: firstCreatedAddon.store_id || storeId,
          options: [],
        };

        setAllAddons((current) =>
          mergeAddons(current, [createdAddon], initialSelectedAddons),
        );

        if (hasFormik) {
          const currentSelectedAddonIds = Array.isArray(formik!.values[name])
            ? (formik!.values[name] as string[])
            : [];

          formik!.setFieldValue(
            name,
            currentSelectedAddonIds.includes(createdAddon.id)
              ? currentSelectedAddonIds
              : [...currentSelectedAddonIds, createdAddon.id],
          );
        }
      }

      setSearch('');
      setDebouncedSearch('');
      setOffset(0);
      setHasMore(true);
      setAddAddonOpen(false);
      void refetch();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
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
                  {placeholder || tForm('addonsPlaceholder')}
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
                  {tForm('addonsLabel')}
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
                  placeholder={tStoreAddons('searchPlaceholder')}
                  className="h-10 w-full rounded-lg border border-stroke bg-transparent pl-9 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
                {search && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={tStoreAddonsForm('optionsClearSearch')}
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
                disabled={disabled || !storeId || isCreatingAddon}
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
          className={cn(
            'text-sm mt-1',
            error ? 'text-destructive' : 'text-mute',
          )}
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
