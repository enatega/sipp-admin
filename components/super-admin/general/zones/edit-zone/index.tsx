'use client';

import { Zone } from '@/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Heading } from '@/components/shared/Heading';
import UpdateZoneForm from './UpdateZoneForm';
import { useTranslations } from 'next-intl';

interface EditZoneDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  zone: Zone;
}

export default function EditZoneDrawer({
  isOpen,
  onClose,
  zone,
}: EditZoneDrawerProps) {
  const t = useTranslations('zones');
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl h-full overflow-y-auto p-4">
        <SheetHeader className="mb-5 !p-0">
          <SheetTitle>
            <Heading title={t('editZone')} />
          </SheetTitle>
        </SheetHeader>
        <UpdateZoneForm onClose={onClose} zone={zone} />
      </SheetContent>
    </Sheet>
  );
}
