'use client';

import {
  InviteUserFormValues,
  inviteUserValidationSchema,
} from '@/schemas/invite-user';
import { ApiErrorResponse } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import { UserPlus2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import {
  useGetAllRoleForInvite,
  useInviteUser,
} from '@/hooks/api/super-admin/general/role-and-permissions';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppPasswordField } from '@/components/shared/form/AppPasswordField';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { Heading } from '@/components/shared/Heading';

interface InviteUserDialogProps {
  open: boolean;
  onClose: () => void;
  showRoleField?: boolean;
}

export function InviteUserDialog({
  open,
  onClose,
  showRoleField = true,
}: InviteUserDialogProps) {
  const t = useTranslations('roleAndPermissions.inviteDialog');
  const tForm = useTranslations('roleAndPermissions.form');
  const tSchema = useTranslations();
  const queryClient = useQueryClient();

  const { data: rolesData, isLoading: isLoadingRoles } =
    useGetAllRoleForInvite({ enabled: showRoleField });
  const inviteUserMutation = useInviteUser();

  const roleOptions =
    rolesData?.data.map((role) => ({
      key: role.name,
      value: role.id,
    })) || [];

  const initialValues: InviteUserFormValues = {
    fullName: '',
    email: '',
    password: '',
    role: '',
    mustChangePassword: false,
  };

  // ...
  const handleSubmit = async (values: InviteUserFormValues) => {
    try {
      await inviteUserMutation.mutateAsync({
        roleId: values.role || undefined,
        email: values.email,
        fullName: values.fullName,
        password: values.password,
        mustChangePassword: values.mustChangePassword ? true : false,
      });
      toast.success(t('success'));
      queryClient.invalidateQueries({ queryKey: ['get-role-users'] });
      onClose();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={t('title')}
      size="lg"
      showDefaultFooter={false}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={inviteUserValidationSchema(tSchema)}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form className="space-y-4">
            <div className="w-full flex flex-col items-center justify-center">
              <div className="mb-4">
                <UserPlus2 className="h-16 w-16 text-primary" />
              </div>
              <Heading title={t('title')} containerClassName="mb-2"></Heading>
              <p className="text-mute text-center mb-6 px-6">{t('subtitle')}</p>
            </div>

            <AppInputField
              name="fullName"
              label={t('fullName')}
              placeholder={t('fullNamePlaceholder')}
              requiredAsterisk
            />

            {/* Email */}
            <AppInputField
              name="email"
              label={t('email')}
              type="email"
              placeholder={t('emailPlaceholder')}
              requiredAsterisk
            />

            {/* Password */}
            <AppPasswordField
              name="password"
              label={t('password')}
              placeholder={t('passwordPlaceholder')}
              requiredAsterisk
            />

            {showRoleField && (
              <AppSelect
                name="role"
                label={t('role')}
                options={roleOptions}
                placeholder={t('rolePlaceholder')}
                disabled={isLoadingRoles}
              />
            )}

            {/* Must Change Password Checkbox */}
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="mustChangePassword"
                checked={values.mustChangePassword}
                onCheckedChange={(checked) =>
                  setFieldValue('mustChangePassword', checked)
                }
              />
              <Label
                htmlFor="mustChangePassword"
                className="text-sm font-normal cursor-pointer"
              >
                {t('changePassword')}
              </Label>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <AppButton
                type="button"
                variant="secondary"
                onClick={onClose}
                className="px-8"
              >
                {tForm('cancel')}
              </AppButton>
              <AppButton
                type="submit"
                className="px-8"
                isLoading={inviteUserMutation.isPending}
              >
                {t('title')}
              </AppButton>
            </div>
          </Form>
        )}
      </Formik>
    </AppDialog>
  );
}
