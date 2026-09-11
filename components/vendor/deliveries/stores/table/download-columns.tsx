import { VendorStoreTableItem } from './types';

export const getDownloadColumns = (t: (key: string) => string) => [
  { header: t('download.name'), dataKey: 'name' },
  { header: t('download.totalOrders'), dataKey: 'totalOrders' },
  { header: t('download.email'), dataKey: 'email' },
  {
    header: t('download.shopType'),
    dataKey: 'shopTypeName',
    formatter: (item: VendorStoreTableItem) => item.shopTypeName,
  },
  { header: t('download.address'), dataKey: 'address' },
  { header: t('download.zone'), dataKey: 'zoneName' },
  { header: t('download.status'), dataKey: 'status' },
  {
    header: t('download.available'),
    dataKey: 'isAvailable',
    formatter: (item: VendorStoreTableItem) =>
      item.isAvailable ? t('download.yes') : t('download.no'),
  },
  {
    header: t('download.activeOrders'),
    dataKey: 'activeOrders',
  },
  {
    header: t('download.rating'),
    dataKey: 'rating',
    formatter: (item: VendorStoreTableItem) => item.rating.toFixed(1),
  },
];
