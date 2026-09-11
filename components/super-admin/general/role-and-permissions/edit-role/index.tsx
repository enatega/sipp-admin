'use client';

import { useRouter } from 'next/navigation';
import { ApiErrorResponse } from '@/types';
import { returnErrorMessage } from '@/lib/toast-error';
import { useGetRoleById } from '@/hooks/api/super-admin/general/role-and-permissions';
import { useQueryParams } from '@/hooks/use-query-params';
import DisplayError from '@/components/shared/DisplayError';
import { Heading } from '@/components/shared/Heading';
import NoDataFound from '@/components/shared/NoDataFound';
import EditRoleForm from './EditRoleForm';
import EditRoleShimmer from './EditRoleShimmer';
import { useTranslations } from 'next-intl';

export function EditRolePage() {
  const router = useRouter();
  const { getParam } = useQueryParams();
  const roleId = getParam('roleId');
  const t = useTranslations('roleAndPermissions');
  const tError = useTranslations('roleAndPermissions.errors');

  const {
    data: roleData,
    isLoading,
    error,
  } = useGetRoleById(roleId!, {
    enabled: !!roleId,
    refetchOnWindowFocus: false,
  });

  const handleClose = () => {
    return router.push(`/general/role-and-permissions`);
  };

  const handleOnSubmit = () => {
    return router.push(`/general/role-and-permissions`);
  };

  if (!roleId) {
    return (
      <div className="space-y-6">
        <Heading title={t('editRole')} showBackBtn={true} />
        <div className="p-6">
          <DisplayError
            title={tError('roleIdNotFound')}
            message={
              returnErrorMessage(error as ApiErrorResponse) ||
              tError('provideValidRoleId')
            }
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Heading title={t('editRole')} showBackBtn={true} />
        <EditRoleShimmer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Heading title={t('editRole')} showBackBtn={true} />
        <div className="p-6">
          <DisplayError
            title={tError('loadingRole')}
            message={
              returnErrorMessage(error as ApiErrorResponse) ||
              tError('findRole')
            }
          />
        </div>
      </div>
    );
  }

  if (!roleData) {
    return (
      <div className="space-y-6">
        <Heading title={t('editRole')} showBackBtn={true} />
        <div className="p-6">
          <NoDataFound
            title={tError('roleNotFound')}
            subtitle={tError('roleNotFoundSubtitle')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Heading title={t('editRole')} showBackBtn={true} />

      {/* Form Container */}
      <div className="p-6">
        <EditRoleForm
          roleId={roleId}
          roleData={roleData}
          onClose={handleClose}
          onSubmit={handleOnSubmit}
        />
      </div>
    </div>
  );
}
