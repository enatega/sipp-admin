'use client';

import { ApiErrorResponse } from '@/types';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { returnErrorMessage } from '@/lib/toast-error';
import { useGetUserOrders } from '@/hooks/api/super-admin/general/users';
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
import AppPagination from '@/components/shared/AppPagination';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import Status from '@/components/shared/Status';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';

interface HistoryProps {
  userId: string;
}

export function History({ userId }: HistoryProps) {
  const t = useTranslations('userDetail.history');
  const { currencySymbol } = useCurrency();
  const { data, isLoading, isError, error } = useGetUserOrders(userId);

  const {
    items: sortedHistory,
    requestSort,
    sortConfig,
  } = useSortableData(data?.data || []);

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-accent">
            <TableRow>
              <TableHeaderCell
                label={t('orderId')}
                sortKey="rideId"
                requestSort={requestSort}
                sortConfig={sortConfig}
                containerClass="ps-2"
              />
              <TableHeaderCell
                label={t('type')}
                sortKey="type"
                requestSort={requestSort}
                sortConfig={sortConfig}
                containerClass="ps-2"
              />
              <TableHeaderCell
                label={t('date')}
                sortKey="rideDate"
                requestSort={requestSort}
                sortConfig={sortConfig}
                containerClass="ps-2"
              />
              <TableHeaderCell
                label={t('amount')}
                sortKey="amount"
                requestSort={requestSort}
                sortConfig={sortConfig}
                containerClass="ps-2"
              />
              <TableHead className="font-semibold">{t('status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableShimmer limit={10 as TLimitType} columns={5} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="p-4">
                  <DisplayError
                    title={t('fetchFailed')}
                    message={
                      returnErrorMessage(error as ApiErrorResponse) ||
                      t('../errors.tryAgain')
                    }
                  />
                </TableCell>
              </TableRow>
            ) : sortedHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center p-4">
                  <NoDataFound
                    title={t('noOrdersTitle')}
                    subtitle={t('noOrdersSubtitle')}
                  />
                </TableCell>
              </TableRow>
            ) : (
              sortedHistory.map((order, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {String(order.rideId || '').slice(0, 8)}
                  </TableCell>
                  <TableCell>{order.app || order.type}</TableCell>
                  <TableCell>
                    {moment(order.rideDate).format('DD MMM YYYY, hh:mm A')}
                  </TableCell>
                  <TableCell>
                    {currencySymbol} {order.amount}
                  </TableCell>
                  <TableCell>
                    <Status status={order.status.toLowerCase()} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="p-3 bg-accent/30 border-t">
        {!isError && !isLoading && sortedHistory.length > 0 && (
          <AppPagination
            page={data?.page || 1}
            totalPages={Math.ceil((data?.total || 0) / (data?.limit || 10))}
            totalData={data?.total || 0}
            defaultLimit={(data?.limit || 10) as TLimitType}
          />
        )}
      </div>
    </div>
  );
}
