'use client';

import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';
import { PlusCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { buildScopedDeliveriesAdminPathFromCurrent } from '@/lib/routes';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('lumiFood.shopTypes.header');

  const handleAddShopType = () => {
    router.push(
      buildScopedDeliveriesAdminPathFromCurrent(
        pathname,
        '/enatega-deliveries/shop-types/add/',
      ),
    );
  };

  return (
    <div className="flex justify-between items-center mb-7">
      <Heading title={t('title')} />
      <AppButton
        variant="primary"
        leftIcon={<PlusCircleIcon size={16} />}
        onClick={handleAddShopType}
      >
        {t('addButton')}
      </AppButton>
    </div>
  );
}
