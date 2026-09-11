'use client';

import { useParams, useRouter } from 'next/navigation';
import { CirclePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';

export default function Header() {
  const router = useRouter();
  const { vendorId } = useParams() as { vendorId: string };
  const t = useTranslations('vendorDeliveriesStores');

  return (
    <div className="flex flex-col gap-7">
      <div className="flex justify-between items-center">
        <Heading title={t('title')} />
        <div className="flex gap-2 items-center">
          <AppButton
            leftIcon={<CirclePlus size={16} />}
            onClick={() =>
              router.push(`/vendor/deliveries/${vendorId}/stores/add-store`)
            }
          >
            {t('addStoreLabel')}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
