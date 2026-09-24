'use client';

import { useState } from 'react';
import { ApiErrorResponse } from '@/types';
import { MoreVertical, PenIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatCommissionRate } from '@/lib/commission-rate';
import { returnErrorMessage } from '@/lib/toast-error';
import { useGetZoneCommissionRates } from '@/hooks/api/super-admin/enatega-deliveries/commission-rate';
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
import NoDataFound from '@/components/shared/NoDataFound';
import Status from '@/components/shared/Status';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import { ZoneCommissionData } from '../../types';

type TtypeLimit = 10 | 25 | 50 | 100;
interface ZoneCommissionTableProps {
  searchQuery?: string;
  onEdit?: (row: ZoneCommissionData) => void;
}

export const ZoneCommissionTable = ({
  searchQuery = '',
  onEdit,
}: ZoneCommissionTableProps) => {
  const tTable = useTranslations('commission-rate.zoneTable');
  const tDialogs = useTranslations('commission-rate.zoneTable.deleteDialog');
  const tCommon = useTranslations('common');
  const { getParam } = useQueryParams();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const currentPage = Number(getParam('page')) || 1;
  const limit = Number(getParam('limit')) || (10 as TtypeLimit);

  const {
    data: zoneCommissionResponse,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetZoneCommissionRates({
    page: currentPage,
    limit,
    search: searchQuery || undefined,
  });
  const showTableLoading = isLoading || isFetching;

  const zoneCommissionRows: ZoneCommissionData[] = (
    zoneCommissionResponse?.data ?? []
  ).map((item) => ({
    id: item.zone_id,
    zone: item.zone_name,
    defaultCommission: formatCommissionRate(item.commission_rate),
    shopTypeCommission: '',
    minimumPayout: '',
    status: item.status === 'active' ? 'Active' : 'Inactive',
  }));

  const {
    items: sortedData,
    requestSort,
    sortConfig,
  } = useSortableData(zoneCommissionRows);

  const totalData = sortedData.length;
  const totalPages = zoneCommissionResponse?.totalPages || 0;
  const paginatedData = sortedData;

  return (
    <div className="space-y-4 w-full">
      <div className="rounded-md border overflow-auto mb-4">
        <Table className="min-w-[1200px] w-full">
          <TableHeader className="bg-accent rounded-t-md">
            <TableRow>
              <TableHeaderCell
                containerClass="pl-4"
                label={tTable('zone')}
                sortKey="zone"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tTable('commissionRate')}
                sortKey="defaultCommission"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHead>{tTable('status')}</TableHead>
              <TableHead>{tTable('action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showTableLoading ? (
              <TableShimmer limit={limit as TLimitType} columns={4} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={4} className="p-4">
                  <DisplayError
                    title={tTable('loadFailedTitle')}
                    message={returnErrorMessage(error as ApiErrorResponse)}
                  />
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <NoDataFound title={tTable('noDataTitle')} />
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow className="!h-[55px]" key={row?.id}>
                  <TableCell className="pl-4 capitalize">{row?.zone}</TableCell>
                  <TableCell>{row?.defaultCommission}</TableCell>
                  <TableCell>
                    <Status status={row?.status} />
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
                          onClick={() => onEdit?.(row)}
                        >
                          <PenIcon className="size-[18px]" />
                          <span className="text-sm">{tCommon('edit')}</span>
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
          {!showTableLoading && !isError && paginatedData.length > 0 && (
            <AppPagination
              page={currentPage}
              totalPages={totalPages}
              totalData={zoneCommissionResponse?.total || totalData}
              defaultLimit={limit as TtypeLimit}
            />
          )}
        </div>
      </div>
      <AppAlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={tDialogs('title')}
        subTitle={tDialogs('subTitle')}
        description={tDialogs('description')}
        confirmLabel={tDialogs('confirm')}
        onConfirm={() => setDeleteId(null)}
        variant="delete"
      />
    </div>
  );
};
