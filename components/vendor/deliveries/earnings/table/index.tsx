'use client';

import { useParams } from 'next/dist/client/components/navigation';
import { VendorEarningItem } from '@/types';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { ApiErrorResponse } from '@/types/api/common';
import { formatCurrency } from '@/lib/formatCurrency';
import { returnErrorMessage } from '@/lib/toast-error';
import { useGetEarningView } from '@/hooks/api/vendor/deliveries/earnings-report';
import { useCurrency } from '@/hooks/use-currency';
import { useSortableData } from '@/hooks/use-sortable-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AppPagination from '@/components/shared/AppPagination';
import DisplayError from '@/components/shared/DisplayError';
import { DownloadButtons } from '@/components/shared/DownloadButtons';
import { fetchAllReport } from '@/lib/fetch-all-report';
import NoDataFound from '@/components/shared/NoDataFound';
import Status from '@/components/shared/Status';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import { useVendorEarningsDownloadColumns } from './download-columns';
import Filters from './Filters';

const VendorEarningsTable = () => {
  const params = useParams();
  const vendorId = params?.vendorId as string;

  const {
    data: earningsTableData,
    isLoading,
    isError,
    error,
  } = useGetEarningView(vendorId);

  const t = useTranslations('vendorEarnings.table');
  const tErrors = useTranslations('vendorEarnings.table.errors');
  const tStatuses = useTranslations('vendorEarnings.table.statuses');
  const { currencySymbol } = useCurrency();

  // Get download columns
  const downloadColumns = useVendorEarningsDownloadColumns();

  // Get earnings data directly (API will handle filtering)
  const earnings = earningsTableData?.data || [];

  // Sorting
  const { items, requestSort, sortConfig } =
    useSortableData<VendorEarningItem>(earnings);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-3 sm:p-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            {t('title')}
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
            <div className="flex-1 w-full">
              <Filters />
            </div>
            <div className="w-full sm:w-auto ">
              <DownloadButtons<VendorEarningItem>
                fileName="vendor_earnings_report"
                data={earnings}
                columns={downloadColumns}
                fetchAll={() => fetchAllReport<VendorEarningItem>('/apps/deliveries/admin/vendor-earning-reports/view', { params: { vendorId } })}
                className="mb-0 "
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="rounded-md border overflow-auto">
            <Table className="min-w-[900px]">
              <TableHeader className="bg-accent rounded-t-md">
                <TableRow>
                  <TableHeaderCell
                    label={t('columns.orderId')}
                    sortKey="order_id"
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={t('columns.customerName')}
                    sortKey="customer_name"
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={t('columns.store')}
                    sortKey="store_name"
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
                    label={t('columns.zone')}
                    sortKey="zone_name"
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
                    sortKey="date_time"
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableShimmer limit={10 as TLimitType} columns={7} />
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="p-4">
                      <DisplayError
                        title={tErrors('fetchFailedTitle')}
                        message={
                          returnErrorMessage(error as ApiErrorResponse) ||
                          tErrors('fetchFailedMessage')
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <NoDataFound
                        title={t('noDataTitle')}
                        subtitle={t('noDataSubtitle')}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((earning) => (
                    <TableRow key={earning.order_id} className="!h-[55px]">
                      <TableCell className="font-medium">
                        {earning.order_id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                            {earning.customer_name.charAt(0)}
                          </div>
                          <span>{earning.customer_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{earning.store_name}</TableCell>
                      <TableCell>
                        {formatCurrency(earning.amount, currencySymbol)}
                      </TableCell>
                      <TableCell>{earning.zone_name}</TableCell>
                      <TableCell>
                        <Status status={tStatuses(earning.status as 'completed' | 'cancelled' | 'ongoing' | 'pending')} />
                      </TableCell>
                      <TableCell>
                        {moment(earning.date_time).format(
                          'DD MMM YYYY, hh:mm A',
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="p-3 bg-accent/30 border-t rounded-b-md">
              {!isError && !isLoading && (
                <AppPagination
                  page={earningsTableData?.page ?? 1}
                  totalPages={earningsTableData?.totalPages ?? 1}
                  totalData={earningsTableData?.total ?? 1}
                  defaultLimit={10}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorEarningsTable;
