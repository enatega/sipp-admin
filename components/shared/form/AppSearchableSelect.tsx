'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type SearchableSelectOption = {
  key: string;
  value: string;
};

type AppSearchableSelectProps = {
  name: string;
  options: SearchableSelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  loading?: boolean;
  loadingText?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
};

export function AppSearchableSelect({
  name,
  options,
  value = '',
  onValueChange,
  placeholder,
  searchPlaceholder,
  emptyText,
  loading = false,
  loadingText = 'Loading...',
  error,
  disabled = false,
  className,
  containerClassName,
}: AppSearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const generatedId = React.useId();
  const listId = `${name}-${generatedId}-listbox`;
  const selectedOption = options.find((option) => option.value === value);

  const selectValue = (nextValue: string) => {
    onValueChange(nextValue);
    setOpen(false);
  };

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            name={name}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-label={placeholder}
            disabled={disabled || loading}
            className={cn(
              'flex h-11 w-full items-center justify-between gap-2 rounded-md border border-stroke bg-transparent px-3 text-sm font-normal outline-none transition-colors',
              'focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50',
              open && 'border-primary',
              error && 'border-destructive focus-visible:border-destructive',
              className,
            )}
          >
            <span
              className={cn(
                'truncate text-left',
                selectedOption ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {loading ? loadingText : selectedOption?.key || placeholder}
            </span>
            {loading ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
            ) : (
              <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] min-w-[220px] p-0"
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList id={listId}>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value={placeholder}
                  onSelect={() => selectValue('')}
                >
                  <Check
                    className={cn('size-4', value ? 'opacity-0' : 'opacity-100')}
                  />
                  <span>{placeholder}</span>
                </CommandItem>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.key} ${option.value}`}
                    onSelect={() => selectValue(option.value)}
                  >
                    <Check
                      className={cn(
                        'size-4',
                        value === option.value ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span className="truncate">{option.key}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
