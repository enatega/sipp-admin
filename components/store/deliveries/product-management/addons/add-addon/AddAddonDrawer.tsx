'use client';

import { AddonFormValues } from '@/types';
import { useTranslations } from 'next-intl';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { AddAddonForm } from './AddAddonForm';

interface AddAddonDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (values: AddonFormValues) => Promise<void> | void;
}

export function AddAddonDrawer({
  isOpen,
  onClose,
  onSubmit,
}: AddAddonDrawerProps) {
  const t = useTranslations('storeAddons');

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <div className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle>{t('form.addTitle')}</SheetTitle>
          </SheetHeader>
          <AddAddonForm
            onClose={onClose}
            onSubmit={onSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
