'use client';

import React from 'react';
import {
  Building2,
  Calendar,
  Copy,
  CreditCard,
  DollarSign,
  Hash,
  TriangleAlert,
  User,
} from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import {
  RiderWithdrawalRequest,
  StoreWithdrawalRequest,
  VendorWithdrawalRequest,
} from '@/types/entities/super-admin/enatega-deliveries/withdrawal-request';
import { useCurrency } from '@/hooks/use-currency';
import { AppDialog } from '@/components/shared/AppDialog';
import CopyButton from '@/components/shared/CopyButton';
import Status from '@/components/shared/Status';

interface VendorWithdrawalDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  withdrawRequest:
    | VendorWithdrawalRequest
    | StoreWithdrawalRequest
    | RiderWithdrawalRequest;
}

function DetailField({
  icon: Icon,
  label,
  value,
  showCopy = false,
  children,
}: {
  icon?: React.ElementType;
  label: string;
  value?: string | React.ReactNode;
  showCopy?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="group relative bg-white rounded-lg p-4 border border-gray-200 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {Icon && <Icon className="w-4 h-4 text-gray-400" />}
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {label}
            </p>
          </div>
          {children ? (
            children
          ) : (
            <p className="text-base font-semibold text-gray-900 break-all">
              {value}
            </p>
          )}
        </div>
        {showCopy && typeof value === 'string' && (
          <div className="flex-shrink-0">
            <CopyButton text={value} />
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-5 first:mt-0">
      {title}
    </h3>
  );
}

export function WithdrawalDetailsDialog({
  open,
  onOpenChange,
  withdrawRequest,
}: VendorWithdrawalDetailsDialogProps) {
  const t = useTranslations('withdrawalRequests.detailsDialog');
  const { currencySymbol } = useCurrency();
  const bankDetails = withdrawRequest?.bank_details;
  const notAvailable = t('notAvailable');

  return (
    <AppDialog
      open={open}
      onClose={() => onOpenChange(false)}
      title={`${t('title')} #${withdrawRequest?.request_id?.slice(0, 8)}`}
      size="3xl"
    >
      <div className="space-y-2">
        {withdrawRequest?.status?.toLowerCase() === 'rejected' &&
          withdrawRequest?.rejection_reason && (
            <div
              className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 shadow-sm"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100">
                  <TriangleAlert className="h-5 w-5 text-rose-600" />
                </span>

                <div className="flex-1">
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-rose-900">
                      {t('rejectionReason')}
                    </h4>
                  </div>

                  <p className="whitespace-pre-wrap break-words text-sm text-rose-900/90">
                    {withdrawRequest?.rejection_reason}
                  </p>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        navigator?.clipboard?.writeText(
                          withdrawRequest?.rejection_reason || '',
                        );
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 active:scale-[0.99]"
                      title={t('copyReason')}
                    >
                      <Copy className="h-4 w-4" />
                      {t('copy')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        <SectionTitle title={t('requestSummary')} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DetailField
            label={t('amount')}
            value={
              withdrawRequest?.requested_amount != null
                ? `${currencySymbol} ${withdrawRequest.requested_amount}`
                : notAvailable
            }
            icon={DollarSign}
          />
          <DetailField label={t('status')}>
            <Status status={withdrawRequest?.status?.toLowerCase()} />
          </DetailField>
        </div>

        <SectionTitle title={t('information')} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailField
            icon={User}
            label={
              'rider_name' in withdrawRequest
                ? t('riderName')
                : 'store_name' in withdrawRequest
                  ? t('storeName')
                  : t('vendorName')
            }
            value={
              'rider_name' in withdrawRequest
                ? (withdrawRequest as RiderWithdrawalRequest).rider_name
                : 'store_name' in withdrawRequest
                  ? (withdrawRequest as StoreWithdrawalRequest).store_name
                  : (withdrawRequest as VendorWithdrawalRequest).vendor_name ||
                    notAvailable
            }
          />
          <DetailField
            icon={Calendar}
            label={t('requestDate')}
            value={
              withdrawRequest?.request_date &&
              moment(withdrawRequest.request_date).isValid()
                ? moment(withdrawRequest.request_date).format(
                    'DD MMM YYYY, hh:mm A',
                  )
                : notAvailable
            }
          />
        </div>

        <SectionTitle title={t('bankAccountDetails')} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailField
            icon={User}
            label={t('accountHolder')}
            value={bankDetails?.bank_title ?? notAvailable}
            showCopy
          />
          <DetailField
            icon={Building2}
            label={t('bankName')}
            value={bankDetails?.bank_name ?? notAvailable}
            showCopy
          />
          <DetailField
            icon={CreditCard}
            label={t('accountNo')}
            value={bankDetails?.account_no ?? notAvailable}
            showCopy
          />
          <DetailField
            icon={Hash}
            label={t('iban')}
            value={bankDetails?.iban ?? notAvailable}
            showCopy
          />
        </div>
      </div>
    </AppDialog>
  );
}
