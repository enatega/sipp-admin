'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { getStorePath } from '@/lib/store';
import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';

const ProfileHeader = () => {
  const t = useTranslations('storeProfile.header');
  const { storeId } = useParams() as { storeId?: string };

  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <Heading title={t('title')} />
      <Link href={getStorePath(storeId, '/store/profile/update-profile')}>
        <AppButton variant="primary" className="font-medium">
          {t('updateButton')}
        </AppButton>
      </Link>
    </header>
  );
};

export default ProfileHeader;
