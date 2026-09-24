'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ApiErrorResponse } from '@/types';
import toast from 'react-hot-toast';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import {
  useDeleteVendorChainMenu,
  useGetVendorChainMenus,
  useToggleVendorChainMenuActive,
} from '@/hooks/api/vendor/deliveries/menu-template';
import { useQueryParams } from '@/hooks/use-query-params';
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
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import { getDownloadColumns } from './download-columns';
import Filters from './Filters';
import MenuTemplateDetailModal from './MenuTemplateDetailModal';
import MenuTemplateRow from './MenuTemplateRow';
import { VendorMenuTemplateItem } from './types';

type ActionState = { menu: VendorMenuTemplateItem; loading: boolean } | null;

export default function VendorMenuTemplateTable() {
  const router = useRouter();
  const { vendorId } = useParams() as { vendorId: string };
  const t = useTranslations('vendorMenuTemplate');
  const tTable = useTranslations('vendorMenuTemplate.table');
  const { getParam, setParams } = useQueryParams();
  const [selectedTemplate, setSelectedTemplate] =
    useState<VendorMenuTemplateItem | null>(null);
  const [deletingState, setDeletingState] = useState<ActionState>(null);
  const [togglingMenuId, setTogglingMenuId] = useState<string | null>(null);

  const {
    data: menuTemplatesData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetVendorChainMenus();

  const page = Number(getParam('page')) || 1;
  const limit = Number(getParam('limit')) || 10;
  const menuTemplates = menuTemplatesData?.data || [];
  const total = menuTemplatesData?.total || 0;
  const totalPages =
    menuTemplatesData?.totalPages || Math.max(1, Math.ceil(total / limit));
  const showTableLoading = isLoading || isFetching;

  const { mutate: deleteChainMenu } = useDeleteVendorChainMenu({
    onSuccess: (data) => {
      toast.success(data.message || t('actions.deleteSuccess'));
      const shouldGoToPreviousPage = menuTemplates.length === 1 && page > 1;
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

  const { mutate: toggleMenuActive } = useToggleVendorChainMenuActive({
    onSuccess: (data) => {
      toast.success(data.message || t('actions.statusUpdated'));
      setTogglingMenuId(null);
    },
    onError: (mutationError) => {
      setTogglingMenuId(null);
      handleApiError(mutationError as ApiErrorResponse);
    },
    onSettled: () => {
      setTogglingMenuId(null);
    },
  });

  const handleToggleAvailability = (selected: VendorMenuTemplateItem) => {
    if (togglingMenuId) return;
    setTogglingMenuId(selected.id);
    toggleMenuActive(selected.id);
  };

  const handleEdit = (selected: VendorMenuTemplateItem) => {
    router.push(
      `/vendor/deliveries/${vendorId}/menu-template/edit-menu/${selected.id}`,
    );
  };

  const handleView = (selected: VendorMenuTemplateItem) => {
    setSelectedTemplate(selected);
  };

  const handleDelete = () => {
    if (!deletingState) return;
    setDeletingState({ ...deletingState, loading: true });
    deleteChainMenu(deletingState.menu.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Filters />
        <DownloadButtons<VendorMenuTemplateItem>
          fileName="menu_template_report"
          data={menuTemplates}
          columns={getDownloadColumns(tTable)}
          fetchAll={() => fetchAllReport<VendorMenuTemplateItem>('/apps/deliveries/chain-menus', { params: { vendorId, filter: getParam('tabStatus') && getParam('tabStatus') !== 'all' ? getParam('tabStatus')! : undefined, isActive: getParam('isActive') || undefined } })}
        />
      </div>

      <div className="mb-4">
        <div className="rounded-md border overflow-auto mt-4">
          <Table className="min-w-[1100px]">
            <TableHeader className="bg-accent rounded-t-md">
              <TableRow>
                <TableHead className="pl-4">{tTable('menuTitle')}</TableHead>
                <TableHead>{tTable('description')}</TableHead>
                <TableHead>{tTable('assignedStores')}</TableHead>
                <TableHead>{tTable('products')}</TableHead>
                <TableHead>{tTable('availability')}</TableHead>
                <TableHead className="w-[70px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {showTableLoading ? (
                <TableShimmer limit={limit as TLimitType} columns={6} />
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-4">
                    <DisplayError
                      title={t('errors.fetchFailed')}
                      message={
                        returnErrorMessage(error as ApiErrorResponse) ||
                        t('errors.loadFailed')
                      }
                      onRetry={refetch}
                    />
                  </TableCell>
                </TableRow>
              ) : menuTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <NoDataFound title={t('table.noDataTitle')} />
                  </TableCell>
                </TableRow>
              ) : (
                menuTemplates.map((item) => (
                  <MenuTemplateRow
                    key={item.id}
                    item={item}
                    isToggling={togglingMenuId === item.id}
                    onView={handleView}
                    onToggleAvailability={handleToggleAvailability}
                    onEdit={handleEdit}
                    onDelete={(menu) =>
                      setDeletingState({ menu, loading: false })
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

      <MenuTemplateDetailModal
        open={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        item={selectedTemplate}
      />

      {deletingState && (
        <AppAlertDialog
          className="w-[850px]!"
          title={t('table.deleteTitle')}
          subTitle={t('table.deleteSubTitle')}
          description={t('table.deleteDescription')}
          open={!!deletingState}
          onOpenChange={() => setDeletingState(null)}
          variant="delete"
          confirmLabel={t('actions.delete')}
          onConfirm={handleDelete}
          loading={deletingState.loading}
        />
      )}
    </div>
  );
}
