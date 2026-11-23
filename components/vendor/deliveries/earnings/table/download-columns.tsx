import moment from 'moment';
import { useTranslations } from 'next-intl';
import { VendorEarningItem } from '@/types/api/vendor/deliveries/earnings-report';
import { formatCurrency } from '@/lib/formatCurrency';
import { useCurrency } from '@/hooks/use-currency';

export const useVendorEarningsDownloadColumns = () => {
  const t = useTranslations('vendorEarnings.table');
  const { currencySymbol } = useCurrency();

  return [
    {
      header: t('columns.orderId'),
      dataKey: 'order_id',
    },
    {
      header: t('columns.customerName'),
      dataKey: 'customer_name',
    },
    {
      header: t('columns.store'),
      dataKey: 'store_name',
    },
    {
      header: t('columns.amount'),
      dataKey: 'amount',
      formatter: (item: VendorEarningItem) =>
        formatCurrency(item.amount, currencySymbol),
    },
    {
      header: t('columns.zone'),
      dataKey: 'zone_name',
    },
    {
      header: t('columns.status'),
      dataKey: 'status',
      formatter: (item: VendorEarningItem) => t(`statuses.${item.status}`),
    },
    {
      header: t('columns.date'),
      dataKey: 'date_time',
      formatter: (item: VendorEarningItem) =>
        moment(item.date_time).format('DD MMM YYYY, hh:mm A'),
    },
  ];
};
