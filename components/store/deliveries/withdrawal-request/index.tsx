'use client';

import * as React from 'react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { ApiErrorResponse, StorePayoutRequest } from '@/types';
import { useGetStoreWithdrawRequests } from '@/hooks/api/store/deliveries/wallet/withdrawal-request';
import { useSyncedTab, type TabDef } from '@/hooks/use-synced-tabs';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import ScrollableTabsNav from '@/components/shared/ScrollableTabsNav';
import {
  BankDetailsDialog,
  type UniversalWithdrawalRequest,
} from '@/components/vendor/deliveries/withdrawal-request/dialogs/BankDetailsDialog';
import { Filters } from './Filters';
import { Header } from './Header';
import { StoreWithdrawalRequestTable } from './table';

/** Map API's StorePayoutRequest to the BankDetailsDialog's expected shape */
function toUniversalRequest(
  req: StorePayoutRequest,
): UniversalWithdrawalRequest {
  return {
    requestId: req.request_id,
    name: req.store_name,
    amount: req.requested_amount,
    status: req.status,
    date: req.request_date,
    bankDetails: req.bank_details
      ? {
          accountHolder: req.bank_details.bank_title,
          bankName: req.bank_details.bank_name,
          accountNumber: req.bank_details.account_no,
          iban: req.bank_details.iban,
          branchCode: req.bank_details.branch_code,
        }
      : undefined,
    notes: req.additional_notes ?? undefined,
    paymentProof: req.payment_proof ?? undefined,
    rejectionReason: req.rejection_reason ?? undefined,
  };
}

export function StoreWithdrawalRequest() {
  const tTabs = useTranslations('withdrawalRequests.tabs');
  const tCommon = useTranslations('common');
  const tTable = useTranslations('withdrawalRequests.table');
  const [open, setOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<UniversalWithdrawalRequest | null>(null);

  const handleViewDetails = (request: StorePayoutRequest) => {
    setSelectedRequest(toUniversalRequest(request));
    setOpen(true);
  };

  const { storeId } = useParams();

  const {
    data: storeWithdrawRequestData,
    isLoading,
    isError,
    error,
  } = useGetStoreWithdrawRequests(storeId as string);

  const TAB_DEFS: TabDef[] = [
    { value: 'all', label: tTabs('all') },
    { value: 'pending', label: tTabs('pending') },
    { value: 'approved', label: tTabs('approved') },
    { value: 'rejected', label: tTabs('rejected') },
  ];

  const { active, setActive, tabs } = useSyncedTab(TAB_DEFS, {
    defaultValue: 'all',
    paramName: 'status',
    mode: 'url-only',
    syncParamsOnChange: { page: '1' },
  });

  return (
    <div className="space-y-7">
      <Header />
      <div>
        <Tabs value={active} onValueChange={setActive}>
          <ScrollableTabsNav
            tabs={tabs}
            value={active}
            onChange={setActive}
            className="mb-4"
          />
          <Filters />
          <TabsContent value={active}>
            <React.Suspense fallback={<div className="p-4">{tCommon('loading')}</div>}>
              <StoreWithdrawalRequestTable
                requests={storeWithdrawRequestData?.data || []}
                isLoading={isLoading}
                isError={isError}
                error={error as ApiErrorResponse | null}
                pagination={{
                  total: storeWithdrawRequestData?.total || 0,
                  page: storeWithdrawRequestData?.page || 1,
                  limit: storeWithdrawRequestData?.limit || 10,
                  totalPages: storeWithdrawRequestData?.totalPages || 1,
                }}
                onViewDetails={handleViewDetails}
              />
            </React.Suspense>
          </TabsContent>
        </Tabs>
      </div>

      <BankDetailsDialog
        open={open}
        onOpenChange={setOpen}
        request={selectedRequest}
        nameLabel={tTable('storeName')}
      />
    </div>
  );
}
