'use client';

import * as React from 'react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Wallet } from 'lucide-react';
import { ApiErrorResponse, StorePayoutRequest } from '@/types';
import { useGetStoreWalletSummary, useGetStoreWithdrawRequests } from '@/hooks/api/store/deliveries/wallet/withdrawal-request';
import { useCurrency } from '@/hooks/use-currency';
import { Skeleton } from '@/components/ui/skeleton';
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
  const tWallet = useTranslations('withdrawalRequests.wallet');
  const { currencySymbol } = useCurrency();
  const [open, setOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<UniversalWithdrawalRequest | null>(null);

  const handleViewDetails = (request: StorePayoutRequest) => {
    setSelectedRequest(toUniversalRequest(request));
    setOpen(true);
  };

  const { storeId } = useParams();
  const storeIdStr = storeId as string;

  const {
    data: walletSummary,
    isLoading: isWalletLoading,
  } = useGetStoreWalletSummary(storeIdStr);

  const {
    data: storeWithdrawRequestData,
    isLoading,
    isError,
    error,
  } = useGetStoreWithdrawRequests(storeIdStr);

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
      <Header
        walletSummary={walletSummary}
        isWalletLoading={isWalletLoading}
      />
      {isWalletLoading ? (
        <Skeleton className="h-28 w-full rounded-lg" />
      ) : (
        <section className="rounded-lg border bg-white p-4" aria-label={tWallet('summaryLabel')}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gray-100 p-2.5">
                <Wallet className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{tWallet('balance')}</p>
                <p className="text-2xl font-bold">
                  {currencySymbol} {(walletSummary?.current_balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">{tWallet('available')}</p>
                <p className="font-semibold">
                  {currencySymbol} {(walletSummary?.available_to_withdraw ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">{tWallet('pending')}</p>
                <p className="font-semibold">
                  {currencySymbol} {(walletSummary?.pending_withdrawal_amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
          {walletSummary?.has_pending_request && (
            <p className="mt-3 text-sm text-muted-foreground">
              {tWallet('pendingNotice')}
            </p>
          )}
        </section>
      )}
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
