'use client';

import { useState } from 'react';
import { Edit2, Eye, MoreVertical, TrashIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
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
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import TooltipText from '@/components/shared/TooltipText';
import Status from '@/components/shared/Status';
import type { ApiErrorResponse } from '@/types';
import type { VendorAddon } from '@/types/api/vendor/deliveries/addons.api';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/lib/formatCurrency';

interface IAddonsTableProps {
  data: VendorAddon[];
  isLoading: boolean;
  isError: boolean;
  error: ApiErrorResponse | null;
  onRetry: () => void | Promise<unknown>;
  page: number;
  totalPages: number;
  totalData: number;
  onEdit?: (addon: VendorAddon) => void;
  onView?: (addon: VendorAddon) => void;
  onDelete?: (addonId: string) => Promise<string | void>;
}

export function AddonsTable({
  data,
  isLoading,
  isError,
  error,
  onRetry,
  page,
  totalPages,
  totalData,
  onEdit,
  onView,
  onDelete,
}: IAddonsTableProps) {
  const t = useTranslations('storeAddons');
  const { getParam } = useQueryParams();
  const limit = (Number(getParam('limit')) || 10) as TLimitType;
  const { items, requestSort, sortConfig } = useSortableData<VendorAddon>(data);
  const [deletingAddon, setDeletingAddon] = useState<VendorAddon | null>(null);
  const [isDeletingAddon, setIsDeletingAddon] = useState(false);
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = currencySymbol || '$';

  const handleDeleteAddon = async () => {
    if (!deletingAddon || !onDelete) {
      return;
    }

    setIsDeletingAddon(true);
    try {
      const message = await onDelete(deletingAddon.id);
      toast.success(message || t('success.delete'));
      setDeletingAddon(null);
    } catch (deleteError) {
      handleApiError(deleteError as ApiErrorResponse);
    } finally {
      setIsDeletingAddon(false);
    }
  };

  const truncateText = (text: string, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  return (
    <div className="space-y-4 w-full">
      <div className="rounded-t-md border overflow-hidden mb-0 bg-white">
        <Table className="min-w-[1100px]">
          <TableHeader className="bg-accent rounded-t-md">
            <TableRow>
              <TableHeaderCell
                label={t('table.columns.name')}
                sortKey="name"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={t('table.columns.description')}
                sortKey="description"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={t('table.columns.required')}
                sortKey="requiredCheck"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={t('table.columns.selectionType')}
                sortKey="selectionType"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={t('table.columns.price')}
                sortKey="price"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={t('table.columns.status')}
                sortKey="status"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={t('table.columns.options')}
                sortKey="options.length"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHead>{t('table.columns.action')}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableShimmer limit={limit} columns={8} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8">
                  <DisplayError
                    title={t('errors.fetchFailedTitle')}
                    message={
                      returnErrorMessage(error as ApiErrorResponse) ||
                      t('errors.fetchFailed')
                    }
                    onRetry={onRetry}
                  />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <NoDataFound
                    title={t('table.noDataTitle')}
                    subtitle={t('table.noDataSubtitle')}
                  />
                </TableCell>
              </TableRow>
            ) : (
              items.map((addon) => (
                <TableRow
                  key={addon.id}
                  className="hover:bg-muted/50 cursor-pointer border-b border-border"
                  onClick={() => onView?.(addon)}
                >
                  <TableCell className="font-medium">{addon.name}</TableCell>

                  <TableCell>
                    {addon.description ? (
                      <TooltipText
                        content={addon.description}
                        side="top"
                        align="start"
                        sideOffset={8}
                        contentClassName="max-w-[300px] w-auto whitespace-normal break-words text-center"
                      >
                        <span className="cursor-help">
                          {truncateText(addon.description)}
                        </span>
                      </TooltipText>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {addon.requiredCheck
                      ? t('table.requiredYes')
                      : t('table.requiredNo')}
                  </TableCell>

                  <TableCell className="capitalize">
                    {addon.selectionType}
                  </TableCell>

                  <TableCell className="font-medium">
                    {Number.isFinite(Number(addon.price))
                      ? formatCurrency(Number(addon.price), resolvedCurrencySymbol)
                      : '-'}
                  </TableCell>

                  <TableCell>
                    <Status
                      status={addon.status ? 'active' : 'inactive'}
                      label={addon.status ? t('view.active') : t('view.inactive')}
                    />
                  </TableCell>

                  <TableCell>{addon.options.length}</TableCell>

                  <TableCell
                    className="text-center"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger className="border px-2 py-1.5 rounded-md shadow align-center flex items-center justify-center hover:bg-muted/50">
                        <MoreVertical size={20} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-[160px] p-0 rounded-xl overflow-hidden shadow-lg"
                      >
                        {onView && (
                          <DropdownMenuItem
                            className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                            onClick={(event) => {
                              event.stopPropagation();
                              onView(addon);
                            }}
                          >
                            <Eye className="size-[18px]" />
                            <span className="text-sm">
                              {t('table.actions.view')}
                            </span>
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem
                            className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                            onClick={(event) => {
                              event.stopPropagation();
                              onEdit(addon);
                            }}
                          >
                            <Edit2 className="size-[18px]" />
                            <span className="text-sm">
                              {t('table.actions.edit')}
                            </span>
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:!bg-red-100"
                            onClick={() => setDeletingAddon(addon)}
                          >
                            <TrashIcon className="size-[18px] text-help-red" />
                            <span className="text-sm text-help-red">
                              {t('table.actions.delete')}
                            </span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && !isError && items.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-accent/20 border rounded-b-md gap-4">
          <AppPagination
            page={page}
            totalPages={totalPages}
            totalData={totalData}
            defaultLimit={limit}
          />
        </div>
      )}

      <AppAlertDialog
        className="!w-full sm:!w-[850px] max-w-[95vw]"
        title={t('delete.title')}
        subTitle={t('delete.subTitle')}
        description={t('delete.description')}
        open={!!deletingAddon}
        onOpenChange={(open) => !open && setDeletingAddon(null)}
        variant="delete"
        confirmLabel={t('delete.confirm')}
        onConfirm={handleDeleteAddon}
        loading={isDeletingAddon}
      />
    </div>
  );
}
