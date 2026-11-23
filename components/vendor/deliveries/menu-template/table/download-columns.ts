import { VendorMenuTemplateItem } from './types';

type Translator = (key: string) => string;

export const getDownloadColumns = (t: Translator) => [
  { header: t('menuTitle'), dataKey: 'name' },
  { header: t('description'), dataKey: 'description' },
  {
    header: t('assignedStores'),
    dataKey: 'assignedStores',
    formatter: (item: VendorMenuTemplateItem) =>
      item.assignedStores.length.toLocaleString(),
  },
  {
    header: t('products'),
    dataKey: 'totalProducts',
    formatter: (item: VendorMenuTemplateItem) =>
      item.totalProducts.toLocaleString(),
  },
  {
    header: t('availability'),
    dataKey: 'availability',
    formatter: (item: VendorMenuTemplateItem) =>
      item.availability ? t('active') : t('inactive'),
  },
];
