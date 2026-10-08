'use client';

import { EnategaDeliveriesDashboardRecentOrder } from '@/types/api/super-admin/enatega-deliveries/dashboard.api';
import { useTranslations } from 'next-intl';
import { useCurrency } from '@/hooks/use-currency';
import { useSortableData } from '@/hooks/use-sortable-data';
import { useQueryParams } from '@/hooks/use-query-params';
import { useGetZonesSimple } from '@/hooks/api/super-admin/general/zones';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import Status from '@/components/shared/Status';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer } from '@/components/shared/TableShimmer';
import CopyButton from '@/components/shared/CopyButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RecentOrdersTableProps {
  data?: EnategaDeliveriesDashboardRecentOrder[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
}

export function RecentOrdersTable({
  data,
  isLoading,
  isError,
  errorMessage,
}: RecentOrdersTableProps) {
  const t = useTranslations('lumiFood.dashboard.tables.recentOrders');
  const { currencySymbol } = useCurrency();
  const { getParam, setParams } = useQueryParams();
  const { data: zones, isLoading: zonesLoading, isError: zonesError } = useGetZonesSimple();
  const selectedZoneId = getParam('recentOrdersZoneId');
  const orders = data ?? [];
  const notAvailable = t('notAvailable');
  const notAssigned = t('notAssigned');

  const { items, requestSort, sortConfig } = useSortableData(orders);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold">
            {t('title')}
          </h3>
          <div>
            <label htmlFor="recent-orders-zone" className="sr-only">
              {t('zoneFilterLabel')}
            </label>
            <Select
              value={selectedZoneId || 'all'}
              onValueChange={(value) =>
                setParams({ recentOrdersZoneId: value === 'all' ? null : value })
              }
              disabled={zonesLoading || zonesError}
            >
              <SelectTrigger id="recent-orders-zone" className="w-[190px] max-w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allZones')}</SelectItem>
                {zones?.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zone.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-4">
          <div className="rounded-md border overflow-auto">
            <Table className="min-w-[900px]">
              <TableHeader className="bg-accent rounded-t-md">
                <TableRow>
                  <TableHead className="pl-3 py-4">{t('orderId')}</TableHead>
                  <TableHead className="pl-3 py-4">{t('module')}</TableHead>
                  <TableHead className="pl-3 py-4">{t('serviceType')}</TableHead>
                  <TableHead className="pl-3 py-4">{t('customer')}</TableHead>
                  <TableHead className="pl-3 py-4">{t('workerRider')}</TableHead>
                  <TableHead className="pl-3 py-4">{t('location')}</TableHead>
                  <TableHeaderCell
                    label={t('amount')}
                    sortKey={'amount'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHead>{t('status')}</TableHead>
                  <TableHeaderCell
                    label={t('createdAt')}
                    sortKey={'createdAt'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableShimmer limit={10} columns={9} />
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <DisplayError
                        title={t('loadFailedTitle')}
                        message={errorMessage}
                        variant="error"
                      />
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <NoDataFound
                        title={t('noDataTitle')}
                        subtitle={t('noDataSubtitle')}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.orderId} className="!h-[55px]">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span
                            className="truncate max-w-[220px]"
                            title={item.orderId || undefined}
                          >
                            {item.orderId
                              ? item.orderId.slice(0, 8)
                              : notAvailable}
                          </span>
                          {item.orderId ? <CopyButton text={item.orderId} /> : null}
                        </div>
                      </TableCell>
                      <TableCell>{item.module}</TableCell>
                      <TableCell>
                        <span>{item.serviceType}</span>
                      </TableCell>
                      <TableCell>
                        <span>{item.customer?.user?.name || notAvailable}</span>
                      </TableCell>
                      <TableCell>
                        {item.workerRider == null
                          ? notAssigned
                          : item.workerRider?.user?.name || notAvailable}
                      </TableCell>
                      <TableCell>{item.location || notAvailable}</TableCell>
                      <TableCell>
                        {currencySymbol}{' '}
                        {Number(item.amount ?? 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        <Status status={(item.status || '').toLowerCase()} />
                      </TableCell>
                      <TableCell>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : notAvailable}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
