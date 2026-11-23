'use client';

import { useRouter } from 'next/navigation';
import { Heading } from '@/components/shared/Heading';
import AddRoleForm from './AddRoleForm';
import { useTranslations } from 'next-intl';

export function AddRolePage() {
  const router = useRouter();
  const t = useTranslations('roleAndPermissions');

  const handleClose = () => {
    return router.push(`/general/role-and-permissions`);
  };

  const handleOnSubmit = () => {
    return router.push(`/general/role-and-permissions`);
  };

  return (
    <div className="space-y-6">
      <Heading title={t('addRole')} showBackBtn={true} />

      {/* Form Container */}
      <div className="p-6">
        <AddRoleForm onClose={handleClose} onSubmit={handleOnSubmit} />
      </div>
    </div>
  );
}
