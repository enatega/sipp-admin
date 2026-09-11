'use client';

import { format } from 'date-fns';
import { RefundRequest } from '@/types/api/super-admin/enatega-deliveries/refunds-and-responsibilities';
import { useSortableData } from '@/hooks/use-sortable-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import Status from '@/components/shared/Status';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer } from '@/components/shared/TableShimmer';
import { RefundRequestActionsDropdown } from './RefundRequestActionsDropdown';
import type { RefundRequestRecord } from './types';

interface RefundResponsibilitiesTableProps {
  data: RefundRequest[];
  totalData: number;
  page: number;
  limit: 10 | 25 | 50 | 100;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: 10 | 25 | 50 | 100) => void;
  onViewRequest: (request: RefundRequest) => void;
  onApproveRequest: (request: RefundRequest) => void;
  onRejectRequest: (request: RefundRequest) => void;
  isLoading: boolean;
  isError: boolean;
  error: string;
}

const formatCurrency = (amount: number) => `$${amount.toFixed(0)}`;

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return format(date, 'dd-MMM-yyyy');
};

const formatStatusLabel = (status: RefundRequestRecord['status']) =>
  status.charAt(0).toUpperCase() + status.slice(1);

const formatRefundTypeLabel = (refundType: RefundRequestRecord['refundType']) =>
  refundType.charAt(0).toUpperCase() + refundType.slice(1);

const getSafeText = (value: string | null | undefined, fallback = 'N/A') =>
  value?.trim() || fallback;

const getInitial = (value: string | null | undefined) =>
  getSafeText(value, '?').charAt(0).toUpperCase();

export function RefundResponsibilitiesTable({
  data,
  totalData,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onViewRequest,
  onApproveRequest,
  onRejectRequest,
  error,
  isLoading,
  isError,
}: RefundResponsibilitiesTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalData / limit));
  const { items, requestSort, sortConfig } = useSortableData(data || []);

  return (
    <div className="w-full overflow-hidden rounded-xl border bg-white">
      <div className="overflow-x-auto">
        <Table className="min-w-[1180px]">
          <TableHeader className="bg-accent">
            <TableRow>
              <TableHeaderCell
                label="Request ID"
                sortKey="requestId"
                requestSort={requestSort}
                sortConfig={sortConfig}
                containerClass="px-5"
              />
              <TableHeaderCell
                label="Customer Name"
                sortKey="customerName"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label="Store Name"
                sortKey="storeName"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label="Order ID"
                sortKey="orderId"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label="Rider Name"
                sortKey="riderName"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label="Refund Type"
                sortKey="refundType"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label="Amount"
                sortKey="amountUsd"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label="Request Date"
                sortKey="requestDate"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label="Status"
                sortKey="status"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableShimmer limit={10} columns={10} />
            ) : isError ? (
              <DisplayError
                title="Failed to fetch refund requests"
                message={error}
              />
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="h-24 text-center text-muted-foreground"
                >
                  No refund requests found.
                </TableCell>
              </TableRow>
            ) : (
              items.map((request) => (
                <TableRow
                  key={request.id}
                  className="h-[66px] cursor-pointer"
                  onClick={() => onViewRequest(request)}
                >
                  <TableCell className="px-5 font-medium">
                    {request.request_id}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={request.customer_image || undefined}
                          alt={getSafeText(request.customer_name, 'Customer')}
                        />
                        <AvatarFallback>
                          {getInitial(request.customer_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{getSafeText(request.customer_name)}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={request.store_image || undefined}
                          alt={getSafeText(request.store_name, 'Store')}
                        />
                        <AvatarFallback>
                          {getInitial(request.store_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className="max-w-[180px] truncate"
                        title={getSafeText(request.store_name)}
                      >
                        {getSafeText(request.store_name)}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>{request.order_id ?? 'N/A'}</TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={undefined}
                          alt={getSafeText(request.rider_name, 'Rider')}
                        />
                        <AvatarFallback>
                          {getInitial(request.rider_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{getSafeText(request.rider_name)}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {formatRefundTypeLabel(request.refund_type)}
                  </TableCell>
                  <TableCell>{formatCurrency(request.amount)}</TableCell>
                  <TableCell>{formatDate(request.request_date)}</TableCell>

                  <TableCell>
                    <Status
                      status={request.status}
                      label={formatStatusLabel(request.status)}
                    />
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-center">
                      <RefundRequestActionsDropdown
                        request={request}
                        onView={onViewRequest}
                        onApprove={onApproveRequest}
                        onReject={onRejectRequest}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="border-t bg-accent/30 p-3">
        <div className="flex w-full items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            1 of {totalData} row(s) selected.
          </p>
          <div className="flex-1">
            <AppPagination
              page={page}
              totalPages={totalPages}
              totalData={totalData}
              defaultLimit={limit}
              onPageChange={onPageChange}
              onLimitChange={onLimitChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
