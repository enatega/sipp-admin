'use client';

import { useState } from 'react';
import { ApiErrorResponse, DeliveriesZone } from '@/types';
import { MoreVertical, PenIcon, TrashIcon } from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import {
  useDeleteDeliveriesZone,
  useGetDeliveriesZones,
} from '@/hooks/api/super-admin/general/deliveries-zones';
import { useQueryParams } from '@/hooks/use-query-params';
import { useSortableData } from '@/hooks/use-sortable-data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import AppPagination from '@/components/shared/AppPagination';
import DisplayError from '@/components/shared/DisplayError';
import { DownloadButtons } from '@/components/shared/DownloadButtons';
import { fetchAllReport } from '@/lib/fetch-all-report';
import NoDataFound from '@/components/shared/NoDataFound';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import TooltipText from '@/components/shared/TooltipText';
import EditZoneDrawer from '../edit-zone';
import Filters from './Filters';

export default function DeliveriesZonesTable() {
  const { getParam } = useQueryParams();
  const limit = Number(getParam('deliveriesLimit')) || 10;
  const [editingZone, setEditingZone] = useState<DeliveriesZone | null>(null);
  const [deletingZone, setDeletingZone] = useState<DeliveriesZone | null>(null);

  const { data, error, isError, isLoading } = useGetDeliveriesZones({
    placeholderData: (previousData) => previousData,
  });
  const { mutateAsync: deleteZone, isPending: isDeletingZone } =
    useDeleteDeliveriesZone();

  const zones = data?.zones || [];
  const { items, requestSort, sortConfig } =
    useSortableData<DeliveriesZone>(zones);

  const handleDelete = async () => {
    if (!deletingZone) return;

    try {
      await deleteZone(deletingZone.id);
      toast.success('Zone deleted successfully');
      setDeletingZone(null);
    } catch (deleteError) {
      handleApiError(deleteError as ApiErrorResponse);
    }
  };

  const zoneDownloadColumns = [
    { header: 'Title', dataKey: 'title' },
    { header: 'Description', dataKey: 'description' },
    { header: 'Zone Shape', dataKey: 'zoneShape' },
    {
      header: 'Created Date',
      dataKey: 'createdAt',
      formatter: (item: DeliveriesZone) =>
        moment(item.createdAt).format('DD MMM YYYY, hh:mm A'),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Filters />
        <DownloadButtons<DeliveriesZone>
          fileName="deliveries_zone_management"
          data={zones}
          columns={zoneDownloadColumns}
          fetchAll={() => fetchAllReport<DeliveriesZone>('/zones', { params: { search: getParam('deliveriesSearch') || undefined, startDate: getParam('deliveriesStartDate') || undefined, endDate: getParam('deliveriesEndDate') || undefined }, select: (response) => { const result = response as { zones: DeliveriesZone[]; total: number }; return { data: result.zones, total: result.total }; } })}
        />
      </div>

      <div className="rounded-md border overflow-auto">
        <Table className="min-w-[900px]">
          <TableHeader className="bg-accent rounded-t-md">
            <TableRow>
              <TableHeaderCell
                label="Title"
                sortKey="title"
                requestSort={requestSort}
                sortConfig={sortConfig}
                containerClass="pl-2"
              />
              <TableHead>Description</TableHead>
              <TableHeaderCell
                label="Zone Shape"
                sortKey="zoneShape"
                requestSort={requestSort}
                sortConfig={sortConfig}
                containerClass="pl-2"
              />
              <TableHeaderCell
                label="Created Date"
                sortKey="createdAt"
                requestSort={requestSort}
                sortConfig={sortConfig}
                containerClass="pl-2"
              />
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableShimmer limit={limit as TLimitType} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <DisplayError
                    title="Failed to fetch zones"
                    message={
                      returnErrorMessage(error as ApiErrorResponse) ||
                      'Unable to load deliveries zones right now.'
                    }
                  />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  <NoDataFound title="No deliveries zones found" />
                </TableCell>
              </TableRow>
            ) : (
              items.map((zone) => (
                <TableRow className="!h-[55px]" key={zone.id}>
                  <TableCell>{zone.title || 'N/A'}</TableCell>
                  <TableCell className="max-w-[260px] truncate">
                    {zone.description ? (
                      <TooltipText content={zone.description}>
                        <span>{zone.description}</span>
                      </TooltipText>
                    ) : (
                      <span>N/A</span>
                    )}
                  </TableCell>
                  <TableCell>{zone.zoneShape || 'N/A'}</TableCell>
                  <TableCell>
                    {moment(zone.createdAt).format('DD MMM YYYY, hh:mm A')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="border px-2 py-1.5 rounded-md shadow">
                        <MoreVertical size={20} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-[150px] p-0 rounded-xl overflow-hidden shadow-lg"
                      >
                        <DropdownMenuItem
                          className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                          onClick={() => setEditingZone(zone)}
                        >
                          <PenIcon className="size-[18px]" />
                          <span className="text-sm">Edit Zone</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:!bg-red-100"
                          onClick={() => setDeletingZone(zone)}
                        >
                          <TrashIcon className="size-[18px] text-help-red" />
                          <span className="text-sm text-help-red">
                            Delete Zone
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="p-3 bg-accent/30 border-t rounded-b-md">
          {!isLoading && !isError && items.length > 0 ? (
            <AppPagination
              page={data?.currentPage || 1}
              totalPages={data?.totalPages || 1}
              totalData={data?.total || 0}
              defaultLimit={limit as TLimitType}
            />
          ) : null}
        </div>
      </div>

      {editingZone ? (
        <EditZoneDrawer
          isOpen={!!editingZone}
          onClose={() => setEditingZone(null)}
          zone={editingZone}
        />
      ) : null}

      {deletingZone ? (
        <AppAlertDialog
          className="!w-[850px]"
          title="Delete Deliveries Zone"
          subTitle="Delete Deliveries Zone"
          description="Are you sure you want to delete this zone? This action cannot be undone."
          open={!!deletingZone}
          onOpenChange={() => setDeletingZone(null)}
          variant="delete"
          confirmLabel="Delete"
          onConfirm={handleDelete}
          loading={isDeletingZone}
        />
      ) : null}
    </div>
  );
}
