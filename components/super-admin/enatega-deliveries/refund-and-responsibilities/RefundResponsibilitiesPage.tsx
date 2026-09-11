'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ApiErrorResponse } from '@/types';
import toast from 'react-hot-toast';
import {
  ApproveRefundRequest,
  RefundRequest,
} from '@/types/api/super-admin/enatega-deliveries/refunds-and-responsibilities';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import {
  useApproveRefundRequest,
  useGetRefundAndResponsibilitiesList,
  useRejectRefundRequest,
} from '@/hooks/api/super-admin/enatega-deliveries/refund-and-responsibilities';
import { useQueryParams } from '@/hooks/use-query-params';
import { DownloadButtons } from '@/components/shared/DownloadButtons';
import { ClearFiltersButton } from '@/components/shared/filters/ClearFiltersButton';
import { DateRangeFilter } from '@/components/shared/filters/DateRangeFilter';
import { Heading } from '@/components/shared/Heading';
import { SearchInput } from '@/components/shared/SearchInput';
import { buildScopedDeliveriesAdminPathFromCurrent } from '@/lib/routes';
import { RefundActionDialog } from './RefundActionDialog';
import { RefundResponsibilitiesTable } from './RefundResponsibilitiesTable';

export type ActionDialogState = {
  type: 'approve' | 'reject';
  request: RefundRequest;
} | null;

export function RefundResponsibilitiesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { getParam, setParams } = useQueryParams();

  const { data, isLoading, isError, error } =
    useGetRefundAndResponsibilitiesList();
  const { mutateAsync: approveRequest, isPending: isApproving } =
    useApproveRefundRequest();
  const { mutateAsync: rejectRequest, isPending: isRejecting } =
    useRejectRefundRequest();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<10 | 25 | 50 | 100>(10);
  const [actionDialog, setActionDialog] = useState<ActionDialogState>(null);

  const searchTerm = (getParam('search') || '').trim().toLowerCase();
  const startDate = getParam('startDate');
  const endDate = getParam('endDate');

  const filteredRequests = useMemo(() => {
    const matchesSearch = (value: string | null | undefined) =>
      (value ?? '').toLowerCase().includes(searchTerm);

    return (
      data?.data.filter((request) => {
        const matchesQuery =
          searchTerm.length === 0 ||
          matchesSearch(request.request_id) ||
          matchesSearch(request.order_id) ||
          matchesSearch(request.customer_name) ||
          matchesSearch(request.store_name) ||
          matchesSearch(request.rider_name);

        const matchesDateRange = (() => {
          if (!startDate || !endDate) {
            return true;
          }

          const requestDate = new Date(request.request_date);
          const fromDate = new Date(startDate);
          const toDate = new Date(endDate);

          if (
            Number.isNaN(requestDate.getTime()) ||
            Number.isNaN(fromDate.getTime()) ||
            Number.isNaN(toDate.getTime())
          ) {
            return false;
          }

          fromDate.setHours(0, 0, 0, 0);
          toDate.setHours(23, 59, 59, 999);

          return (
            requestDate.getTime() >= fromDate.getTime() &&
            requestDate.getTime() <= toDate.getTime()
          );
        })();

        return matchesQuery && matchesDateRange;
      }) || []
    );
  }, [endDate, data, searchTerm, startDate]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / limit));
  const safePage = Math.min(page, totalPages);

  const paginatedRequests = useMemo(() => {
    const start = (safePage - 1) * limit;
    return filteredRequests.slice(start, start + limit);
  }, [filteredRequests, limit, safePage]);

  const downloadColumns = [
    { header: 'Request ID', dataKey: 'request_id' },
    { header: 'Customer Name', dataKey: 'customer_name' },
    {
      header: 'Store Name',
      dataKey: 'store_name',
      formatter: (item: RefundRequest) => item.store_name ?? 'N/A',
    },
    {
      header: 'Order ID',
      dataKey: 'order_id',
      formatter: (item: RefundRequest) => item.order_id ?? 'N/A',
    },
    { header: 'Rider Name', dataKey: 'rider_name' },
    {
      header: 'Refund Type',
      dataKey: 'refundType',
      formatter: (item: RefundRequest) =>
        item.refund_type.charAt(0).toUpperCase() + item.refund_type.slice(1),
    },
    {
      header: 'Amount',
      dataKey: 'amountUsd',
      formatter: (item: RefundRequest) => `$${item.amount.toFixed(2)}`,
    },
    { header: 'Request Date', dataKey: 'requestDate' },
    {
      header: 'Status',
      dataKey: 'status',
      formatter: (item: RefundRequest) =>
        item.status.charAt(0).toUpperCase() + item.status.slice(1),
    },
  ];

  const handleViewRequest = (request: RefundRequest) => {
    router.push(
      buildScopedDeliveriesAdminPathFromCurrent(
        pathname,
        `/enatega-deliveries/refund-and-responsibilities/${request.id}`,
      ),
    );
  };

  const handleConfirmAction = async (payload: ApproveRefundRequest) => {
    if (!actionDialog) return;

    try {
      const actionLabel =
        actionDialog.type === 'approve' ? 'approved' : 'rejected';
      if (actionLabel === 'approved') {
        const response = await approveRequest({
          id: actionDialog.request.id,
          ApproveRefundRequest: payload,
        });
        toast.success(
          response.message || 'Refund Request Approved Successfully',
        );
      }
      if (actionLabel === 'rejected') {
        const response = await rejectRequest({
          id: actionDialog.request.id,
          internal_note: { internal_notes: payload.internal_notes },
        });
        toast.success(
          response.message || 'Refund Request Rejected Successfully',
        );
      }
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    } finally {
      setActionDialog(null);
    }

    // toast.success(
    //   `Refund request ${actionDialog.request.request_id} ${actionLabel}. (${payload.pointsPerUsd} pts/USD)`,
    // );
  };

  return (
    <div className="space-y-6">
      <Heading title="Refund & Responsibilities" containerClassName="my-4" />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full justify-between gap-2 ">
          <div className="flex justify-between gap-2 items-center">
            <SearchInput
              text={getParam('search') || ''}
              onChangeText={(value) => {
                setParams({ search: value || null, page: '1' });
                setPage(1);
              }}
              placeholder="Search by request ID, customer or store name"
              containerClass="w-full sm:w-[360px]"
              inputClassName="h-11"
            />

            <div className="w-full flex items-center gap-4 sm:w-[220px]">
              <DateRangeFilter />
              <ClearFiltersButton
                paramKeys={['search', 'startDate', 'endDate']}
              />
            </div>
          </div>

          <DownloadButtons<RefundRequest>
            fileName="refund-responsibilities"
            data={filteredRequests}
            columns={downloadColumns}
            className="h-11"
          />
        </div>
      </div>

      <RefundResponsibilitiesTable
        data={paginatedRequests}
        totalData={filteredRequests.length}
        page={safePage}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
        onViewRequest={handleViewRequest}
        onApproveRequest={(request) =>
          setActionDialog({ type: 'approve', request })
        }
        onRejectRequest={(request) =>
          setActionDialog({ type: 'reject', request })
        }
        isLoading={isLoading}
        error={returnErrorMessage(error as ApiErrorResponse)}
        isError={isError}
      />

      {actionDialog ? (
        <RefundActionDialog
          key={`${actionDialog.type}-${actionDialog.request.id}`}
          open={!!actionDialog}
          type={actionDialog.type}
          request={actionDialog.request}
          onClose={() => setActionDialog(null)}
          onConfirm={handleConfirmAction}
          isLoading={isApproving || isRejecting}
        />
      ) : null}
    </div>
  );
}
