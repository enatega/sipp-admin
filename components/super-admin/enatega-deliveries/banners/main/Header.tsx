'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { PlusCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';

const AddBannerSheet = dynamic(
  () =>
    import('../add-banner/AddBannerSheet').then((mod) => mod.AddBannerSheet),
  { ssr: false },
);

export function Header() {
  const [open, setOpen] = useState(false);
  const t = useTranslations('enategaDeliveriesPages.banners');

  return (
    <div className="flex items-center justify-between">
      <Heading title={t('title')} />
      <AppButton
        variant="primary"
        leftIcon={<PlusCircleIcon size={16} />}
        onClick={() => setOpen(true)}
      >
        {t('addButton')}
      </AppButton>
      {open ? <AddBannerSheet open={open} onOpenChange={setOpen} /> : null}
    </div>
  );
}
