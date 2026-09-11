'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ApiErrorResponse } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import {
  useDeleteRole,
  useGetRoles,
  useToggleRoleStatus,
} from '@/hooks/api/super-admin/general/role-and-permissions';
import { useQueryParams } from '@/hooks/use-query-params';
import { useSortableData } from '@/hooks/use-sortable-data';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import AppPagination from '@/components/shared/AppPagination';
import { DownloadButtons } from '@/components/shared/DownloadButtons';
import { TLimitType } from '@/components/shared/TableShimmer';
import Filters from './Filters';
import { RoleAndPermissionsTable } from './RoleAndPermissionsTable';
import { useTranslations } from 'next-intl';

// User type for assigned users (matching AnimatedTooltip format)
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

export default function RolesTable() {
  const router = useRouter();
  const t = useTranslations('roleAndPermissions.dialogs');
  const tDownload = useTranslations('roleAndPermissions.download');
  const { getParam } = useQueryParams();
  const limit = Number(getParam('limit')) || 10;
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [togglingRole, setTogglingRole] = useState<Role | null>(null);
  const queryClient = useQueryClient();

  // Fetch roles from API
  const {
    data: rolesData,
    isLoading,
    error,
  } = useGetRoles({
    refetchOnWindowFocus: false,
  });

  const isError = !!error;

  // Toggle role status mutation
  const { mutateAsync: toggleRoleStatus, isPending: isTogglingStatus } =
    useToggleRoleStatus();

  // Delete role mutation
  const { mutateAsync: deleteRole, isPending: isDeletingRole } =
    useDeleteRole();

  // Transform API data to match component structure
  const transformedData = useMemo(() => {
    if (!rolesData) {
      return {
        roles: [],
        currentPage: 1,
        totalPages: 1,
        total: 0,
      };
    }

    const transformedRoles: Role[] = rolesData.data?.map((role) => ({
      id: role.id,
      roleName: role.name,
      description: role.description,
      assignedUsers: role.users.length,
      assignedUsersList: role.users?.map((user) => ({
        id: user.id,
        name: user.name,
        designation: '', // API doesn't provide designation
        email: user.email || user.phone,
        image: user.profile,
        fallback: user?.name
          ?.split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      })),
      rolePermissions: role.permissions?.map((p) => p.name),
      status: role.active_status,
      createdAt: new Date().toISOString(), // API doesn't provide createdAt
    }));

    return {
      roles: transformedRoles,
      currentPage: rolesData.pagination.page,
      totalPages: rolesData.pagination.totalPages,
      total: rolesData.pagination.total,
    };
  }, [rolesData]);

  const roles = transformedData.roles;
  const { items, requestSort, sortConfig } = useSortableData<Role>(roles);

  const handleDelete = async () => {
    if (!deletingRole) return;

    try {
      const response = await deleteRole({ roleId: deletingRole.id });
      toast.success(
        response.message ||
          t('deleteSuccess'),
      );
      // Invalidate roles query to refetch the updated data
      queryClient.invalidateQueries({ queryKey: ['get-roles'] });
      setDeletingRole(null);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  const handleEditRole = (role: Role) => {
    // Navigate to edit role page with roleId as query param
    return router.push(
      `/general/role-and-permissions/edit-role?roleId=${role.id}`,
    );
  };

  const handleStatusToggle = (role: Role) => {
    // Show confirmation dialog instead of directly toggling
    setTogglingRole(role);
  };

  const handleConfirmToggle = async () => {
    if (!togglingRole) return;

    try {
      const response = await toggleRoleStatus({ roleId: togglingRole.id });
      toast.success(
        response.message ||
          t('toggleSuccess', { status: response.status ? t('activated') : t('deactivated') }),
      );
      // Invalidate roles query to refetch the updated data
      queryClient.invalidateQueries({ queryKey: ['get-roles'] });
      setTogglingRole(null);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  const roleDownloadColumns = [
    { header: tDownload('roleName'), dataKey: 'roleName' },
    { header: tDownload('description'), dataKey: 'description' },
    { header: tDownload('assignedUsers'), dataKey: 'assignedUsers' },
    {
      header: tDownload('rolePermissions'),
      dataKey: 'rolePermissions',
      formatter: (item: Role) => item.rolePermissions.join(', '),
    },
    {
      header: tDownload('status'),
      dataKey: 'status',
      formatter: (item: Role) => (item.status ? tDownload('active') : tDownload('inactive')),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <div className="flex flex-wrap mb-4 gap-4 items-center justify-between ">
          <Filters />
          <DownloadButtons<Role>
            fileName="roles_report"
            data={roles}
            columns={roleDownloadColumns}
            className="mb-0"
          />
        </div>
        <div className="rounded-md border overflow-auto">
          <RoleAndPermissionsTable
            roles={roles}
            items={items}
            requestSort={requestSort}
            sortConfig={sortConfig}
            isLoading={isLoading}
            isError={isError}
            error={error}
            limit={limit}
            handleStatusToggle={handleStatusToggle}
            handleEditRole={handleEditRole}
            setDeletingRole={setDeletingRole}
          />
          <div className="p-3 bg-accent/30 border-t rounded-b-md">
            {!isLoading && !error && items.length > 0 && (
              <AppPagination
                page={transformedData.currentPage}
                totalPages={transformedData.totalPages}
                totalData={transformedData.total}
                defaultLimit={limit as TLimitType}
              />
            )}
          </div>
        </div>
      </div>
      {togglingRole && (
        <AppAlertDialog
          className="!w-[850px]"
          title={togglingRole.status ? t('deactivateTitle') : t('activateTitle')}
          subTitle={togglingRole.status ? t('deactivateSubtitle', { roleName: togglingRole.roleName }) : t('activateSubtitle', { roleName: togglingRole.roleName })}
          description={togglingRole.status ? t('deactivateConfirm') : t('activateConfirm')}
          open={!!togglingRole}
          onOpenChange={() => setTogglingRole(null)}
          variant="primary"
          confirmLabel={togglingRole.status ? t('confirmDeactivate') : t('confirmActivate')}
          onConfirm={handleConfirmToggle}
          loading={isTogglingStatus}
        />
      )}
      {deletingRole && (
        <AppAlertDialog
          className="!w-[850px]"
          title={t('deleteTitle')}
          subTitle={t('deleteSubtitle', { roleName: deletingRole.roleName })}
          description={t('deleteConfirm')}
          open={!!deletingRole}
          onOpenChange={() => setDeletingRole(null)}
          variant="delete"
          confirmLabel={t('confirmDelete')}
          onConfirm={handleDelete}
          loading={isDeletingRole}
        />
      )}
    </div>
  );
}
