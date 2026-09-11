'use client';

import * as React from 'react';
import { useField } from 'formik';
import { cn } from '@/lib/utils';

interface AppCheckBoxProps {
  name: string;
  label: string;
  value?: string;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export function AppCheckBox({ name, label, value, onChange, disabled }: AppCheckBoxProps) {
  const [field] = useField({ name, type: 'checkbox', ...(value && { value }) });
  const inputId = React.useId();

  return (
    <div className="flex items-center gap-2">
      <input
        {...field}
        id={inputId}
        type="checkbox"
        disabled={disabled}
        className="h-4 w-4 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        onChange={(event) => {
          field.onChange(event);
          onChange?.(event.target.checked);
        }}
      />
      <label
        htmlFor={inputId}
        className={cn(
          'text-sm font-medium cursor-pointer transition-colors',
          disabled && 'cursor-not-allowed opacity-50',
          field.checked ? 'text-black' : 'text-muted-foreground',
        )}
      >
        {label}
      </label>
    </div>
  );
}
