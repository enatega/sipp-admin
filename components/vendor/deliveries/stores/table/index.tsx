'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import {
  useDeleteVendorStore,
  useToggleVendorStoreAvailability,
} from '@/hooks/api/vendor/deliveries/stores';
import { useQueryParams } from '@/hooks/use-query-params';
import { ApiErrorResponse } from '@/types';
import DisplayError from '@/components/shared/DisplayError';
import { useSortableData } from '@/hooks/use-sortable-data';
import { getStorePath, withBackToPath } from '@/lib/store';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
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
import { DownloadButtons } from '@/components/shared/DownloadButtons';
import { fetchAllReport } from '@/lib/fetch-all-report';
import NoDataFound from '@/components/shared/NoDataFound';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import { getDownloadColumns } from './download-columns';
import Filters from './Filters';
import StoreRow from './StoreRow';
import { VendorStoreTableItem } from './types';
import { mapVendorStoreToRow, useVendorStoresData } from './useVendorStoresData';
import type { DeliveryStore } from '@/types';

type ActionState = { store: VendorStoreTableItem; loading: boolean } | null;

export default function VendorStoresTable() {
  const t = useTranslations('vendorDeliveriesStores');
  const router = useRouter();
  const { vendorId } = useParams() as { vendorId: string };
  const { getParam, setParams } = useQueryParams();

  const [deletingState, setDeletingState] = useState<ActionState>(null);
  const [togglingStoreId, setTogglingStoreId] = useState<string | null>(null);

  const {
    stores,
    total,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useVendorStoresData();
  const showTableLoading = isLoading || isFetching;

  const limit = Number(getParam('limit')) || 10;
  const page = Number(getParam('page')) || 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const { items, requestSort, sortConfig } =
    useSortableData<VendorStoreTableItem>(stores);

  const { mutate: deleteStore } = useDeleteVendorStore({
    onSuccess: (data) => {
      toast.success(data.message || t('deleteSuccess'));
      const shouldGoToPreviousPage = stores.length === 1 && page > 1;
      setDeletingState(null);

      if (shouldGoToPreviousPage) {
        setParams({ page: String(page - 1) });
      }
    },
    onError: (mutationError) => {
      setDeletingState((current) =>
        current ? { ...current, loading: false } : null,
      );
      handleApiError(mutationError as ApiErrorResponse);
    },
  });

  const { mutate: toggleAvailability } = useToggleVendorStoreAvailability({
    onSuccess: (data) => {
      toast.success(data.message || t('availabilityUpdated'));
      setTogglingStoreId(null);
    },
    onError: (mutationError) => {
      setTogglingStoreId(null);
      handleApiError(mutationError as ApiErrorResponse);
    },
    onSettled: () => {
      setTogglingStoreId(null);
    },
  });

  const handleEdit = (store: VendorStoreTableItem) => {
    router.push(`/vendor/deliveries/${vendorId}/stores/edit-store/${store.id}`);
  };

  const handleViewStore = (store: VendorStoreTableItem) => {
    router.push(
      withBackToPath(
        getStorePath(store.id),
        `/vendor/deliveries/${vendorId}/stores`,
      ),
    );
  };

  const handleDelete = () => {
    if (!deletingState) return;
    setDeletingState({ ...deletingState, loading: true });
    deleteStore(deletingState.store.id);
  };

  const handleToggleAvailability = (store: VendorStoreTableItem) => {
    if (togglingStoreId) return;
    setTogglingStoreId(store.id);
    toggleAvailability(store.id);
  };

  const downloadColumns = getDownloadColumns(t);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Filters />
        <DownloadButtons<VendorStoreTableItem>
          fileName="stores_report"
          data={items}
          columns={downloadColumns}
          fetchAll={async () => (await fetchAllReport<DeliveryStore>('/apps/deliveries/stores/vendors/stores', { params: { vendorId, status: [getParam('status'), getParam('tabStatus')].find((value) => value && value !== 'all') || undefined } })).map(mapVendorStoreToRow)}
        />
      </div>

      <div className="mb-4">
        <div className="rounded-md border overflow-auto mt-4">
          <Table className="min-w-[1200px]">
            <TableHeader className="bg-accent rounded-t-md">
              <TableRow>
                <TableHeaderCell
                  label={t('table.name')}
                  sortKey="name"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-2"
                />
                <TableHeaderCell
                  label={t('table.totalOrders')}
                  sortKey="totalOrders"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                />

                <TableHead>{t('table.shopType')}</TableHead>

                <TableHead>{t('table.address')}</TableHead>
                <TableHead>{t('table.availability')}</TableHead>
                <TableHead>{t('table.status')}</TableHead>
                <TableHead>{t('table.createdAt')}</TableHead>
                <TableHead>{t('table.activeOrders')}</TableHead>
                <TableHeaderCell
                  label={t('table.rating')}
                  sortKey="rating"
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                />
                <TableHead>{t('table.action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {showTableLoading ? (
                <TableShimmer limit={limit as TLimitType} columns={10} />
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={10} className="p-4">
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
              ) : stores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center">
                    <NoDataFound title={t('errors.noStores')} />
                  </TableCell>
                </TableRow>
              ) : (
                items.map((store) => (
                  <StoreRow
                    key={store.id}
                    store={store}
                    isToggling={togglingStoreId === store.id}
                    onView={handleViewStore}
                    onEdit={handleEdit}
                    onToggleAvailability={handleToggleAvailability}
                    onDelete={(s) =>
                      setDeletingState({ store: s, loading: false })
                    }
                  />
                ))
              )}
            </TableBody>
          </Table>
          <div className="p-3 bg-accent/30 border-t rounded-b-md">
            {!showTableLoading && !isError && total > 0 && (
              <AppPagination
                page={page}
                totalPages={totalPages}
                totalData={total}
                defaultLimit={limit as TLimitType}
              />
            )}
          </div>
        </div>
      </div>

      {deletingState && (
        <AppAlertDialog
          className="w-[850px]!"
          title={t('deleteDialog.title')}
          subTitle={t('deleteDialog.subTitle')}
          description={t('deleteDialog.description')}
          open={!!deletingState}
          onOpenChange={() => setDeletingState(null)}
          variant="delete"
          confirmLabel={t('deleteDialog.confirm')}
          onConfirm={handleDelete}
          loading={deletingState.loading}
        />
      )}
    </div>
  );
}
