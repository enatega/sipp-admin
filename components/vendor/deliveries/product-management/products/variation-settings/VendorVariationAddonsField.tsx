'use client';

import * as React from 'react';
import { getIn, useFormikContext, type FormikValues } from 'formik';
import { useTranslations } from 'next-intl';
import type { VendorDropdownOption } from '@/types';
import VendorAddonsAsyncMultiSelect from '@/components/vendor/deliveries/product-management/common/VendorAddonsAsyncMultiSelect';

interface Props {
  /** Formik path of the add-on group ids, e.g. `variations.0.addOnIds`. */
  name: string;
  vendorId?: string;
  disabled?: boolean;
  /**
   * Add-on groups that are listed and named before the picker has loaded,
   * e.g. the ones the product already has. Pass a stable (memoised) list.
   */
  knownAddons?: VendorDropdownOption[] | null;
  helperText?: string;
}

/** Add-on groups offered with one variation (or with a single product) of a chain product. */
export function VendorVariationAddonsField({
  name,
  vendorId,
  disabled,
  knownAddons,
  helperText,
}: Props) {
  const t = useTranslations('products.variationSettings');
  const { values, setFieldValue } = useFormikContext<FormikValues>();
  const selected: unknown = getIn(values, name);
  const selectedIds = React.useMemo<string[]>(
    () => (Array.isArray(selected) ? selected : []),
    [selected],
  );

  return (
    <VendorAddonsAsyncMultiSelect
      // Controlled, because the picker's own Formik mode cannot read nested paths.
      name={name}
      label={t('addonsLabel')}
      placeholder={t('addonsPlaceholder')}
      helperText={helperText}
      vendorId={vendorId}
      disabled={disabled}
      initialSelectedAddons={knownAddons}
      value={selectedIds}
      onChange={(addonIds) => void setFieldValue(name, addonIds)}
    />
  );
}
