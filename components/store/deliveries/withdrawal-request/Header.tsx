'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { PlusIcon } from 'lucide-react';
import {
  useCreateStoreWithdrawalRequest,
  useGetStoreBankDetails,
} from '@/hooks/api/store/deliveries/wallet/withdrawal-request';
import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';
import { CreateWithdrawalRequest } from '@/components/vendor/deliveries/withdrawal-request/create-withdrawal-request';
import { GetStoreWalletSummaryResponse } from '@/types';

interface HeaderProps {
  walletSummary?: GetStoreWalletSummaryResponse;
  isWalletLoading: boolean;
  canCreate: boolean;
}

export function Header({
  walletSummary,
  isWalletLoading,
  canCreate,
}: HeaderProps) {
  const t = useTranslations('withdrawalRequests');
  const tVendor = useTranslations('vendorWithdrawalRequest');
  const tTable = useTranslations('withdrawalRequests.table');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { storeId } = useParams();
  const storeIdStr = storeId as string;

  const { data: bankDetailsResponse, isLoading: isBankDetailsLoading } =
    useGetStoreBankDetails(storeIdStr, {
      enabled: canCreate && isCreateOpen && Boolean(storeIdStr),
    });

  const { mutateAsync: createStoreWithdrawRequest, isPending: isCreating } =
    useCreateStoreWithdrawalRequest(storeIdStr);

  const firstBankDetail = bankDetailsResponse?.bank_details?.[0];
  const mappedBankDetail = firstBankDetail
    ? {
        bank_id: firstBankDetail.id,
        bank_name: firstBankDetail.bank_name,
        account_title: firstBankDetail.account_title,
        account_number: firstBankDetail.account_number,
        account_code: firstBankDetail.account_code,
      }
    : null;

  const handleCreateRequest = async (payload: {
    withdrawal_amount: number;
    bank_id: string;
    additional_notes?: string;
  }) => {
    await createStoreWithdrawRequest(payload);
  };

  return (
    <div className="flex items-center justify-between">
      <Heading title={t('title')} showBackBtn />
      {canCreate && (
        <>
          <AppButton
            variant="primary"
            leftIcon={<PlusIcon />}
            onClick={() => setIsCreateOpen(true)}
            disabled={
              isWalletLoading ||
              !walletSummary ||
              walletSummary.available_to_withdraw <= 0
            }
          >
            {tVendor('createButton')}
          </AppButton>

          <CreateWithdrawalRequest
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            showStoreSelection={false}
            maxWithdrawalAmount={walletSummary?.available_to_withdraw ?? 0}
            storeLabel={tTable('storeName')}
            storeUserId={storeIdStr}
            externalBankDetails={mappedBankDetail}
            externalBankDetailsLoading={isBankDetailsLoading}
            externalCreateRequest={handleCreateRequest}
            externalIsCreating={isCreating}
          />
        </>
      )}
    </div>
  );
}
