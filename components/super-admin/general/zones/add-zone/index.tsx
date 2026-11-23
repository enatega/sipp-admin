'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Heading } from '@/components/shared/Heading';
import AddZoneForm from './AddZoneForm';
import { useTranslations } from 'next-intl';

interface AddZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddZoneDrawer({ isOpen, onClose }: AddZoneModalProps) {
  const t = useTranslations('zones');
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl h-full overflow-y-auto p-4">
        <SheetHeader className="mb-5 !p-0">
          <SheetTitle>
            <Heading title={t('addZone')} />
          </SheetTitle>
        </SheetHeader>
        <AddZoneForm onClose={onClose} />
      </SheetContent>
    </Sheet>
  );
}
