'use client';

import { useState } from 'react';
import { ApiErrorResponse, Category } from '@/types';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import {
  useDeleteCategory,
  useGetCategories,
  useToggleCategoryStatus,
} from '@/hooks/api/vendor/deliveries/product-management/categories';
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
import EditCategorySheet from '../EditCategorySheet';
import CategoryActions from './CategoryActions';
import Filters from './Filters';

export default function CategoriesTable() {
  const t = useTranslations('categories');
  const { getParam } = useQueryParams();
  const limit = Number(getParam('limit')) || 10;
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );
  const [togglingCategoryIds, setTogglingCategoryIds] = useState<string[]>([]);

  const { data, isLoading, isError, error, refetch } = useGetCategories({
    placeholderData: (previousData) => previousData,
  });
  const { mutateAsync: deleteCategory, isPending: isDeletingCategory } =
    useDeleteCategory();
  const { mutateAsync: toggleCategoryStatus } = useToggleCategoryStatus();
  const categories = data?.categories || [];
  const { items, requestSort, sortConfig } =
    useSortableData<Category>(categories);

  const handleDelete = async () => {
    if (deletingCategory) {
      try {
        const response = await deleteCategory(deletingCategory.id);

        if (response.affected > 0) {
          toast.success(t('success.delete'));
          setDeletingCategory(null);
        } else {
          toast.error(t('errors.deleteFailed'));
        }
      } catch (error) {
        handleApiError(error as ApiErrorResponse);
      }
    }
  };

  const handleToggleStatus = async (category: Category) => {
    if (togglingCategoryIds.includes(category.id)) return;

    setTogglingCategoryIds((current) => [...current, category.id]);

    try {
      const response = await toggleCategoryStatus(category.id);
      toast.success(response.message);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    } finally {
      setTogglingCategoryIds((current) =>
        current.filter((id) => id !== category.id),
      );
    }
  };

  const categoryDownloadColumns = [
    { header: t('download.name'), dataKey: 'categoryName' },
    {
      header: t('download.status'),
      dataKey: 'is_active',
      formatter: (item: Category) =>
        item.is_active ? t('active') : t('inactive'),
    },
    {
      header: t('download.creationDate'),
      dataKey: 'createdAt',
      formatter: (item: Category) =>
        moment(item.createdAt).format('DD MMM YYYY, hh:mm A'),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Filters />
        <DownloadButtons<Category>
          fileName="categories_report"
          data={categories}
          columns={categoryDownloadColumns}
        />
      </div>
      <div className="mb-4">
        <div className="rounded-md border overflow-auto mt-4">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-accent rounded-t-md">
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
                <TableShimmer limit={limit as TLimitType} columns={5} />
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <DisplayError
                      title={t('errors.fetchFailed')}
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
                  <TableCell colSpan={5} className="text-center">
                    <NoDataFound title={t('errors.noCategories')} />
                  </TableCell>
                </TableRow>
              ) : (
                items.map((category) => (
                  <TableRow className="!h-[55px]" key={category.id}>
                    <TableCell className="w-[80px]">
                      <div className="flex items-center gap-2">
                        {category?.imageURL ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={category.imageURL}
                            alt={category.categoryName}
                            className="size-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="size-10 rounded-md bg-accent flex items-center justify-center text-sm font-medium">
                            {category?.categoryName?.charAt(0)?.toUpperCase() ||
                              '?'}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {category?.categoryName ?? t('table.notAvailable')}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={category.is_active}
                        disabled={togglingCategoryIds.includes(category.id)}
                        onCheckedChange={() => handleToggleStatus(category)}
                      />
                    </TableCell>
                    <TableCell>
                      {moment(category?.createdAt).format(
                        'DD MMM YYYY, hh:mm A',
                      ) ?? t('table.notAvailable')}
                    </TableCell>
                    <TableCell className="">
                      <CategoryActions
                        category={category}
                        onEdit={setEditingCategory}
                        onDelete={setDeletingCategory}
                      />
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
      {editingCategory && (
        <EditCategorySheet
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          category={editingCategory}
        />
      )}
      {deletingCategory && (
        <AppAlertDialog
          className="!w-[850px]"
          title={t('errors.deleteTitle')}
          subTitle={t('errors.deleteTitle')}
          description={t('errors.deleteDescription')}
          open={!!deletingCategory}
          onOpenChange={() => setDeletingCategory(null)}
          variant="delete"
          confirmLabel={t('errors.deleteConfirm')}
          onConfirm={handleDelete}
          loading={isDeletingCategory}
        />
      )}
    </div>
  );
}

