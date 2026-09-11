'use client';

import { useState } from 'react';
import { ApiErrorResponse, Option as StoreOption } from '@/types';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/formatCurrency';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import {
  useDeleteOption,
  useGetOptions,
} from '@/hooks/api/vendor/deliveries/product-management/options';
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
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import AppPagination from '@/components/shared/AppPagination';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import Status from '@/components/shared/Status';
import { getOptionDownloadColumns } from '../data';
import Filters from '../Filters';
import { OptionActions } from './OptionActions';

interface OptionsTableProps {
  onEditOption?: (option: StoreOption) => void;
}

const OptionsTable = ({ onEditOption }: OptionsTableProps) => {
  const t = useTranslations('storeOptions');
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = currencySymbol || '$';
  const { getParam } = useQueryParams();
  const limit = Number(getParam('limit')) || 10;
  const [deleteOption, setDeleteOption] = useState<StoreOption | null>(null);

  const { data, isLoading, isError, error, refetch } = useGetOptions({
    placeholderData: (previousData) => previousData,
  });
  const { mutateAsync: deleteOptionMutation, isPending: isDeletingOption } =
    useDeleteOption();

  const options = data?.data || [];
  const { items, requestSort, sortConfig } =
    useSortableData<StoreOption>(options);
  const optionDownloadColumns = getOptionDownloadColumns(
    t,
    resolvedCurrencySymbol,
  );

  const formatPrice = (price: StoreOption['price']) => {
    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) {
      return null;
    }

    return formatCurrency(numericPrice, resolvedCurrencySymbol);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteOption) return;

    try {
      const response = await deleteOptionMutation(deleteOption.id);
      toast.success(response.message || t('success.delete'));
      setDeleteOption(null);
    } catch (mutationError) {
      handleApiError(mutationError as ApiErrorResponse);
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <Filters data={items} columns={optionDownloadColumns} />
      </div>

      <div className="rounded-md border overflow-auto bg-white">
        <Table className="min-w-[1120px]">
          <TableHeader className="bg-accent rounded-t-md">
            <TableRow>
              <TableHeaderCell
                label={t('table.title')}
                sortKey="title"
                requestSort={requestSort}
                sortConfig={sortConfig}
                align="left"
              />
              <TableHeaderCell
                label={`${t('table.price')} (${resolvedCurrencySymbol})`}
                sortKey="price"
                requestSort={requestSort}
                sortConfig={sortConfig}
                align="left"
              />
              <TableHeaderCell
                label={t('table.stockQuantity')}
                sortKey="stockQuantity"
                requestSort={requestSort}
                sortConfig={sortConfig}
                align="left"
              />
              <TableHeaderCell
                label={t('table.status')}
                sortKey="isActive"
                requestSort={requestSort}
                sortConfig={sortConfig}
                align="left"
              />
              <TableHeaderCell
                label={t('table.description')}
                sortKey="description"
                requestSort={requestSort}
                sortConfig={sortConfig}
                align="left"
              />
              <TableHeaderCell
                label={t('table.createdAt')}
                sortKey="createdAt"
                requestSort={requestSort}
                sortConfig={sortConfig}
                align="left"
              />
              <TableHead className="px-4 py-4 font-medium">
                {t('table.action')}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableShimmer limit={limit as TLimitType} columns={7} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <DisplayError
                    title={t('errors.fetchFailedTitle')}
                    message={
                      returnErrorMessage(error as ApiErrorResponse) ||
                      t('errors.fetchFailed')
                    }
                    onRetry={refetch}
                  />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <NoDataFound title={t('errors.noOptions')} />
                </TableCell>
              </TableRow>
            ) : (
              items.map((row) => (
                <TableRow key={row.id} className="!h-[60px]">
                  <TableCell className="min-w-[220px]">{row.title}</TableCell>
                  <TableCell>
                    {formatPrice(row.price) ? (
                      <span className="font-medium">{formatPrice(row.price)}</span>
                    ) : (
                      t('table.notAvailable')
                    )}
                  </TableCell>
                  <TableCell>{row.stockQuantity}</TableCell>
                  <TableCell>
                    <Status
                      status={row.isActive ? 'active' : 'inactive'}
                      label={
                        row.isActive
                          ? t('form.activeLabel')
                          : t('form.inactiveLabel')
                      }
                    />
                  </TableCell>
                  <TableCell className="min-w-[260px]">
                    {row.description}
                  </TableCell>
                  <TableCell>
                    {moment(row.createdAt).format('DD MMM YYYY, hh:mm A')}
                  </TableCell>
                  <TableCell>
                    <OptionActions
                      option={row}
                      onEdit={(option) => onEditOption?.(option)}
                      onDelete={setDeleteOption}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!isLoading && !isError && items.length > 0 && (
          <div className="p-3 bg-accent/30 border-t rounded-b-md">
            <div className="flex items-center justify-end">
              <AppPagination
                page={data?.page || 1}
                totalPages={data?.totalPages || 1}
                totalData={data?.total || 0}
                defaultLimit={limit as TLimitType}
              />
            </div>
          </div>
        )}
      </div>

      <AppAlertDialog
        open={!!deleteOption}
        onOpenChange={(open) => {
          if (!open) setDeleteOption(null);
        }}
        title={t('errors.deleteTitle')}
        subTitle={t('errors.deleteSubTitle')}
        description={
          deleteOption
            ? t('errors.deleteDescriptionWithName', {
                name: deleteOption.title,
              })
            : t('errors.deleteDescription')
        }
        confirmLabel={t('errors.deleteConfirm')}
        variant="delete"
        onConfirm={handleDeleteConfirm}
        loading={isDeletingOption}
      />
    </div>
  );
};

export default OptionsTable;
