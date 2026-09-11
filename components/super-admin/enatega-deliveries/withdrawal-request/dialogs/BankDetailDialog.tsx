'use client';

import React from 'react';
import {
  RiderWithdrawalRequest,
  StoreWithdrawalRequest,
  VendorWithdrawalRequest,
} from '@/types';
import { Building2, CreditCard, DollarSign, Hash, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCurrency } from '@/hooks/use-currency';
import { AppDialog } from '@/components/shared/AppDialog';
import CopyButton from '@/components/shared/CopyButton';
import { ImagePreview } from '@/components/shared/ImagePreview';

interface BankDetailsDialogProps {
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
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  showCopy?: boolean;
}) {
  return (
    <div className="group relative bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-4 h-4 text-gray-400" />
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {label}
            </p>
          </div>
          <p className="text-base font-semibold text-gray-900 break-all">
            {value}
          </p>
        </div>
        {showCopy && (
          <div className="flex-shrink-0">
            <CopyButton text={value} />
          </div>
        )}
      </div>
    </div>
  );
}

export function BankDetailsDialog({
  open,
  onOpenChange,
  withdrawRequest,
}: BankDetailsDialogProps) {
  const t = useTranslations('withdrawalRequests.bankDetailsDialog');
  const { currencySymbol } = useCurrency();
  const bankDetails = withdrawRequest?.bank_details;
  const notAvailable = t('notAvailable');

  return (
    <AppDialog
      open={open}
      onClose={() => onOpenChange(false)}
      title={t('title')}
      size="3xl"
    >
      <div className="space-y-6">
        <div className=" rounded-xl p-6 border bg-white">
          <div className="flex items-center gap-3 mb-1 ">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center border">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">{t('accountHolder')}</p>
              <p className="text-xl font-bold">
                {bankDetails?.bank_title ?? notAvailable}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailField
            icon={Building2}
            label={t('bankName')}
            value={bankDetails?.bank_name ?? notAvailable}
            showCopy={true}
          />
          <DetailField
            icon={CreditCard}
            label={t('accountNo')}
            value={bankDetails?.account_no ?? notAvailable}
            showCopy={true}
          />
          <DetailField
            icon={Hash}
            label={t('iban')}
            value={bankDetails?.iban ?? notAvailable}
            showCopy={true}
          />
          <DetailField
            icon={DollarSign}
            label={t('withdrawAmount')}
            value={
              withdrawRequest?.requested_amount
                ? `${currencySymbol || '$'} ${withdrawRequest?.requested_amount}`
                : notAvailable
            }
            showCopy={true}
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <ImagePreview
            label={t('paymentProof')}
            image={withdrawRequest?.payment_proof || ''}
          />
        </div>
      </div>
    </AppDialog>
  );
}
