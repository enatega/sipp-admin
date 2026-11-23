'use client';

import * as React from 'react';
import { getIn, useFormikContext, type FormikValues } from 'formik';
import { useTranslations } from 'next-intl';
import type { Addon } from '@/types';
import AddonsAsyncMultiSelect from '@/components/store/deliveries/product-management/common/AddonsAsyncMultiSelect';

interface Props {
  /** Formik path of the add-on group ids, e.g. `variations.0.addOnIds`. */
  name: string;
  storeId?: string;
  disabled?: boolean;
  /** Add-on groups whose names are already known, so chosen ones show at once. */
  knownAddons?: Addon[] | null;
  helperText?: string;
}

/** Add-on groups offered with one variation (or with a single product). */
export function VariationAddonsField({
  name,
  storeId,
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
  // Only the chosen ones are handed over: the picker lists whatever it is
  // given, so more would drown out its own search results.
  const selectedKnownAddons = React.useMemo(
    () => knownAddons?.filter((addon) => selectedIds.includes(addon.id)) ?? null,
    [knownAddons, selectedIds],
  );

  return (
    <AddonsAsyncMultiSelect
      // Controlled, because the picker's own Formik mode cannot read nested paths.
      name={name}
      label={t('addonsLabel')}
      placeholder={t('addonsPlaceholder')}
      helperText={helperText}
      storeId={storeId}
      disabled={disabled}
      initialSelectedAddons={selectedKnownAddons}
      value={selectedIds}
      onChange={(addonIds) => void setFieldValue(name, addonIds)}
    />
  );
}
