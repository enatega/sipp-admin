import moment from 'moment';
import { formatCurrency, resolveCurrencySymbol } from '@/lib/formatCurrency';
import type { Option as StoreOption } from '@/types';

type TranslateFn = (key: string) => string;

const formatPrice = (price: StoreOption['price'], currencySymbol?: string) => {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return '';
  }

  return formatCurrency(numericPrice, resolveCurrencySymbol(currencySymbol));
};

export const getOptionDownloadColumns = (
  t: TranslateFn,
  currencySymbol?: string,
) => [
  { header: t('download.title'), dataKey: 'title' },
  {
    header: t('download.price'),
    dataKey: 'price',
    formatter: (item: StoreOption) => formatPrice(item.price, currencySymbol),
  },
  { header: t('download.stockQuantity'), dataKey: 'stockQuantity' },
  { header: t('download.description'), dataKey: 'description' },
  {
    header: t('download.createdAt'),
    dataKey: 'createdAt',
    formatter: (item: StoreOption) =>
      moment(item.createdAt).format('DD MMM YYYY, hh:mm A'),
  },
];
