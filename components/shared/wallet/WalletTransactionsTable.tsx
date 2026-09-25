'use client';

import Link from 'next/link';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  Minus,
  Plus,
} from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import {
  ApiErrorResponse,
  GetWalletTransactionsResponse,
  WalletTransaction,
} from '@/types';
import { useCurrency } from '@/hooks/use-currency';
import { returnErrorMessage } from '@/lib/toast-error';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AppPagination from '@/components/shared/AppPagination';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';

interface WalletTransactionsTableProps {
  data?: GetWalletTransactionsResponse;
  isLoading: boolean;
  isError: boolean;
  error: ApiErrorResponse | null;
  getOrderHref: (orderId: string) => string;
}

export function WalletTransactionsTable({
  data,
  isLoading,
  isError,
  error,
  getOrderHref,
}: WalletTransactionsTableProps) {
  const t = useTranslations('wallet.transactions');
  const tColumns = useTranslations('wallet.transactions.columns');
  const tEntryTypes = useTranslations('wallet.entryTypes');
  const tTypes = useTranslations('wallet.types');
  const { formatCurrency } = useCurrency();
  const transactions = data?.data ?? [];

  const describe = (transaction: WalletTransaction) => {
    if (transaction.description) return transaction.description;
    if (transaction.entry_type && tEntryTypes.has(transaction.entry_type)) {
      return tEntryTypes(transaction.entry_type);
    }
    return tTypes.has(transaction.type)
      ? tTypes(transaction.type)
      : tTypes(transaction.direction);
  };

  return (
    <div className="rounded-md border overflow-auto">
      <Table className="min-w-[560px]">
        <TableHeader className="bg-accent">
          <TableRow>
            <TableHead className="pl-4">
              {tColumns('description')}
            </TableHead>
            <TableHead className="pr-4 text-right">
              {tColumns('transaction')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableShimmer limit={(data?.limit || 10) as TLimitType} columns={2} />
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={2} className="p-4">
                <DisplayError
                  title={t('fetchFailed')}
                  message={
                    returnErrorMessage(error as ApiErrorResponse) ||
                    t('tryAgain')
                  }
                />
              </TableCell>
            </TableRow>
          ) : transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="p-4">
                <NoDataFound
                  title={t('emptyTitle')}
                  subtitle={t('emptySubtitle')}
                />
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => {
              const isCredit = transaction.direction === 'credit';
              const DirectionIcon = isCredit ? ArrowDownLeft : ArrowUpRight;
              const SignIcon = isCredit ? Plus : Minus;

              return (
                <TableRow key={transaction.transaction_id} className="h-[68px]">
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <span
                        aria-label={
                          isCredit
                            ? t('incoming')
                            : t('outgoing')
                        }
                        className={cn(
                          'flex size-9 shrink-0 items-center justify-center rounded-full',
                          isCredit
                            ? 'bg-help-green/10 text-help-green'
                            : 'bg-help-red/10 text-help-red',
                        )}
                      >
                        <DirectionIcon className="size-[18px]" />
                      </span>
                      <div className="min-w-0">
                        <p className="max-w-[420px] truncate font-medium">
                          {describe(transaction)}
                        </p>
                        <p className="text-sm text-mute">
                          {moment(transaction.created_at).format(
                            'DD MMM YYYY, hh:mm A',
                          )}
                        </p>
                        {transaction.entry_type === 'order_sale' &&
                          transaction.order_id && (
                            <Link
                              href={getOrderHref(transaction.order_id)}
                              className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                              {t('viewOrder')}
                              <ExternalLink className="size-3.5" aria-hidden="true" />
                            </Link>
                          )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <p
                      className={cn(
                        'inline-flex items-center gap-0.5 font-semibold tabular-nums',
                        isCredit ? 'text-help-green' : 'text-help-red',
                      )}
                    >
                      <SignIcon className="size-3.5" strokeWidth={3} />
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-mute tabular-nums">
                      {t('balanceAfter', {
                        amount: formatCurrency(transaction.balance_after),
                      })}
                    </p>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      {!isError && !isLoading && transactions.length > 0 && (
        <div className="p-3 bg-accent/30 border-t rounded-b-md">
          <AppPagination
            page={data?.page || 1}
            totalPages={data?.totalPages || 1}
            totalData={data?.total || 0}
            defaultLimit={(data?.limit || 10) as TLimitType}
          />
        </div>
      )}
    </div>
  );
}
