'use client';

import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/lib/formatCurrency';
import { VendorOrderItem } from '@/components/vendor/deliveries/dashboard/types';

export const useVendorOrdersDownloadColumns = () => {
  const t = useTranslations('vendorDeliveriesDashboard.ordersTable');
  const { currencySymbol } = useCurrency();

  return [
    {
      header: t('columns.orderId'),
      dataKey: 'orderId',
    },
    {
      header: t('columns.customerName'),
      dataKey: 'customerName',
    },
    {
      header: t('columns.address'),
      dataKey: 'address',
    },
    {
      header: t('columns.status'),
      dataKey: 'status',
      formatter: (item: VendorOrderItem) => t(`statuses.${item.status}`),
    },
    {
      header: t('columns.amount'),
      dataKey: 'amount',
      formatter: (item: VendorOrderItem) => formatCurrency(item.amount, currencySymbol),
    },
    {
      header: t('columns.date'),
      dataKey: 'date',
      formatter: (item: VendorOrderItem) => moment(item.date).format('DD MMM YYYY, hh:mm A'),
    },
    {
      header: t('columns.zone'),
      dataKey: 'zone',
    },
    {
      header: t('columns.driverName'),
      dataKey: 'driverName',
      formatter: (item: VendorOrderItem) => item.driverName || '-',
    },
  ];
};
