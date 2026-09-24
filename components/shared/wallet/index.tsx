'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CirclePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ApiErrorResponse, WalletOwnerType } from '@/types';
import {
  useGetWalletSummary,
  useGetWalletTransactions,
  WalletDataSource,
} from '@/hooks/api/super-admin/enatega-deliveries/wallets';
import { returnErrorMessage } from '@/lib/toast-error';
import { AppButton } from '@/components/shared/AppButton';
import DisplayError from '@/components/shared/DisplayError';
import { Heading } from '@/components/shared/Heading';
import { AddWalletTransactionSheet } from './AddWalletTransactionSheet';
import { WalletBalanceCard } from './WalletBalanceCard';
import { WalletTransactionsTable } from './WalletTransactionsTable';

interface WalletPageProps {
  ownerType: WalletOwnerType;
  ownerId: string;
  /** Shows a back arrow that navigates here when provided. */
  backPath?: string;
  source?: WalletDataSource;
  /** Only admins may credit or debit a wallet manually. */
  canAddTransaction?: boolean;
}

export function WalletPage({
  ownerType,
  ownerId,
  backPath,
  source = 'admin',
  canAddTransaction = true,
}: WalletPageProps) {
  const t = useTranslations('wallet');
  const tCard = useTranslations('wallet.balanceCard');
  const tTransactions = useTranslations('wallet.transactions');
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const summaryQuery = useGetWalletSummary(ownerType, ownerId, source);
  const transactionsQuery = useGetWalletTransactions(
    ownerType,
    ownerId,
    source,
  );

  return (
    <div className="space-y-6 pb-8">
      <Heading
        title={t('title')}
        subTitle={t('subtitle')}
        showBackBtn={!!backPath}
        onBack={backPath ? () => router.push(backPath) : undefined}
      />

      {summaryQuery.isError ? (
        <DisplayError
          title={tCard('fetchFailed')}
          message={
            returnErrorMessage(summaryQuery.error as ApiErrorResponse) ||
            tTransactions('tryAgain')
          }
        />
      ) : (
        <WalletBalanceCard
          summary={summaryQuery.data}
          isLoading={summaryQuery.isLoading}
        />
      )}

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Heading
            as="h2"
            size="lg"
            title={tTransactions('title')}
            subTitle={tTransactions('subtitle')}
            titleClassName="text-lg"
          />
          {canAddTransaction && (
            <AppButton
              leftIcon={<CirclePlus size={16} />}
              onClick={() => setIsSheetOpen(true)}
              disabled={!summaryQuery.data}
            >
              {tTransactions('addButton')}
            </AppButton>
          )}
        </div>

        <WalletTransactionsTable
          data={transactionsQuery.data}
          isLoading={transactionsQuery.isLoading}
          isError={transactionsQuery.isError}
          error={transactionsQuery.error}
        />
      </section>

      {canAddTransaction && summaryQuery.data && (
        <AddWalletTransactionSheet
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          ownerType={ownerType}
          ownerId={ownerId}
          balance={summaryQuery.data.balance}
        />
      )}
    </div>
  );
}
