'use client';

import * as React from 'react';
import {
  FormikContext,
  type FormikContextType,
  type FormikValues,
} from 'formik';
import { Loader2 } from 'lucide-react';
import {
  resolveFormikError,
  type ErrorStrategy,
} from '@/lib/resolveFormikError';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type SelectOption = string | { key: string; value: string };

interface AppSelectProps {
  options?: SelectOption[];
  label?: string;
  name: string;
  className?: string;
  labelClassName?: string;
  error?: string;
  helperText?: string;
  showErrorStrategy?: ErrorStrategy;
  placeholder?: string;
  id?: string;
  containerClassName?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  requiredAsterisk?: boolean;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
  displayPrefix?: string;
  showInputOnOtherSelect?: boolean;
  otherOptionValue?: string;
  otherInputPlaceholder?: string;
}

export const AppSelect = ({
  label,
  name,
  options = [],
  className,
  labelClassName,
  error: errorProp,
  helperText,
  showErrorStrategy = 'touchedOrSubmit',
  placeholder,
  id,
  containerClassName,
  value: propValue,
  onValueChange: propOnValueChange,
  disabled,
  required,
  requiredAsterisk,
  loading = false,
  loadingText = 'Loading...',
  emptyText = 'No options available',
  displayPrefix,
  showInputOnOtherSelect = false,
  otherOptionValue = 'other',
  otherInputPlaceholder = 'Enter custom value',
}: AppSelectProps) => {
  const formik = React.useContext(
    FormikContext as unknown as React.Context<
      FormikContextType<FormikValues> | undefined
    >,
  );

  const hasFormik = Boolean(formik && name);

  // Determine the current value: Formik's value if available, otherwise propValue
  const rawCurrentValue = hasFormik ? formik!.values[name] : propValue;

  const optionValues = options.map((option) =>
    typeof option === 'string' ? option : option.value,
  );
  const isCustomOtherValue =
    showInputOnOtherSelect &&
    typeof rawCurrentValue === 'string' &&
    rawCurrentValue.trim() !== '' &&
    rawCurrentValue !== otherOptionValue &&
    !optionValues.includes(rawCurrentValue);
  const shouldShowOtherInput = showInputOnOtherSelect
    ? rawCurrentValue === otherOptionValue || isCustomOtherValue
    : false;

  // Check if 'all' is an actual option value
  const hasAllOption = options.some((option) => {
    const optionValue = typeof option === 'string' ? option : option.key;
    return optionValue === '' || optionValue === 'all';
  });

  // Radix UI Select doesn't allow empty string values
  // Only map to 'all' if it's an actual option, otherwise use undefined to show placeholder
  const currentValue =
    shouldShowOtherInput
      ? otherOptionValue
      : rawCurrentValue === ''
      ? hasAllOption
        ? 'all'
        : undefined
      : rawCurrentValue;

  // Map placeholder value back to empty string for callbacks
  const normalizeValue = (value: string) =>
    hasAllOption && value === 'all' ? '' : value;

  const formikError = resolveFormikError(
    formik,
    name as string | undefined,
    showErrorStrategy,
  );
  const error = errorProp ?? formikError;

  const generatedId = React.useId();
  const inputId = id ?? (name ? `${name}-input` : generatedId);
  const helperId = error || helperText ? `${inputId}-helper` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5 ', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn('text-[15px] font-medium', labelClassName)}
        >
          {label}
          {(requiredAsterisk || required) && (
            <span className="text-destructive ml-1">*</span>
          )}
        </label>
      )}

      <Select
        name={name}
        value={currentValue}
        onValueChange={(value) => {
          const normalizedValue = normalizeValue(value);
          if (hasFormik) {
            formik!.setFieldValue(name, normalizedValue);
          }
          if (propOnValueChange) {
            propOnValueChange(normalizedValue);
          }
        }}
        disabled={disabled}
      >
        <SelectTrigger
          id={inputId}
          className={cn(
            '!w-full !h-11  bg-transparent text-sm font-normal border focus-visible:ring-0 outline-none data-[state=open]:border-primary',
            'capitalize',
            error
              ? 'border-destructive focus:border-destructive'
              : 'border-stroke focus-border-primary focus-visible:border-primary',
            className,
          )}
        >
          {displayPrefix && (
            <span className="text-sm font-normal">{displayPrefix}: </span>
          )}
          <SelectValue placeholder={loading ? loadingText : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <SelectItem
              disabled
              value="__loading"
              className="flex items-center gap-2 text-muted-foreground"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingText}
            </SelectItem>
          ) : options.length > 0 ? (
            options.map((option) => {
              const optionValue =
                typeof option === 'string' ? option : option.key;
              let optionLabel =
                typeof option === 'string' ? option : option.value;

              // Radix UI Select doesn't allow empty string values
              // Replace empty strings with a placeholder value
              if (optionLabel === '') {
                optionLabel = 'all';
              }

              return (
                <SelectItem
                  className="capitalize"
                  key={optionLabel}
                  value={optionLabel}
                >
                  {optionValue}
                </SelectItem>
              );
            })
          ) : (
            <SelectItem
              disabled
              value="__empty"
              className="text-muted-foreground"
            >
              {emptyText}
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {shouldShowOtherInput && (
        <input
          type="text"
          className={cn(
            'w-full h-11 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-0',
            error
              ? 'border-destructive focus:border-destructive'
              : 'border-stroke focus-visible:border-primary',
          )}
          placeholder={otherInputPlaceholder}
          value={
            rawCurrentValue === otherOptionValue ? '' : `${rawCurrentValue ?? ''}`
          }
          onChange={(e) => {
            const nextValue = e.target.value;
            if (hasFormik) {
              formik!.setFieldValue(name, nextValue);
            }
            if (propOnValueChange) {
              propOnValueChange(nextValue);
            }
          }}
          disabled={disabled}
        />
      )}

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
};

AppSelect.displayName = 'AppSelect';
