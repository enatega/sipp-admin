'use client';

import { useTranslations } from 'next-intl';
import { Heading } from '@/components/shared/Heading';
import { UsersTable } from './UsersTable';

export function UsersTableMain() {
  const t = useTranslations('users');

  return (
    <div>
      <Heading title={t('title')} />
      <UsersTable />
    </div>
  );
}
