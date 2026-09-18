'use client';

import { useField, useFormikContext } from 'formik';
import { useTranslations } from 'next-intl';
import { TaxConfiguration as Configuration, TaxRate } from '@/types/tax';
import { useTaxRates } from '@/hooks/api/deliveries/tax-rates';
import { Button } from '@/components/ui/button';

export default function TaxConfiguration({
  currentRate,
}: {
  currentRate?: TaxRate | null;
}) {
  const t = useTranslations('taxRates');
  const { values, setFieldValue } = useFormikContext<Configuration>();
  const query = useTaxRates('store');
  const rates = query.data || [];
  const mode = values.productTaxMode || 'store_rate';
  const [, rateMeta, rateHelpers] = useField({
    name: 'taxRateId',
    validate: (value: string) =>
      mode === 'store_rate' && !value ? t('selectRate') : undefined,
  });
  return (
    <section className="space-y-3 rounded-lg border p-4">
      <h3 className="font-semibold">{t('configuration')}</h3>
      <label className="block space-y-2">
        <span>{t('mode')}</span>
        <select
          className="w-full rounded-md border bg-background p-2"
          value={mode}
          onChange={(event) => {
            setFieldValue('productTaxMode', event.target.value);
            if (event.target.value === 'product_level')
              setFieldValue('taxRateId', '');
          }}
        >
          <option value="store_rate">{t('storeMode')}</option>
          <option value="product_level">{t('productMode')}</option>
        </select>
      </label>
      {mode === 'store_rate' && (
        <label className="block space-y-2">
          <span>{t('store')}</span>
          <select
            className="w-full rounded-md border bg-background p-2"
            aria-invalid={rateMeta.touched && !!rateMeta.error}
            onBlur={() => rateHelpers.setTouched(true)}
            disabled={query.isPending || query.isError}
            value={values.taxRateId || ''}
            onChange={(event) => setFieldValue('taxRateId', event.target.value)}
          >
            <option value="">{t('selectRate')}</option>
            {currentRate &&
              !rates.some((rate) => rate.id === currentRate.id) && (
                <option value={currentRate.id}>
                  {currentRate.name} ({currentRate.rate}%) — {t('inactive')}
                </option>
              )}
            {rates.map((rate) => (
              <option key={rate.id} value={rate.id}>
                {rate.name} ({rate.rate}%)
              </option>
            ))}
          </select>
        </label>
      )}
      {mode === 'store_rate' && rateMeta.touched && rateMeta.error && (
        <p role="alert" className="text-destructive">
          {rateMeta.error}
        </p>
      )}
      {query.isPending && <p role="status">{t('loading')}</p>}
      {query.isError && (
        <div role="alert" className="text-destructive">
          {t('loadError')}{' '}
          <Button
            type="button"
            variant="outline"
            onClick={() => query.refetch()}
          >
            {t('retry')}
          </Button>
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        {mode === 'product_level' ? t('productModeHelp') : t('storeHelp')}
      </p>
    </section>
  );
}
