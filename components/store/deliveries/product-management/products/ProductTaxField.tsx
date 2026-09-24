'use client';

import { useParams } from 'next/navigation';
import { useField, useFormikContext } from 'formik';
import { useTranslations } from 'next-intl';
import { TaxRate } from '@/types/tax';
import { inclusiveTaxBreakdown } from '@/lib/tax-inclusive';
import { useTaxRates } from '@/hooks/api/deliveries/tax-rates';
import { useGetStoreProfile } from '@/hooks/api/store/deliveries/profile';
import { Button } from '@/components/ui/button';

export default function ProductTaxField({
  currentRate,
}: {
  currentRate?: TaxRate | null;
}) {
  const t = useTranslations('taxRates');
  const { storeId } = useParams() as { storeId: string };
  const profile = useGetStoreProfile(storeId);
  const query = useTaxRates('product');
  const { values, setFieldValue } = useFormikContext<{
    price: string;
    taxRateId?: string;
  }>();
  const configuration = profile.data?.basicInformation;
  const productLevel = configuration?.productTaxMode === 'product_level';
  const rates = query.data || [];
  const selected = productLevel
    ? rates.find((rate) => rate.id === values.taxRateId) ||
      (values.taxRateId ? currentRate : configuration?.productDefaultTaxRate)
    : configuration?.taxRate;
  const gross = Number(values.price);
  const percentage = selected ? Number(selected.rate) : null;
  const breakdown =
    percentage === null ? null : inclusiveTaxBreakdown(gross, percentage);
  const net = breakdown?.net ?? null;
  const [, taxMeta, taxHelpers] = useField({
    name: 'taxRateId',
    validate: () =>
      productLevel && !query.isPending && !query.isError && !selected
        ? t('missingDefault')
        : undefined,
  });
  return (
    <div className="space-y-2">
      {profile.isPending && <p role="status">{t('loading')}</p>}
      {(profile.isError || (productLevel && query.isError)) && (
        <div role="alert" className="text-destructive">
          {t('loadError')}{' '}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              profile.refetch();
              query.refetch();
            }}
          >
            {t('retry')}
          </Button>
        </div>
      )}
      {productLevel && (
        <label className="block space-y-2">
          <span>{t('product')}</span>
          <select
            className="w-full rounded-md border bg-background p-2"
            onBlur={() => taxHelpers.setTouched(true)}
            aria-invalid={taxMeta.touched && !!taxMeta.error}
            disabled={query.isPending || query.isError}
            value={values.taxRateId || ''}
            onChange={(event) => setFieldValue('taxRateId', event.target.value)}
          >
            <option value="">{t('useDefault')}</option>
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
      <p className="text-sm text-muted-foreground">{t('inclusiveHelp')}</p>
      {selected && net !== null && Number.isFinite(gross) && gross >= 0 && (
        <p className="text-sm" aria-live="polite">
          {t('breakdown', {
            name: selected.name,
            rate: String(selected.rate),
            net: net.toFixed(2),
            tax: (gross - net).toFixed(2),
            gross: gross.toFixed(2),
          })}
        </p>
      )}
      {productLevel && !query.isPending && !selected && (
        <p role="alert" className="text-destructive">
          {t('missingDefault')}
        </p>
      )}
    </div>
  );
}
