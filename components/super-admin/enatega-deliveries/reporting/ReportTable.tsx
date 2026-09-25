'use client';

import type { ApiErrorResponse } from '@/types';
import { useTranslations } from 'next-intl';
import type { AdminReportRow } from '@/types/api/super-admin/enatega-deliveries/reporting/reporting.api';
import { formatCurrency as formatCurrencyWithSymbol } from '@/lib/formatCurrency';
import { returnErrorMessage } from '@/lib/toast-error';
import { cn } from '@/lib/utils';
import {
  fetchAdminReportRows,
  useAdminReportQueryParams,
  useGetAdminReport,
} from '@/hooks/api/super-admin/enatega-deliveries/reporting';
import { useCurrency } from '@/hooks/use-currency';
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
import {
  TableShimmer,
  type TLimitType,
} from '@/components/shared/TableShimmer';
import type { ReportColumn, ReportTab } from './report-config';
import { getReportValue, humanize, reportMessageKey } from './report-values';

const VALID_LIMITS: TLimitType[] = [10, 25, 50, 100];
const RIGHT_ALIGNED_FORMATS = new Set(['currency', 'number', 'percentage']);

const isRightAlignedColumn = (column: ReportColumn) =>
  RIGHT_ALIGNED_FORMATS.has(column.format ?? '');

const getRowKey = (
  reportKey: string,
  row: AdminReportRow,
  rowIndex: number,
) => {
  const identity = [
    'orderId',
    'storeId',
    'riderId',
    'customerId',
    'productId',
    'promotionType',
    'promotionCode',
  ]
    .map((key) => row[key])
    .filter((value) => value !== null && value !== undefined && value !== '')
    .map(String)
    .join('-');

  return `${reportKey}-${identity || 'row'}-${rowIndex}`;
};

export function ReportTable({ report }: { report: ReportTab }) {
  const params = useAdminReportQueryParams();
  const tTable = useTranslations('reporting.table');
  const tTabs = useTranslations('reporting.tabs');
  const tColumns = useTranslations('reporting.columns');
  const { currencySymbol } = useCurrency();
  const { data, isLoading, isError, error, refetch } = useGetAdminReport(
    report.key,
  );
  const rows = data?.data ?? [];
  const limit = VALID_LIMITS.includes(
    (data?.limit ?? params.limit ?? 10) as TLimitType,
  )
    ? ((data?.limit ?? params.limit ?? 10) as TLimitType)
    : 10;

  const formatValue = (row: AdminReportRow, column: ReportColumn) => {
    const value = getReportValue(row, column.keys);
    if (value === null) return '—';
    if (column.format === 'currency')
      return formatCurrencyWithSymbol(Number(value) || 0, currencySymbol);
    if (column.format === 'number')
      return new Intl.NumberFormat().format(Number(value) || 0);
    if (column.format === 'percentage')
      return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(Number(value) || 0)}%`;
    if (column.format === 'date') {
      const date = new Date(String(value));
      return Number.isNaN(date.getTime())
        ? '—'
        : date.toLocaleString(undefined, { timeZone: 'America/Costa_Rica' });
    }
    if (column.format === 'boolean')
      return value ? tTable('yes') : tTable('no');
    if (column.format === 'status') return humanize(value);
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  };

  const downloadColumns = report.columns.map((column) => ({
    header: tColumns(reportMessageKey(column.label)),
    dataKey: column.keys[0],
    formatter: (row: AdminReportRow) => formatValue(row, column),
  }));

  return (
    <section className="rounded-xl border bg-white shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">
              {tTabs(`${report.key.replace('/', '_')}.label`)}
            </h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {tTable('records', { count: data?.total ?? 0 })}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {tTabs(`${report.key.replace('/', '_')}.description`)}
          </p>
        </div>
        <DownloadButtons
          fileName={report.fileName}
          data={rows}
          columns={downloadColumns}
          formats={['csv', 'excel']}
          fetchAll={() => fetchAdminReportRows(report.key, params)}
        />
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-max">
          <TableHeader className="bg-accent">
            <TableRow>
              {report.columns.map((column) => (
                <TableHead
                  key={`${column.label}-${column.keys[0]}`}
                  className={cn(
                    'whitespace-nowrap px-4',
                    isRightAlignedColumn(column) && 'text-right tabular-nums',
                  )}
                >
                  {tColumns(reportMessageKey(column.label))}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableShimmer limit={limit} columns={report.columns.length} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={report.columns.length} className="p-5">
                  <DisplayError
                    title={tTable('loadError')}
                    message={returnErrorMessage(error as ApiErrorResponse)}
                    onRetry={() => void refetch()}
                  />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={report.columns.length} className="p-5">
                  <NoDataFound
                    title={tTable('emptyTitle')}
                    subtitle={tTable('emptySubtitle')}
                  />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, rowIndex) => (
                <TableRow key={getRowKey(report.key, row, rowIndex)}>
                  {report.columns.map((column) => (
                    <TableCell
                      key={`${column.label}-${column.keys[0]}`}
                      className={cn(
                        'whitespace-nowrap px-4',
                        isRightAlignedColumn(column) &&
                          'text-right tabular-nums',
                      )}
                    >
                      {column.format === 'status' ? (
                        <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                          {formatValue(row, column)}
                        </span>
                      ) : (
                        formatValue(row, column)
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data?.meta ? (
        <div className="flex flex-wrap gap-x-5 gap-y-1 border-t px-5 py-3 text-xs text-muted-foreground">
          <span>
            {tTable('dateBasis')}: {humanize(data.meta.dateBasis)}
          </span>
          <span>
            {tTable('timezone')}: {data.meta.timezone}
          </span>
          {data.meta.knownLimitations?.map((limitation) => (
            <span key={limitation}>{limitation}</span>
          ))}
        </div>
      ) : null}

      {data && data.totalPages > 0 ? (
        <div className="border-t p-4">
          <AppPagination
            page={data.page}
            totalPages={data.totalPages}
            totalData={data.total}
            defaultLimit={limit}
          />
        </div>
      ) : null}
    </section>
  );
}
