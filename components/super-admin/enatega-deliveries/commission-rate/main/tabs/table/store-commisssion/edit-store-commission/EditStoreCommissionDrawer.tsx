'use client';

import { useTranslations } from 'next-intl';
import { Heading } from '@/components/shared/Heading';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { StoreCommissionData } from '../../../types';
import { EditStoreCommissionForm } from './EditStoreCommissionForm';

interface EditStoreCommissionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  row?: StoreCommissionData | null;
}

export function EditStoreCommissionDrawer({
  isOpen,
  onClose,
  row,
}: EditStoreCommissionDrawerProps) {
  const t = useTranslations('commission-rate.storeForm');
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl h-full overflow-y-auto p-4">
        <SheetHeader className="mb-5 !p-0">
          <SheetTitle>
            <Heading
              title={row ? t('editTitle') : t('addTitle')}
            />
          </SheetTitle>
        </SheetHeader>
        <EditStoreCommissionForm row={row || null} onClose={onClose} />
      </SheetContent>
    </Sheet>
  );
}
