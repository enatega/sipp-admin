'use client';

import { DEFAULT_CURRENCY } from '@/constants/currency.constants';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Coupon } from '@/types';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { ApiErrorResponse } from '@/types/api/common';
import { formatCurrency, resolveCurrencySymbol } from '@/lib/formatCurrency';
import { buildScopedDeliveriesAdminPathFromCurrent } from '@/lib/routes';
import { getStorePath } from '@/lib/store';
import { returnErrorMessage } from '@/lib/toast-error';
import { useCurrency } from '@/hooks/use-currency';
import { useGetCouponUsage } from '@/hooks/api/super-admin/enatega-deliveries/discount-offers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';
import CopyButton from '@/components/shared/CopyButton';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import Status from '@/components/shared/Status';
import { formatOrderStatusLabel } from '@/components/super-admin/enatega-deliveries/orders/utils';

const ORDERS_PAGE_SIZE = 10;

type UsageTab = 'customers' | 'orders';

interface CouponUsageModalProps {
  coupon: Coupon | null;
  onClose: () => void;
  /** Store panel: uses the store endpoint and links to the store's orders. */
  storeId?: string;
}

export function CouponUsageModal({
  coupon,
  onClose,
  storeId,
}: CouponUsageModalProps) {
  const t = useTranslations('lumiFood.discountsOffers.usage');
  const tTabs = useTranslations('lumiFood.discountsOffers.tabs');
  const tStatuses = useTranslations('orders.statuses');
  const router = useRouter();
  const pathname = usePathname();
  const { currencySymbol } = useCurrency();
  const symbol = resolveCurrencySymbol(
    currencySymbol || DEFAULT_CURRENCY.symbol,
  );
  const isStore = Boolean(storeId);

  const [activeTab, setActiveTab] = useState<UsageTab>('customers');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, isFetching } = useGetCouponUsage(
    coupon?.id ?? null,
    { isStore, page, limit: ORDERS_PAGE_SIZE },
  );

  const handleOpenChange = (open: boolean) => {
    if (open) return;
    setActiveTab('customers');
    setPage(1);
    onClose();
  };

  const openOrder = (orderId: string) => {
    handleOpenChange(false);
    router.push(
      isStore
        ? getStorePath(storeId, `/orders/${orderId}`)
        : buildScopedDeliveriesAdminPathFromCurrent(
            pathname,
            `/enatega-deliveries/orders/${orderId}`,
          ),
    );
  };

  const summary = data?.summary;
  const totalLimit = data?.coupon.total_usage_limit ?? 0;
  const perUserLimit = data?.coupon.usage_per_user ?? 0;
  const orders = data?.orders;
  const customers = data?.customers ?? [];

  const statusKey = summary?.limit_reached
    ? 'limit_reached'
    : (data?.coupon.status ?? coupon?.status);
  const statusLabel = summary?.limit_reached
    ? t('limitReached')
    : statusKey === 'active'
      ? tTabs('active')
      : statusKey === 'inactive'
        ? tTabs('inactive')
        : statusKey === 'expired'
          ? tTabs('expired')
          : undefined;

  const summaryCards = [
    {
      label: t('used'),
      value:
        totalLimit > 0
          ? t('usedOfLimit', { used: summary?.used_count ?? 0, limit: totalLimit })
          : String(summary?.used_count ?? 0),
    },
    {
      label: t('remaining'),
      value:
        summary?.remaining === null || summary?.remaining === undefined
          ? t('unlimited')
          : String(summary.remaining),
    },
    { label: t('customers'), value: String(summary?.unique_customers ?? 0) },
    {
      label: t('totalDiscount'),
      value: formatCurrency(summary?.total_discount ?? 0, symbol),
    },
  ];

  return (
    <Dialog open={!!coupon} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[860px] max-h-[90vh] p-0 overflow-hidden gap-0 border-none flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3 flex-wrap pr-8">
            <DialogTitle className="text-xl font-semibold text-black">
              {t('title')}
            </DialogTitle>
            {coupon && (
              <span className="inline-flex items-center gap-1 rounded-md border bg-accent/50 px-2 py-0.5 text-sm font-medium text-black">
                {coupon.code}
                <CopyButton text={coupon.code} />
              </span>
            )}
            {statusKey && !isLoading && (
              <Status status={statusKey} label={statusLabel} />
            )}
          </div>
          <DialogDescription className="text-mute text-sm">
            {coupon?.title}
            {perUserLimit > 0 && (
              <>
                {' · '}
                {t('perUserLimit', { limit: perUserLimit })}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5 overflow-y-auto flex-1">
          {isLoading ? (
            <div
              className="flex min-h-[320px] flex-col items-center justify-center gap-3"
              role="status"
            >
              <Spinner className="size-8 text-ink" />
              <p className="text-mute text-sm">{t('loading')}</p>
            </div>
          ) : isError ? (
            <DisplayError
              title={t('fetchFailedTitle')}
              message={
                returnErrorMessage(error as ApiErrorResponse) ||
                t('fetchFailedMessage')
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {summaryCards.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-xl border border-sidebar-border bg-accent/30 p-4"
                  >
                    <p className="text-mute text-xs font-medium">
                      {card.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-black">
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-accent/50 p-1.5 rounded-lg border mb-4">
                {(['customers', 'orders'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      activeTab === tab
                        ? 'bg-white text-black shadow-sm'
                        : 'text-mute hover:text-black'
                    }`}
                  >
                    {tab === 'customers'
                      ? t('customersTab', { count: summary?.unique_customers ?? 0 })
                      : t('ordersTab', { count: orders?.total ?? 0 })}
                  </button>
                ))}
              </div>

              <div className="rounded-md border overflow-auto">
                {activeTab === 'customers' ? (
                  <Table className="min-w-[640px] w-full">
                    <TableHeader className="bg-accent">
                      <TableRow>
                        <TableHead>{t('customer')}</TableHead>
                        <TableHead>{t('timesUsed')}</TableHead>
                        <TableHead>{t('discount')}</TableHead>
                        <TableHead>{t('lastUsed')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="p-4 text-center">
                            <NoDataFound title={t('noCustomers')} />
                          </TableCell>
                        </TableRow>
                      ) : (
                        customers.map((customer) => (
                          <TableRow key={customer.customer_id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-black">
                                  {customer.name || t('unknownCustomer')}
                                </span>
                                {(customer.email || customer.phone) && (
                                  <span className="text-mute text-xs">
                                    {customer.email || customer.phone}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span>
                                  {perUserLimit > 0
                                    ? t('usedOfLimit', {
                                        used: customer.used_count,
                                        limit: perUserLimit,
                                      })
                                    : customer.used_count}
                                </span>
                                {customer.limit_reached && (
                                  <Status
                                    status="limit_reached"
                                    label={t('limitReached')}
                                  />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatCurrency(customer.total_discount, symbol)}
                            </TableCell>
                            <TableCell>
                              {moment(customer.last_used_at).format(
                                'DD MMM YYYY, hh:mm A',
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                ) : (
                  <Table className="min-w-[720px] w-full">
                    <TableHeader className="bg-accent">
                      <TableRow>
                        <TableHead>{t('order')}</TableHead>
                        <TableHead>{t('customer')}</TableHead>
                        {!isStore && <TableHead>{t('store')}</TableHead>}
                        <TableHead>{t('status')}</TableHead>
                        <TableHead>{t('discount')}</TableHead>
                        <TableHead>{t('orderTotal')}</TableHead>
                        <TableHead>{t('date')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!orders?.data.length ? (
                        <TableRow>
                          <TableCell
                            colSpan={isStore ? 6 : 7}
                            className="p-4 text-center"
                          >
                            <NoDataFound title={t('noOrders')} />
                          </TableCell>
                        </TableRow>
                      ) : (
                        orders.data.map((order) => (
                          <TableRow
                            key={order.id}
                            className="cursor-pointer hover:bg-accent/50"
                            onClick={() => openOrder(order.id)}
                            title={t('viewOrder')}
                          >
                            <TableCell>
                              <span className="inline-flex items-center gap-1 font-medium text-ink">
                                {order.id.split('-')[0]}
                                <ExternalLink className="size-3.5" />
                              </span>
                            </TableCell>
                            <TableCell>
                              {order.customer_name || t('unknownCustomer')}
                            </TableCell>
                            {!isStore && (
                              <TableCell>{order.store_name || '-'}</TableCell>
                            )}
                            <TableCell>
                              <Status
                                status={order.status}
                                label={formatOrderStatusLabel(
                                  order.status,
                                  tStatuses,
                                  order.status,
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              {formatCurrency(order.discount_amount, symbol)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(order.total_amount, symbol)}
                            </TableCell>
                            <TableCell>
                              {moment(order.created_at).format(
                                'DD MMM YYYY, hh:mm A',
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>

              {activeTab === 'customers' &&
                (summary?.unique_customers ?? 0) > customers.length && (
                  <p className="text-mute text-xs mt-2">
                    {t('customersCapped', { count: customers.length })}
                  </p>
                )}

              {activeTab === 'orders' && orders && orders.totalPages > 1 && (
                <div className="flex items-center justify-end gap-3 mt-3">
                  <span className="text-mute text-sm">
                    {t('pageOf', {
                      page: orders.page,
                      totalPages: orders.totalPages,
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page <= 1 || isFetching}
                    className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    <ChevronLeft className="size-4" />
                    {t('previous')}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPage((p) => Math.min(p + 1, orders.totalPages))
                    }
                    disabled={page >= orders.totalPages || isFetching}
                    className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    {t('next')}
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
