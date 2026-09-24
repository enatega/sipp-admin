'use client';

import { useState } from 'react';
import { ApiErrorResponse, Zone } from '@/types';
import { MoreVertical, PenIcon, TrashIcon } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import { useDeleteZone, useGetZones } from '@/hooks/api/super-admin/general/zones';
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
import Filters, { reverseTypeMapping } from './Filters';

export default function ZonesTable() {
  const t = useTranslations('zones');
  const { getParam } = useQueryParams();
  const limit = Number(getParam('limit')) || 10;
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [deletingZone, setDeletingZone] = useState<Zone | null>(null);

  const { data, isLoading, isError, error } = useGetZones({
    placeholderData: (previousData) => previousData,
  });
  const { mutateAsync: deleteZone, isPending: isDeletingZone } =
    useDeleteZone();
  const zones = data?.zones || [];
  const { items, requestSort, sortConfig } = useSortableData<Zone>(zones);

  const handleDelete = async () => {
    if (deletingZone) {
      try {
        await deleteZone(deletingZone.id);
        toast.success(t('deleteSuccess'));
        setDeletingZone(null);
      } catch (error) {
        handleApiError(error as ApiErrorResponse);
      }
    }
  };

  const zoneDownloadColumns = [
    { header: t('download.title'), dataKey: 'title' },
    { header: t('download.description'), dataKey: 'description' },
    {
      header: t('download.type'),
      dataKey: 'zoneType',
      formatter: (item: Zone) =>
        item.zoneType.map((type) => reverseTypeMapping[type]).join(', '),
    },
    {
      header: t('download.creationDate'),
      dataKey: 'createdAt',
      formatter: (item: Zone) =>
        moment(item.createdAt).format('DD MMM YYYY, hh:mm A'),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Filters />
        <DownloadButtons<Zone>
          fileName="zones_report"
          data={zones}
          columns={zoneDownloadColumns}
          fetchAll={() => fetchAllReport<Zone>('/zones', { select: (response) => { const result = response as { zones: Zone[]; total: number }; return { data: result.zones, total: result.total }; } })}
        />
      </div>
      <div className=" mb-4">
        <div className="rounded-md border overflow-auto mt-4">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-accent rounded-t-md">
              <TableRow>
                <TableHeaderCell
                  label={t('table.title')}
                  sortKey={'title'}
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-2"
                />
                <TableHead>{t('table.description')}</TableHead>
                <TableHeaderCell
                  label={t('table.type')}
                  sortKey={'zoneType'}
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-2"
                />
                <TableHeaderCell
                  label={t('table.creationDate')}
                  sortKey={'createdAt'}
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-2"
                />
                <TableHead>{t('table.action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableShimmer limit={limit as TLimitType} />
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <DisplayError
                      title={t('errors.fetchFailedTitle')}
                      message={
                        returnErrorMessage(error as ApiErrorResponse) ||
                        t('errors.fetchFailed')
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : zones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    <NoDataFound title={t('errors.noZones')} />
                  </TableCell>
                </TableRow>
              ) : (
                items.map((zone) => (
                  <TableRow className="!h-[55px]" key={zone.id}>
                    <TableCell>{zone?.title ?? t('notAvailable')}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {zone?.description ? (
                        <TooltipText content={zone?.description}>
                          <span>{zone?.description}</span>
                        </TooltipText>
                      ) : (
                        <span>{t('notAvailable')}</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {zone?.zoneType
                        ?.map((item) => reverseTypeMapping[item])
                        ?.join(', ') ?? t('notAvailable')}
                    </TableCell>
                    <TableCell>
                      {moment(zone?.createdAt).format('DD MMM YYYY, hh:mm A') ??
                        t('notAvailable')}
                    </TableCell>
                    <TableCell className="">
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
                            <span className="text-sm ">{t('editZone')}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:!bg-red-100"
                            onClick={() => setDeletingZone(zone)}
                          >
                            <TrashIcon className="size-[18px] text-help-red" />
                            <span className="text-sm text-help-red">
                              {t('deleteZone')}
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
            {!isLoading && !isError && items.length > 0 && (
              <AppPagination
                page={data?.currentPage || 1}
                totalPages={data?.totalPages || 1}
                totalData={data?.total || 0}
                defaultLimit={limit as TLimitType}
              />
            )}
          </div>
        </div>
      </div>
      {editingZone && (
        <EditZoneDrawer
          isOpen={!!editingZone}
          onClose={() => setEditingZone(null)}
          zone={editingZone}
        />
      )}
      {deletingZone && (
        <AppAlertDialog
          className="!w-[850px]"
          title={t('errors.deleteTitle')}
          subTitle={t('errors.deleteTitle')}
          description={t('errors.deleteDescription')}
          open={!!deletingZone}
          onOpenChange={() => setDeletingZone(null)}
          variant="delete"
          confirmLabel={t('errors.deleteConfirm')}
          onConfirm={handleDelete}
          loading={isDeletingZone}
        />
      )}
    </div>
  );
}
