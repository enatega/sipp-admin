'use client';

import { ApiErrorResponse } from '@/types';
import { MoreVertical, PenIcon, TrashIcon } from 'lucide-react';
import { returnErrorMessage } from '@/lib/toast-error';
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
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import TableHeaderCell from '@/components/shared/TableHeaderCell';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import { AddAssignedUsersCell } from './cell/assigned-users-cell/AddAssignedUsersCell';
import { AssignedUsersCell } from './cell/assigned-users-cell/AssignedUsersCell';
import { RolePermissionsCell } from './cell/RolePermissionsCell';
import TooltipText from '@/components/shared/TooltipText';
import { useTranslations } from 'next-intl';

interface User {
  id: string;
  name: string;
  designation: string;
  email: string;
  image: string;
  fallback: string;
}

// Role type for the table
interface Role extends Record<string, unknown> {
  id: string;
  roleName: string;
  description: string;
  assignedUsers: number;
  assignedUsersList?: User[];
  rolePermissions: string[];
  status: boolean;
  createdAt: string;
}

interface RoleAndPermissionsTableProps {
  roles: Role[];
  items: Role[];
  requestSort: (key: string) => void;
  sortConfig: {
    key: string | null;
    direction: 'ascending' | 'descending';
  } | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | ApiErrorResponse | null;
  limit: number;
  handleStatusToggle: (role: Role, checked: boolean) => void;
  handleEditRole: (role: Role) => void;
  setDeletingRole: (role: Role) => void;
}

function RoleAndPermissionsTable({
  roles,
  items,
  requestSort,
  sortConfig,
  isLoading,
  isError,
  error,
  limit,
  handleStatusToggle,
  handleEditRole,
  setDeletingRole,
}: RoleAndPermissionsTableProps) {
  const t = useTranslations('roleAndPermissions.table');
  const tError = useTranslations('roleAndPermissions.errors');

  return (
    <Table className="min-w-[900px]">
      <TableHeader className="bg-accent rounded-t-md">
        <TableRow>
          <TableHeaderCell
            label={t('roleName')}
            sortKey={'roleName'}
            requestSort={requestSort}
            sortConfig={sortConfig}
            containerClass="pl-2"
          />
          <TableHead>{t('description')}</TableHead>
          <TableHeaderCell
            label={t('assignedUsers')}
            sortKey={'assignedUsers'}
            requestSort={requestSort}
            sortConfig={sortConfig}
            containerClass="pl-2"
          />
          <TableHead>{t('rolePermissions')}</TableHead>
          <TableHeaderCell
            label={t('status')}
            sortKey={'status'}
            requestSort={requestSort}
            sortConfig={sortConfig}
            containerClass="pl-2"
          />
          <TableHead>{t('action')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableShimmer limit={limit as TLimitType} />
        ) : isError ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              <DisplayError
                title={tError('fetchFailedTitle')}
                message={
                  returnErrorMessage(error as ApiErrorResponse) ||
                  tError('fetchFailed')
                }
              />
            </TableCell>
          </TableRow>
        ) : roles.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center">
              <NoDataFound title={tError('noRoles')} />
            </TableCell>
          </TableRow>
        ) : (
          items.map((role) => (
            <TableRow className="!h-[55px]" key={role.id}>
              <TableCell className="font-medium">
                {role?.roleName ?? t('notAvailable')}
              </TableCell>
              <TableCell className="max-w-[300px] truncate">
                {role?.description ? (
                  <TooltipText content={role?.description}>
                    <span>{role?.description}</span>
                  </TooltipText>
                ) : (
                  <span>{t('notAvailable')}</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <AssignedUsersCell users={role?.assignedUsersList || []} />
                  <AddAssignedUsersCell
                    roleId={role.id}
                    selectedUsers={role?.assignedUsersList || []}
                  />
                </div>
              </TableCell>
              <TableCell>
                <RolePermissionsCell
                  permissions={role?.rolePermissions || []}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    id={`status-${role.id}`}
                    checked={role.status}
                    onCheckedChange={(checked) =>
                      handleStatusToggle(role, checked)
                    }
                  />
                </div>
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
                      onClick={() => handleEditRole(role)}
                    >
                      <PenIcon className="size-[18px]" />
                      <span className="text-sm">{t('edit')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:!bg-red-100"
                      onClick={() => setDeletingRole(role)}
                    >
                      <TrashIcon className="size-[18px] text-help-red" />
                      <span className="text-sm text-help-red">{t('delete')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export { RoleAndPermissionsTable };
