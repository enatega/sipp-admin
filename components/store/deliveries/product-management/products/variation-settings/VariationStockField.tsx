'use client';

import { useId } from 'react';
import { getIn, useFormikContext, type FormikValues } from 'formik';
import { useTranslations } from 'next-intl';
import {
  UNLIMITED_STOCK_VALUE,
  isUnlimitedStockValue,
} from '@/lib/product-variation-settings';
import { Switch } from '@/components/ui/switch';
import { AppInputField } from '@/components/shared/form/AppInput';

interface Props {
  /** Formik path of the stock value, e.g. `variations.0.stockQuantity`. */
  name: string;
  disabled?: boolean;
}

/** Stock quantity with an "Unlimited" switch; unlimited is stored as a large number. */
export function VariationStockField({ name, disabled }: Props) {
  const t = useTranslations('products.variationSettings');
  const switchId = useId();
  const { values, setFieldValue } = useFormikContext<FormikValues>();
  const isUnlimited = isUnlimitedStockValue(getIn(values, name));

  return (
    <div className="space-y-2">
      <AppInputField
        label={t('stockLabel')}
        name={name}
        type="number"
        min="0"
        step="1"
        placeholder={isUnlimited ? t('unlimited') : t('stockPlaceholder')}
        requiredAsterisk={!isUnlimited}
        disabled={disabled || isUnlimited}
        {...(isUnlimited ? { value: '' } : {})}
      />
      <div className="flex items-center gap-3">
        <Switch
          id={switchId}
          checked={isUnlimited}
          disabled={disabled}
          onCheckedChange={(checked) =>
            void setFieldValue(name, checked ? UNLIMITED_STOCK_VALUE : '')
          }
        />
        <label htmlFor={switchId} className="cursor-pointer text-sm font-medium">
          {t('unlimited')}
        </label>
      </div>
    </div>
  );
}
