'use client';

import { useState } from 'react';
import { FileDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { AppButton } from '@/components/shared/AppButton';
import { DEFAULT_CURRENCY } from '@/constants/currency.constants';
import { useCurrency } from '@/hooks/use-currency';
import { useGetOrderAdminNote } from '@/hooks/api/super-admin/enatega-deliveries/orders';
import { formatAdminDateTime } from '@/lib/adminDateTime';
import { formatCurrency } from '@/lib/formatCurrency';
import { OrderDetail, OrderProduct } from '@/types';
import {
  formatOrderStatusLabel,
  formatOrderTypeLabel,
  formatPaymentMethodLabel,
  formatPaymentStatusLabel,
  isPickupOrder,
} from '../utils';
import type { OrderPdfNote, PdfRow } from './orderDetailPdf';

interface DownloadOrderPdfButtonProps {
  order: OrderDetail;
}

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : value == null ? '' : String(value));

/** Drops rows with nothing to show so the PDF never prints empty labels. */
const rows = (entries: Array<[string, unknown]>): PdfRow[] =>
  entries.map(([label, value]) => [label, text(value)] as PdfRow).filter(([, value]) => value.length > 0);

const optionLabel = (option: unknown) => {
  if (typeof option !== 'object' || option === null) return text(option);
  const record = option as Record<string, unknown>;
  const group = text(record.groupName);
  const name = text(record.optionName ?? record.name ?? record.label ?? record.title);
  return group && name ? `${group}: ${name}` : group || name;
};

const itemOptions = (item: OrderProduct) => {
  const source = item.selectedOptions?.length ? item.selectedOptions : item.addons?.length ? item.addons : item.addon ? [item.addon] : [];
  return source.map(optionLabel).filter(Boolean).join(', ');
};

export function DownloadOrderPdfButton({ order }: DownloadOrderPdfButtonProps) {
  const t = useTranslations('orders.orderDetail.pdf');
  const tStatuses = useTranslations('orders.statuses');
  const tOrderTypes = useTranslations('orders.orderTypes');
  const tPaymentMethods = useTranslations('orders.paymentMethods');
  const tPaymentStatuses = useTranslations('orders.paymentStatuses');
  const { currencySymbol } = useCurrency();
  const currency = currencySymbol || DEFAULT_CURRENCY.symbol;
  // Shares the cache with the admin note panel, so this does not refetch.
  const adminNote = useGetOrderAdminNote(order.orderId);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const { downloadOrderDetailPdf } = await import('./orderDetailPdf');
      const timeZone = order.storeTimezone || 'UTC';
      const money = (value?: number | null) => formatCurrency(value ?? 0, currency);
      const dateTime = (value?: string | null) => formatAdminDateTime(value, '', timeZone);
      // Older API builds omit the placed time from the detail summary; the
      // first log ("Order created") carries the same moment.
      const logs = order.logs ?? [];
      const placedAt = order.dateTime || order.summary.dateTime || logs[logs.length - 1]?.date || null;
      const status = formatOrderStatusLabel(order.status, tStatuses, text(order.status) || '-');
      const pickup = isPickupOrder(order.orderType);
      const delivery = order.delivery ?? order.deliveryInfo;
      const payment = order.payment;
      const orderCode = `#${order.orderId.split('-')[0].toUpperCase()}`;
      const addressDetails = delivery?.deliveryAddressDetails;

      const notes: OrderPdfNote[] = [];
      const storeNote = text(order.orderNotes?.restaurantNote);
      const courierNote = text(order.orderNotes?.courierNote);
      if (storeNote) notes.push({ title: t('storeNote'), body: storeNote });
      if (courierNote) notes.push({ title: t('courierNote'), body: courierNote });
      const internalNote = text(adminNote.data?.note);
      if (internalNote) {
        notes.push({
          title: t('adminNote'),
          body: internalNote,
          isInternal: true,
          internalLabel: adminNote.data?.updatedAt
            ? t('adminNoteMeta', {
                name: adminNote.data.updatedBy?.name || t('unknownAdmin'),
                date: dateTime(adminNote.data.updatedAt),
              })
            : t('adminsOnly'),
        });
      }

      const discount = Number(order.discounts ?? 0);
      const totals = rows([
        [t('subtotal'), money(order.subtotal)],
        [t('taxes'), money(order.taxes)],
        [payment?.couponApplied ? t('discountWithCoupon', { code: payment.couponApplied }) : t('discount'), discount ? `- ${money(Math.abs(discount))}` : ''],
        [t('deliveryFee'), pickup ? '' : money(order.deliveryFee)],
        [t('packingCharges'), order.packingCharges ? money(order.packingCharges) : ''],
        [t('riderTip'), order.riderTip ? money(order.riderTip) : ''],
      ]);

      await downloadOrderDetailPdf({
        fileName: `sipp-order-${orderCode.slice(1)}`,
        brand: 'sipp',
        title: t('documentTitle'),
        orderCode,
        status,
        generatedAt: t('generatedAt', { date: formatAdminDateTime(new Date(), '', timeZone) }),
        highlights: [
          [t('placedAt'), dateTime(placedAt) || '-'],
          [t('orderType'), formatOrderTypeLabel(order.orderType, tOrderTypes, text(order.orderType) || '-')],
          [t('paymentMethod'), formatPaymentMethodLabel(order.paymentMethod, tPaymentMethods, '-')],
          [t('total'), money(order.amount)],
        ],
        sections: [
          {
            title: t('orderInformation'),
            rows: rows([
              [t('orderId'), order.orderId],
              [t('status'), status],
              [t('store'), order.store],
              [t('vendor'), order.vendor],
              [t('paymentStatus'), payment?.paymentStatus ? formatPaymentStatusLabel(payment.paymentStatus, tPaymentStatuses, payment.paymentStatus) : ''],
              [t('storeTimezone'), order.storeTimezone],
            ]),
          },
          {
            title: t('customer'),
            rows: rows([
              [t('name'), order.customer?.name],
              [t('email'), order.customer?.email],
              [t('phone'), order.customer?.phone],
              [t('pastOrders'), order.customer?.totalPastOrders],
            ]),
          },
          {
            title: pickup ? t('pickup') : t('delivery'),
            rows: rows([
              [t('pickupAddress'), delivery?.pickupAddress],
              [t('dropoffAddress'), pickup ? '' : delivery?.dropoffAddress],
              [t('placeName'), addressDetails?.placeName],
              [t('howToFind'), addressDetails?.howToFindYou],
              [t('deliveryInstructions'), addressDetails?.deliveryInstructions],
              // Older orders only have the combined legacy text; newer ones already
              // show its parts above, so repeating it would mislabel them.
              [t('addressNotes'), addressDetails ? '' : delivery?.deliveryAddressExtras],
              [t('zone'), delivery?.zone],
              [t('distance'), delivery?.distance],
              [t('eta'), delivery?.eta],
            ]),
          },
          {
            title: t('rider'),
            rows: pickup
              ? []
              : rows([
                  [t('name'), order.rider?.name || t('notAssigned')],
                  [t('phone'), order.rider?.phone],
                  [t('vehicle'), order.rider?.vehicleType],
                ]),
          },
        ],
        items: {
          title: t('items'),
          head: [t('item'), t('options'), t('qty'), t('unitPrice'), t('lineTotal')],
          body: order.items.length
            ? order.items.map((item) => [
                text(item.itemName) || '-',
                itemOptions(item) || '-',
                String(item.quantity ?? 1),
                money(item.price),
                money(item.finalPrice),
              ])
            : [[t('noItems'), '', '', '', '']],
          numericFrom: 2,
        },
        totals,
        grandTotal: [t('total'), money(order.amount)],
        earnings: {
          title: t('earnings'),
          rows: rows([
            [t('storeEarnings'), money(order.storeEarnings)],
            [t('adminCommission'), money(order.adminCommission)],
            [t('riderDeliveryEarning'), pickup ? '' : money(order.riderDeliveryEarning)],
            [
              t('riderPlatformCommission', { rate: order.riderCommissionPercentage ?? 0 }),
              pickup ? '' : money(order.riderPlatformCommission),
            ],
            [t('stripeCharged'), payment?.stripeChargedAmount != null ? `${payment.stripeChargedAmount} ${payment.stripeChargedCurrency ?? ''}`.trim() : ''],
          ]),
        },
        notes,
        timeline: {
          title: t('timeline'),
          head: [t('timelineStatus'), t('timelineBy'), t('timelineDate'), t('timelineNotes')],
          body: (order.logs ?? []).map((log) => [
            formatOrderStatusLabel(log.status, tStatuses, text(log.status) || '-'),
            text(log.by) || '-',
            dateTime(log.date) || '-',
            text(log.notes) || '-',
          ]),
        },
        footer: t('footer'),
        pageLabel: (page, total) => t('page', { page, total }),
      });
    } catch (error) {
      console.error('Order PDF export failed', error);
      toast.error(t('failed'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppButton
      variant="secondary"
      onClick={() => void handleDownload()}
      isLoading={isGenerating}
      className="h-10 px-6 w-full sm:w-auto"
      leftIcon={<FileDown size={18} />}
    >
      {t('download')}
    </AppButton>
  );
}
