'use client';

import { useState } from 'react';
import { StaticPage } from '@/types';
import { Edit, Eye, MoreVertical, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { ApiErrorResponse } from '@/types/api/common';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import {
  useDeleteStaticPage,
  useGetStaticPages,
  useToggleStaticPagePublish,
} from '@/hooks/api/super-admin/enatega-deliveries/static-pages';
import { useSortableData } from '@/hooks/use-sortable-data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import NoDataFound from '@/components/shared/NoDataFound';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import EditStaticPageDrawer from './EditStaticPageDrawer';
import StaticPagePreviewPortal from './StaticPagePreviewPortal';
import StaticPageTableHeader from './StaticPageTableHeader';

export function StaticPagesTable() {
  const tTable = useTranslations('settings.staticPages.table');
  const tColumns = useTranslations('settings.staticPages.table.columns');
  const tErrors = useTranslations('settings.staticPages.table.errors');
  const tToasts = useTranslations('settings.staticPages.table.toasts');
  const tActions = useTranslations('settings.staticPages.table.actions');
  const tDialogs = useTranslations('settings.staticPages.dialogs.delete');
  const initialValues: StaticPage = {
    id: '',
    page_name: '',
    slug: '',
    content: '',
    banner_image: null,
    is_published: false,
  };

  // API
  const {
    data: staticPagesData,
    isLoading,
    isError,
    error,
  } = useGetStaticPages({
    refetchOnWindowFocus: false,
  });

  const { mutateAsync: togglePublish, isPending: isTogglingPublish } =
    useToggleStaticPagePublish();

  const { mutateAsync: deleteStaticPage, isPending: isDeletingPage } =
    useDeleteStaticPage();
  const staticPage = staticPagesData?.data || [];

  // states
  const { items, requestSort, sortConfig } = useSortableData(staticPage);
  const [deletingPage, setDeletingPage] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [preview, setPreviewOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<StaticPage>(initialValues);

  // Handles
  const handlePublishChange = async (page: StaticPage) => {
    try {
      await togglePublish({ id: page.id });
      toast.success(tToasts('publishUpdated'));
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  const onDeleteConfirm = async () => {
    if (!selectedPage?.id) return;
    try {
      const response = await deleteStaticPage({ id: selectedPage.id });

      toast.success(
        response.message || tToasts('deleteSuccess'),
      );

      setDeletingPage(false);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <div className="w-full">
      <StaticPageTableHeader />
      <div className="rounded-md border overflow-auto mb-4">
        <Table className="min-w-[900px]">
          <TableHeader className="bg-accent rounded-t-md">
            <TableRow>
              <TableHeaderCell
                label={tColumns('pageName')}
                sortKey={'page_name'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tColumns('slug')}
                sortKey={'slug'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={tColumns('content')}
                sortKey={'content'}
                requestSort={requestSort}
                sortConfig={sortConfig}
              />

              <TableHead>{tColumns('publish')}</TableHead>
              <TableHead>{''}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableShimmer limit={10 as TLimitType} columns={5} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="p-4">
                  <DisplayError
                    title={tErrors('fetchTitle')}
                    message={
                      returnErrorMessage(error as ApiErrorResponse) ||
                      tErrors('fetchMessage')
                    }
                  />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center p-4">
                  <NoDataFound
                    title={tTable('noDataTitle')}
                    subtitle={tTable('noDataSubtitle')}
                  />
                </TableCell>
              </TableRow>
            ) : (
              items.map((page, index) => (
                <TableRow className={`!h-[55px] cursor-pointer `} key={index}>
                  <TableCell>{page.page_name ?? tTable('notAvailable')}</TableCell>
                  <TableCell>{page.slug ?? tTable('notAvailable')}</TableCell>
                  <TableCell>
                    {page.content
                      ? page.content.replace(/<[^>]*>/g, '').length > 70
                        ? page.content
                            .replace(/<[^>]*>/g, '')
                            .substring(0, 70) + '...'
                        : page.content.replace(/<[^>]*>/g, '')
                      : tTable('notAvailable')}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={page.is_published}
                      disabled={isTogglingPublish}
                      onCheckedChange={() => handlePublishChange(page)}
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="border px-2 py-1.5 rounded-md shadow"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical size={20} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-[150px] p-0 rounded-xl overflow-hidden shadow-lg"
                      >
                        <DropdownMenuItem
                          className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPage(page);
                            setEditOpen(true);
                          }}
                        >
                          <Edit className="size-[18px]" />
                          <span className="text-sm">{tActions('edit')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPage(page);
                            setPreviewOpen(true);
                          }}
                        >
                          <Eye className="size-[18px]" />
                          <span className="text-sm">{tActions('preview')}</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          variant="destructive"
                          className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none "
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPage(page);
                            setDeletingPage(true);
                          }}
                        >
                          <Trash className="size-[18px] text-destructive" />
                          <span className="text-sm text-destructive">
                            {tActions('delete')}
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
          {!isError && !isLoading && staticPage?.length > 0 && (
            <AppPagination
              page={staticPagesData?.page ?? 1}
              totalPages={staticPagesData?.totalPages ?? 1}
              totalData={staticPagesData?.total ?? 1}
              defaultLimit={10}
            />
          )}
        </div>

        <EditStaticPageDrawer
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          pageData={selectedPage}
        />

        <StaticPagePreviewPortal
          data={selectedPage}
          open={preview}
          variant="modal"
          onClose={() => setPreviewOpen(false)}
        />

        <AppAlertDialog
          className="!w-[850px]"
          title={tDialogs('title')}
          subTitle={tDialogs('subTitle')}
          description={tDialogs('description')}
          open={deletingPage}
          onOpenChange={() => {
            setDeletingPage(false);
          }}
          variant="delete"
          confirmLabel={tDialogs('confirm')}
          onConfirm={onDeleteConfirm}
          loading={isDeletingPage}
        />
      </div>
    </div>
  );
}
