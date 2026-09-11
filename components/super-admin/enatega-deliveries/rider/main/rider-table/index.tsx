'use client';

import { useState } from 'react';
import { ApiErrorResponse } from '@/types';
import moment from 'moment';
import { DeliveryRider } from '@/types/entities/super-admin/enatega-deliveries/rider';
import { useTranslations } from 'next-intl';
import { returnErrorMessage } from '@/lib/toast-error';
import { useGetDeliveryRiders } from '@/hooks/api/super-admin/enatega-deliveries/riders';
import { useCapitalize } from '@/hooks/use-capitalize';
import { useCurrency } from '@/hooks/use-currency';
import { useQueryParams } from '@/hooks/use-query-params';
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
import Filters from '../filters';
import RiderDetailDialog from '../rider-detail-dialog';
import { RiderActionsDropdown } from './RiderActionsDropdown';

export function RiderTable() {
  const t = useTranslations('driverManagement.driversTable');
  const tHeaders = useTranslations('driverManagement.driversTable.tableHeaders');
  const { getParam } = useQueryParams();
  const limit = Number(getParam('limit')) || 10;
  const { capitalizeFirstLetter } = useCapitalize();

  const [selectedRider, setSelectedRider] = useState<DeliveryRider | null>(
    null,
  );

  // ===== API HOOK USAGE =====
  const { data, isLoading, isFetching, isError, error } = useGetDeliveryRiders({
    refetchOnWindowFocus: false,
  });
  const showTableLoading = isLoading || isFetching;
  const { currencySymbol } = useCurrency();

  const riders = (data?.riders || []) as unknown as DeliveryRider[];
  const { items, requestSort, sortConfig } =
    useSortableData<DeliveryRider>(riders);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <Filters />
        <div className="">
          <DownloadButtons<DeliveryRider>
            columns={[
              {
                dataKey: 'userProfile.user.name',
                header: tHeaders('name'),
              },
              {
                dataKey: 'userProfile.user.phone',
                header: tHeaders('phoneNumber'),
              },
              {
                dataKey: 'userProfile.user.email',
                header: tHeaders('email'),
              },
              {
                dataKey: 'zone.title',
                header: tHeaders('zoneType'),
              },
              {
                dataKey: 'vehicle.vehicleType.name',
                header: tHeaders('vehicleType'),
              },
              {
                dataKey: 'totalDeliveries',
                header: tHeaders('totalDeliveries'),
              },
              {
                dataKey: 'totalEarnings',
                header: tHeaders('totalEarnings'),
              },
              {
                dataKey: 'averageRating',
                header: tHeaders('ratings'),
              },
              {
                dataKey: 'created_at',
                header: tHeaders('registrationDate'),
              },
              {
                dataKey: 'status',
                header: tHeaders('kycStatus'),
              },
              {
                dataKey: 'userProfile.user.block_status',
                header: tHeaders('blockStatus'),
              },
            ]}
            data={riders}
            fileName="riders"
          />
        </div>
      </div>
      <div className="rounded-md border overflow-auto mb-4">
        <Table className="min-w-[900px]">
          <TableHeader className="bg-accent rounded-t-md">
            <TableRow>
              <TableHeaderCell
                label={tHeaders('name')}
                sortKey={'userProfile.user.name'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tHeaders('email')}
                sortKey={'userProfile.user.email'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tHeaders('phoneNumber')}
                sortKey={'userProfile.user.phone'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tHeaders('registrationDate')}
                sortKey={'created_at'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />

              <TableHeaderCell
                label={tHeaders('vehicleType')}
                sortKey={'vehicle.vehicleType.name'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tHeaders('zoneType')}
                sortKey={'zone.title'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tHeaders('totalDeliveries')}
                sortKey={'totalDeliveries'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tHeaders('totalEarnings')}
                sortKey={'totalEarnings'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tHeaders('ratings')}
                sortKey={'averageRating'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHead>{tHeaders('kycStatus')}</TableHead>
              <TableHead>{tHeaders('blockStatus')}</TableHead>
              <TableHead>{tHeaders('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showTableLoading ? (
              <TableShimmer limit={limit as TLimitType} columns={12} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={12} className="p-4">
                  <DisplayError
                    title={t('failedToFetchRiders')}
                    message={
                      returnErrorMessage(error as ApiErrorResponse) ||
                      t('tryAgainLater')
                    }
                  />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center p-4">
                  <NoDataFound title={t('noRiderFound')} />
                </TableCell>
              </TableRow>
            ) : (
              items.map((rider) => (
                <TableRow
                  className={`!h-[55px]  ${rider.status === 'approved' && 'cursor-pointer'}`}
                  key={rider.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (rider.status === 'approved') {
                      setSelectedRider(rider);
                    }
                  }}
                >
                  <TableCell>
                    {capitalizeFirstLetter(rider.userProfile?.user?.name ?? '')}
                  </TableCell>
                  <TableCell>
                    {rider.userProfile?.user?.email ?? t('notAvailable')}
                  </TableCell>
                  <TableCell>
                    {rider.userProfile?.user?.phone ?? t('notAvailable')}
                  </TableCell>
                  <TableCell>
                    {rider.created_at
                      ? moment(rider.created_at).format('DD MMM YYYY, hh:mm A')
                      : t('notAvailable')}
                  </TableCell>
                  <TableCell>
                    {capitalizeFirstLetter(
                      rider.vehicle?.vehicleType?.name ?? t('notAvailable'),
                    )}
                  </TableCell>
                  <TableCell>
                    {capitalizeFirstLetter(rider.zone?.title ?? '')}
                  </TableCell>
                  <TableCell>{rider.totalDeliveries ?? t('notAvailable')}</TableCell>
                  <TableCell>
                    {rider.totalEarnings !== null &&
                    rider.totalEarnings !== undefined
                      ? `${currencySymbol}${rider.totalEarnings}`
                      : t('notAvailable')}
                  </TableCell>
                  <TableCell>{rider.averageRating ?? t('notAvailable')}</TableCell>

                  <TableCell>
                    <Status status={rider.status.toLowerCase()} />
                  </TableCell>
                  <TableCell>
                    <Status
                      status={
                        rider.userProfile?.user?.block_status === true
                          ? 'blocked'
                          : 'active'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <RiderActionsDropdown
                      rider={rider}
                      onViewProfile={(rider) => setSelectedRider(rider)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="p-3 bg-accent/30 border-t rounded-b-md">
          {!showTableLoading && !isError && (
            <AppPagination
              page={data?.currentPage || 1}
              totalPages={data?.totalPages || 1}
              totalData={data?.total || 0}
              defaultLimit={limit as TLimitType}
            />
          )}
        </div>
      </div>

      {/* Rider Detail Dialog */}
      {selectedRider && (
        <RiderDetailDialog
          open={!!selectedRider}
          riderId={selectedRider.id}
          onOpenChange={(open) => {
            if (!open) setSelectedRider(null);
          }}
        />
      )}
    </div>
  );
}
