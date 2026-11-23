'use client';

import { useTranslations } from 'next-intl';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';

interface AddStoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddStoreDrawer({
  isOpen,
  onClose,
}: AddStoreDrawerProps) {
  const t = useTranslations('lumiFood.stores');

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl h-full overflow-y-auto p-4">
        <SheetHeader className="mb-5 p-0!">
          <SheetTitle>
            <Heading title={t('addStorelabel')} />
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-6">
          <p className="text-muted-foreground">{t('comingSoon')}</p>
          <div className="flex justify-end">
            <AppButton variant="secondary" onClick={onClose}>
              {t('cancel')}
            </AppButton>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
