'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGetVendorStoreWithdrawRequests } from '@/hooks/api/vendor/deliveries/withdraw-requests';
import { Heading } from '@/components/shared/Heading';
import { CreateWithdrawalRequest } from './create-withdrawal-request';
import { ApproveWithdrawalDialog } from './dialogs/ApproveWithdrawalDialog';
import { BankDetailsDialog } from './dialogs/BankDetailsDialog';
import { RejectWithdrawalDialog } from './dialogs/RejectWithdrawalDialog';
import VendorWithdrawalRequestsTable from './table';
import { VendorWithdrawalRequest } from './types';

type DialogState = {
  type: 'create' | 'view' | 'approve' | 'reject' | null;
  request: VendorWithdrawalRequest | null;
  isProcessing: boolean;
};

export const VendorWithdrawalRequestComponent = () => {
  const t = useTranslations('vendorWithdrawalRequest');
  const tBankDetailsDialog = useTranslations(
    'vendorWithdrawalRequest.bankDetailsDialog',
  );
  const { data, isLoading, isError } = useGetVendorStoreWithdrawRequests();
  const requestsData = data?.data ?? [];

  const requests: VendorWithdrawalRequest[] = requestsData.map((item) => ({
    requestId: item.request_id,
    storeId: item.bank_details?.bank_id ?? '',
    name: item.store_name,
    amount: item.amount,
    status: item.status,
    date: item.date_time,
    notes: item.notes || undefined,
    paymentProof: item.payment_proof || undefined,
    bankDetails: {
      accountHolder: item.bank_details?.account_title ?? '',
      bankName: item.bank_details?.bank_name ?? '',
      accountNumber: item.bank_details?.account_number ?? '',
      iban: item.bank_details?.iban ?? '',
      branchCode: item.bank_details?.account_code ?? '',
    },
  }));

  const pagination = {
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? 10,
    totalPages: data?.totalPages ?? 0,
  };

  // Consolidated dialog state
  const [dialogState, setDialogState] = useState<DialogState>({
    type: null,
    request: null,
    isProcessing: false,
  });

  // Helper functions to manage dialog state
  const openDialog = (
    type: DialogState['type'],
    request?: VendorWithdrawalRequest,
  ) => {
    setDialogState({ type, request: request || null, isProcessing: false });
  };

  const closeDialog = () => {
    setDialogState({ type: null, request: null, isProcessing: false });
  };

  return (
    <div className="space-y-6">
      <Heading title={t('title')} />

      {/* Withdrawal Requests Table */}
      <VendorWithdrawalRequestsTable
        requests={requests}
        pagination={pagination}
        isLoading={isLoading}
        isError={isError}
        onViewDetails={(request) => openDialog('view', request)}
        onCreateWithdrawal={() => openDialog('create')}
        onApprove={(request) => openDialog('approve', request)}
        onReject={(request) => openDialog('reject', request)}
      />

      {/* Create Withdrawal Request */}
      <CreateWithdrawalRequest
        open={dialogState.type === 'create'}
        onOpenChange={(open) => (open ? openDialog('create') : closeDialog())}
        maxWithdrawalAmount={800}
      />

      {/* Bank Details Dialog */}
      {dialogState.type === 'view' && dialogState.request && (
        <BankDetailsDialog
          open={dialogState.type === 'view'}
          onOpenChange={(open) => open ? openDialog('view', dialogState.request!) : closeDialog()
          }
          request={dialogState.request}
          nameLabel={tBankDetailsDialog('storeNameLabel')}
        />
      )}

      {/* Approve Dialog */}
      <ApproveWithdrawalDialog
        open={dialogState.type === 'approve'}
        onOpenChange={(open) => open ? openDialog('approve', dialogState.request!) : closeDialog()
        }
        onConfirm={() => {}}
        request={dialogState.request}
        isLoading={dialogState.isProcessing}
      />

      {/* Reject Dialog */}
      <RejectWithdrawalDialog
        open={dialogState.type === 'reject'}
        onOpenChange={(open) => open ? openDialog('reject', dialogState.request!) : closeDialog()
        }
        request={dialogState.request}
        onConfirm={() => {}}
        isLoading={dialogState.isProcessing}
      />
    </div>
  );
};
