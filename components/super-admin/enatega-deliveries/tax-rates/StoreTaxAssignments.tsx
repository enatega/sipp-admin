'use client';

import { useState } from 'react';
import { ApiErrorResponse } from '@/types';
import { Loader2, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { TaxScope } from '@/types/tax';
import { handleApiError } from '@/lib/toast-error';
import {
  useStoreTaxAssignmentMutation,
  useTaxRates,
  useTaxStoreAssignments,
} from '@/hooks/api/deliveries/tax-rates';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AppPagination from '@/components/shared/AppPagination';
import { TLimitType } from '@/components/shared/TableShimmer';

interface Props {
  scope: TaxScope;
}

export function StoreTaxAssignments({ scope }: Props) {
  const t = useTranslations('taxRates');
  const [search, setSearch] = useState('');
  const [taxRateId, setTaxRateId] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<TLimitType>(10);
  const [draftAssignments, setDraftAssignments] = useState<
    Record<string, string>
  >({});
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const stores = useTaxStoreAssignments({
    scope,
    page,
    limit,
    search: debouncedSearch || undefined,
    taxRateId: taxRateId || undefined,
  });
  const rates = useTaxRates(scope, true);
  const update = useStoreTaxAssignmentMutation();

  const activeRates = (rates.data ?? []).filter((rate) => rate.isActive);
  const isLoading = stores.isPending || rates.isPending;
  const isError = stores.isError || rates.isError;
  const items = stores.data?.items ?? [];
  const total = stores.data?.total ?? 0;
  const modeTotal = stores.data?.modeTotal ?? 0;
  const totalPages = Math.max(1, stores.data?.totalPages ?? 1);
  const hasFilters = Boolean(debouncedSearch || taxRateId);

  function statusLabel(status: string) {
    switch (status.toLowerCase()) {
      case 'approved':
        return t('storeStatusApproved');
      case 'pending':
        return t('storeStatusPending');
      case 'rejected':
        return t('storeStatusRejected');
      default:
        return t('storeStatusUnknown');
    }
  }

  async function updateAssignment(storeId: string, taxRateId: string) {
    if (!taxRateId) return;
    try {
      await update.mutateAsync({ storeId, scope, taxRateId });
      setDraftAssignments((current) => {
        const next = { ...current };
        delete next[storeId];
        return next;
      });
      toast.success(t('storeTaxSaved'));
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  }

  return (
    <section className="space-y-4 pt-4" aria-labelledby="store-tax-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2
            id="store-tax-heading"
            className="flex flex-wrap items-baseline gap-2 text-xl font-semibold"
          >
            <span>
              {scope === 'store'
                ? t('mainTaxStoresTitle')
                : t('productTaxStoresTitle')}
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              {t('storeCount', { count: modeTotal })}
            </span>
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            {scope === 'store'
              ? t('mainTaxStoresHelp')
              : t('productTaxStoresHelp')}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <label className="relative block w-full sm:w-72">
            <span className="sr-only">{t('searchStores')}</span>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              className="pl-9"
              type="search"
              value={search}
              placeholder={t('searchStores')}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
                setDraftAssignments({});
              }}
            />
          </label>
          <label className="block w-full sm:w-64">
            <span className="sr-only">{t('filterByTax')}</span>
            <select
              aria-label={t('filterByTax')}
              className="min-h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={taxRateId}
              onChange={(event) => {
                setTaxRateId(event.target.value);
                setPage(1);
                setDraftAssignments({});
              }}
            >
              <option value="">{t('allTaxRates')}</option>
              {(rates.data ?? []).map((rate) => (
                <option key={rate.id} value={rate.id}>
                  {rate.name} ({Number(rate.rate).toFixed(2)}%)
                  {!rate.isActive ? ` — ${t('inactive')}` : ''}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {hasFilters && !isLoading && !isError ? (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {t('matchingStoreCount', { count: total })}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader className="bg-accent">
            <TableRow>
              <TableHead>{t('storeName')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>
                {scope === 'store'
                  ? t('appliedMainTax')
                  : t('defaultProductTax')}
              </TableHead>
              <TableHead className="w-32">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <span
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                    role="status"
                  >
                    <Loader2
                      aria-hidden="true"
                      className="size-4 animate-spin"
                    />
                    {t('loadingStores')}
                  </span>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <div role="alert" className="space-y-2 text-destructive">
                    <p>{t('storeLoadError')}</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        void stores.refetch();
                        void rates.refetch();
                      }}
                    >
                      {t('retry')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center">
                  <p className="font-medium">
                    {hasFilters
                      ? t('noStoreSearchResults')
                      : t('noStoresInMode')}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {hasFilters
                      ? t('tryAnotherStoreFilter')
                      : scope === 'store'
                        ? t('noMainTaxStoresHelp')
                        : t('noProductTaxStoresHelp')}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              items.map((store) => {
                const isUpdating =
                  update.isPending && update.variables?.storeId === store.id;
                const currentTaxRateId = store.taxRate?.id ?? '';
                const selectedTaxRateId =
                  draftAssignments[store.id] ?? currentTaxRateId;
                const hasPendingChange = selectedTaxRateId !== currentTaxRateId;
                const choices = store.taxRate?.isActive
                  ? activeRates
                  : [
                      ...(store.taxRate ? [store.taxRate] : []),
                      ...activeRates.filter(
                        (rate) => rate.id !== store.taxRate?.id,
                      ),
                    ];
                return (
                  <TableRow key={store.id}>
                    <TableCell className="max-w-72 font-medium">
                      <span className="block truncate" title={store.name}>
                        {store.name}
                      </span>
                    </TableCell>
                    <TableCell>{statusLabel(store.status)}</TableCell>
                    <TableCell className="min-w-72">
                      <div className="flex items-center gap-2">
                        <select
                          aria-label={t('taxForStore', { name: store.name })}
                          className="min-h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-60"
                          disabled={isUpdating || choices.length === 0}
                          value={selectedTaxRateId}
                          onChange={(event) =>
                            setDraftAssignments((current) => ({
                              ...current,
                              [store.id]: event.target.value,
                            }))
                          }
                        >
                          <option value="" disabled>
                            {t('selectRate')}
                          </option>
                          {choices.map((rate) => (
                            <option key={rate.id} value={rate.id}>
                              {rate.name} ({Number(rate.rate).toFixed(2)}%)
                              {!rate.isActive ? ` — ${t('inactive')}` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        className="min-w-24"
                        disabled={!hasPendingChange || update.isPending}
                        onClick={() =>
                          void updateAssignment(store.id, selectedTaxRateId)
                        }
                      >
                        {isUpdating ? (
                          <>
                            <Loader2
                              aria-hidden="true"
                              className="size-4 animate-spin"
                            />
                            {t('saving')}
                          </>
                        ) : (
                          t('updateTax')
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        {!isLoading && !isError && modeTotal > 0 ? (
          <div className="border-t bg-accent/30 p-3">
            <AppPagination
              page={Math.min(page, totalPages)}
              totalPages={totalPages}
              totalData={total}
              defaultLimit={limit}
              onPageChange={(nextPage) => {
                setPage(nextPage);
                setDraftAssignments({});
              }}
              onLimitChange={(nextLimit) => {
                setLimit(nextLimit);
                setPage(1);
                setDraftAssignments({});
              }}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
