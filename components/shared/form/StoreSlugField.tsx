'use client';

import { useEffect, useRef } from 'react';
import { useFormikContext } from 'formik';
import { toStoreSlug } from '@/lib/store-slug';
import { AppInputField } from './AppInput';

export function StoreSlugField({
  nameField = 'name',
  label,
  helperText,
}: {
  nameField?: string;
  label: string;
  helperText?: string;
}) {
  const { values, setFieldValue } = useFormikContext<Record<string, string>>();
  const lastGenerated = useRef('');
  const name = values[nameField] ?? '';
  const slug = values.slug ?? '';

  useEffect(() => {
    const generated = toStoreSlug(name);
    if (!slug || slug === lastGenerated.current) {
      lastGenerated.current = generated;
      void setFieldValue('slug', generated, false);
    }
  }, [name, setFieldValue, slug]);

  return (
    <AppInputField
      label={label}
      name="slug"
      type="text"
      helperText={helperText}
      requiredAsterisk
    />
  );
}
