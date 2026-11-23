'use client';

import { useTranslations } from 'next-intl';
import { Heading } from '@/components/shared/Heading';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ZoneCommissionData } from '../../../types';
import { EditZoneCommissionForm } from './EditZoneCommissionForm';

interface EditZoneCommissionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  row?: ZoneCommissionData | null;
}

export function EditZoneCommissionDrawer({
  isOpen,
  onClose,
  row,
}: EditZoneCommissionDrawerProps) {
  const t = useTranslations('commission-rate.zoneForm');
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
        <EditZoneCommissionForm row={row || null} onClose={onClose} />
      </SheetContent>
    </Sheet>
  );
}
