import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';

const ProfileHeader = ({ vendorId }: { vendorId: string }) => {
  const t = useTranslations('vendorProfile.header');

  return (
    <header className="flex justify-between">
      <Heading title={t('title')} />
      <Link href={`/vendor/deliveries/${vendorId}/profile/update-profile`}>
        <AppButton variant="primary" className="font-medium">
          {t('updateButton')}
        </AppButton>
      </Link>
    </header>
  );
};

export default ProfileHeader;
