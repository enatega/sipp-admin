/** Tax-inclusive prices: never add tax again to the entered gross amount. */
export function inclusiveTaxBreakdown(gross: number, rate: number) {
  if (!Number.isFinite(gross) || !Number.isFinite(rate) || gross < 0 || rate < 0 || rate > 100) return null;
  const net = gross / (1 + rate / 100);
  return { gross, net, tax: gross - net };
}
