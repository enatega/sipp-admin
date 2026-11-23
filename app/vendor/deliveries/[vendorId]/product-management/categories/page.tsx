'use client';

import { useState } from 'react';
import { CirclePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';
import CreateCategorySheet from '@/components/vendor/deliveries/product-management/categories/CreateCategorySheet';
import CategoriesTable from '@/components/vendor/deliveries/product-management/categories/table/CategoriesTable';

export default function Categories() {
  const t = useTranslations('categories');
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

  return (
    <div className="space-y-7">
      <div className="flex justify-between items-center">
        <Heading title={t('title')} />
        <AppButton
          leftIcon={<CirclePlus size={16} />}
          onClick={() => setIsCreateSheetOpen(true)}
        >
          {t('createButton')}
        </AppButton>
      </div>

      <CategoriesTable />

      {isCreateSheetOpen && (
        <CreateCategorySheet
          isOpen={isCreateSheetOpen}
          onClose={() => setIsCreateSheetOpen(false)}
        />
      )}
    </div>
  );
}

