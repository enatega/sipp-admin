'use client';

import moment from 'moment';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/lib/formatCurrency';
import { useCurrency } from '@/hooks/use-currency';
import { VendorWithdrawalRequest } from '../types';

export const useVendorWithdrawalDownloadColumns = () => {
  const t = useTranslations('vendorWithdrawalRequest.table');
  const { currencySymbol } = useCurrency();

  return [
    {
      header: t('columns.requestId'),
      dataKey: 'requestId',
    },
    {
      header: t('columns.storeName'),
      dataKey: 'name',
    },
    {
      header: t('columns.amount'),
      dataKey: 'amount',
      formatter: (item: VendorWithdrawalRequest) =>
        formatCurrency(item.amount, currencySymbol),
    },
    {
      header: t('columns.status'),
      dataKey: 'status',
      formatter: (item: VendorWithdrawalRequest) =>
        t(`statuses.${item.status}`),
    },
    {
      header: t('columns.date'),
      dataKey: 'date',
      formatter: (item: VendorWithdrawalRequest) =>
        moment(item.date).format('DD MMM YYYY, hh:mm A'),
    },
  ];
};
