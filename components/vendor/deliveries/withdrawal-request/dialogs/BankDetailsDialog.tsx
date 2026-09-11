'use client';

import { Download, FileText, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/lib/formatCurrency';
import { useCurrency } from '@/hooks/use-currency';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import CopyButton from '@/components/shared/CopyButton';
import Status from '@/components/shared/Status';

export interface UniversalWithdrawalRequest {
  requestId: string;
  name: string;
  logo?: string;
  amount: number;
  status: string;
  date: string;
  bankDetails?: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    iban: string;
    branchCode?: string;
    swiftCode?: string;
  };
  notes?: string;
  paymentProof?: string;
  rejectionReason?: string;
}

interface BankDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: UniversalWithdrawalRequest | null;
  nameLabel?: string;
}

function DetailField({
  label,
  value,
  showCopy = false,
}: {
  label: string;
  value: string | React.ReactNode;
  showCopy?: boolean;
}) {
  return (
    <div className="flex items-start justify-between py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {typeof value === 'string' ? (
          <>
            <span className="text-sm font-medium text-right">{value}</span>
            {showCopy && <CopyButton text={value} />}
          </>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

export const BankDetailsDialog = ({
  open,
  onOpenChange,
  request,
  nameLabel,
}: BankDetailsDialogProps) => {
  const t = useTranslations('vendorWithdrawalRequest.bankDetailsDialog');
  const { currencySymbol } = useCurrency();

  if (!request) return null;

  const handleDownload = async () => {
    if (!request?.paymentProof) return;

    const fileName = request.paymentProof.split('/').pop() || 'payment-proof';

    try {
      const res = await fetch(request.paymentProof);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(request.paymentProof, '_blank');
    }
  };

  return (
    <AppDialog
      open={open}
      onClose={() => onOpenChange(false)}
      title={t('title')}
      size="lg"
      showDefaultFooter={false}
    >
      <div className="space-y-4">
        {/* User Icon/Header */}
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Entity Information */}
        <div className="space-y-2">
          <DetailField
            label={nameLabel || t('recipientNameLabel')}
            value={request?.name}
          />
          <DetailField
            label={t('withdrawalAmountLabel')}
            value={formatCurrency(request?.amount, currencySymbol)}
          />
          <DetailField
            label={t('statusLabel')}
            value={<Status status={request?.status.toLowerCase()} />}
          />
        </div>

        {/* Bank Details */}
        {request?.bankDetails && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t('bankDetailsLabel')}</h3>
            <DetailField
              label={t('bankNameLabel')}
              value={request?.bankDetails?.bankName || t('notAvailable')}
              showCopy
            />
            <DetailField
              label={t('ibanLabel')}
              value={request?.bankDetails?.iban || t('notAvailable')}
              showCopy
            />
            <DetailField
              label={t('branchCodeLabel')}
              value={request?.bankDetails?.branchCode || t('notAvailable')}
              showCopy={!!request?.bankDetails?.branchCode}
            />
            <DetailField
              label={t('swiftCodeLabel')}
              value={request?.bankDetails?.swiftCode || t('notAvailable')}
              showCopy={!!request?.bankDetails?.swiftCode}
            />
          </div>
        )}

        {/* Notes */}
        {request?.notes && (
          <DetailField label={t('notesLabel')} value={request?.notes} />
        )}

        {/* Rejection Reason */}
        {request?.status?.toLowerCase() === 'rejected' &&
          request?.rejectionReason && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm font-medium text-destructive mb-1">
                {t('rejectionReasonLabel')}
              </p>
              <p className="text-sm text-destructive/90">
                {request?.rejectionReason}
              </p>
            </div>
          )}

        {/* Payment Proof */}
        {request?.paymentProof && (
          <div>
            <label className="text-[15px] font-medium mb-1.5 block">
              {t('paymentProofLabel')}
            </label>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <FileText className="w-8 h-8 text-red-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {request.paymentProof.split('/').pop()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('fileSizeUnavailable')}
                </p>
              </div>
              <AppButton size="sm" variant="secondary" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </AppButton>
            </div>
          </div>
        )}
      </div>
    </AppDialog>
  );
};
