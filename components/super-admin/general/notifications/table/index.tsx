'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ApiErrorResponse, GetNotification } from '@/types';
import { MoreVertical, RefreshCw, TrashIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { formatDateTime } from '@/lib/formatDateTime';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import {
  useDeleteNotification,
  useGetNotifications,
} from '@/hooks/api/super-admin/general/notifications';
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
import AppPagination from '@/components/shared/AppPagination';
import DisplayError from '@/components/shared/DisplayError';
import { DownloadButtons } from '@/components/shared/DownloadButtons';
import NoDataFound from '@/components/shared/NoDataFound';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import TooltipText from '@/components/shared/TooltipText';
import Filters from './Filters';
import { NotificationSendToTableCell } from './NotificationSendToTableCell';

const AppAlertDialog = dynamic(
  () =>
    import('@/components/shared/AppAlertDialog').then(
      (mod) => mod.AppAlertDialog,
    ),
  { ssr: false },
);
const ResendNotificationDrawer = dynamic(
  () => import('../resend-notification'),
  { ssr: false },
);

export default function NotificationsTable() {
  const t = useTranslations('notifications');
  const tTable = useTranslations('notifications.table');
  const tErrors = useTranslations('notifications.errors');
  const tDialogs = useTranslations('notifications.dialogs');
  const tDownload = useTranslations('notifications.download');
  const { getParam } = useQueryParams();
  const limit = Number(getParam('limit')) || 10;
  const [resendingNotification, setResendingNotification] =
    useState<GetNotification | null>(null);
  const [deletingNotification, setDeletingNotification] =
    useState<GetNotification | null>(null);

  const { data, isLoading, isError, error } = useGetNotifications({
    placeholderData: (previousData) => previousData,
  });

  const { mutateAsync: deleteNotification, isPending: isDeletingNotification } =
    useDeleteNotification();

  const notifications = data?.notifications || [];
  const { items, requestSort, sortConfig } =
    useSortableData<GetNotification>(notifications);

  const handleDelete = async () => {
    if (deletingNotification) {
      try {
        const response = await deleteNotification(deletingNotification.id);
        toast.success(response.message || t('deleteSuccess'));
        setDeletingNotification(null);
      } catch (error) {
        handleApiError(error as ApiErrorResponse);
      }
    }
  };

  const notificationDownloadColumns = [
    { header: tDownload('title'), dataKey: 'title' },
    { header: tDownload('description'), dataKey: 'description' },
    {
      header: tDownload('sentTo'),
      dataKey: 'type',
    },
    {
      header: tDownload('createdDate'),
      dataKey: 'created_at',
      formatter: (item: GetNotification) =>
        formatDateTime(item.created_at, tTable('notAvailable')),
    },
  ];

  return (
    <div className="space-y-4">
      <Filters />
      <div className="mb-4">
        <DownloadButtons<GetNotification>
          fileName="notifications_report"
          data={notifications}
          columns={notificationDownloadColumns}
        />
        <div className="rounded-md border overflow-auto mt-4">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-accent rounded-t-md">
              <TableRow>
                <TableHeaderCell
                  label={tTable('title')}
                  sortKey={'title'}
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-2"
                />
                <TableHead>{tTable('description')}</TableHead>
                <TableHead>{tTable('sentTo')}</TableHead>
                <TableHead>{tTable('zones')}</TableHead>
                <TableHeaderCell
                  label={tTable('createdDate')}
                  sortKey={'created_at'}
                  requestSort={requestSort}
                  sortConfig={sortConfig}
                  containerClass="pl-2"
                />
                <TableHead>{tTable('action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableShimmer limit={limit as TLimitType} columns={6} />
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <DisplayError
                      title={tErrors('fetchFailedTitle')}
                      message={
                        returnErrorMessage(error as ApiErrorResponse) ||
                        tErrors('fetchFailed')
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : notifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <NoDataFound title={tErrors('noNotifications')} />
                  </TableCell>
                </TableRow>
              ) : (
                items.map((notification) => (
                  <TableRow className="!h-[55px]" key={notification.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {notification?.title ?? tTable('notAvailable')}
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate">
                      {notification?.description ? (
                        <TooltipText content={notification?.description}>
                          <span>{notification?.description}</span>
                        </TooltipText>
                      ) : (
                        <span>{tTable('notAvailable')}</span>
                      )}
                    </TableCell>
                    {/* <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {notification?.type?.map(
                          (type) =>
                            reverseUserTypeMapping[
                              type.toLowerCase() as UserType
                            ],
                        ) ?? tTable('notAvailable')}
                      </div>
                    </TableCell> */}
                    <TableCell>
                      <NotificationSendToTableCell
                        sendTo={notification.type}
                        emptyLabel={tTable('notAvailable')}
                        moreSuffix={
                          '+' +
                          Math.max(0, notification.type.length - 1) +
                          ' more'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {notification?.zoneNames?.length
                        ? tTable('zonesCount', {
                            count: notification.zoneNames.length,
                          })
                        : tTable('allZones')}
                    </TableCell>
                    <TableCell>
                      {formatDateTime(
                        notification?.created_at,
                        tTable('notAvailable'),
                      )}
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
                            onClick={() =>
                              setResendingNotification(notification)
                            }
                          >
                            <RefreshCw className="size-[18px]" />
                            <span className="text-sm">{tTable('resend')}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:!bg-red-100"
                            onClick={() =>
                              setDeletingNotification(notification)
                            }
                          >
                            <TrashIcon className="size-[18px] text-help-red" />
                            <span className="text-sm text-help-red">
                              {tTable('delete')}
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
            {!isLoading && !error && items.length > 0 && (
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

      {resendingNotification ? (
        <ResendNotificationDrawer
          isOpen={!!resendingNotification}
          onClose={() => setResendingNotification(null)}
          notification={resendingNotification}
        />
      ) : null}

      {deletingNotification ? (
        <AppAlertDialog
          className="!w-[850px]"
          title={tDialogs('deleteTitle')}
          subTitle={tDialogs('deleteSubtitle')}
          description={tDialogs('deleteConfirm')}
          open={!!deletingNotification}
          onOpenChange={() => setDeletingNotification(null)}
          variant="delete"
          confirmLabel={tDialogs('confirmDelete')}
          onConfirm={handleDelete}
          loading={isDeletingNotification}
        />
      ) : null}
    </div>
  );
}
