'use client';

import * as React from 'react';
import type { VendorDropdownOption } from '@/types';
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
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  resolveFormikError,
  type ErrorStrategy,
} from '@/lib/resolveFormikError';
import { cn } from '@/lib/utils';
import { useGetVendorCategoriesDropdown } from '@/hooks/api/vendor/deliveries/product-management/dropdowns';
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
import CreateCategorySheet from '@/components/vendor/deliveries/product-management/categories/CreateCategorySheet';

const PAGE_SIZE = 10;

type VendorCategoryAsyncSelectProps = {
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
  initialSelectedCategory?: VendorDropdownOption | null;
};

const mergeCategories = (
  existing: VendorDropdownOption[],
  incoming: VendorDropdownOption[],
  initialSelectedCategory?: VendorDropdownOption | null,
) => {
  const merged = new Map<string, VendorDropdownOption>();

  if (initialSelectedCategory) {
    merged.set(initialSelectedCategory.id, initialSelectedCategory);
  }

  existing.forEach((category) => {
    merged.set(category.id, category);
  });

  incoming.forEach((category) => {
    merged.set(category.id, category);
  });

  return Array.from(merged.values());
};

export default function VendorCategoryAsyncSelect({
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
  initialSelectedCategory,
}: VendorCategoryAsyncSelectProps) {
  const tForm = useTranslations('categories.form');
  const [open, setOpen] = React.useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [offset, setOffset] = React.useState(0);
  const [allCategories, setAllCategories] = React.useState<
    VendorDropdownOption[]
  >(initialSelectedCategory ? [initialSelectedCategory] : []);
  const [hasMore, setHasMore] = React.useState(true);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const formik = React.useContext(
    FormikContext as unknown as React.Context<
      FormikContextType<FormikValues> | undefined
    >,
  );
  const hasFormik = Boolean(formik && name);

  const selectedCategoryId = hasFormik
    ? String(formik!.values[name] || '')
    : '';

  const formikError = resolveFormikError(
    formik,
    name as string | undefined,
    showErrorStrategy,
  );
  const error = errorProp ?? formikError;

  React.useEffect(() => {
    if (initialSelectedCategory) {
      setAllCategories((current) =>
        mergeCategories(current, [], initialSelectedCategory),
      );
    }
  }, [initialSelectedCategory]);

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
    useGetVendorCategoriesDropdown(queryParams, {
      enabled: (open || !!selectedCategoryId) && !!vendorId,
    });

  React.useEffect(() => {
    if (!data) return;

    setHasMore(data.hasMore);
    setAllCategories((current) =>
      offset === 0
        ? mergeCategories([], data.data, initialSelectedCategory)
        : mergeCategories(current, data.data, initialSelectedCategory),
    );
  }, [data, initialSelectedCategory, offset]);

  const isFetchingMore = isFetching && offset > 0;
  const isLoadingInitial =
    (isLoading || (isFetching && offset === 0)) && allCategories.length === 0;

  const selectedCategory =
    allCategories.find((category) => category.id === selectedCategoryId) ||
    (initialSelectedCategory?.id === selectedCategoryId
      ? initialSelectedCategory
      : null);

  const generatedId = React.useId();
  const inputId = name ? `${name}-category-async-input` : generatedId;
  const helperId = error || helperText ? `${inputId}-helper` : undefined;

  const handleSelect = (category: VendorDropdownOption) => {
    if (!hasFormik) return;

    formik!.setFieldValue(name, category.id);
    setSearch('');
    setDebouncedSearch('');
    setOffset(0);
    setOpen(false);
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

  const handleCreatedCategory = (createdCategory: {
    id: string;
    categoryName?: string;
    name?: string;
  }) => {
    const createdOption: VendorDropdownOption = {
      id: createdCategory.id,
      name: createdCategory.categoryName || createdCategory.name || '',
    };

    setAllCategories((current) =>
      mergeCategories(current, [createdOption], initialSelectedCategory),
    );

    if (hasFormik) {
      formik!.setFieldValue(name, createdOption.id);
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
              'flex h-11 w-full items-center justify-between rounded-[12px] border bg-transparent px-3 text-sm',
              error
                ? 'border-destructive'
                : open && !disabled
                  ? 'border-primary'
                  : 'border-stroke',
              (disabled || !vendorId) &&
                'cursor-not-allowed opacity-70 bg-light',
              inputContainerClassName,
              className,
            )}
          >
            <span
              className={cn(
                'truncate text-left',
                selectedCategory
                  ? 'text-foreground'
                  : 'text-muted-foreground font-normal',
              )}
            >
              {selectedCategory?.name ||
                placeholder ||
                tForm('categoryPlaceholder')}
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
          <Command
            className="overflow-visible bg-transparent"
            shouldFilter={false}
          >
            <div className="border-b p-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
                    placeholder={tForm('categorySearchPlaceholder')}
                    className="h-10 w-full rounded-lg border border-stroke bg-transparent pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
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
                  aria-label={tForm('categoryRefresh')}
                >
                  <RefreshCw
                    className={cn('size-4', isFetching && 'animate-spin')}
                  />
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
                    {tForm('categoryLoadFailed')}
                  </p>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium text-primary"
                  >
                    <RefreshCw className="size-4" />
                    {tForm('categoryRefresh')}
                  </button>
                </div>
              ) : isLoadingInitial ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {tForm('categoryLoading')}
                </div>
              ) : allCategories.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {tForm('categoryEmpty')}
                </div>
              ) : (
                <CommandGroup>
                  {allCategories.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={`${category.id} ${category.name}`}
                      className="cursor-pointer px-3 py-2.5"
                      onSelect={() => handleSelect(category)}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="truncate">{category.name}</span>
                        {selectedCategoryId === category.id && (
                          <Check className="size-4 text-primary" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
                  {isFetchingMore && (
                    <CommandItem disabled>
                      <div className="flex w-full items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        {tForm('categoryLoadingMore')}
                      </div>
                    </CommandItem>
                  )}
                  {!hasMore && !isFetchingMore && (
                    <CommandItem disabled>
                      <div className="w-full py-2 text-center text-sm text-muted-foreground">
                        {tForm('categoryReachedEnd')}
                      </div>
                    </CommandItem>
                  )}
                </CommandGroup>
              )}
            </CommandList>
            <div className="border-t p-2">
              <button
                type="button"
                onClick={() => setAddCategoryOpen(true)}
                disabled={disabled || !vendorId}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-stroke px-3 py-2 text-sm font-medium text-primary transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="size-4" />
                {tForm('addNewCategory')}
              </button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {(error || helperText) && (
        <p
          id={helperId}
          className={cn(
            'mt-1 text-sm',
            error ? 'text-destructive' : 'text-mute',
          )}
        >
          {error ?? helperText}
        </p>
      )}

      <CreateCategorySheet
        isOpen={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        onCreated={handleCreatedCategory}
      />
    </div>
  );
}
