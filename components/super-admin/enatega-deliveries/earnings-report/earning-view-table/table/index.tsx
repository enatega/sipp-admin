'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  ApiErrorResponse,
  EarningReportItem,
  EarningReportPagination,
} from '@/types';
import { Copy } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { fetchAllReport } from '@/lib/fetch-all-report';
import { formatCurrency, resolveCurrencySymbol } from '@/lib/formatCurrency';
import { buildScopedDeliveriesAdminPathFromCurrent } from '@/lib/routes';
import { returnErrorMessage } from '@/lib/toast-error';
import { useCurrency } from '@/hooks/use-currency';
import { useDeliveriesAdminModeScope } from '@/hooks/use-deliveries-admin-mode-scope';
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
import { DownloadButtons } from '@/components/shared/DownloadButtons';
import NoDataFound from '@/components/shared/NoDataFound';
import Status from '@/components/shared/Status';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer } from '@/components/shared/TableShimmer';
import { EarningReportsFilters } from '../table-filters';

export function EarningViewTable({
  earningData,
  isLoading,
  isError,
  error,
  pagination,
}: {
  earningData: EarningReportItem[];
  isLoading: boolean;
  isError: boolean;
  error: ApiErrorResponse | null;
  pagination: EarningReportPagination;
}) {
  const tTable = useTranslations('lumiFood.earningsReports.table');
  const tCommission = useTranslations('orders.orderDetail.paymentInformation');
  const tHeaders = useTranslations('lumiFood.earningsReports.table.headers');
  const tDownload = useTranslations('lumiFood.earningsReports.table.download');
  const tToasts = useTranslations('lumiFood.earningsReports.table.toasts');
  const { currencySymbol } = useCurrency();
  const modeScope = useDeliveriesAdminModeScope();
  const commissionCurrency = resolveCurrencySymbol(currencySymbol);
  const router = useRouter();
  const pathname = usePathname();
  const notAvailable = tTable('notAvailable');

  const loData = earningData;

  const { items, requestSort, sortConfig } = useSortableData(loData);

  const earningsDownloadColumns = [
    { header: tDownload('orderId'), dataKey: 'orderId' },
    { header: tDownload('customerName'), dataKey: 'customerName' },
    { header: tDownload('zoneType'), dataKey: 'zoneType' },
    { header: tDownload('vendorName'), dataKey: 'vendorName' },
    {
      header: tDownload('orderAmount'),
      dataKey: 'orderAmount',
      formatter: (item: EarningReportItem) =>
        `${commissionCurrency} ${item.orderAmount}`,
    },
    { header: tDownload('storeName'), dataKey: 'storeName' },
    {
      header: tDownload('commissionValue'),
      dataKey: 'commissionValue',
      formatter: (item: EarningReportItem) =>
        `${commissionCurrency} ${item.commissionValue}`,
    },
    {
      header: tDownload('deliveryFee'),
      dataKey: 'deliveryFee',
      formatter: (item: EarningReportItem) =>
        `${commissionCurrency} ${item.deliveryFee}`,
    },
    ...(
      [
        'commissionNet',
        'vatOnCommission',
        'totalCommissionDebit',
        'sippAbsorbedVat',
      ] as const
    ).map((field) => ({
      header: tCommission(`${field}Label`),
      dataKey: field,
      formatter: (item: EarningReportItem) =>
        item.commissionSnapshotAvailable && item[field] != null
          ? formatCurrency(item[field], commissionCurrency)
          : '',
    })),
    { header: tDownload('paymentMethod'), dataKey: 'paymentMethod' },
    { header: tDownload('dateTime'), dataKey: 'dateTime' },
    { header: tDownload('status'), dataKey: 'status' },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(tToasts('orderIdCopied'));
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-3 sm:p-4">
        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            {tTable('title')}
          </h3>
          <div className="flex flex-col flex-wrap sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
            <EarningReportsFilters />
            <DownloadButtons
              fileName="earnings_report"
              data={items}
              columns={earningsDownloadColumns}
              fetchAll={() =>
                fetchAllReport<EarningReportItem>(
                  '/apps/deliveries/admin/earning-reports/view',
                  {
                    params: { modeScope },
                    select: (response) => {
                      const result = response as {
                        data: EarningReportItem[];
                        pagination: { total: number };
                      };
                      return {
                        data: result.data,
                        total: result.pagination.total,
                      };
                    },
                  },
                )
              }
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
                    label={tHeaders('orderId')}
                    sortKey={'orderId'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tHeaders('customerName')}
                    sortKey={'customerName'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tHeaders('zoneType')}
                    sortKey={'zoneType'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tHeaders('vendorName')}
                    sortKey={'vendorName'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tHeaders('orderAmount')}
                    sortKey={'orderAmount'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tHeaders('storeName')}
                    sortKey={'storeName'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tHeaders('commissionValue')}
                    sortKey={'commissionValue'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tHeaders('deliveryFee')}
                    sortKey={'deliveryFee'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tHeaders('paymentMethod')}
                    sortKey={'paymentMethod'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tHeaders('dateTime')}
                    sortKey={'date'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHead>{tHeaders('status')}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableShimmer limit={pagination?.limit} columns={11} />
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={11}>
                      <DisplayError
                        title={tTable('loadError')}
                        message={returnErrorMessage(error as ApiErrorResponse)}
                        variant="error"
                      />
                    </TableCell>
                  </TableRow>
                ) : loData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11}>
                      <NoDataFound
                        title={tTable('noData')}
                        subtitle={tTable('noDataSubtitle')}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow
                      key={item.orderId}
                      className="!h-[55px] cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          buildScopedDeliveriesAdminPathFromCurrent(
                            pathname,
                            `/enatega-deliveries/orders/${item?.orderId}`,
                          ),
                        );
                      }}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{item?.orderId.slice(0, 10) + '...'}</span>
                          <Copy
                            className="h-5 w-5 text-gray-600 hover:text-primary cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(item?.orderId);
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-2">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={item?.customerImage || ''}
                              alt={item?.customerName || ''}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-accent">
                              {item?.customerName?.slice(0, 2)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {item?.customerName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span>{item?.zoneType || notAvailable}</span>
                      </TableCell>
                      <TableCell>
                        <span>{item?.vendorName || notAvailable}</span>
                      </TableCell>
                      <TableCell>
                        {item?.orderAmount != null ? (
                          <span>
                            {currencySymbol ?? 'QR'} {item?.orderAmount}
                          </span>
                        ) : (
                          <span>{notAvailable}</span>
                        )}
                      </TableCell>
                      <TableCell>{item?.storeName || notAvailable}</TableCell>
                      <TableCell>
                        {item.commissionSnapshotAvailable ? (
                          <div className="space-y-1 text-sm tabular-nums">
                            {(
                              [
                                'commissionNet',
                                'vatOnCommission',
                                'totalCommissionDebit',
                              ] as const
                            ).map((field) => (
                              <div
                                key={field}
                                className="flex justify-between items-start gap-4"
                              >
                                <span className="min-w-0">
                                  {tCommission(`${field}Label`)}
                                </span>
                                <span className="shrink-0">
                                  {formatCurrency(
                                    item[field] ?? 0,
                                    commissionCurrency,
                                  )}
                                </span>
                              </div>
                            ))}
                            {item.sippAbsorbedVat != null &&
                              item.sippAbsorbedVat > 0 && (
                                <div className="flex justify-between items-start gap-4">
                                  <span className="min-w-0">
                                    {tCommission('sippAbsorbedVatLabel')}
                                  </span>
                                  <span className="shrink-0">
                                    {formatCurrency(
                                      item.sippAbsorbedVat,
                                      commissionCurrency,
                                    )}
                                  </span>
                                </div>
                              )}
                          </div>
                        ) : item?.commissionValue != null ? (
                          <span>
                            {currencySymbol ?? 'QR'} {item?.commissionValue}
                          </span>
                        ) : (
                          <span>{notAvailable}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item?.deliveryFee != null ? (
                          <span>
                            {currencySymbol ?? 'QR'} {item?.deliveryFee}
                          </span>
                        ) : (
                          <span>{notAvailable}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item?.paymentMethod || notAvailable}
                      </TableCell>
                      <TableCell>
                        {item?.dateTime
                          ? moment(item?.dateTime).format(
                              'DD MMM YYYY, hh:mm A',
                            )
                          : notAvailable}
                      </TableCell>
                      <TableCell>
                        {item?.status ? (
                          <Status status={item.status.toLocaleLowerCase()} />
                        ) : (
                          <span>{notAvailable}</span>
                        )}
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
                  defaultLimit={pagination.limit}
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
