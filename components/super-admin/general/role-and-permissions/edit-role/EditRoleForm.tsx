'use client';

import { useMemo, useState } from 'react';
import type { ApiErrorResponse, GetRoleByIdResponse } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import {
  useGetAllPermissions,
  useUpdateRole,
} from '@/hooks/api/super-admin/general/role-and-permissions';
import { AppButton } from '@/components/shared/AppButton';
import DisplayError from '@/components/shared/DisplayError';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppTextarea } from '@/components/shared/form/AppTextarea';
import NoDataFound from '@/components/shared/NoDataFound';
import AssignRoleToUserMultiSelect from '../common/AssignRoleToUserMultiSelect';
import { InviteUserDialog } from '../common/InviteUserDialog';
import PermissionCard from '../common/PermissionCard';
import PermissionCardShimmer from '../common/PermissionCardShimmer';
import { useTranslations } from 'next-intl';

interface EditRoleFormProps {
  roleId: string;
  roleData: GetRoleByIdResponse;
  onClose: () => void;
  onSubmit?: (values: {
    roleName: string;
    assignTo: string[];
    description: string;
    permissions: string[];
  }) => void;
}

export default function EditRoleForm({
  roleId,
  roleData,
  onClose,
  onSubmit,
}: EditRoleFormProps) {
  const t = useTranslations('roleAndPermissions');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Validation schema
  const editRoleValidationSchema = Yup.object().shape({
    roleName: Yup.string()
      .required(t('form.validation.roleNameRequired'))
      .min(2, t('form.validation.roleNameMin')),
    assignTo: Yup.array().min(0, t('form.validation.assignToMin')),
    description: Yup.string(),
    permissions: Yup.array()
      .min(1, t('form.validation.permissionsMin'))
      .required(t('form.validation.permissionsRequired')),
  });

  // Fetch permissions from API
  const {
    data: permissionsData,
    isLoading: isLoadingPermissions,
    error: permissionsError,
  } = useGetAllPermissions({ refetchOnWindowFocus: false });

  // Update role mutation
  const { mutateAsync: updateRole, isPending: isUpdatingRole } =
    useUpdateRole();

  // Transform API data to PermissionCard format
  const modules = useMemo(() => {
    if (!permissionsData) return [];

    return Object.entries(permissionsData).map(
      ([mainModuleKey, modulePermissions]) => ({
        id: mainModuleKey,
        name: mainModuleKey
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        subModules: Object.entries(modulePermissions).map(
          ([subModuleKey, permissions]) => ({
            id: subModuleKey,
            name: subModuleKey
              .split('_')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' '),
            permissions: permissions.map((permission) => ({
              id: permission.id,
              name: permission.name
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
              description: permission.description,
            })),
          }),
        ),
      }),
    );
  }, [permissionsData]);

  // Initial values from existing role data
  const initialValues = {
    roleName: roleData.name,
    assignTo: roleData.users.map((u) => u.id),
    description: roleData.description,
    permissions: roleData.permissions.map((p) => p.id),
  };

  // Store initial values to calculate diffs
  const initialUserIds = roleData.users.map((u) => u.id);
  const initialPermissionIds = roleData.permissions.map((p) => p.id);

  const handleSubmit = async (values: {
    roleName: string;
    assignTo: string[];
    description: string;
    permissions: string[];
  }) => {
    try {
      // Calculate what changed
      const currentUserIds = values.assignTo;
      const currentPermissionIds = values.permissions;

      const usersToAdd = currentUserIds.filter(
        (id: string) => !initialUserIds.includes(id),
      );
      const usersToRemove = initialUserIds.filter(
        (id: string) => !currentUserIds.includes(id),
      );
      const permissionsToAdd = currentPermissionIds.filter(
        (id: string) => !initialPermissionIds.includes(id),
      );
      const permissionsToRemove = initialPermissionIds.filter(
        (id: string) => !currentPermissionIds.includes(id),
      );

      const payload = {
        roleId,
        name: values.roleName,
        description: values.description,
        usersToAdd,
        usersToRemove,
        permissionsToAdd,
        permissionsToRemove,
      };

      const response = await updateRole(payload);
      toast.success(response.message || t('form.updateSuccess'));

      // Invalidate roles query to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ['get-roles'] });

      if (onSubmit) {
        onSubmit(values);
      }

      onClose();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  const handlePermissionChange = (
    permissionId: string,
    checked: boolean,
    setFieldValue: (
      field: string,
      value: string[],
      shouldValidate?: boolean,
    ) => void,
    currentPermissions: string[],
  ) => {
    let updatedPermissions: string[];

    if (checked) {
      // Add permission if not already present
      updatedPermissions = currentPermissions.includes(permissionId)
        ? currentPermissions
        : [...currentPermissions, permissionId];
    } else {
      // Remove permission
      updatedPermissions = currentPermissions.filter(
        (id) => id !== permissionId,
      );
    }

    setFieldValue('permissions', updatedPermissions);
  };

  const handleBulkPermissionChange = (
    permissionIds: string[],
    checked: boolean,
    setFieldValue: (
      field: string,
      value: string[],
      shouldValidate?: boolean,
    ) => void,
    currentPermissions: string[],
  ) => {
    let updatedPermissions: string[];

    if (checked) {
      // Add all permissions that aren't already present
      const newPermissions = permissionIds.filter(
        (id) => !currentPermissions.includes(id),
      );
      updatedPermissions = [...currentPermissions, ...newPermissions];
    } else {
      // Remove all specified permissions
      updatedPermissions = currentPermissions.filter(
        (id) => !permissionIds.includes(id),
      );
    }

    setFieldValue('permissions', updatedPermissions);
  };

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={editRoleValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, errors, touched }) => (
          <Form className="space-y-4">
            {/* Role Name and Assign To Row */}

            <AppInputField
              name="roleName"
              label={t('form.roleName')}
              placeholder={t('form.roleNamePlaceholder')}
              requiredAsterisk
            />

            <div className="mt-0.5 self-start flex items-center gap-2">
              <AssignRoleToUserMultiSelect
                name="assignTo"
                label={t('form.assignTo')}
                placeholder={t('form.assignToPlaceholder')}
                containerClassName="w-full"
                onInviteUser={() => setInviteDialogOpen(true)}
              />
              <AppButton
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<UserPlus size={16} />}
                className="w-fit mt-6.5 h-11"
                onClick={() => setInviteDialogOpen(true)}
              >
                {t('form.inviteUser')}
              </AppButton>
            </div>

            {/* Description */}
            <AppTextarea
              name="description"
              label={t('form.description')}
              placeholder={t('form.descriptionPlaceholder')}
              rows={3}
            />

            {/* Permissions Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium ">
                  {t('form.permissions')} <span className="text-destructive ml-1">*</span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('form.permissionsSubtitle')}
                </p>
                {touched.permissions && errors.permissions && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.permissions}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                {isLoadingPermissions ? (
                  <PermissionCardShimmer count={2} />
                ) : permissionsError ? (
                  <DisplayError
                    title={t('errors.loadingPermissions')}
                    message={
                      returnErrorMessage(
                        permissionsError as ApiErrorResponse,
                      ) || t('errors.fetchPermissions')
                    }
                  />
                ) : modules.length === 0 ? (
                  <NoDataFound
                    title={t('errors.noPermissions')}
                    subtitle={t('errors.noPermissionsSubtitle')}
                  />
                ) : (
                  modules.map((module) => (
                    <PermissionCard
                      key={module.id}
                      module={module}
                      selectedPermissions={values.permissions}
                      onPermissionChange={(permissionId, checked) =>
                        handlePermissionChange(
                          permissionId,
                          checked,
                          setFieldValue,
                          values.permissions,
                        )
                      }
                      onBulkPermissionChange={(permissionIds, checked) =>
                        handleBulkPermissionChange(
                          permissionIds,
                          checked,
                          setFieldValue,
                          values.permissions,
                        )
                      }
                    />
                  ))
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-5">
              <AppButton
                type="button"
                className="px-6"
                variant="secondary"
                onClick={onClose}
                disabled={isUpdatingRole}
              >
                {t('form.cancel')}
              </AppButton>
              <AppButton
                type="submit"
                className="px-10"
                isLoading={isUpdatingRole}
                disabled={isUpdatingRole}
              >
                {t('form.update')}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>

      {/* Invite User Dialog */}
      <InviteUserDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
      />
    </>
  );
}
