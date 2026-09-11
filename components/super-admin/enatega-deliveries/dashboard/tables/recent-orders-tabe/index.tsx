'use client';

import { EnategaDeliveriesDashboardRecentOrder } from '@/types/api/super-admin/enatega-deliveries/dashboard.api';
import { useTranslations } from 'next-intl';
import { useCurrency } from '@/hooks/use-currency';
import { useSortableData } from '@/hooks/use-sortable-data';
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
  const orders = data ?? [];
  const notAvailable = t('notAvailable');
  const notAssigned = t('notAssigned');

  const { items, requestSort, sortConfig } = useSortableData(orders);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-3 sm:p-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            {t('title')}
          </h3>
        </div>

        <div className="mb-4">
          <div className="rounded-md border overflow-auto">
            <Table className="min-w-[900px]">
              <TableHeader className="bg-accent rounded-t-md">
                <TableRow>
                  <TableHeaderCell
                    label={t('orderId')}
                    sortKey={'orderId'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={t('module')}
                    sortKey={'module'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={t('serviceType')}
                    sortKey={'serviceType'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={t('customer')}
                    sortKey={'customer.user.name'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={t('workerRider')}
                    sortKey={'workerRider.user.name'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={t('location')}
                    sortKey={'location'}
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
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
