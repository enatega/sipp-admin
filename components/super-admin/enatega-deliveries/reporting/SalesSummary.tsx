'use client';

import DisplayError from '@/components/shared/DisplayError';
import { useGetSalesReportSummary } from '@/hooks/api/super-admin/enatega-deliveries/reporting';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/lib/formatCurrency';
import { returnErrorMessage } from '@/lib/toast-error';
import type { ApiErrorResponse } from '@/types';
import { useTranslations } from 'next-intl';

export function SalesSummary() {
  const { data, isLoading, isError, error, refetch } =
    useGetSalesReportSummary();
  const { currencySymbol } = useCurrency();
  const t = useTranslations('reporting.summary');
  const summary = data?.summary;
  const cards = [
    [t('grossSales'), formatCurrency(summary?.grossSales ?? 0, currencySymbol)],
    [t('deliveredOrders'), String(summary?.deliveredOrders ?? 0)],
    [t('productTax'), formatCurrency(summary?.productTax ?? 0, currencySymbol)],
    [t('discounts'), formatCurrency(summary?.discounts ?? 0, currencySymbol)],
    [t('deliveryFees'), formatCurrency(summary?.deliveryFees ?? 0, currencySymbol)],
    [
      t('packingCharges'),
      formatCurrency(summary?.packingCharges ?? 0, currencySymbol),
    ],
  ];

  if (isError) {
    return (
      <DisplayError
        title={t('loadError')}
        message={returnErrorMessage(error as ApiErrorResponse)}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <section aria-label={t('ariaLabel')} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {cards.map(([label, value]) => (
        <div key={label} className="rounded-xl border bg-white p-4 shadow-xs">
          <p className="text-sm text-muted-foreground">{label}</p>
          {isLoading ? (
            <div className="mt-2 h-7 w-24 animate-pulse rounded bg-gray-200" />
          ) : (
            <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
          )}
        </div>
      ))}
    </section>
  );
}
