'use client';

import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useCurrency } from '@/hooks/use-currency';
import { useSortableData } from '@/hooks/use-sortable-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import NoDataFound from '@/components/shared/NoDataFound';
import Status from '@/components/shared/Status';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import { formatCurrency } from '@/lib/formatCurrency';
import { IStoreOrdersTable } from '@/components/store/deliveries/dashboard/types';

const StoreOrdersTable = ({ data, isLoading }: IStoreOrdersTable) => {
  const t = useTranslations('storeDeliveriesDashboard.ordersTable');
  const { currencySymbol } = useCurrency();
  const limit = 10;
  const orders = data || [];

  const { items, requestSort, sortConfig } = useSortableData(orders);
  const getStatusLabel = (status?: string | null) => {
    const normalized = String(status ?? '').trim().toLowerCase();
    if (!normalized) return t('notAvailable');

    const key = `statuses.${normalized}`;
    if (t.has(key)) return t(key);

    return normalized
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
          {t('title')}
        </h3>

        <div className="mb-4">
          <div className="rounded-md border overflow-auto">
            <Table className="min-w-[900px]">
              <TableHeader className="bg-accent rounded-t-md">
                <TableRow>
                  <TableHeaderCell
                    label={t('columns.orderId')}
                    sortKey="orderId"
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={t('columns.customerName')}
                    sortKey="customer.user.name"
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
                    label={t('columns.amount')}
                    sortKey="amount"
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={t('columns.date')}
                    sortKey="createdAt"
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={t('columns.riderName')}
                    sortKey="workerRider.user.name"
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableShimmer limit={limit as TLimitType} columns={6} />
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
                  items.map((order, index) => (
                    <TableRow
                      key={`${order.orderId}-${order.createdAt}-${index}`}
                      className="!h-[55px]"
                    >
                      <TableCell className="font-medium">
                        {order.orderId}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {order.customer?.user?.name || t('notAvailable')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Status
                          status={order.status}
                          label={getStatusLabel(order.status)}
                        />
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(order.amount, currencySymbol)}
                      </TableCell>
                      <TableCell>
                        {moment(order.createdAt).format('DD MMM YYYY, hh:mm A')}
                      </TableCell>
                      <TableCell>
                        {order.workerRider?.user?.name ? (
                          <div className="font-medium">
                            {order.workerRider.user.name}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            {t('notAvailable')}
                          </span>
                        )}
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
};

export default StoreOrdersTable;
