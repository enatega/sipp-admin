import type { TaxConfiguration, TaxRate } from '@/types/tax';

/** Resolve the rate used for a product without changing its saved price. */
export function resolveProductTaxRate(
  configuration: TaxConfiguration | undefined,
  rates: TaxRate[],
  taxRateId?: string | null,
  currentRate?: TaxRate | null,
): TaxRate | null {
  if (!configuration) return null;
  if (configuration.productTaxMode !== 'product_level') {
    return configuration.taxRate ?? null;
  }
  return (
    rates.find((rate) => rate.id === taxRateId) ??
    (taxRateId ? currentRate : configuration.productDefaultTaxRate) ??
    null
  );
}

/** Tax-inclusive prices: never add tax again to the entered gross amount. */
export function inclusiveTaxBreakdown(gross: number, rate: number) {
  if (!Number.isFinite(gross) || !Number.isFinite(rate) || gross < 0 || rate < 0 || rate > 100) return null;
  const net = gross / (1 + rate / 100);
  return { gross, net, tax: gross - net };
}
