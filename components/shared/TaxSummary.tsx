'use client';

import { useTranslations } from 'next-intl';
import { TaxConfiguration, TaxRate } from '@/types/tax';
import { inclusiveTaxBreakdown } from '@/lib/tax-inclusive';

export default function TaxSummary({
  configuration,
  price,
}: {
  configuration: TaxConfiguration;
  price?: string | number;
}) {
  const t = useTranslations('taxRates');
  const rate: TaxRate | null | undefined = configuration.taxRate;
  const gross = Number(price);
  const breakdown = rate ? inclusiveTaxBreakdown(gross, Number(rate.rate)) : null;
  const net = breakdown?.net ?? null;
  return (
    <div className="space-y-1 text-sm">
      <p className="text-muted-foreground">{t('configuration')}</p>
      <p>
        {configuration.productTaxMode === 'product_level'
          ? t('productMode')
          : rate
            ? `${rate.name} (${rate.rate}%)`
            : t('unconfigured')}
      </p>
      {price !== undefined &&
        rate &&
        net !== null &&
        Number.isFinite(gross) && (
          <p>
            {t('breakdown', {
              name: rate.name,
              rate: String(rate.rate),
              net: net.toFixed(2),
              tax: (gross - net).toFixed(2),
              gross: gross.toFixed(2),
            })}
          </p>
        )}
    </div>
  );
}
