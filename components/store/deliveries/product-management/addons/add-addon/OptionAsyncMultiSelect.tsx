'use client';

import * as React from 'react';
import type { CreateOptionResponse, Option, OptionDropdownItem } from '@/types';
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
  resolveFormikError,
  type ErrorStrategy,
} from '@/lib/resolveFormikError';
import { cn } from '@/lib/utils';
import { useGetOptionsDropdown } from '@/hooks/api/store/deliveries/product-management/options';
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
import AddOptionSidebar from '@/components/store/deliveries/product-management/options/AddOptionSidebar';

const PAGE_SIZE = 100;

type DisplayOption = OptionDropdownItem & {
  duplicateCount: number;
  duplicateIds: string[];
};

const normalizedText = (value?: string | null) =>
  String(value ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase();

const optionSignature = (option: OptionDropdownItem) =>
  JSON.stringify({
    title: normalizedText(option.title),
    price: Number(option.price ?? 0),
    description: normalizedText(option.description),
    unitOfMeasure: normalizedText(option.unitOfMeasure),
    stockQuantity: Number(option.stockQuantity ?? 0),
    titleTranslations: Object.fromEntries(
      Object.entries(option.titleTranslations ?? {}).sort(([a], [b]) => a.localeCompare(b)),
    ),
    descriptionTranslations: Object.fromEntries(
      Object.entries(option.descriptionTranslations ?? {}).sort(([a], [b]) => a.localeCompare(b)),
    ),
  });

const groupEquivalentOptions = (options: OptionDropdownItem[]): DisplayOption[] => {
  const groups = new Map<string, DisplayOption>();
  for (const option of options) {
    const signature = optionSignature(option);
    const existing = groups.get(signature);
    if (existing) {
      existing.duplicateCount += 1;
      existing.duplicateIds.push(option.id);
    } else {
      groups.set(signature, { ...option, duplicateCount: 1, duplicateIds: [option.id] });
    }
  }
  return [...groups.values()];
};

const toDropdownOption = (option: Option): OptionDropdownItem => ({
  id: option.id,
  title: option.title,
  price: option.price,
  description: option.description,
  unitOfMeasure: option.unitOfMeasure,
  stockQuantity: option.stockQuantity,
  titleTranslations: option.titleTranslations,
  descriptionTranslations: option.descriptionTranslations,
  storeName: null,
});

type OptionAsyncMultiSelectProps = {
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
  initialSelectedOptions?: Option[] | null;
};

const mergeOptions = (
  existing: OptionDropdownItem[],
  incoming: OptionDropdownItem[],
  initialSelectedOptions?: Option[] | null,
) => {
  const merged = new Map<string, OptionDropdownItem>();

  initialSelectedOptions?.forEach((option) => {
    merged.set(option.id, toDropdownOption(option));
  });

  existing.forEach((option) => {
    merged.set(option.id, option);
  });

  incoming.forEach((option) => {
    merged.set(option.id, option);
  });

  return Array.from(merged.values());
};

export default function OptionAsyncMultiSelect({
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
  initialSelectedOptions,
}: OptionAsyncMultiSelectProps) {
  const t = useTranslations('storeAddons');
  const [open, setOpen] = React.useState(false);
  const [addOptionOpen, setAddOptionOpen] = React.useState(false);
  const [offset, setOffset] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [allOptions, setAllOptions] = React.useState<OptionDropdownItem[]>(
    initialSelectedOptions?.map(toDropdownOption) ?? [],
  );
  const [hasMore, setHasMore] = React.useState(true);

  const formik = React.useContext(
    FormikContext as unknown as React.Context<
      FormikContextType<FormikValues> | undefined
    >,
  );
  const hasFormik = Boolean(formik && name);

  const selectedOptionIds: string[] = hasFormik
    ? Array.isArray(formik!.values[name])
      ? formik!.values[name]
      : []
    : [];

  const formikError = resolveFormikError(
    formik,
    name as string | undefined,
    showErrorStrategy,
  );
  const error = errorProp ?? formikError;

  React.useEffect(() => {
    if (initialSelectedOptions?.length) {
      setAllOptions((current) =>
        mergeOptions(current, [], initialSelectedOptions),
      );
    }
  }, [initialSelectedOptions]);

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
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
      }
    : null;

  const { data, isLoading, isFetching, isError, refetch } =
    useGetOptionsDropdown(queryParams, {
      enabled: open && !!storeId,
    });

  React.useEffect(() => {
    if (!data) return;

    setHasMore(data.hasMore);
    setAllOptions((current) =>
      offset === 0
        ? mergeOptions([], data.data, initialSelectedOptions)
        : mergeOptions(current, data.data, initialSelectedOptions),
    );
  }, [data, initialSelectedOptions, offset]);

  const isFetchingMore = isFetching && offset > 0;
  const isLoadingInitial =
    (isLoading || (isFetching && offset === 0)) && allOptions.length === 0;

  const generatedId = React.useId();
  const inputId = name ? `${name}-option-async-input` : generatedId;
  const helperId = error || helperText ? `${inputId}-helper` : undefined;

  const selectedOptions = selectedOptionIds
    .map((selectedId) => allOptions.find((option) => option.id === selectedId))
    .filter(Boolean) as OptionDropdownItem[];
  const displayOptions = React.useMemo(
    () => groupEquivalentOptions(allOptions),
    [allOptions],
  );
  const firstSelectedOption = selectedOptions[0] ?? null;

  const handleToggleOption = (option: DisplayOption) => {
    if (!hasFormik) return;

    const matchingIds = new Set(option.duplicateIds);
    const isSelected = selectedOptionIds.some((id) => matchingIds.has(id));
    const nextValue = isSelected
      ? selectedOptionIds.filter((selectedId: string) => !matchingIds.has(selectedId))
      : [...selectedOptionIds, option.id];

    formik!.setFieldValue(name, nextValue);
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

  const handleRemove = (optionId: string) => {
    if (!hasFormik) return;

    formik!.setFieldValue(
      name,
      selectedOptionIds.filter((selectedId: string) => selectedId !== optionId),
    );
  };

  const handleClearSearch = () => {
    if (!search) return;

    setSearch('');
    if (offset !== 0) {
      setOffset(0);
    }
  };

  const handleCreatedOption = (createdOption: CreateOptionResponse) => {
    const createdDropdownOption = toDropdownOption(createdOption);

    setAllOptions((current) =>
      mergeOptions(current, [createdDropdownOption], initialSelectedOptions),
    );

    if (hasFormik) {
      const nextValue = selectedOptionIds.includes(createdOption.id)
        ? selectedOptionIds
        : [...selectedOptionIds, createdOption.id];
      formik!.setFieldValue(name, nextValue);
    }

    setOffset(0);
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
            disabled={disabled}
            className={cn(
              'flex min-h-11 w-full items-center justify-between rounded-[12px] border bg-transparent px-3 py-2 text-sm',
              error
                ? 'border-destructive'
                : open && !disabled
                  ? 'border-primary'
                  : 'border-stroke',
              disabled && 'cursor-not-allowed opacity-70 bg-light',
              inputContainerClassName,
              className,
            )}
            aria-describedby={helperId}
          >
            <div className="flex flex-1 flex-wrap gap-1 text-left">
              {selectedOptions.length > 0 && firstSelectedOption ? (
                <>
                  <Badge variant="secondary" className="max-w-[180px] gap-1">
                    <span className="truncate">
                      {firstSelectedOption.title}
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleRemove(firstSelectedOption.id);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleRemove(firstSelectedOption.id);
                        }
                      }}
                    >
                      <X className="size-3" />
                    </span>
                  </Badge>
                  {selectedOptions.length > 1 && (
                    <Badge variant="secondary">
                      {t('form.optionsMoreCount', {
                        count: selectedOptions.length - 1,
                      })}
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">
                  {placeholder || t('form.optionsPlaceholder')}
                </span>
              )}
              {selectedOptions.length > 2 && (
                <Badge variant="secondary">+{selectedOptions.length - 2}</Badge>
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
          <Command
            className="overflow-visible bg-transparent"
            shouldFilter={false}
          >
            <div className="border-b p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">
                  {t('form.optionsLabel')}
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
              {allOptions[0]?.storeName && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('form.optionsStoreLabel', { name: allOptions[0].storeName })}
                </p>
              )}
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
                  placeholder={t('form.optionsSearchPlaceholder')}
                  className="h-10 w-full rounded-lg border border-stroke bg-transparent pl-9 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
                {search && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={t('form.optionsClearSearch')}
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              {selectedOptions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selectedOptions.map((option) => (
                    <Badge
                      key={option.id}
                      variant="secondary"
                      className="max-w-full gap-1"
                    >
                      <span className="max-w-[180px] truncate">
                        {option.title}
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleRemove(option.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleRemove(option.id);
                          }
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
                    {t('form.optionsLoadFailed')}
                  </p>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium text-primary"
                  >
                    <RefreshCw className="size-4" />
                    {t('form.optionsRefresh')}
                  </button>
                </div>
              ) : isLoadingInitial ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {t('form.optionsLoading')}
                </div>
              ) : allOptions.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {t('form.optionsEmpty')}
                </div>
              ) : (
                <CommandGroup>
                  {displayOptions.map((option) => {
                    const isSelected = option.duplicateIds.some((id) => selectedOptionIds.includes(id));
                    const details = [
                      option.price !== undefined && t('form.optionsPriceLabel', { price: option.price }),
                      option.unitOfMeasure,
                      option.description,
                    ].filter(Boolean);
                    return (
                    <CommandItem
                      key={option.id}
                      value={`${option.id} ${option.title} ${details.join(' ')}`}
                      // Keep the keyboard highlight neutral so it never looks
                      // like a chosen option; chosen options are tinted.
                      className={cn(
                        'cursor-pointer px-3 py-2.5 data-[selected=true]:bg-muted data-[selected=true]:text-foreground',
                        isSelected &&
                          'bg-primary/10 font-medium data-[selected=true]:bg-primary/15',
                      )}
                      aria-checked={isSelected}
                      onSelect={() => handleToggleOption(option)}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="flex min-w-0 flex-col items-start">
                          <span className="flex max-w-full items-center gap-2">
                            <span className="truncate">{option.title}</span>
                          </span>
                          {details.length > 0 && (
                            <span className="max-w-full truncate text-xs font-normal text-muted-foreground">
                              {details.join(' · ')}
                            </span>
                          )}
                        </span>
                        {isSelected && (
                          <Check className="size-4 text-primary" />
                        )}
                      </div>
                    </CommandItem>
                    );
                  })}
                  {isFetchingMore && (
                    <CommandItem disabled>
                      <div className="flex w-full items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        {t('form.optionsLoadingMore')}
                      </div>
                    </CommandItem>
                  )}
                  {!hasMore && !isFetchingMore && (
                    <CommandItem disabled>
                      <div className="w-full py-2 text-center text-sm text-muted-foreground">
                        {t('form.optionsReachedEnd')}
                      </div>
                    </CommandItem>
                  )}
                </CommandGroup>
              )}
            </CommandList>

            <div className="border-t p-2">
              <button
                type="button"
                onClick={() => setAddOptionOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-stroke px-3 py-2 text-sm font-medium text-primary transition-colors hover:border-primary"
              >
                <Plus className="size-4" />
                {t('form.addNewOption')}
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

      <AddOptionSidebar
        open={addOptionOpen}
        onOpenChange={setAddOptionOpen}
        onCreated={handleCreatedOption}
      />
    </div>
  );
}
