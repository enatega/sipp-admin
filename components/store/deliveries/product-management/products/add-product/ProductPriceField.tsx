'use client';

import { getIn, useFormikContext, type FormikValues } from 'formik';
import { useTranslations } from 'next-intl';
import { DEFAULT_CURRENCY } from '@/constants/currency.constants';
import { calculatePriceAfterDeal, type DealSummary } from '@/lib/deal-pricing';
import { formatCurrency } from '@/lib/formatCurrency';
import { useCurrency } from '@/hooks/use-currency';
import type { TaxRate } from '@/types/tax';
import { AppInputField } from '@/components/shared/form/AppInput';
import { ProductVariationTaxBreakdown } from '../ProductVariationTaxBreakdown';

interface Props {
  /** Formik path of the price, e.g. `price` or `variations.0.price`. */
  name: string;
  taxRate?: TaxRate | null;
  dealSummary?: DealSummary | null;
  /** Off where no tax is shown with the price, e.g. the vendor panel. */
  showTaxBreakdown?: boolean;
}

/** Price input with the tax breakdown and, when a deal is picked, the price after it. */
export function ProductPriceField({
  name,
  taxRate,
  dealSummary,
  showTaxBreakdown = true,
}: Props) {
  const t = useTranslations('products.addProduct.step2');
  const { currencySymbol } = useCurrency();
  const symbol = currencySymbol || DEFAULT_CURRENCY.symbol;
  const { values } = useFormikContext<FormikValues>();
  const rawPrice: unknown = getIn(values, name);
  const price = typeof rawPrice === 'number' ? rawPrice : String(rawPrice ?? '');
  const priceAfterDeal =
    dealSummary && Number(price) > 0
      ? calculatePriceAfterDeal(Number(price), dealSummary)
      : null;

  return (
    <div className="min-w-0 space-y-2">
      <AppInputField
        label={`${t('priceLabel')} (${symbol})`}
        name={name}
        type="number"
        step="0.01"
        min="0"
        placeholder={t('pricePlaceholder')}
        prefix={<span className="font-semibold text-primary">{symbol}</span>}
        requiredAsterisk
      />
      {showTaxBreakdown ? (
        <ProductVariationTaxBreakdown
          price={price}
          rate={taxRate}
          currencySymbol={symbol}
        />
      ) : null}
      {priceAfterDeal !== null ? (
        <p className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
          {t('priceAfterDealLabel')}: {formatCurrency(priceAfterDeal, symbol)}
        </p>
      ) : null}
    </div>
  );
}
