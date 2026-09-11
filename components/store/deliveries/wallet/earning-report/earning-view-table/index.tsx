'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import AppPagination from '@/components/shared/AppPagination';
import DisplayError from '@/components/shared/DisplayError';
import { DownloadButtons } from '@/components/shared/DownloadButtons';
import NoDataFound from '@/components/shared/NoDataFound';
import Status from '@/components/shared/Status';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer } from '@/components/shared/TableShimmer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCurrency } from '@/hooks/use-currency';
import { useSortableData } from '@/hooks/use-sortable-data';
import { formatCurrency, resolveCurrencySymbol } from '@/lib/formatCurrency';
import { returnErrorMessage } from '@/lib/toast-error';
import { ApiErrorResponse, StoreEarningViewItem, StoreEarningViewPagination } from '@/types';
import { Copy } from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';
import { EarningReportsFilters } from './EarningReportsFilters';

export function EarningViewTable({
  earningData,
  isLoading,
  isError,
  error,
  pagination,
}: {
  earningData: StoreEarningViewItem[];
  isLoading: boolean;
  isError: boolean;
  error: ApiErrorResponse | null;
  pagination: StoreEarningViewPagination;
}) {
  const t = useTranslations('storeWalletEarningReports.table');
  const tColumns = useTranslations('storeWalletEarningReports.table.columns');
  const tErrors = useTranslations('storeWalletEarningReports.table.errors');
  const tNoData = useTranslations('storeWalletEarningReports.table.noData');
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = resolveCurrencySymbol(currencySymbol);

  const { items, requestSort, sortConfig } = useSortableData(earningData);

  const earningsDownloadColumns = useMemo(
    () => [
      { header: tColumns('orderId'), dataKey: 'orderId' },
      { header: tColumns('customerName'), dataKey: 'customerName' },
      { header: tColumns('zoneType'), dataKey: 'zoneType' },
      { header: tColumns('vendorName'), dataKey: 'vendorName' },
      {
        header: tColumns('orderAmount'),
        dataKey: 'orderAmount',
        formatter: (item: StoreEarningViewItem) =>
          formatCurrency(item.orderAmount, resolvedCurrencySymbol),
      },
      { header: tColumns('storeName'), dataKey: 'storeName' },
      {
        header: tColumns('commissionValue'),
        dataKey: 'commissionValue',
        formatter: (item: StoreEarningViewItem) =>
          formatCurrency(item.commissionValue, resolvedCurrencySymbol),
      },
      {
        header: tColumns('deliveryFee'),
        dataKey: 'deliveryFee',
        formatter: (item: StoreEarningViewItem) =>
          formatCurrency(item.deliveryFee, resolvedCurrencySymbol),
      },
      { header: tColumns('paymentMethod'), dataKey: 'paymentMethod' },
      { header: tColumns('dateTime'), dataKey: 'dateTime' },
      { header: tColumns('status'), dataKey: 'status' },
    ],
    [resolvedCurrencySymbol, tColumns],
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('copySuccess'));
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-3 sm:p-4">
        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            {t('title')}
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
            <EarningReportsFilters />
            <DownloadButtons
              fileName="earnings_report"
              data={items}
              columns={earningsDownloadColumns}
              className="mb-0"
            />
          </div>
        </div>

        <div className="mb-4">
          <div className="rounded-md border overflow-auto">
            <Table className="min-w-[800px]">
              <TableHeader className="bg-accent rounded-t-md">
                <TableRow>
                  <TableHeaderCell
                    label={tColumns('orderId')}
                    sortKey={'orderId'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tColumns('customerName')}
                    sortKey={'customerName'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tColumns('zoneType')}
                    sortKey={'zoneType'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tColumns('vendorName')}
                    sortKey={'vendorName'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tColumns('orderAmount')}
                    sortKey={'orderAmount'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tColumns('storeName')}
                    sortKey={'storeName'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tColumns('commissionValue')}
                    sortKey={'commissionValue'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tColumns('deliveryFee')}
                    sortKey={'deliveryFee'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tColumns('paymentMethod')}
                    sortKey={'paymentMethod'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tColumns('dateTime')}
                    sortKey={'dateTime'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHead>{tColumns('status')}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableShimmer limit={(pagination?.limit as 10 | 25 | 50 | 100) ?? 10} columns={11} />
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={11}>
                      <DisplayError
                        title={tErrors('fetchFailedTitle')}
                        message={returnErrorMessage(error as ApiErrorResponse)}
                        variant="error"
                      />
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11}>
                      <NoDataFound
                        title={tNoData('title')}
                        subtitle={tNoData('subtitle')}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.orderId} className="!h-[55px]">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{item.orderId.slice(0, 10) + '...'}</span>
                          <Copy
                            className="h-5 w-5 text-gray-600 hover:text-primary cursor-pointer"
                            onClick={() => handleCopy(item.orderId)}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-2">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={item.customerImage}
                              alt={item.customerName}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-accent">
                              {item.customerName?.slice(0, 2)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {item.customerName}
                        </span>
                      </TableCell>
                      <TableCell>{item.zoneType || t('notAvailable')}</TableCell>
                      <TableCell>{item.vendorName || t('notAvailable')}</TableCell>
                      <TableCell>{formatCurrency(item.orderAmount, resolvedCurrencySymbol)}</TableCell>
                      <TableCell>{item.storeName || t('notAvailable')}</TableCell>
                      <TableCell>{formatCurrency(item.commissionValue, resolvedCurrencySymbol)}</TableCell>
                      <TableCell>{formatCurrency(item.deliveryFee, resolvedCurrencySymbol)}</TableCell>
                      <TableCell>{item.paymentMethod || t('notAvailable')}</TableCell>
                      <TableCell>
                        {item.dateTime
                          ? moment(item.dateTime).format('DD MMM YYYY, hh:mm A')
                          : t('notAvailable')}
                      </TableCell>
                      <TableCell>
                        <Status status={item.status.toLocaleLowerCase()} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="p-3 bg-accent/30 border-t rounded-b-md">
              {pagination?.total > 0 && (
                <AppPagination
                  page={pagination.page}
                  defaultLimit={(pagination.limit as 10 | 25 | 50 | 100) ?? 10}
                  totalData={pagination.total}
                  totalPages={Math.ceil(pagination.total / pagination.limit)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
