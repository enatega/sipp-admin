'use client';

import * as React from 'react';
import { getIn, useFormikContext, type FormikValues } from 'formik';
import { useTranslations } from 'next-intl';
import type { ProductSkuScope } from '@/types';
import { useCheckProductSkuAvailability } from '@/hooks/api/store/deliveries/product-management/products';
import { AppInputField } from '@/components/shared/form/AppInput';

const LIVE_CHECK_DELAY_MS = 400;

interface Props {
  /** Formik path of the SKU value. */
  name: string;
  label: string;
  placeholder?: string;
  helperText?: string;
  requiredAsterisk?: boolean;
  disabled?: boolean;
  /** Store the SKU is checked in; without it no check is made. */
  storeId?: string;
  scope: ProductSkuScope;
  /** Record being edited, so its own SKU is not reported as taken. */
  productId?: string;
  variationId?: string;
  /**
   * For forms that create a record. The SKU is then checked shortly after
   * every change instead of on blur, and one known to be taken fails the
   * form's validation, so it cannot be submitted.
   */
  liveCheck?: boolean;
  /** With `liveCheck`: a SKU the server reserved for this form, which needs no check. */
  trustedSku?: string | null;
}

/**
 * SKU input that asks the server whether the code is still free and shows the
 * answer inline. By default it asks on blur and saving is not blocked: the
 * save call checks again. A check that is still running or that failed never
 * blocks either.
 */
export function ProductSkuField({
  name,
  label,
  placeholder,
  helperText,
  requiredAsterisk,
  disabled,
  storeId,
  scope,
  productId,
  variationId,
  liveCheck,
  trustedSku,
}: Props) {
  const t = useTranslations('products.variationSettings');
  const { values, initialValues, handleBlur, registerField, unregisterField } =
    useFormikContext<FormikValues>();
  const { mutateAsync: checkAvailability } = useCheckProductSkuAvailability();
  const [takenSku, setTakenSku] = React.useState<string | null>(null);
  // Same value, readable by the validator between renders.
  const takenSkuRef = React.useRef<string | null>(null);
  const lastChecked = React.useRef('');

  const currentSku = String(getIn(values, name) ?? '').trim();
  const savedSku = String(getIn(initialValues, name) ?? '').trim();
  // Needs no check: the record's own saved SKU on edit; on create only a SKU
  // the server has just reserved.
  const uncheckedSku = liveCheck ? (trustedSku ?? '').trim() : savedSku;
  const takenMessage = t('skuTaken');

  const checkSku = React.useCallback(
    async (sku: string) => {
      const markTaken = (taken: string | null) => {
        takenSkuRef.current = taken;
        setTakenSku(taken);
      };

      lastChecked.current = sku;
      if (!storeId || !sku || sku === uncheckedSku) {
        markTaken(null);
        return;
      }

      try {
        const result = await checkAvailability({
          store_id: storeId,
          sku,
          scope,
          productId,
          variationId,
        });
        // Ignore the answer if the SKU was edited again meanwhile.
        if (lastChecked.current === sku) {
          markTaken(result.available ? null : sku);
        }
      } catch {
        // The save call still validates the SKU and reports the error.
      }
    },
    [checkAvailability, productId, scope, storeId, uncheckedSku, variationId],
  );

  React.useEffect(() => {
    if (!liveCheck) return;
    const timer = window.setTimeout(
      () => void checkSku(currentSku),
      LIVE_CHECK_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [checkSku, currentSku, liveCheck]);

  React.useEffect(() => {
    if (!liveCheck) return;
    registerField(name, {
      validate: (value: unknown) => {
        const sku = String(value ?? '').trim();
        return sku && sku === takenSkuRef.current ? takenMessage : undefined;
      },
    });
    return () => unregisterField(name);
  }, [liveCheck, name, registerField, takenMessage, unregisterField]);

  return (
    <AppInputField
      label={label}
      name={name}
      type="text"
      maxLength={100}
      placeholder={placeholder}
      helperText={helperText}
      requiredAsterisk={requiredAsterisk}
      disabled={disabled}
      error={takenSku && takenSku === currentSku ? takenMessage : undefined}
      onBlur={(event) => {
        handleBlur(event);
        if (!liveCheck) void checkSku(currentSku);
      }}
    />
  );
}
