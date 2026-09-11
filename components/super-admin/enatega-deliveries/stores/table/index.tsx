'use client';

import { ApiErrorResponse, DeliveryStore } from '@/types';
import { useTranslations } from 'next-intl';
import { returnErrorMessage } from '@/lib/toast-error';
import { useGetAllDeliveryStores } from '@/hooks/api/super-admin/enatega-deliveries/stores';
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
import NoDataFound from '@/components/shared/NoDataFound';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import { getDownloadColumns } from './constants';
import Filters from './Filters';
import StoreRow from './StoreRow';

export default function StoresTable() {
  const t = useTranslations('lumiFood.stores');
  const tErrors = useTranslations('lumiFood.stores.errors');

  const {
    data: storesResponse,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetAllDeliveryStores();
  const showTableLoading = isLoading || isFetching;

  const stores = storesResponse?.data || [];
  const totalCount = storesResponse?.total || 0;
  const currentPage = storesResponse?.page || 1;
  const limit = storesResponse?.limit || 10;
  const totalPages = Math.ceil(totalCount / limit);

  // Implement client-side sorting
  const {
    items: sortedStores,
    requestSort,
    sortConfig,
  } = useSortableData(stores);

  const downloadColumns = getDownloadColumns(t);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Filters />
        <DownloadButtons<DeliveryStore>
          fileName="stores_report"
          data={stores}
          columns={downloadColumns}
        />
      </div>

      <div className="mb-4">
        <div className="rounded-md border overflow-auto mt-4">
          <Table className="min-w-[1400px]">
            <TableHeader className="bg-accent rounded-t-md">
              <TableRow>
                <TableHeaderCell
                  label={t('table.name')}
                  sortKey="storename"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-2"
                />
                <TableHeaderCell
                  label={t('table.totalSales')}
                  sortKey="totalSales"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                />
                <TableHeaderCell
                  label={t('table.shopType')}
                  sortKey="shoptypename"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                />
                <TableHeaderCell
                  label={t('table.address')}
                  sortKey="address"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                />
                <TableHeaderCell
                  label={t('table.zone')}
                  sortKey="zonename"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                />
                <TableHeaderCell
                  label={t('table.creationDate')}
                  sortKey="createdat"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                />
                <TableHeaderCell
                  label={t('table.availability')}
                  sortKey="isavailable"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                />
                <TableHeaderCell
                  label={t('table.status')}
                  sortKey="status"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                />
                <TableHeaderCell
                  label={t('table.activeOrders')}
                  sortKey="activeorders"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                />
                <TableHeaderCell
                  label={t('table.rating')}
                  sortKey="averagerating"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                />
                <TableHeaderCell
                  label={t('table.action')}
                  sortKey="id"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                />
              </TableRow>
            </TableHeader>
            <TableBody>
              {showTableLoading ? (
                <TableShimmer limit={limit as TLimitType} columns={11} />
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={11} className="p-4">
                    <DisplayError
                      title={tErrors('fetchFailedTitle')}
                      message={
                        returnErrorMessage(error as ApiErrorResponse) ||
                        tErrors('genericRetryMessage')
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : stores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center">
                    <NoDataFound title={tErrors('noStores')} />
                  </TableCell>
                </TableRow>
              ) : (
                sortedStores.map((store) => (
                  <StoreRow key={store.id} store={store} />
                ))
              )}
            </TableBody>
          </Table>
          <div className="p-3 bg-accent/30 border-t rounded-b-md">
            {!showTableLoading && !isError && (
              <AppPagination
                page={currentPage}
                totalPages={totalPages}
                totalData={totalCount}
                defaultLimit={limit as TLimitType}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
