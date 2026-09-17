'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import type { OrdersItem as Order } from '@/types';
import { ApiErrorResponse } from '@/types';
import { Check, Eye, MapPin, MoreVertical, Trash, UserPlus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { buildScopedDeliveriesAdminPathFromCurrent } from '@/lib/routes';
import { formatCurrency } from '@/lib/formatCurrency';
import { handleApiError } from '@/lib/toast-error';
import {
  useDeleteOrder,
  useGetOrderDetail,
} from '@/hooks/api/super-admin/enatega-deliveries/orders';
import {
  useAcceptStoreOrder,
  useRejectStoreOrder,
} from '@/hooks/api/store/deliveries/orders';
import { useCurrency } from '@/hooks/use-currency';
import { useQueryParams } from '@/hooks/use-query-params';
import { useSortableData } from '@/hooks/use-sortable-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import CopyButton from '@/components/shared/CopyButton';
import Status from '@/components/shared/Status';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import {
  formatOrderStatusLabel,
  formatOrderTypeLabel,
  isStoreOrdersPath,
} from '../../utils';

const AssignRiderModal = dynamic(
  () =>
    import('../../order-detail/right-column/AssignRiderModal').then(
      (mod) => mod.AssignRiderModal,
    ),
  { ssr: false },
);

const MapTrackingModal = dynamic(
  () => import('../../order-detail/MapTrackingModal'),
  {
    loading: () => (
      <div className="h-[400px] w-full flex items-center justify-center bg-accent animate-pulse rounded-lg">
        <span className="text-muted-foreground">Loading map...</span>
      </div>
    ),
    ssr: false,
  },
);

interface IOrdersTableProps {
  data: Order[];
  page?: number;
  limit?: TLimitType;
  total?: number;
  isLoading?: boolean;
  onOrderUpdated?: () => void;
}

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const formatDateTime = (value?: string) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return DATE_TIME_FORMATTER.format(date).replace(',', '');
};

const normalizeOrderStatus = (value?: string | null) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

const canShowAssignRiderButton = (status?: string | null) => {
  const normalized = normalizeOrderStatus(status);
  return (
    normalized === 'accepted' ||
    normalized === 'preparing' ||
    normalized === 'ready'
  );
};

export function OrdersTable({
  data,
  page = 1,
  limit = 10,
  total,
  isLoading,
  onOrderUpdated,
}: IOrdersTableProps) {
  const router = useRouter();
  const t = useTranslations('orders');
  const tTable = useTranslations('orders.table');
  const tDeleteDialog = useTranslations('orders.deleteDialog');
  const tStatuses = useTranslations('orders.statuses');
  const tOrderTypes = useTranslations('orders.orderTypes');
  const { currencySymbol } = useCurrency();
  const currency = currencySymbol || 'QAR';
  useQueryParams();

  const { items, requestSort, sortConfig } = useSortableData(data || []);

  const formatOrderType = (type?: string) => {
    return formatOrderTypeLabel(type, tOrderTypes, t('notAvailable'));
  };

  const [deletingOrder, setDeletingOrder] = useState<string | null>(null);
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { mutateAsync: deleteOrder, isPending: isDeleting } = useDeleteOrder();
  const { mutateAsync: acceptStoreOrder, isPending: isAccepting } =
    useAcceptStoreOrder();
  const { mutateAsync: rejectStoreOrder, isPending: isRejecting } =
    useRejectStoreOrder();
  const { data: trackingOrderDetail, isFetching: isTrackingOrderLoading } =
    useGetOrderDetail(trackingOrderId ?? undefined);

  const totalPages = total
    ? Math.ceil(total / Number(limit))
    : Math.ceil((data?.length || 0) / Number(limit));

  const handleDeleteOrder = async () => {
    if (!deletingOrder) return;
    if (isDeleting) return;
    try {
      await deleteOrder(deletingOrder);
      toast.success(t('deleteSuccess'));
      setDeletingOrder(null);
      onOrderUpdated?.();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  const pathname = usePathname();
  const storeOrdersPath = isStoreOrdersPath(pathname);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await acceptStoreOrder(orderId);
      toast.success('Order accepted successfully');
      onOrderUpdated?.();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  const handleRejectOrder = async () => {
    const reason = rejectionReason.trim();
    if (!rejectingOrderId || !reason) {
      toast.error('Please enter a rejection reason');
      return;
    }
    try {
      await rejectStoreOrder({ orderId: rejectingOrderId, reason });
      toast.success('Order rejected successfully');
      setRejectingOrderId(null);
      setRejectionReason('');
      onOrderUpdated?.();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  const handleRowClick = (id: string) => {
    if (isStoreOrdersPath(pathname)) {
      const segments = pathname?.split('/').filter(Boolean) ?? [];
      const storeId = segments[2];
      router.push(`/store/deliveries/${storeId}/orders/${id}`);
      return;
    }
    router.push(
      buildScopedDeliveriesAdminPathFromCurrent(
        pathname,
        `/enatega-deliveries/orders/${id}`,
      ),
    );
  };

  return (
    <div className="space-y-4 w-full">
      <div className="rounded-t-md border overflow-hidden mb-0">
        <Table className="min-w-[1100px]">
          <TableHeader className="bg-accent rounded-t-md">
            <TableRow className="text-center">
              <TableHeaderCell
                label={tTable('orderId')}
                sortKey="orderId"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tTable('customerName')}
                sortKey="customer.name"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tTable('vendor')}
                sortKey="vendor"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tTable('store')}
                sortKey="store"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tTable('rider') ?? 'Rider'}
                sortKey="riderName"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tTable('orderType')}
                sortKey="orderType"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tTable('amount')}
                sortKey="amount"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tTable('status')}
                sortKey="status"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tTable('dateTime')}
                sortKey="dateTime"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHead>{tTable('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableShimmer limit={limit as TLimitType} columns={10} />
            ) : (
              items.map((order) => {
                // const riderInfo = getRiderInfo(order);
                const riderAssigned = Boolean(order.riderId || order.riderName);
                const showAssignRiderButton =
                  !riderAssigned && canShowAssignRiderButton(order.status);
                const normalizedStatus = normalizeOrderStatus(order.status);
                const canAccept =
                  storeOrdersPath &&
                  (normalizedStatus === 'pending' || normalizedStatus === 'scheduled');
                const canReject =
                  storeOrdersPath &&
                  (normalizedStatus === 'pending' || normalizedStatus === 'accepted');

                return (
                  <TableRow
                    key={order?.orderId}
                    className="h-[70px] cursor-pointer"
                    onClick={() => handleRowClick(order?.orderId)}
                  >
                    <TableCell className="pl-3">
                      <div className="flex items-center gap-2 text-sm muted-foreground">
                        <span
                          className="truncate max-w-[220px]"
                          title={order?.orderId}
                        >
                          {order?.orderId?.split('-')?.[0] ??
                            String(order?.orderId ?? '').slice(0, 8)}
                        </span>
                        <span onClick={(e) => e.stopPropagation()}>
                          <CopyButton text={order?.orderId ?? ''} />
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={order?.customerProfile || undefined}
                            alt={order?.customerName || ''}
                          />
                          <AvatarFallback>
                            {order?.customerName?.charAt(0) ?? ''}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm">{order?.customerName}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{order?.vendorName}</TableCell>
                    <TableCell>{order?.storeName}</TableCell>
                    <TableCell>
                      {riderAssigned ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={order.riderProfile}
                              alt={order.riderName || 'Rider'}
                            />
                            <AvatarFallback>
                              {order.riderName?.charAt(0) ?? 'R'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm">{order.riderName}</span>
                          </div>
                        </div>
                      ) : showAssignRiderButton ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/5 px-2.5 py-1.5 text-xs text-primary hover:bg-primary/10 hover:border-primary/50 font-medium transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssigningOrderId(order.orderId);
                          }}
                        >
                          <UserPlus size={14} />
                          {tTable('assignRider') ?? 'Assign Rider'}
                        </button>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          N/A
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{formatOrderType(order?.orderType)}</TableCell>
                    <TableCell>
                      {formatCurrency(order?.amount ?? 0, currency)}
                    </TableCell>
                    <TableCell>
                      <Status
                        status={(order?.status || '').toLowerCase()}
                        label={formatOrderStatusLabel(
                          order?.status,
                          tStatuses,
                          t('notAvailable'),
                        )}
                      />
                    </TableCell>
                    <TableCell>{formatDateTime(order?.dateTime)}</TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <div className="relative">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="border px-2 py-1.5 rounded-md shadow"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical size={20} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              sideOffset={8}
                              className="w-[170px] p-0 rounded-xl overflow-hidden shadow-lg"
                            >
                              <DropdownMenuItem
                                className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isStoreOrdersPath(pathname)) {
                                    const segments =
                                      pathname?.split('/').filter(Boolean) ??
                                      [];
                                    const storeId = segments[2];
                                    router.push(
                                      `/store/deliveries/${storeId}/orders/${order?.orderId}`,
                                    );
                                    return;
                                  }
                                  router.push(
                                    buildScopedDeliveriesAdminPathFromCurrent(
                                      pathname,
                                      `/enatega-deliveries/orders/${order?.orderId}`,
                                    ),
                                  );
                                }}
                              >
                                <Eye className="size-[18px]" />
                                <span className="text-sm">
                                  {tTable('view')}
                                </span>
                              </DropdownMenuItem>

                              {canAccept && (
                                <DropdownMenuItem
                                  className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none text-green-700"
                                  disabled={isAccepting}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void handleAcceptOrder(order.orderId);
                                  }}
                                >
                                  <Check className="size-[18px]" />
                                  <span className="text-sm">Accept Order</span>
                                </DropdownMenuItem>
                              )}

                              {canReject && (
                                <DropdownMenuItem
                                  variant="destructive"
                                  className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRejectingOrderId(order.orderId);
                                  }}
                                >
                                  <X className="size-[18px] text-destructive" />
                                  <span className="text-sm text-destructive">Reject Order</span>
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTrackingOrderId(order.orderId);
                                }}
                              >
                                <MapPin className="size-[18px]" />
                                <span className="text-sm">
                                  {trackingOrderId === order.orderId &&
                                  isTrackingOrderLoading
                                    ? `${tTable('liveTracking') ?? 'Live Tracking'}...`
                                    : (tTable('liveTracking') ??
                                      'Live Tracking')}
                                </span>
                              </DropdownMenuItem>

                              {!storeOrdersPath && <DropdownMenuItem
                                variant="destructive"
                                className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingOrder(order?.orderId);
                                }}
                              >
                                <Trash className="size-[18px] text-destructive" />
                                <span className="text-sm text-destructive">
                                  {tTable('delete')}
                                </span>
                              </DropdownMenuItem>}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="p-3 bg-accent/30 border-t rounded-b-md">
        {!isLoading && (
          <AppPagination
            page={page}
            totalPages={totalPages}
            totalData={total ?? (data?.length || 0)}
            defaultLimit={limit as TLimitType}
          />
        )}
      </div>

      {deletingOrder && (
        <AppAlertDialog
          className="!w-full sm:!w-[850px] max-w-[95vw]"
          title={tDeleteDialog('title')}
          subTitle={tDeleteDialog('subTitle')}
          description={tDeleteDialog('description')}
          open={!!deletingOrder}
          onOpenChange={(open) => !open && setDeletingOrder(null)}
          variant="delete"
          confirmLabel={tDeleteDialog('confirm')}
          onConfirm={handleDeleteOrder}
          loading={isDeleting}
        />
      )}

      {rejectingOrderId && (
        <AppAlertDialog
          title="Reject Order"
          subTitle="Why are you rejecting this order?"
          description="This reason will be visible in the order history."
          open
          onOpenChange={(open) => {
            if (!open) {
              setRejectingOrderId(null);
              setRejectionReason('');
            }
          }}
          variant="delete"
          confirmLabel="Reject Order"
          onConfirm={handleRejectOrder}
          loading={isRejecting}
        >
          <textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            maxLength={200}
            rows={4}
            autoFocus
            placeholder="Enter rejection reason"
            className="mt-4 w-full resize-none rounded-md border bg-white p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <div className="mt-1 text-right text-xs text-muted-foreground">
            {rejectionReason.length}/200
          </div>
        </AppAlertDialog>
      )}

      {assigningOrderId && (
        <AssignRiderModal
          isOpen
          onClose={() => {
            setAssigningOrderId(null);
            onOrderUpdated?.();
          }}
          orderId={assigningOrderId}
        />
      )}

      {trackingOrderId && trackingOrderDetail && (
        <MapTrackingModal
          open
          onClose={() => setTrackingOrderId(null)}
          order={trackingOrderDetail}
        />
      )}
    </div>
  );
}
