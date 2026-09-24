'use client';

import DisplayError from '@/components/shared/DisplayError';
import { useGetTaxCommissionReportSummary } from '@/hooks/api/super-admin/enatega-deliveries/reporting';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/lib/formatCurrency';
import { returnErrorMessage } from '@/lib/toast-error';
import type { ApiErrorResponse } from '@/types';
import type {
  CommissionTaxReportSummary,
  ProductTaxReportSummary,
  TaxCommissionReportKey,
} from '@/types/api/super-admin/enatega-deliveries/reporting/reporting.api';
import { useTranslations } from 'next-intl';

type SummaryCard = [label: string, value: string];

export function TaxCommissionSummary({
  reportKey,
}: {
  reportKey: TaxCommissionReportKey;
}) {
  const { data, isLoading, isError, error, refetch } =
    useGetTaxCommissionReportSummary(reportKey);
  const { currencySymbol } = useCurrency();
  const t = useTranslations('reporting.taxSummary');
  const money = (value: number | undefined) =>
    formatCurrency(value ?? 0, currencySymbol);

  let cards: SummaryCard[];
  if (reportKey === 'tax/product') {
    const summary = data?.summary as ProductTaxReportSummary | undefined;
    cards = [
      [t('deliveredOrders'), String(summary?.deliveredOrders ?? 0)],
      [t('grossProductAmount'), money(summary?.grossProductAmount)],
      [t('netProductAmount'), money(summary?.netProductAmount)],
      [t('totalProductTax'), money(summary?.productTax)],
    ];
  } else {
    const summary = data?.summary as CommissionTaxReportSummary | undefined;
    cards = [
      [t('deliveredOrders'), String(summary?.deliveredOrders ?? 0)],
      [t('commissionBase'), money(summary?.commissionBase)],
      [t('commissionNet'), money(summary?.commissionNet)],
      [t('commissionVat'), money(summary?.commissionVat)],
      [t('totalCommissionDeduction'), money(summary?.totalCommissionDebit)],
      [t('absorbedVat'), money(summary?.absorbedVat)],
    ];
  }

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
    <section
      aria-label={t('ariaLabel')}
      className={`grid gap-3 sm:grid-cols-2 ${
        reportKey === 'tax/product' ? 'xl:grid-cols-4' : 'xl:grid-cols-6'
      }`}
    >
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
