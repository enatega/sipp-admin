'use client';

import CopyButton from '@/components/shared/CopyButton';
import { Heading } from '@/components/shared/Heading';
import Status from '@/components/shared/Status';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/lib/formatCurrency';
import { OrderDetail } from '@/types';
import { useTranslations } from 'next-intl';
import {
  formatOrderStatusLabel,
  formatOrderTypeLabel,
  formatPaymentStatusLabel,
} from '../../utils';

interface IOrderSummaryProps {
  order: OrderDetail;
}

export function OrderSummary({ order }: IOrderSummaryProps) {
  const t = useTranslations('orders.orderDetail.summary');
  const tOrderTypes = useTranslations('orders.orderTypes');
  const tPaymentStatuses = useTranslations('orders.paymentStatuses');
  const tStatuses = useTranslations('orders.statuses');
  const { currencySymbol } = useCurrency();
  const currency = currencySymbol || '₡';

  const summaryItems = [
    {
      label: t('orderIdLabel'),
      value: (
        <div className="flex items-center gap-2 text-sm muted-foreground">
          <span className="truncate max-w-[220px]" title={order?.orderId}>
            {order?.orderId?.split('-')?.[0] ?? String(order?.orderId ?? '').slice(0, 8)}
          </span>
          <span onClick={(e) => e.stopPropagation()}>
            <CopyButton text={order?.orderId ?? ''} />
          </span>
        </div>
      ),
    },
    {
      label: t('statusLabel'),
      value: (
        <Status
          status={order?.status ?? ''}
          label={formatOrderStatusLabel(order?.status, tStatuses, '')}
        />
      ),
    },
    { label: t('vendorLabel'), value: order?.vendor },
    {
      label: t('orderAmountLabel'),
      value: formatCurrency(order?.amount ?? 0, currency),
    },
    {
      label: t('riderEarningsLabel'),
      value: (
        <div className="flex items-center gap-1">
          <span>{formatCurrency(order?.riderEarnings ?? 0, currency)}</span>
          <span className="text-mute text-xs">{t('riderEarningsHint')}</span>
        </div>
      ),
    },
    {
      label: t('orderTypeLabel'),
      value: formatOrderTypeLabel(
        order?.orderType,
        tOrderTypes,
        order?.orderType ?? '',
      ),
    },
    {
      label: t('paymentLabel'),
      value: (
        <Status
          status={
            (order?.payment && (order.payment.paymentStatus as string)) ||
            order?.paymentMethod ||
            ''
          }
          label={formatPaymentStatusLabel(
            (order?.payment && (order.payment.paymentStatus as string)) ||
              order?.paymentMethod,
            tPaymentStatuses,
            '',
          )}
        />
      ),
    },
    {
      label: t('storeLabel'),
      value: <span>{order?.store}</span>,
    },
    {
      label: t('adminCommissionLabel'),
      value: formatCurrency(order?.adminCommission ?? 0, currency),
    },
  ];

  return (
    <div className="border border-sidebar-border p-6 mt-6 rounded-[12px] bg-white shadow-sm">
      <Heading title={t('title')} containerClassName="mb-6" />
      <div className="flex flex-col gap-5">
        {summaryItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-black text-[16px] font-medium">
              {item?.label}
            </span>
            <div className="text-mute text-[16px] font-semibold">
              {item?.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
