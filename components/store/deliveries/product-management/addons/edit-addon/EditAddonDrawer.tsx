'use client';

import { Addon, AddonFormValues } from '@/types';
import { useTranslations } from 'next-intl';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { AddAddonForm } from '../add-addon/AddAddonForm';

interface EditAddonDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (values: AddonFormValues) => Promise<void> | void;
  editData: Addon;
}

export function EditAddonDrawer({
  isOpen,
  onClose,
  onSubmit,
  editData,
}: EditAddonDrawerProps) {
  const t = useTranslations('storeAddons');

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <div className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle>{t('form.editTitle')}</SheetTitle>
          </SheetHeader>
          <AddAddonForm
            onClose={onClose}
            onSubmit={onSubmit}
            editData={editData}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
