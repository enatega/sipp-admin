'use client';

import { DEFAULT_CURRENCY } from '@/constants/currency.constants';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Coupon } from '@/types';
import {
  BarChart3,
  MoreVertical,
  Pause,
  Pencil,
  Play,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ApiErrorResponse } from '@/types/api/common';
import { formatAdminDateTimeShort } from '@/lib/adminDateTime';
import { formatCurrency, resolveCurrencySymbol } from '@/lib/formatCurrency';
import { isStoreCouponsBasePath } from '@/lib/store';
import { returnErrorMessage } from '@/lib/toast-error';
import { useCurrency } from '@/hooks/use-currency';
import { useSortableData } from '@/hooks/use-sortable-data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import AppPagination from '@/components/shared/AppPagination';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import Status from '@/components/shared/Status';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import { CouponUsageModal } from './CouponUsageModal';
import { StoresTableCell } from './StoreTableCell';

interface DiscountTableProps {
  basePath?: string;
  /** The coupon rows to render (already mapped to the Coupon shape). */
  coupons: Coupon[];
  /** True while the list request is in-flight. */
  isLoading: boolean;
  /** True if the list request errored. */
  isError: boolean;
  /** The error object when isError is true. */
  error: ApiErrorResponse | null;
  /** Called with the coupon id when the user confirms deletion. */
  onDelete: (id: string) => Promise<void>;
  /** Switches a coupon off ('inactive') or back on ('active'). */
  onToggleStatus?: (id: string, status: 'active' | 'inactive') => Promise<void>;
  /** True while the delete mutation is in-flight. */
  isPending: boolean;
  /** Pagination metadata – omit if the API has no pagination. */
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
  };
}

// List APIs send 'free_delivery'; detail APIs send 'FREE_DELIVERY'.
const isFreeDelivery = (type: unknown) =>
  String(type ?? '').trim().toUpperCase() === 'FREE_DELIVERY';

export function DiscountTable({
  basePath = '/enatega-deliveries/discounts-offers',
  coupons,
  isLoading,
  isError,
  error,
  onDelete,
  onToggleStatus,
  isPending,
  pagination,
}: DiscountTableProps) {
  const tTable = useTranslations('lumiFood.discountsOffers.table');
  const tDialogs = useTranslations('lumiFood.discountsOffers.dialogs');
  const tTabs = useTranslations('lumiFood.discountsOffers.tabs');
  const tFilters = useTranslations('lumiFood.discountsOffers.filters');
  const tCommon = useTranslations('common');
  const tStoresCell = useTranslations('lumiFood.discountsOffers.storeCell');
  const router = useRouter();
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = resolveCurrencySymbol(
    currencySymbol || DEFAULT_CURRENCY.symbol,
  );
  const { storeId } = useParams() as { storeId?: string };
  const showStoresColumn = !isStoreCouponsBasePath(basePath);
  const columnsCount = showStoresColumn ? 10 : 9;
  const showTableLoading = isLoading;

  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const [usageCoupon, setUsageCoupon] = useState<Coupon | null>(null);

  const { items, requestSort, sortConfig } = useSortableData<Coupon>(coupons);

  const handleDelete = async () => {
    if (!deletingCoupon) return;
    await onDelete(deletingCoupon.id);
    setDeletingCoupon(null);
  };

  return (
    <>
      <div className="rounded-md border overflow-auto my-2">
        <Table className="min-w-[1200px] w-full">
          <TableHeader className="bg-accent">
            <TableRow className="h-[55px]!">
              <TableHeaderCell
                label={tTable('discountCode')}
                sortKey={'code'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tTable('title')}
                sortKey={'title'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tTable('discountType')}
                sortKey={'discount_type'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tTable('value')}
                sortKey={'values'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHead>{tTable('usageLimit')}</TableHead>
              <TableHead>{tTable('validityFrom')}</TableHead>
              <TableHead>{tTable('validityTo')}</TableHead>

              {showStoresColumn && (
                <TableHeaderCell
                  label={tTable('storesName')}
                  sortKey={'store_name'}
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                />
              )}

              <TableHead>{tTable('status')}</TableHead>
              <TableHead>{tTable('actions')}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {showTableLoading ? (
              <TableShimmer limit={10 as TLimitType} columns={columnsCount} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={columnsCount} className="p-4">
                  <DisplayError
                    title={tTable('fetchFailedTitle')}
                    message={
                      returnErrorMessage(error as ApiErrorResponse) ||
                      tTable('fetchFailedMessage')
                    }
                  />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnsCount} className="text-center p-4">
                  <NoDataFound title={tTable('noDataTitle')} />
                </TableCell>
              </TableRow>
            ) : (
              items.map((coupon) => (
                <TableRow
                  key={coupon.id}
                  className="h-[55px]! cursor-pointer hover:bg-accent/50"
                  onClick={() => setUsageCoupon(coupon)}
                >
                  <TableCell className="font-medium">{coupon.code}</TableCell>

                  <TableCell>{coupon.title}</TableCell>

                  <TableCell className="capitalize">
                    {isFreeDelivery(coupon.discount_type)
                      ? tFilters('couponTypeFreeDelivery')
                      : String(coupon.discount_type ?? '').trim() === '%' ||
                          String(coupon.discount_type ?? '')
                            .trim()
                            .toUpperCase() === 'PERCENTAGE'
                        ? tFilters('couponTypePercentage')
                        : tFilters('couponTypeFixed')}
                  </TableCell>
                  <TableCell>
                    {isFreeDelivery(coupon.discount_type)
                      ? tFilters('couponTypeFreeDelivery')
                      : coupon.discount_type === '%' ||
                          String(coupon.discount_type).toUpperCase() ===
                            'PERCENTAGE'
                        ? `${Number(coupon.values)}%`
                        : formatCurrency(
                            Number(coupon.values),
                            resolvedCurrencySymbol,
                          )}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span>
                        {tTable('usageTotal')}: {coupon.usage_limit.total}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {tTable('usagePerUser')}: {coupon.usage_limit.per_user}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {formatAdminDateTimeShort(coupon.validity.start_date)}
                  </TableCell>
                  <TableCell>
                    {formatAdminDateTimeShort(coupon.validity.end_date)}
                  </TableCell>

                  {showStoresColumn && (
                    <TableCell>
                      <StoresTableCell
                        stores={coupon.stores.map((store) => store.name)}
                        emptyLabel={tStoresCell('empty')}
                        unknownLabel={tStoresCell('unknown')}
                        moreSuffix={tStoresCell('more')}
                      />
                    </TableCell>
                  )}

                  <TableCell>
                    <Status
                      status={
                        isLimitReached(coupon) ? 'limit_reached' : coupon.status
                      }
                      label={
                        isLimitReached(coupon)
                          ? tTable('limitReached')
                          : String(coupon.status ?? '')
                          .trim()
                          .toLowerCase() === 'active'
                          ? tTabs('active')
                          : String(coupon.status ?? '')
                                .trim()
                                .toLowerCase() === 'inactive'
                            ? tTabs('inactive')
                            : String(coupon.status ?? '')
                                  .trim()
                                  .toLowerCase() === 'expired'
                              ? tTabs('expired')
                              : undefined
                      }
                    />
                  </TableCell>

                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="border px-2 py-1.5 rounded-md shadow">
                        <MoreVertical size={20} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-[150px] p-0 rounded-xl overflow-hidden shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuItem
                          className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                          onClick={() => setUsageCoupon(coupon)}
                        >
                          <BarChart3 className="size-[18px]" />
                          <span className="text-sm">{tTable('viewUsage')}</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                          onClick={() =>
                            router.push(`${basePath}/edit-coupon/${coupon.id}`)
                          }
                        >
                          <Pencil className="size-[18px]" />
                          <span className="text-sm">{tCommon('edit')}</span>
                        </DropdownMenuItem>

                        {onToggleStatus && canToggleStatus(coupon) ? (
                          <DropdownMenuItem
                            className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                            onClick={() =>
                              void onToggleStatus(
                                coupon.id,
                                coupon.deactivated ? 'active' : 'inactive',
                              )
                            }
                          >
                            {coupon.deactivated ? (
                              <Play className="size-[18px]" />
                            ) : (
                              <Pause className="size-[18px]" />
                            )}
                            <span className="text-sm">
                              {coupon.deactivated
                                ? tTable('activate')
                                : tTable('deactivate')}
                            </span>
                          </DropdownMenuItem>
                        ) : null}

                        <DropdownMenuItem
                          className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:bg-red-100!"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingCoupon(coupon);
                          }}
                        >
                          <Trash2 className="size-[18px] text-help-red" />
                          <span className="text-sm text-help-red">
                            {tCommon('delete')}
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="p-3 bg-accent/30 border-t rounded-b-md">
          {pagination && !showTableLoading && !isError && (
            <AppPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              totalData={pagination.total}
              defaultLimit={10}
            />
          )}
        </div>
      </div>

      <CouponUsageModal
        coupon={usageCoupon}
        onClose={() => setUsageCoupon(null)}
        storeId={showStoresColumn ? undefined : storeId}
      />

      {deletingCoupon && (
        <AppAlertDialog
          title={tDialogs('deleteTitle')}
          subTitle={tDialogs('deleteSubTitle', { code: deletingCoupon.code })}
          description={tDialogs('deleteDescription')}
          open={!!deletingCoupon}
          onOpenChange={() => setDeletingCoupon(null)}
          variant="delete"
          confirmLabel={tDialogs('confirmDelete')}
          onConfirm={handleDelete}
          loading={isPending}
        />
      )}
    </>
  );
}

/** Active coupons whose total limit is used up can't be redeemed any more. */
function isLimitReached(coupon: Coupon) {
  return (
    String(coupon.status ?? '').trim().toLowerCase() === 'active' &&
    Boolean(coupon.limit_reached)
  );
}

// Expired coupons can only come back by editing their end date.
function canToggleStatus(coupon: Coupon) {
  return String(coupon.status ?? '').trim().toLowerCase() !== 'expired';
}
