'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ApiErrorResponse, UserManagementItem } from '@/types';
import {
  Ban,
  CheckCircle,
  Eye,
  FileText,
  LogOut,
  MoreVertical,
  UserRoundCog,
  XCircle,
} from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { returnErrorMessage } from '@/lib/toast-error';
import { hasNamedPermission } from '@/lib/user';
import {
  useCreateImpersonationToken,
  useGetUserManagement,
} from '@/hooks/api/super-admin/general/users';
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
import Status from '@/components/shared/Status';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import TooltipText from '@/components/shared/TooltipText';
import { UserActionDialogs } from '../../user-detail/dialogs';
import { useUserActionDialogs } from '../../user-detail/dialogs/useUserActionDialogs';
import { downloadColumns } from './downloadColumns';
import { Filters } from './Filters';

export function UsersTable() {
  const t = useTranslations('users');
  const actions = useTranslations('users.actions');
  const userErrors = useTranslations('users.errors');
  const router = useRouter();
  const { data, isLoading, isError, error } = useGetUserManagement();
  const createImpersonationToken = useCreateImpersonationToken();
  const canImpersonate = hasNamedPermission('impersonate_users');

  const {
    items: sortedUsers,
    requestSort,
    sortConfig,
  } = useSortableData(data?.data || []);

  const {
    dialogs,
    openInternalNotes,
    closeInternalNotes,
    openForceLogout,
    closeForceLogout,
    openActivate,
    closeActivate,
    openDeactivate,
    closeDeactivate,
    openBlock,
    closeBlock,
  } = useUserActionDialogs();

  const getRegistrationMethod = (
    user: UserManagementItem,
  ): 'google' | 'manual' => {
    if (user.userProfile.user.google_id) return 'google';
    return 'manual';
  };

  const getStatusType = (user: UserManagementItem) => {
    if (user.userProfile.user.block_status) return 'blocked';
    if (!user.userProfile.user.active_status) return 'deactivated';
    return 'active';
  };

  const formatDate = (dateString: string) => {
    return moment(dateString).format('DD MMM YYYY, hh:mm A');
  };

  const handleRowClick = (id: string) => {
    router.push(`/general/users/${id}`);
  };

  const handleImpersonate = async (user: UserManagementItem) => {
    try {
      const result = await createImpersonationToken.mutateAsync(
        user.userProfile.user.id,
      );
      const customerWebUrl = new URL(
        '/auth/impersonate',
        process.env.NEXT_PUBLIC_CUSTOMER_WEB_URL || 'http://localhost:3001',
      );
      customerWebUrl.searchParams.set('token', result.token);
      window.location.assign(customerWebUrl.toString());
    } catch (caught) {
      toast.error(
        returnErrorMessage(caught as ApiErrorResponse) ||
          userErrors('impersonationFailed'),
      );
    }
  };

  return (
    <>
      <div className="flex items-center justify-between my-4 flex-wrap gap-2">
        <Filters />
        {sortedUsers.length > 0 && (
          <DownloadButtons
            fileName="users-data"
            data={sortedUsers}
            columns={downloadColumns}
            className="mb-0"
          />
        )}
      </div>
      <div className="rounded-md border overflow-auto mb-8">
        <Table className="min-w-[1200px]">
          <TableHeader className="bg-accent">
            <TableRow>
              <TableHeaderCell
                containerClass="pl-2"
                label={t('table.name')}
                sortKey="userProfile.user.name"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                containerClass="pl-2"
                label={t('table.email')}
                sortKey="userProfile.user.email"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHeaderCell
                label={t('table.phone')}
                sortKey="userProfile.user.phone"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHead>{t('table.registrationMethod')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
              <TableHead>{t('table.internalNotes')}</TableHead>
              <TableHead>{t('table.lastLogin')}</TableHead>
              <TableHeaderCell
                containerClass="pl-2"
                label={t('table.createdAt')}
                sortKey="userProfile.user.createdAt"
                requestSort={requestSort}
                sortConfig={sortConfig}
              />
              <TableHead>{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableShimmer limit={10 as TLimitType} columns={9} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={9} className="p-4">
                  <DisplayError
                    title={t('errors.fetchFailed')}
                    message={
                      returnErrorMessage(error as ApiErrorResponse) ||
                      t('errors.tryAgain')
                    }
                  />
                </TableCell>
              </TableRow>
            ) : sortedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center p-4">
                  <NoDataFound
                    title={t('errors.noUsers')}
                    subtitle={t('errors.noUsersSubtitle')}
                  />
                </TableCell>
              </TableRow>
            ) : (
              sortedUsers.map((user) => (
                <TableRow
                  className="cursor-pointer"
                  onClick={() => handleRowClick(user.id)}
                  key={user.id}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {user.userProfile.user.profile && (
                        <div className="relative w-8 h-8 flex-shrink-0">
                          <Image
                            src={user.userProfile.user.profile}
                            alt={user.userProfile.user.name}
                            fill
                            className="object-cover rounded-full"
                          />
                        </div>
                      )}
                      <span>{user.userProfile.user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.userProfile.user.email || t('notAvailable')}
                  </TableCell>
                  <TableCell>
                    {user.userProfile.user.phone || t('notAvailable')}
                  </TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getRegistrationMethod(user) === 'google'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-black/10 text-black'
                      }`}
                    >
                      {t(`registrationMethods.${getRegistrationMethod(user)}`)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Status status={getStatusType(user)} />
                  </TableCell>

                  <TableCell className="max-w-[200px] truncate">
                    {user.userProfile.user.internal_notes ? (
                      <TooltipText
                        content={user.userProfile.user.internal_notes}
                      >
                        <span>{user.userProfile.user.internal_notes}</span>
                      </TooltipText>
                    ) : (
                      <span>{t('notAvailable')}</span>
                    )}
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    {user.userProfile.user.last_login
                      ? formatDate(user.userProfile.user.last_login)
                      : t('notAvailable')}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(user.userProfile.user.createdAt)}
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="border px-2 py-1.5 rounded-md shadow">
                        <MoreVertical size={20} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-[200px] p-0 rounded-xl overflow-hidden shadow-lg"
                      >
                        <DropdownMenuItem
                          className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(user.id);
                          }}
                        >
                          <Eye className="size-[18px]" />
                          <span className="text-sm">
                            {t('actions.viewDetails')}
                          </span>
                        </DropdownMenuItem>
                        {canImpersonate &&
                          user.userProfile.user.active_status &&
                          !user.userProfile.user.block_status && (
                            <DropdownMenuItem
                              disabled={createImpersonationToken.isPending}
                              className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleImpersonate(user);
                              }}
                            >
                              <UserRoundCog className="size-[18px]" />
                              <span className="text-sm">
                                {actions('loginAsUser')}
                              </span>
                            </DropdownMenuItem>
                          )}
                        <DropdownMenuItem
                          className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            openInternalNotes(user);
                          }}
                        >
                          <FileText className="size-[18px]" />
                          <span className="text-sm max-w-[100px] truncate">
                            {t('actions.internalNotes')}
                          </span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            openForceLogout(user);
                          }}
                        >
                          <LogOut className="size-[18px]" />
                          <span className="text-sm">
                            {t('actions.forceLogout')}
                          </span>
                        </DropdownMenuItem>

                        {!user.userProfile.user.active_status ? (
                          <DropdownMenuItem
                            className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none hover:!bg-green-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              openActivate(user);
                            }}
                          >
                            <CheckCircle className="size-[18px] text-green-600" />
                            <span className="text-sm text-green-600">
                              {t('actions.activateAccount')}
                            </span>
                          </DropdownMenuItem>
                        ) : (
                          <>
                            {!user.userProfile.user.block_status && (
                              <DropdownMenuItem
                                className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none hover:!bg-orange-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeactivate(user);
                                }}
                              >
                                <XCircle className="size-[18px] text-orange-600" />
                                <span className="text-sm text-orange-600">
                                  {t('actions.deactivateAccount')}
                                </span>
                              </DropdownMenuItem>
                            )}
                          </>
                        )}

                        {!user.userProfile.user.block_status ? (
                          <DropdownMenuItem
                            className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:!bg-yellow-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              openBlock(user);
                            }}
                          >
                            <Ban className="size-[18px] text-yellow-700" />
                            <span className="text-sm text-yellow-700">
                              {t('actions.blockAccount')}
                            </span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none hover:!bg-green-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              openBlock(user);
                            }}
                          >
                            <CheckCircle className="size-[18px] text-green-600" />
                            <span className="text-sm text-green-600">
                              {t('actions.unblockAccount')}
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
        <div className="p-3 bg-accent/30 border-t rounded-b-md">
          {!isError && !isLoading && sortedUsers.length > 0 && (
            <AppPagination
              page={data?.page || 1}
              totalPages={Math.ceil((data?.total || 0) / (data?.limit || 10))}
              totalData={data?.total || 0}
              defaultLimit={(data?.limit || 10) as TLimitType}
            />
          )}
        </div>
      </div>

      {/* Dialogs */}
      <UserActionDialogs
        queryKey={'get-user-management'}
        dialogs={dialogs}
        closeInternalNotes={closeInternalNotes}
        closeForceLogout={closeForceLogout}
        closeActivate={closeActivate}
        closeDeactivate={closeDeactivate}
        closeBlock={closeBlock}
      />
    </>
  );
}
