'use client';

import { useState } from 'react';
import { CirclePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';
import CreateSubCategorySheet from '@/components/store/deliveries/product-management/sub-categories/CreateSubCategorySheet';
import SubCategoriesTable from '@/components/store/deliveries/product-management/sub-categories/table/SubCategoriesTable';

export default function SubCategories() {
  const t = useTranslations('subCategories');
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

      <SubCategoriesTable />

      {isCreateSheetOpen && (
        <CreateSubCategorySheet
          isOpen={isCreateSheetOpen}
          onClose={() => setIsCreateSheetOpen(false)}
        />
      )}
    </div>
  );
}
