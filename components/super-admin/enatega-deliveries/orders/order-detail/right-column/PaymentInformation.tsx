'use client';

import { Heading } from '@/components/shared/Heading';
import Status from '@/components/shared/Status';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/lib/formatCurrency';
import { OrderDetail, PaymentInfo } from '@/types/entities/super-admin/enatega-deliveries/orders';
import { useTranslations } from 'next-intl';
import {
  formatPaymentMethodLabel,
  formatPaymentStatusLabel,
} from '../../utils';

interface PaymentInformationProps {
  order: OrderDetail;
}

export function PaymentInformation({ order }: PaymentInformationProps) {
  const t = useTranslations('orders.orderDetail.paymentInformation');
  const tPaymentMethods = useTranslations('orders.paymentMethods');
  const tPaymentStatuses = useTranslations('orders.paymentStatuses');
  const { currencySymbol } = useCurrency();
  const currency = currencySymbol || '₡';
  const payment = order.payment as PaymentInfo | null | undefined;
  const hasCommissionSnapshot = payment?.commissionSnapshotAvailable === true;
  const paymentStatus =
    (order?.payment && (order.payment as PaymentInfo).paymentStatus) ||
    order?.paymentMethod ||
    '';
  const hasStripeCharge =
    payment?.stripeChargedAmount != null &&
    Number.isFinite(Number(payment.stripeChargedAmount)) &&
    Number(payment.stripeChargedAmount) > 0;
  const stripeCurrency = payment?.stripeChargedCurrency || 'USD';

  return (
    <div className="border border-sidebar-border p-6 rounded-[12px] bg-white  shadow-sm">
      <Heading title={t('title')} />

      <div className="space-y-4 pt-6">
        {/* Basic Payment Info */}
        <div className="flex justify-between items-center text-[16px]">
          <span className="text-black font-semibold">{t('paymentMethodLabel')}</span>
          <span className="text-mute font-normal">
            {formatPaymentMethodLabel(
              order?.paymentMethod,
              tPaymentMethods,
              t('notAvailable'),
            )}
          </span>
        </div>
        <div className="flex justify-between items-center text-[16px]">
          <span className="text-black font-semibold">{t('paymentStatusLabel')}</span>
          <Status
            status={paymentStatus}
            label={formatPaymentStatusLabel(
              paymentStatus,
              tPaymentStatuses,
              t('notAvailable'),
            )}
          />
        </div>

        <div className="border-t border-sidebar-border my-4" />

        {/* Cost Breakdown */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-[16px]">
            <span className="text-black font-semibold">{t('subtotalLabel')}</span>
            <span className="text-mute font-normal">{formatCurrency(order?.subtotal || 0, currency)}</span>
          </div>
          <div className="flex justify-between items-center text-[16px]">
            <span className="text-black font-semibold">{t('taxesLabel')}</span>
            <span className="text-mute font-normal">{formatCurrency(order?.taxes || 0, currency)}</span>
          </div>
          <div className="flex justify-between items-center text-[16px]">
            <span className="text-black font-semibold">{t('discountsLabel')}</span>
            <span className="text-mute font-normal">
              {order?.discounts !== null && order?.discounts !== undefined
                ? `${order.discounts}%`
                : t('notAvailable')}
            </span>
          </div>
          <div className="flex justify-between items-center text-[16px]">
            <span className="text-black font-semibold">{t('deliveryFeeLabel')}</span>
            <span className="text-mute font-normal">
              {order?.deliveryFee != null ? formatCurrency(order.deliveryFee, currency) : t('notAvailable')}
            </span>
          </div>
          <div className="flex justify-between items-center text-[16px]">
            <span className="text-black font-semibold">{t('riderTipLabel')}</span>
            <span className="text-mute font-normal">
              {order?.riderTip != null ? formatCurrency(order.riderTip, currency) : t('notAvailable')}
            </span>
          </div>
          <div className="rounded-lg border border-sidebar-border bg-gray-50 p-4 space-y-3">
            <div className="text-sm font-semibold text-black">
              {t('riderDeliverySplitTitle')}
            </div>
            <div className="flex justify-between items-start gap-4 text-[15px]">
              <span className="min-w-0 text-mute">{t('riderDeliveryEarningLabel')}</span>
              <span className="shrink-0 font-medium tabular-nums text-black">
                {formatCurrency(order?.riderDeliveryEarning ?? 0, currency)}
              </span>
            </div>
            <div className="flex justify-between items-start gap-4 text-[15px]">
              <span className="min-w-0 text-mute">
                {t('riderPlatformCommissionLabel', {
                  rate: order?.riderCommissionPercentage ?? 0,
                })}
              </span>
              <span className="shrink-0 font-medium tabular-nums text-black">
                {formatCurrency(order?.riderPlatformCommission ?? 0, currency)}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-sidebar-border my-4" />

        {/* Total */}
        <div className="flex justify-between items-center text-[18px]">
          <span className="text-black font-bold">{t('totalAmountLabel')}</span>
          <span className="text-black font-bold tabular-nums">{formatCurrency(order?.amount || 0, currency)}</span>
        </div>
        {hasStripeCharge && (
          <div className="flex items-start justify-between gap-4 rounded-lg bg-blue-50 px-4 py-3 text-[16px]">
            <span className="min-w-0 font-semibold text-black">
              {t('stripeChargeLabel', { currency: stripeCurrency })}
            </span>
            <span className="shrink-0 font-bold tabular-nums text-black">
              {formatCurrency(payment.stripeChargedAmount, '$')}
            </span>
          </div>
        )}

        <div className="border-t border-sidebar-border my-4" />

        {/* Commission Breakdown */}
        <div className="space-y-4">
          <div>
            <div className="text-black font-bold text-[16px]">{t('commissionBreakdownTitle')}</div>
            <div className="text-mute text-sm font-normal mt-1">{t('commissionBreakdownHint')}</div>
          </div>
          <div className="flex justify-between items-center text-[16px]">
            <span className="text-black font-semibold">{t('storeEarningsLabel')}</span>
            <span className="text-mute font-normal">{formatCurrency(order?.storeEarnings || 0, currency)}</span>
          </div>
          {hasCommissionSnapshot ? (
            <>
              <div className="flex justify-between items-start gap-4 text-[16px]">
                <span className="min-w-0 text-black font-semibold">{t('commissionNetLabel')}</span>
                <span className="shrink-0 text-mute font-normal tabular-nums">{formatCurrency(payment?.commissionNet ?? 0, currency)}</span>
              </div>
              <div className="flex justify-between items-start gap-4 text-[16px]">
                <span className="min-w-0 text-black font-semibold">{t(payment?.vatOnCommission === 0 ? 'vatOnCommissionNotChargedLabel' : 'vatOnCommissionLabel')}</span>
                <span className="shrink-0 text-mute font-normal tabular-nums">{formatCurrency(payment?.vatOnCommission ?? 0, currency)}</span>
              </div>
              <div className="flex justify-between items-start gap-4 text-[16px]">
                <span className="min-w-0 text-black font-semibold">{t('totalCommissionDebitLabel')}</span>
                <span className="shrink-0 text-mute font-semibold tabular-nums">{formatCurrency(payment?.totalCommissionDebit ?? order.adminCommission ?? 0, currency)}</span>
              </div>
              {payment?.sippAbsorbedVat != null && payment.sippAbsorbedVat > 0 && (
                <div className="flex justify-between items-start gap-4 text-[16px]">
                  <span className="min-w-0 text-black font-semibold">{t('sippAbsorbedVatLabel')}</span>
                  <span className="shrink-0 text-mute font-normal tabular-nums">{formatCurrency(payment.sippAbsorbedVat, currency)}</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex justify-between items-start gap-4 text-[16px]">
              <span className="min-w-0 text-black font-semibold">{t('adminCommissionLabel')}</span>
              <span className="shrink-0 text-mute font-normal tabular-nums">{formatCurrency(order?.adminCommission ?? 0, currency)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
