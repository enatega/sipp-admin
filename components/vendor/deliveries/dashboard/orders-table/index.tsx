'use client';

import moment from 'moment';
import { useTranslations } from 'next-intl';
import { VendorRecentOrder } from '@/types/entities/vendor/deliveries/dashboard';
import { formatCurrency } from '@/lib/formatCurrency';
import { useCurrency } from '@/hooks/use-currency';
import { useQueryParams } from '@/hooks/use-query-params';
import { useSortableData } from '@/hooks/use-sortable-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import Status from '@/components/shared/Status';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';

const VendorOrdersTable = ({
  data,
  isLoading,
  isError,
  errorMessage,
}: {
  data: VendorRecentOrder[];
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
}) => {
  const t = useTranslations('vendorDeliveriesDashboard.ordersTable');
  const tColumns = useTranslations('vendorDeliveriesDashboard.ordersTable.columns');
  const tErrors = useTranslations('vendorDeliveriesDashboard.ordersTable.errors');
  const { currencySymbol } = useCurrency();
  const { getParam } = useQueryParams();
  const limit = Number(getParam('limit')) || 10;

  // Sorting
  const { items, requestSort, sortConfig } =
    useSortableData<VendorRecentOrder>(data);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-3 sm:p-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            {t('title')}
          </h3>
        </div>

        <div className="mb-6">
          <div className="rounded-md border overflow-auto">
            <Table className="min-w-[1000px]">
              <TableHeader className="bg-accent rounded-t-md">
                <TableRow>
                  <TableHeaderCell
                    label={tColumns('orderId')}
                    sortKey="orderId"
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tColumns('customerName')}
                    sortKey="customer.user.name"
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tColumns('storeName')}
                    sortKey="storeName"
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tColumns('productName')}
                    sortKey="productName"
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tColumns('status')}
                    sortKey="status"
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tColumns('amount')}
                    sortKey="amount"
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tColumns('date')}
                    sortKey="createdAt"
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                  <TableHeaderCell
                    label={tColumns('riderName')}
                    sortKey="workerRider.user.name"
                    requestSort={requestSort}
                    sortConfig={sortConfig}
                    containerClass="pl-3"
                  />
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableShimmer limit={limit as TLimitType} columns={8} />
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <DisplayError
                        title={tErrors('fetchFailedTitle')}
                        message={errorMessage}
                        variant="error"
                      />
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <NoDataFound
                        title={t('noDataTitle')}
                        subtitle={t('noDataSubtitle')}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((order) => (
                    <TableRow key={order?.orderId} className="h-[55px]!">
                      <TableCell className="font-medium">
                        {order?.orderId}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {order?.customer?.user?.name ?? t('notAvailable')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {order?.storeName}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {order?.productName}
                      </TableCell>
                      <TableCell>
                        <Status status={t(`statuses.${order.status}`)} />
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(order.amount, currencySymbol)}
                      </TableCell>
                      <TableCell>
                        {moment(order.createdAt).format('DD MMM YYYY, hh:mm A')}
                      </TableCell>
                      <TableCell>
                        {order?.workerRider?.user?.name ? (
                          <div>
                            <div className="font-medium">
                              {order.workerRider.user.name}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
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

export default VendorOrdersTable;
