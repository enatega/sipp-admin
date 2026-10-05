'use client';

import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/lib/formatCurrency';
import { inclusiveTaxBreakdown } from '@/lib/tax-inclusive';
import type { TaxRate } from '@/types/tax';

type Props = {
  price: string | number;
  rate?: TaxRate | null;
  currencySymbol: string;
};

export function ProductVariationTaxBreakdown({ price, rate, currencySymbol }: Props) {
  const t = useTranslations('taxRates');
  const rawPrice = String(price).trim();
  if (!rawPrice || !rate || Number(rawPrice) <= 0) return null;

  const breakdown = inclusiveTaxBreakdown(Number(rawPrice), Number(rate.rate));
  if (!breakdown) return null;

  return (
    <p className="text-sm leading-relaxed text-muted-foreground" aria-live="polite">
      {t('breakdown', {
        name: rate.name,
        rate: String(rate.rate),
        net: formatCurrency(breakdown.net, currencySymbol),
        tax: formatCurrency(breakdown.tax, currencySymbol),
        gross: formatCurrency(breakdown.gross, currencySymbol),
      })}
    </p>
  );
}
