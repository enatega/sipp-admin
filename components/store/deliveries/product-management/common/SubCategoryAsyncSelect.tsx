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
import { useGetProductSubCategoryOptions } from '@/hooks/api/store/deliveries/product-management/products';
import {
  resolveFormikError,
  type ErrorStrategy,
} from '@/lib/resolveFormikError';
import { cn } from '@/lib/utils';
import type { SubCategory } from '@/types';
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
import CreateSubCategorySheet from '@/components/store/deliveries/product-management/sub-categories/CreateSubCategorySheet';

const PAGE_SIZE = 100;

type SubCategoryAsyncSelectProps = {
  name: string;
  storeId?: string;
  parentCategoryId?: string;
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
  initialSelectedSubCategory?: SubCategory | null;
};

const mergeSubCategories = (
  existing: SubCategory[],
  incoming: SubCategory[],
  initialSelectedSubCategory?: SubCategory | null,
) => {
  const merged = new Map<string, SubCategory>();

  if (initialSelectedSubCategory) {
    merged.set(initialSelectedSubCategory.id, initialSelectedSubCategory);
  }

  existing.forEach((item) => {
    merged.set(item.id, item);
  });

  incoming.forEach((item) => {
    merged.set(item.id, item);
  });

  return Array.from(merged.values());
};

export default function SubCategoryAsyncSelect({
  name,
  storeId,
  parentCategoryId,
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
  initialSelectedSubCategory,
}: SubCategoryAsyncSelectProps) {
  const tForm = useTranslations('products.form');
  const tSearchInput = useTranslations('searchInput');
  const [open, setOpen] = React.useState(false);
  const [addSubCategoryOpen, setAddSubCategoryOpen] = React.useState(false);
  const [offset, setOffset] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [allSubCategories, setAllSubCategories] = React.useState<SubCategory[]>(
    initialSelectedSubCategory ? [initialSelectedSubCategory] : [],
  );
  const [hasMore, setHasMore] = React.useState(true);
  const previousParentCategoryIdRef = React.useRef<string | undefined>(
    parentCategoryId,
  );

  const formik = React.useContext(
    FormikContext as unknown as React.Context<
      FormikContextType<FormikValues> | undefined
    >,
  );
  const hasFormik = Boolean(formik && name);

  const selectedSubCategoryId = hasFormik
    ? String(formik!.values[name] || '')
    : '';

  const formikError = resolveFormikError(
    formik,
    name as string | undefined,
    showErrorStrategy,
  );
  const error = errorProp ?? formikError;

  React.useEffect(() => {
    if (initialSelectedSubCategory) {
      setAllSubCategories((current) =>
        mergeSubCategories(current, [], initialSelectedSubCategory),
      );
    }
  }, [initialSelectedSubCategory]);

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
    const previousParentCategoryId = previousParentCategoryIdRef.current;

    if (previousParentCategoryId !== parentCategoryId) {
      setOffset(0);
      setSearch('');
      setDebouncedSearch('');
      setHasMore(true);
      setAllSubCategories(
        initialSelectedSubCategory &&
          initialSelectedSubCategory.parentId === parentCategoryId
          ? [initialSelectedSubCategory]
          : [],
      );

      if (hasFormik && previousParentCategoryId && formik!.values[name]) {
        formik!.setFieldValue(name, '');
      }
    }

    previousParentCategoryIdRef.current = parentCategoryId;
  }, [formik, hasFormik, initialSelectedSubCategory, name, parentCategoryId]);

  const queryParams = storeId && parentCategoryId
    ? {
        storeId,
        categoryId: parentCategoryId,
        offset,
        size: PAGE_SIZE,
        search: debouncedSearch || undefined,
      }
    : null;

  const { data, isLoading, isFetching, isError, refetch } =
    useGetProductSubCategoryOptions(queryParams, {
      enabled: open && !!storeId && !!parentCategoryId,
    });

  React.useEffect(() => {
    if (!data) return;

    setHasMore(data.hasMore);
    setAllSubCategories((current) =>
      offset === 0
        ? mergeSubCategories([], data.data, initialSelectedSubCategory)
        : mergeSubCategories(current, data.data, initialSelectedSubCategory),
    );
  }, [data, initialSelectedSubCategory, offset]);

  const selectedSubCategory =
    allSubCategories.find((item) => item.id === selectedSubCategoryId) ||
    (initialSelectedSubCategory?.id === selectedSubCategoryId
      ? initialSelectedSubCategory
      : null);

  const generatedId = React.useId();
  const inputId = name ? `${name}-subcategory-async-input` : generatedId;
  const helperId = error || helperText ? `${inputId}-helper` : undefined;

  const isFetchingMore = isFetching && offset > 0;
  const isLoadingInitial =
    (isLoading || (isFetching && offset === 0)) && allSubCategories.length === 0;

  const handleSelect = (subCategory: SubCategory) => {
    if (!hasFormik) return;

    formik!.setFieldValue(name, subCategory.id);
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

  const handleCreatedSubCategory = (createdSubCategory: SubCategory) => {
    setAllSubCategories((current) =>
      mergeSubCategories(current, [createdSubCategory], initialSelectedSubCategory),
    );

    const createdParentId =
      createdSubCategory.parentId || createdSubCategory.parent?.id || null;

    if (hasFormik && parentCategoryId && createdParentId === parentCategoryId) {
      formik!.setFieldValue(name, createdSubCategory.id);
      setOpen(false);
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
            disabled={disabled || !storeId || !parentCategoryId}
            className={cn(
              'flex h-11 w-full items-center justify-between rounded-[12px] border bg-transparent px-3 text-sm',
              error
                ? 'border-destructive'
                : open && !disabled
                  ? 'border-primary'
                  : 'border-stroke',
              (disabled || !storeId || !parentCategoryId) &&
                'cursor-not-allowed opacity-70 bg-light',
              inputContainerClassName,
              className,
            )}
          >
            <span
              className={cn(
                'truncate text-left',
                selectedSubCategory
                  ? 'text-foreground'
                  : 'text-muted-foreground font-normal',
              )}
            >
              {selectedSubCategory?.categoryName ||
                selectedSubCategoryId ||
                placeholder}
            </span>
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
                  {tForm('subcategoryLabel')}
                </span>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={disabled || isFetching || !parentCategoryId}
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
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={tForm('subcategorySearchPlaceholder')}
                  disabled={disabled || !parentCategoryId}
                  className="h-10 w-full rounded-lg border border-stroke bg-transparent pl-9 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={tSearchInput('clearSearch')}
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
              {!parentCategoryId ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {tForm('selectCategoryFirst')}
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center gap-3 p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {tForm('subcategoryLoadFailed')}
                  </p>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium text-primary"
                  >
                    <RefreshCw className="size-4" />
                    {tForm('subcategoryRefresh')}
                  </button>
                </div>
              ) : isLoadingInitial ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {tForm('subcategoryLoading')}
                </div>
              ) : allSubCategories.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {tForm('subcategoryEmpty')}
                </div>
              ) : (
                <CommandGroup>
                  {allSubCategories.map((subCategory) => (
                    <CommandItem
                      key={subCategory.id}
                      value={`${subCategory.id} ${subCategory.categoryName}`}
                      className="cursor-pointer px-3 py-2.5"
                      onSelect={() => handleSelect(subCategory)}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="truncate">
                          {subCategory.categoryName}
                        </span>
                        {selectedSubCategoryId === subCategory.id && (
                          <Check className="size-4 text-primary" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
                  {isFetchingMore && (
                    <CommandItem disabled>
                      <div className="flex w-full items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        {tForm('subcategoryLoadingMore')}
                      </div>
                    </CommandItem>
                  )}
                  {!hasMore && !isFetchingMore && (
                    <CommandItem disabled>
                      <div className="w-full py-2 text-center text-sm text-muted-foreground">
                        {tForm('subcategoryReachedEnd')}
                      </div>
                    </CommandItem>
                  )}
                </CommandGroup>
              )}
            </CommandList>

            <div className="border-t p-2">
              <button
                type="button"
                onClick={() => setAddSubCategoryOpen(true)}
                disabled={disabled || !storeId || !parentCategoryId}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-stroke px-3 py-2 text-sm font-medium text-primary transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="size-4" />
                {tForm('addNewSubcategory')}
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

      <CreateSubCategorySheet
        isOpen={addSubCategoryOpen}
        onClose={() => setAddSubCategoryOpen(false)}
        defaultCategoryId={parentCategoryId}
        onCreated={handleCreatedSubCategory}
      />
    </div>
  );
}
