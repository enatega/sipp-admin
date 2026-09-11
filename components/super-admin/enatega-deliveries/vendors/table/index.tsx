'use client';

import { ApiErrorResponse } from '@/types';
import { useTranslations } from 'next-intl';
import { formatDateTime } from '@/lib/formatDateTime';
import { returnErrorMessage } from '@/lib/toast-error';
import { useGetAllDeliveryVendors } from '@/hooks/api/super-admin/enatega-deliveries/vendors';
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
import { DownloadButtons } from '@/components/shared/DownloadButtons';
import NoDataFound from '@/components/shared/NoDataFound';
import Status from '@/components/shared/Status';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import { Filters } from '../filters';
import VendorActions from './VendorActions';

type VendorTableProps = {
  activeTab?: string;
};

export function VendorTable({ activeTab }: VendorTableProps) {
  const t = useTranslations('lumiFood.vendors.table');
  const tErrors = useTranslations('lumiFood.vendors.table.errors');
  const { currencySymbol } = useCurrency();

  const {
    data: vendorsResponse,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetAllDeliveryVendors(
    { placeholderData: (previous) => previous },
    { statusFilter: activeTab },
  );

  const showTableLoading = isLoading || isFetching;

  const vendors = vendorsResponse?.data || [];
  const totalCount = vendorsResponse?.total || 0;
  const currentPage = vendorsResponse?.page || 1;
  const limit = vendorsResponse?.limit || 10;
  const totalPages = Math.ceil(totalCount / limit);

  // Implement client-side sorting
  const {
    items: sortedVendors,
    requestSort,
    sortConfig,
  } = useSortableData(vendors);

  return (
    <div className="w-full">
      <div className="flex gap-4 flex-wrap items-center justify-between mb-4">
        <Filters />
        <div className="">
          <DownloadButtons
            columns={[
              { dataKey: 'name', header: t('name') },
              { dataKey: 'phone', header: t('phone') },
              { dataKey: 'email', header: t('email') },
              { dataKey: 'createdat', header: t('registrationDate') },
              { dataKey: 'zonename', header: t('zone') },
              { dataKey: 'totalStores', header: t('totalStores') },
              { dataKey: 'totalOrders', header: t('totalOrders') },
              { dataKey: 'totalSales', header: t('totalSales') },
              { dataKey: `status`, header: t('status') },
              { dataKey: `blockstatus`, header: t('blockStatus') },
            ]}
            data={vendors}
            fileName="vendors"
          />
        </div>
      </div>
      <div className="rounded-md border overflow-auto mb-4">
        <Table className="min-w-[900px]">
          <TableHeader className="bg-accent rounded-t-md">
            <TableRow>
              <TableHeaderCell
                label={t('name')}
                sortKey={'name'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={t('email')}
                sortKey={'email'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={t('phoneNumber')}
                sortKey={'phone'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={t('registrationDate')}
                sortKey={'createdat'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={t('zone')}
                sortKey={'zonename'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={t('totalStores')}
                sortKey={'totalStores'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={t('totalOrders')}
                sortKey={'totalOrders'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={t('totalSales')}
                sortKey={'totalSales'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showTableLoading ? (
              <TableShimmer limit={limit as TLimitType} columns={10} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={10} className="p-4">
                  <DisplayError
                    title={tErrors('fetchFailedTitle')}
                    message={
                      returnErrorMessage(error as ApiErrorResponse) ||
                      tErrors('fetchFailedMessage')
                    }
                  />
                </TableCell>
              </TableRow>
            ) : vendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center">
                  <NoDataFound title={t('noDataTitle')} />
                </TableCell>
              </TableRow>
            ) : (
              sortedVendors.map((vendor, index) => (
                <TableRow
                  className={`!h-[55px] cursor-pointer`}
                  key={`${vendor.id}-${index}`}
                >
                  <TableCell>{vendor.name ?? t('notAvailable')}</TableCell>
                  <TableCell>{vendor.email ?? t('notAvailable')}</TableCell>
                  <TableCell>{vendor.phone ?? t('notAvailable')}</TableCell>
                  <TableCell>
                    {vendor.createdat
                      ? formatDateTime(vendor.createdat, t('notAvailable'))
                      : t('notAvailable')}
                  </TableCell>
                  <TableCell>{vendor.zonename ?? t('notAvailable')}</TableCell>
                  <TableCell>
                    {vendor.totalStores ?? t('notAvailable')}
                  </TableCell>
                  <TableCell>
                    {vendor.totalOrders ?? t('notAvailable')}
                  </TableCell>
                  <TableCell>
                    {vendor.totalSales
                      ? `${currencySymbol}${vendor.totalSales}`
                      : t('notAvailable')}
                  </TableCell>
                  <TableCell>
                    <Status
                      status={
                        vendor.blockstatus
                          ? 'blocked'
                          : (vendor.status?.toLocaleLowerCase() ?? 'pending')
                      }
                    />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <VendorActions vendor={vendor} />
                  </TableCell>
                </TableRow>
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
  );
}
