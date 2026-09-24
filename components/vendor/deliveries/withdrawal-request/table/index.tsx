'use client';

import { Check, Eye, Plus, X } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/lib/formatCurrency';
import { useCurrency } from '@/hooks/use-currency';
import { useQueryParams } from '@/hooks/use-query-params';
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
import { AppButton } from '@/components/shared/AppButton';
import AppPagination from '@/components/shared/AppPagination';
import { DownloadButtons } from '@/components/shared/DownloadButtons';
import { fetchAllReport } from '@/lib/fetch-all-report';
import { useParams } from 'next/navigation';
import type { VendorStoreWithdrawalRequest } from '@/types';
import NoDataFound from '@/components/shared/NoDataFound';
import Status from '@/components/shared/Status';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import TooltipText from '@/components/shared/TooltipText';
import {
  IVendorWithdrawalRequestsTable,
  VendorWithdrawalRequest,
} from '../types';
import { useVendorWithdrawalDownloadColumns } from './download-columns';
import Filters from './Filters';

const VendorWithdrawalRequestsTable = ({
  requests = [],
  pagination,
  isLoading = false,
  isError = false,
  onViewDetails,
  onCreateWithdrawal,
  onApprove,
  onReject,
}: IVendorWithdrawalRequestsTable) => {
  const t = useTranslations('vendorWithdrawalRequest.table');
  const tErrors = useTranslations('vendorWithdrawalRequest.table.errors');
  const tFallback = useTranslations('vendorWithdrawalRequest.table.fallback');
  const { currencySymbol } = useCurrency();
  const { getParam } = useQueryParams();
  const { vendorId } = useParams() as { vendorId: string };
  const limit = Number(getParam('limit')) || 10;

  // Get download columns
  const downloadColumns = useVendorWithdrawalDownloadColumns();

  // Pagination
  const page = pagination?.page || Number(getParam('page')) || 1;
  const paginatedRequests = requests;
  const totalPages = pagination
    ? pagination.totalPages
    : Math.ceil(requests.length / limit);

  // Sorting
  const { items, requestSort, sortConfig } =
    useSortableData<VendorWithdrawalRequest>(paginatedRequests);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex-1 w-full">
            <Filters />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <DownloadButtons<VendorWithdrawalRequest>
              fileName="vendor_withdrawal_requests"
              data={requests}
              columns={downloadColumns}
              fetchAll={async () => (await fetchAllReport<VendorStoreWithdrawalRequest>('/apps/deliveries/admin/vendor-store-withdraw-requests/requests', { params: { vendorId } })).map((item) => ({
                requestId: item.request_id,
                storeId: item.bank_details?.bank_id ?? '',
                name: item.store_name,
                amount: item.amount,
                status: item.status,
                date: item.date_time,
                notes: item.notes || undefined,
                paymentProof: item.payment_proof || undefined,
                bankDetails: {
                  accountHolder: item.bank_details?.account_title ?? '',
                  bankName: item.bank_details?.bank_name ?? '',
                  accountNumber: item.bank_details?.account_number ?? '',
                  iban: item.bank_details?.iban ?? '',
                  branchCode: item.bank_details?.account_code ?? '',
                },
              }))}
              className="mb-0"
            />
            <AppButton
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={onCreateWithdrawal}
            >
              {t('createButton')}
            </AppButton>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="rounded-md border overflow-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-accent rounded-t-md">
              <TableRow>
                <TableHeaderCell
                  label={t('columns.requestId')}
                  sortKey="requestId"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-3"
                />
                <TableHeaderCell
                  label={t('columns.storeName')}
                  sortKey="name"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-3"
                />
                <TableHeaderCell
                  label={t('columns.amount')}
                  sortKey="amount"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-3"
                />
                <TableHeaderCell
                  label={t('columns.status')}
                  sortKey="status"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-3"
                />
                <TableHeaderCell
                  label={t('columns.date')}
                  sortKey="date"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-3"
                />
                <TableHead>{t('columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableShimmer limit={limit as TLimitType} columns={6} />
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <NoDataFound
                      title={t('noDataTitle')}
                      subtitle={tErrors('fetchFailedSubtitle')}
                    />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <NoDataFound
                      title={t('noDataTitle')}
                      subtitle={t('noDataSubtitle')}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                items.map((request) => (
                  <TableRow key={request.requestId} className="!h-[55px]">
                    <TableCell className="font-medium">
                      {request.requestId.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          {request.logo ? (
                            <AvatarImage
                              src={request.logo}
                              alt={request.name || tFallback('store')}
                            />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs font-semibold">
                              {request.name?.charAt(0) ||
                                tFallback('storeInitial')}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span>{request.name || tFallback('notAvailable')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(request.amount, currencySymbol)}
                    </TableCell>
                    <TableCell>
                      <Status status={t(`statuses.${request.status}`)} />
                    </TableCell>
                    <TableCell>
                      {moment(request.date).format('DD MMM YYYY, hh:mm A')}
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          {/* Approve Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onApprove?.(request);
                            }}
                            className="flex items-center justify-center size-8 bg-green-500 text-white rounded-full transition-colors hover:bg-green-600"
                          >
                            <TooltipText content={t('approveButtonTooltip')}>
                              <Check className="size-4" />
                            </TooltipText>
                          </button>

                          {/* Reject Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onReject?.(request);
                            }}
                            className="flex items-center justify-center size-8 bg-help-red text-white rounded-full transition-colors hover:bg-help-red/90"
                          >
                            <TooltipText content={t('rejectButtonTooltip')}>
                              <X className="size-4" />
                            </TooltipText>
                          </button>
                        </div>
                      ) : (
                        /* Non-pending: Show View button only */
                        <AppButton
                          size="sm"
                          variant="secondary"
                          leftIcon={<Eye className="w-4 h-4" />}
                          onClick={() => onViewDetails?.(request)}
                        >
                          {t('viewButton')}
                        </AppButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

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
      </div>
    </div>
  );
};

export default VendorWithdrawalRequestsTable;
