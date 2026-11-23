'use client';

import { useId } from 'react';
import { getIn, useFormikContext, type FormikValues } from 'formik';
import { useTranslations } from 'next-intl';
import { Switch } from '@/components/ui/switch';

interface Props {
  /** Formik path of the boolean, e.g. `inStock`. */
  name: string;
  disabled?: boolean;
}

/** Manual "In stock" switch of one variation. */
export function VariationInStockField({ name, disabled }: Props) {
  const t = useTranslations('products.variationSettings');
  const switchId = useId();
  const { values, setFieldValue } = useFormikContext<FormikValues>();

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <Switch
          id={switchId}
          checked={getIn(values, name) !== false}
          disabled={disabled}
          onCheckedChange={(checked) => void setFieldValue(name, checked)}
        />
        <label htmlFor={switchId} className="cursor-pointer text-sm font-medium">
          {t('inStock')}
        </label>
      </div>
      <p className="text-sm text-mute">{t('inStockHelper')}</p>
    </div>
  );
}
