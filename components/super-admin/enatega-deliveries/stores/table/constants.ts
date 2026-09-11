import { DeliveryStore } from '@/types';
import { formatDateTime } from '@/lib/formatDateTime';

export const getDownloadColumns = (t: (key: string) => string) => [
  { header: t('download.name'), dataKey: 'storename' },
  { header: t('download.totalSales'), dataKey: 'totalSales' },
  { header: t('download.email'), dataKey: 'storeemail' },
  { header: t('download.shopType'), dataKey: 'shoptypename' },
  { header: t('download.vendor'), dataKey: 'vendorname' },
  { header: t('download.address'), dataKey: 'address' },
  { header: t('download.zone'), dataKey: 'zonename' },
  {
    header: t('download.creationDate'),
    dataKey: 'createdat',
    formatter: (item: DeliveryStore) =>
      item.createdat
        ? formatDateTime(item.createdat, t('download.notAvailable'))
        : t('download.notAvailable'),
  },
  { header: t('download.status'), dataKey: 'status' },
  {
    header: t('download.available'),
    dataKey: 'isavailable',
    formatter: (item: DeliveryStore) =>
      item.isavailable ? t('download.yes') : t('download.no'),
  },
  {
    header: t('download.blocked'),
    dataKey: 'isblocked',
    formatter: (item: DeliveryStore) =>
      item.isblocked ? t('download.yes') : t('download.no'),
  },
  {
    header: t('download.rating'),
    dataKey: 'averagerating',
    formatter: (item: DeliveryStore) =>
      parseFloat(item.averagerating || '0').toFixed(1),
  },
  { header: t('download.activeOrders'), dataKey: 'activeorders' },
  { header: t('download.reviewCount'), dataKey: 'reviewcount' },
];
