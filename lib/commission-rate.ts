export const commissionRateToPercentage = (
  value: string | number | null | undefined,
): number => {
  const rate = Number(value);
  if (!Number.isFinite(rate)) return 0;

  const percentage = rate > 1 ? rate : rate * 100;
  return Number(percentage.toFixed(2));
};

export const formatCommissionRate = (
  value: string | number | null | undefined,
): string => `${commissionRateToPercentage(value)}%`;

export const commissionPercentageToRate = (value: string | number): number =>
  Number((Number(value) / 100).toFixed(4));
