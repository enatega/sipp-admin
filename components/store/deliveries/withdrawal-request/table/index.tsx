'use client';

import { useTranslations } from 'next-intl';
import { StorePayoutRequest } from '@/types';
import { Eye } from 'lucide-react';
import moment from 'moment';
import { formatCurrency } from '@/lib/formatCurrency';
import { useCurrency } from '@/hooks/use-currency';
import { useQueryParams } from '@/hooks/use-query-params';
import { useSortableData } from '@/hooks/use-sortable-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AppButton } from '@/components/shared/AppButton';
import AppPagination from '@/components/shared/AppPagination';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import Status from '@/components/shared/Status';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import { ApiErrorResponse } from '@/types';
import { returnErrorMessage } from '@/lib/toast-error';

export function StoreWithdrawalRequestTable({
  requests = [],
  isLoading = false,
  isError = false,
  error = null,
  pagination,
  onViewDetails,
}: {
  requests: StorePayoutRequest[];
  isLoading?: boolean;
  isError?: boolean;
  error?: ApiErrorResponse | null;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onViewDetails?: (request: StorePayoutRequest) => void;
}) {
  const tTable = useTranslations('withdrawalRequests.table');
  const tVendorTable = useTranslations('vendorWithdrawalRequest.table');
  const { getParam } = useQueryParams();
  const { currencySymbol } = useCurrency();
  const limit = Number(getParam('limit')) || 10;

  const page = pagination?.page || Number(getParam('page')) || 1;
  const paginatedData = requests;
  const totalPages = pagination
    ? pagination.totalPages
    : Math.ceil(requests.length / limit);

  const { items, requestSort, sortConfig } =
    useSortableData<StorePayoutRequest>(paginatedData);

  return (
    <div className="mb-4">
      <div className="rounded-md border overflow-auto">
        <Table className="min-w-[900px]">
            <TableHeader className="bg-accent rounded-t-md">
              <TableRow>
                <TableHeaderCell
                  label={tTable('requestId')}
                  sortKey="request_id"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-3"
                />
                <TableHeaderCell
                  label={tTable('storeName')}
                  sortKey="store_name"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-3"
                />
                <TableHeaderCell
                  label={tTable('vendorName')}
                  sortKey="vendor"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-3"
                />
                <TableHeaderCell
                  label={tTable('amount')}
                  sortKey="requested_amount"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-3"
                />
                <TableHeaderCell
                  label={tTable('storeBalance')}
                  sortKey="store_balance"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-3"
                />
                <TableHeaderCell
                  label={tTable('status')}
                  sortKey="status"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-3"
                />
                <TableHeaderCell
                  label={tTable('dateTime')}
                  sortKey="request_date"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-3"
                />
                <TableHead>{tTable('bankWallet')}</TableHead>
              </TableRow>
            </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableShimmer limit={limit as TLimitType} columns={8} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <DisplayError
                    title={tTable('errorTitle')}
                    message={error ? returnErrorMessage(error) : tTable('errorMessage')}
                    variant="error"
                  />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <NoDataFound
                    title={tTable('noData')}
                    subtitle={tVendorTable('noDataSubtitle')}
                  />
                </TableCell>
              </TableRow>
            ) : (
              items.map((request) => (
                <TableRow key={request?.request_id} className="!h-[55px]">
                  <TableCell className="font-medium">
                    {request?.request_id?.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{request?.store_name || tTable('notAvailable')}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{request?.vendor || tTable('notAvailable')}</span>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(
                      request?.requested_amount || 0,
                      currencySymbol,
                    )}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(
                      request?.store_balance || 0,
                      currencySymbol,
                    )}
                  </TableCell>
                  <TableCell>
                    <Status status={request?.status} />
                  </TableCell>
                  <TableCell>
                    {moment(request?.request_date).format(
                      'DD MMM YYYY, hh:mm A',
                    )}
                  </TableCell>
                  <TableCell>
                    <AppButton
                      size="sm"
                      variant="secondary"
                      leftIcon={<Eye className="w-4 h-4" />}
                      onClick={() => onViewDetails?.(request)}
                    >
                      {tTable('view')}
                    </AppButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {!isLoading && items.length > 0 && totalPages > 0 && (
        <div className="p-3 bg-accent/30 border-t rounded-b-md">
          <AppPagination
            page={page}
            totalPages={totalPages}
            totalData={pagination?.total || requests.length}
            defaultLimit={limit as TLimitType}
          />
        </div>
      )}
    </div>
  );
}
