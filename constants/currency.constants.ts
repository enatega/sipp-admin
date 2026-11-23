export interface CurrencyOption {
  id: number;
  label: string;
  value: string;
  symbol: string;
}

export const DEFAULT_CURRENCY = {
  code: 'CRC',
  name: 'Costa Rican Colón',
  symbol: '₡',
} as const;

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { id: 1, label: 'US Dollar', value: 'USD', symbol: '$' },
  { id: 2, label: 'Euro', value: 'EUR', symbol: '€' },
  { id: 3, label: 'British Pound', value: 'GBP', symbol: '£' },
  { id: 4, label: 'Saudi Riyal', value: 'SAR', symbol: '﷼' },
  { id: 5, label: 'UAE Dirham', value: 'AED', symbol: 'د.إ' },
  { id: 6, label: 'Pakistani Rupee', value: 'PKR', symbol: '₨' },
  { id: 7, label: 'Indian Rupee', value: 'INR', symbol: '₹' },
  { id: 8, label: 'Canadian Dollar', value: 'CAD', symbol: 'C$' },
  { id: 9, label: 'Australian Dollar', value: 'AUD', symbol: 'A$' },
  { id: 10, label: 'Japanese Yen', value: 'JPY', symbol: '¥' },
  { id: 11, label: 'Costa Rican Colón', value: 'CRC', symbol: '₡' },
];
