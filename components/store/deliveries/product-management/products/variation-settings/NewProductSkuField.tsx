'use client';

import * as React from 'react';
import { getIn, useFormikContext, type FormikValues } from 'formik';
import { useTranslations } from 'next-intl';
import type { ProductSkuScope } from '@/types';
import { ProductSkuField } from './ProductSkuField';

interface Props {
  /** Formik path of the SKU, e.g. `sku` or `variations.0.sku`. */
  name: string;
  scope: ProductSkuScope;
  /** Store the SKU is checked in; without it no check is made. */
  storeId?: string;
  /**
   * What the form itself puts in the field: the server's suggestion, or a
   * variation SKU that follows the product SKU.
   */
  prefilledSku?: string | null;
  /** The prefilled SKU when the server reserved it for this form, so it needs no check. */
  trustedSku?: string | null;
  /** Put `prefilledSku` into the field when it arrives while the field is still blank. */
  autoFill?: boolean;
  disabled?: boolean;
}

/**
 * SKU input of the add-product forms: prefilled, editable, checked for
 * duplicates once edited. It may be left blank; the SKU is then created on save.
 */
export function NewProductSkuField({
  name,
  scope,
  storeId,
  prefilledSku,
  trustedSku,
  autoFill,
  disabled,
}: Props) {
  const t = useTranslations('products.variationSettings');
  const { values, setFieldValue } = useFormikContext<FormikValues>();
  const currentSku = String(getIn(values, name) ?? '').trim();
  const prefilled = (prefilledSku ?? '').trim();
  const filled = React.useRef('');

  // Once per suggestion: clearing the field afterwards leaves it blank.
  React.useEffect(() => {
    if (!autoFill || !prefilled || filled.current === prefilled) return;
    filled.current = prefilled;
    if (!currentSku) void setFieldValue(name, prefilled);
  }, [autoFill, currentSku, name, prefilled, setFieldValue]);

  return (
    <ProductSkuField
      name={name}
      label={t('skuLabel')}
      placeholder={t('skuGeneratedPlaceholder')}
      helperText={
        !currentSku
          ? t('skuAutoHelper')
          : currentSku === prefilled
            ? t('skuSuggestedHelper')
            : t('skuHelper')
      }
      disabled={disabled}
      storeId={storeId}
      scope={scope}
      liveCheck
      trustedSku={trustedSku}
    />
  );
}
