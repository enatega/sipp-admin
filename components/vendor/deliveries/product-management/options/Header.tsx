'use client';

import { Heading } from '@/components/shared/Heading';
import { AppButton } from '@/components/shared/AppButton';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface OptionsHeaderProps {
  onAddClick?: () => void;
}

export default function OptionsHeader({ onAddClick }: OptionsHeaderProps) {
  const t = useTranslations('storeOptions');

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Heading title={t('title')} />
      <AppButton leftIcon={<Plus className="size-4" />} onClick={onAddClick}>
        {t('addButton')}
      </AppButton>
    </div>
  );
}
