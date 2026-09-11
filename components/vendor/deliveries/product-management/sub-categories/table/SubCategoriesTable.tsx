'use client';

import { useState } from 'react';
import { ApiErrorResponse, SubCategory } from '@/types';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import {
  useDeleteSubCategory,
  useGetSubCategories,
  useToggleSubCategoryStatus,
} from '@/hooks/api/vendor/deliveries/product-management/sub-categories';
import { useQueryParams } from '@/hooks/use-query-params';
import { useSortableData } from '@/hooks/use-sortable-data';
import { Switch } from '@/components/ui/switch';
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
import NoDataFound from '@/components/shared/NoDataFound';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import EditSubCategorySheet from '../EditSubCategorySheet';
import Filters from './Filters';
import SubCategoryActions from './SubCategoryActions';

export default function SubCategoriesTable() {
  const t = useTranslations('subCategories');
  const { getParam } = useQueryParams();
  const limit = Number(getParam('limit')) || 10;
  const [editingSubCategory, setEditingSubCategory] =
    useState<SubCategory | null>(null);
  const [deletingSubCategory, setDeletingSubCategory] =
    useState<SubCategory | null>(null);
  const [togglingSubCategoryIds, setTogglingSubCategoryIds] = useState<
    string[]
  >([]);

  const { data, isLoading, isError, error, refetch } = useGetSubCategories({
    placeholderData: (previousData) => previousData,
  });
  const { mutateAsync: deleteSubCategory, isPending: isDeletingSubCategory } =
    useDeleteSubCategory();
  const { mutateAsync: toggleSubCategoryStatus } = useToggleSubCategoryStatus();

  const subCategories = data?.subCategories || [];
  const { items, requestSort, sortConfig } =
    useSortableData<SubCategory>(subCategories);

  const handleDelete = async () => {
    if (!deletingSubCategory) {
      return;
    }

    try {
      const response = await deleteSubCategory(deletingSubCategory.id);

      if (response.affected > 0) {
        toast.success(t('success.delete'));
        setDeletingSubCategory(null);
      } else {
        toast.error(t('errors.deleteFailed'));
      }
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  const handleToggleStatus = async (subCategory: SubCategory) => {
    if (togglingSubCategoryIds.includes(subCategory.id)) {
      return;
    }

    setTogglingSubCategoryIds((current) => [...current, subCategory.id]);

    try {
      const response = await toggleSubCategoryStatus(subCategory.id);
      toast.success(response.message);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    } finally {
      setTogglingSubCategoryIds((current) =>
        current.filter((id) => id !== subCategory.id),
      );
    }
  };

  const subCategoryDownloadColumns = [
    { header: t('download.name'), dataKey: 'categoryName' },
    {
      header: t('download.category'),
      dataKey: 'parentId',
      formatter: (item: SubCategory) =>
        item.parent?.categoryName ?? t('table.notAvailable'),
    },
    {
      header: t('download.status'),
      dataKey: 'is_active',
      formatter: (item: SubCategory) =>
        item.is_active ? t('active') : t('inactive'),
    },
    {
      header: t('download.creationDate'),
      dataKey: 'createdAt',
      formatter: (item: SubCategory) =>
        moment(item.createdAt).format('DD MMM YYYY, hh:mm A'),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Filters />
        <DownloadButtons<SubCategory>
          fileName="sub-categories_report"
          data={items}
          columns={subCategoryDownloadColumns}
        />
      </div>

      <div className="mb-4">
        <div className="mt-4 overflow-auto rounded-md border">
          <Table className="min-w-[1000px]">
            <TableHeader className="rounded-t-md bg-accent">
              <TableRow>
                <TableHeaderCell
                  label={t('table.image')}
                  sortKey="categoryName"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-2 w-[80px]"
                />
                <TableHeaderCell
                  label={t('table.name')}
                  sortKey="categoryName"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-2"
                />
                <TableHeaderCell
                  label={t('table.category')}
                  sortKey="parent.categoryName"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-2"
                />
                <TableHeaderCell
                  label={t('table.status')}
                  sortKey="is_active"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-2"
                />
                <TableHeaderCell
                  label={t('table.creationDate')}
                  sortKey="createdAt"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-2"
                />
                <TableHead>{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableShimmer limit={limit as TLimitType} columns={6} />
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center">
                    <DisplayError
                      title={t('errors.fetchFailed')}
                      message={
                        returnErrorMessage(error as ApiErrorResponse) ||
                        t('errors.fetchFailed')
                      }
                      onRetry={() => {
                        void refetch();
                      }}
                    />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <NoDataFound title={t('errors.noSubCategories')} />
                  </TableCell>
                </TableRow>
              ) : (
                items.map((subCategory) => (
                  <TableRow className="!h-[55px]" key={subCategory.id}>
                    <TableCell className="w-[80px]">
                      <div className="flex items-center gap-2">
                        {subCategory.imageURL ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={subCategory.imageURL}
                            alt={subCategory.categoryName}
                            className="size-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex size-10 items-center justify-center rounded-md bg-accent text-sm font-medium">
                            {subCategory.categoryName?.charAt(0)?.toUpperCase() ||
                              '?'}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {subCategory.categoryName ?? t('table.notAvailable')}
                    </TableCell>

                    <TableCell>
                      {subCategory.parent?.categoryName ??
                        t('table.notAvailable')}
                    </TableCell>

                    <TableCell>
                      <Switch
                        checked={subCategory.is_active}
                        disabled={togglingSubCategoryIds.includes(subCategory.id)}
                        onCheckedChange={() => handleToggleStatus(subCategory)}
                      />
                    </TableCell>

                    <TableCell>
                      {moment(subCategory.createdAt).format(
                        'DD MMM YYYY, hh:mm A',
                      ) || t('table.notAvailable')}
                    </TableCell>

                    <TableCell>
                      <SubCategoryActions
                        subCategory={subCategory}
                        onEdit={setEditingSubCategory}
                        onDelete={setDeletingSubCategory}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="rounded-b-md border-t bg-accent/30 p-3">
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

      {editingSubCategory && (
        <EditSubCategorySheet
          isOpen={!!editingSubCategory}
          onClose={() => setEditingSubCategory(null)}
          subCategory={editingSubCategory}
        />
      )}

      {deletingSubCategory && (
        <AppAlertDialog
          className="!w-[850px]"
          title={t('errors.deleteTitle')}
          subTitle={t('errors.deleteTitle')}
          description={t('errors.deleteDescription')}
          open={!!deletingSubCategory}
          onOpenChange={() => setDeletingSubCategory(null)}
          variant="delete"
          confirmLabel={t('errors.deleteConfirm')}
          onConfirm={handleDelete}
          loading={isDeletingSubCategory}
        />
      )}
    </div>
  );
}

