'use client';

import { useTranslations } from 'next-intl';
import { Heading } from '@/components/shared/Heading';
import { UserDetailTabs } from './tabs';

export function UserDetailPage() {
  const t = useTranslations('userDetail');

  return (
    <div>
      <Heading title={t('title')} showBackBtn />
      <div className="mt-6">
        <UserDetailTabs />
      </div>
    </div>
  );
}
