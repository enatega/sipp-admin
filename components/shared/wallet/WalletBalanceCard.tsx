'use client';

import { Wallet } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { WalletSummary } from '@/types';
import { useCurrency } from '@/hooks/use-currency';
import { resolveCurrencySymbol } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';

interface WalletBalanceCardProps {
  summary?: WalletSummary;
  isLoading?: boolean;
  className?: string;
}

export function WalletBalanceCard({
  summary,
  isLoading,
  className,
}: WalletBalanceCardProps) {
  const t = useTranslations('wallet.balanceCard');
  const tOwners = useTranslations('wallet.owners');
  const { currencyCode, currencySymbol } = useCurrency();

  return (
    <section
      aria-label={t('availableBalance')}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white shadow-lg',
        'bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_58%,black)_0%,color-mix(in_oklab,var(--primary)_82%,black)_100%)]',
        className,
      )}
    >
      {/* Decorative rings */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full border-[28px] border-white/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 right-24 size-48 rounded-full bg-white/5"
      />

      <div className="relative flex items-start justify-between gap-6">
        <div className="min-w-0 space-y-3">
          <span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            {summary
              ? t('walletOf', {
                  owner: tOwners(summary.owner_type),
                })
              : t('walletLabel')}
            {summary?.owner_name && (
              <span className="truncate opacity-80">
                · {summary.owner_name}
              </span>
            )}
          </span>

          <div>
            <p className="text-sm text-white/80">
              {t('availableBalance')}
            </p>
            {isLoading ? (
              <div className="mt-2 h-10 w-48 animate-pulse rounded-lg bg-white/20" />
            ) : (
              <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
                {resolveCurrencySymbol(currencySymbol)}{' '}
                {Number(summary?.balance ?? 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            )}
          </div>

          <p className="text-xs text-white/70">
            {summary?.updated_at
              ? t('lastUpdated', {
                  date: moment(summary.updated_at).format('DD MMM YYYY, hh:mm A'),
                })
              : !isLoading && summary && !summary.wallet_id
                ? t('noWallet')
                : currencyCode}
          </p>
        </div>

        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm sm:size-16">
          <Wallet className="size-7 sm:size-8" strokeWidth={1.75} />
        </div>
      </div>
    </section>
  );
}
