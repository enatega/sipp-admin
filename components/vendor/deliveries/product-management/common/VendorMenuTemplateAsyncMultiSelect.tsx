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
  useGetVendorMenuTemplatesDropdown,
} from '@/hooks/api/vendor/deliveries/product-management/dropdowns';
import {
  resolveFormikError,
  type ErrorStrategy,
} from '@/lib/resolveFormikError';
import { cn } from '@/lib/utils';
import type { VendorDropdownOption } from '@/types';
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
import MenuTemplateCreateSheet from '@/components/vendor/deliveries/menu-template/add-menu/MenuTemplateCreateSheet';

const PAGE_SIZE = 100;

type VendorMenuTemplateAsyncMultiSelectProps = {
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
  initialSelectedMenuTemplates?: VendorDropdownOption[] | null;
};

const mergeOptions = (
  existing: VendorDropdownOption[],
  incoming: VendorDropdownOption[],
  initialSelectedMenuTemplates?: VendorDropdownOption[] | null,
) => {
  const merged = new Map<string, VendorDropdownOption>();

  initialSelectedMenuTemplates?.forEach((option) => {
    merged.set(option.id, option);
  });

  existing.forEach((option) => {
    merged.set(option.id, option);
  });

  incoming.forEach((option) => {
    merged.set(option.id, option);
  });

  return Array.from(merged.values());
};

export default function VendorMenuTemplateAsyncMultiSelect({
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
  initialSelectedMenuTemplates,
}: VendorMenuTemplateAsyncMultiSelectProps) {
  const tForm = useTranslations('products.form');
  const tSearchInput = useTranslations('searchInput');
  const [open, setOpen] = React.useState(false);
  const [addMenuOpen, setAddMenuOpen] = React.useState(false);
  const [offset, setOffset] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [allOptions, setAllOptions] = React.useState<VendorDropdownOption[]>(
    initialSelectedMenuTemplates ?? [],
  );
  const [hasMore, setHasMore] = React.useState(true);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const formik = React.useContext(
    FormikContext as unknown as React.Context<
      FormikContextType<FormikValues> | undefined
    >,
  );
  const hasFormik = Boolean(formik && name);

  const selectedMenuIds: string[] = hasFormik
    ? (Array.isArray(formik!.values[name]) ? formik!.values[name] : [])
    : [];

  const formikError = resolveFormikError(
    formik,
    name as string | undefined,
    showErrorStrategy,
  );
  const error = errorProp ?? formikError;

  React.useEffect(() => {
    if (initialSelectedMenuTemplates?.length) {
      setAllOptions((current) =>
        mergeOptions(current, [], initialSelectedMenuTemplates),
      );
    }
  }, [initialSelectedMenuTemplates]);

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
    useGetVendorMenuTemplatesDropdown(queryParams, {
      enabled: (open || selectedMenuIds.length > 0) && !!vendorId,
    });

  React.useEffect(() => {
    if (!data) return;

    setHasMore(data.hasMore);
    setAllOptions((current) =>
      offset === 0
        ? mergeOptions([], data.data, initialSelectedMenuTemplates)
        : mergeOptions(current, data.data, initialSelectedMenuTemplates),
    );
  }, [data, initialSelectedMenuTemplates, offset]);

  const isFetchingMore = isFetching && offset > 0;
  const isLoadingInitial =
    (isLoading || (isFetching && offset === 0)) && allOptions.length === 0;

  const selectedOptions = selectedMenuIds
    .map(
      (selectedId) =>
        allOptions.find((option) => option.id === selectedId) ?? {
          id: selectedId,
          name: selectedId,
        },
    )
    .filter(Boolean) as VendorDropdownOption[];

  const generatedId = React.useId();
  const inputId = name ? `${name}-menu-template-async-input` : generatedId;
  const helperId = error || helperText ? `${inputId}-helper` : undefined;

  const handleToggle = (optionId: string) => {
    if (!hasFormik) return;

    const nextValue = selectedMenuIds.includes(optionId)
      ? selectedMenuIds.filter((selectedId) => selectedId !== optionId)
      : [...selectedMenuIds, optionId];

    formik!.setFieldValue(name, nextValue);
  };

  const handleRemove = (optionId: string) => {
    if (!hasFormik) return;

    formik!.setFieldValue(
      name,
      selectedMenuIds.filter((selectedId) => selectedId !== optionId),
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

  const handleCreatedMenu = (createdMenu: { id: string; name: string }) => {
    const createdOption = {
      id: createdMenu.id,
      name: createdMenu.name,
    };

    setAllOptions((current) =>
      mergeOptions(current, [createdOption], initialSelectedMenuTemplates),
    );

    if (hasFormik) {
      const nextValue = selectedMenuIds.includes(createdMenu.id)
        ? selectedMenuIds
        : [...selectedMenuIds, createdMenu.id];
      formik!.setFieldValue(name, nextValue);
    }

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
              {selectedOptions.length > 0 ? (
                <>
                  {selectedOptions.slice(0, 2).map((option) => (
                    <Badge key={option.id} variant="secondary" className="gap-1">
                      <span className="max-w-[180px] truncate">{option.name}</span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleRemove(option.id);
                        }}
                      >
                        <X className="size-3" />
                      </span>
                    </Badge>
                  ))}
                  {selectedOptions.length > 2 && (
                    <Badge variant="secondary">+{selectedOptions.length - 2}</Badge>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">
                  {placeholder || tForm('menuTemplatePlaceholder')}
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
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
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
                    placeholder={tForm('menuTemplateSearchPlaceholder')}
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
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={disabled || isFetching}
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-stroke px-3 text-sm font-medium text-primary disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label={tForm('menuTemplateRefresh')}
                >
                  <RefreshCw
                    className={cn('size-4', isFetching && 'animate-spin')}
                  />
                </button>
              </div>
              {selectedOptions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selectedOptions.map((option) => (
                    <Badge key={option.id} variant="secondary" className="gap-1">
                      <span className="max-w-[160px] truncate">{option.name}</span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleRemove(option.id);
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
                    {tForm('menuTemplateLoadFailed')}
                  </p>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium text-primary"
                  >
                    <RefreshCw className="size-4" />
                    {tForm('menuTemplateRefresh')}
                  </button>
                </div>
              ) : isLoadingInitial ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {tForm('menuTemplateLoading')}
                </div>
              ) : allOptions.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {tForm('menuTemplateEmpty')}
                </div>
              ) : (
                <CommandGroup>
                  {allOptions.map((option) => (
                    <CommandItem
                      key={option.id}
                      value={`${option.id} ${option.name}`}
                      className="cursor-pointer px-3 py-2.5"
                      onSelect={() => handleToggle(option.id)}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="truncate">{option.name}</span>
                        {selectedMenuIds.includes(option.id) && (
                          <Check className="size-4 text-primary" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
                  {isFetchingMore && (
                    <CommandItem disabled>
                      <div className="flex w-full items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        {tForm('menuTemplateLoadingMore')}
                      </div>
                    </CommandItem>
                  )}
                  {!hasMore && !isFetchingMore && (
                    <CommandItem disabled>
                      <div className="w-full py-2 text-center text-sm text-muted-foreground">
                        {tForm('menuTemplateReachedEnd')}
                      </div>
                    </CommandItem>
                  )}
                </CommandGroup>
              )}
            </CommandList>

            <div className="border-t p-2">
              <button
                type="button"
                onClick={() => setAddMenuOpen(true)}
                disabled={disabled || !vendorId}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-stroke px-3 py-2 text-sm font-medium text-primary transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="size-4" />
                {tForm('addNewMenuTemplate')}
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

      <MenuTemplateCreateSheet
        open={addMenuOpen}
        onOpenChange={setAddMenuOpen}
        onCreated={handleCreatedMenu}
      />
    </div>
  );
}
