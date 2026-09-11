'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';
import { FormikContext, getIn, type FormikContextType, type FormikValues } from 'formik';
import { ChevronsUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { StoreOption } from './data';

type StoreMultiSelectProps = {
  name: string;
  label: string;
  placeholder?: string;
  options: StoreOption[];
  requiredAsterisk?: boolean;
};

export default function StoreMultiSelect({
  name,
  label,
  placeholder,
  options,
  requiredAsterisk,
}: StoreMultiSelectProps) {
  const t = useTranslations('vendorMenuTemplate.form');
  const [open, setOpen] = useState(false);
  const formik = React.useContext(
    FormikContext as unknown as React.Context<
      FormikContextType<FormikValues> | undefined
    >,
  );

  if (!formik) {
    throw new Error('StoreMultiSelect must be used inside a Formik form');
  }

  const selected = useMemo(
    () => ((getIn(formik.values, name) || []) as string[]),
    [formik.values, name],
  );
  const touched = getIn(formik.touched, name);
  const error = getIn(formik.errors, name) as string | undefined;

  const selectedLabel = useMemo(() => {
    if (!selected.length) return placeholder || t('selectStore');
    const selectedStores = options
      .filter((option) => selected.includes(option.id))
      .map((option) => option.label);
    return selectedStores.join(', ');
  }, [options, placeholder, selected, t]);

  const handleToggle = (storeId: string) => {
    const alreadySelected = selected.includes(storeId);
    const nextValue = alreadySelected
      ? selected.filter((id) => id !== storeId)
      : [...selected, storeId];

    formik.setFieldValue(name, nextValue);
    formik.setFieldTouched(name, true, false);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[15px] font-medium">
        {label}
        {requiredAsterisk && <span className="text-destructive ml-1">*</span>}
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'w-full h-11 rounded-[12px] border border-stroke px-3 text-sm flex items-center justify-between',
              touched && error ? 'border-destructive' : 'focus:border-primary',
            )}
          >
            <span
              className={cn(
                'truncate text-left',
                selected.length ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {selectedLabel}
            </span>
            <ChevronsUpDown className="size-4 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[320px] p-0">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-semibold">
              {t('selectStore')}
            </p>
          </div>
          <div className="max-h-[260px] overflow-y-auto">
            {options.map((option) => {
              const isSelected = selected.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleToggle(option.id)}
                  className="w-full px-4 py-3 border-b last:border-b-0 text-left flex items-center justify-between hover:bg-accent/60"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-sm">{option.label}</p>
                    {option.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {option.description}
                      </p>
                    )}
                  </div>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(option.id)}
                    onClick={(event) => event.stopPropagation()}
                  />
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {touched && error && (
        <p className="text-sm mt-1 text-destructive">{error}</p>
      )}
    </div>
  );
}
