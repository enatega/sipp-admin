'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CirclePlus } from 'lucide-react';
import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';

const Header = () => {
  const router = useRouter();
  const { vendorId } = useParams() as { vendorId: string };
  const t = useTranslations('vendorMenuTemplate');

  return (
    <div className="flex flex-col gap-7">
      <div className="flex justify-between items-center">
        <Heading title={t('title')} />
        <div className="flex gap-2 items-center">
          <AppButton
            leftIcon={<CirclePlus size={16} />}
            onClick={() =>
              router.push(`/vendor/deliveries/${vendorId}/menu-template/add-menu`)
            }
          >
            {t('addButton')}
          </AppButton>
        </div>
      </div>
    </div>
  );
};

export default Header;
