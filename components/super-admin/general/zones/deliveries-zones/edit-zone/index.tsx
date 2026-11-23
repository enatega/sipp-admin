'use client';

import { Heading } from '@/components/shared/Heading';
import { DeliveriesZone } from '@/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import UpdateZoneForm from './UpdateZoneForm';

interface EditZoneDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  zone: DeliveriesZone;
}

export default function EditZoneDrawer({
  isOpen,
  onClose,
  zone,
}: EditZoneDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl h-full overflow-y-auto p-4">
        <SheetHeader className="mb-5 !p-0">
          <SheetTitle>
            <Heading title="Edit Deliveries Zone" />
          </SheetTitle>
        </SheetHeader>
        <UpdateZoneForm onClose={onClose} zone={zone} />
      </SheetContent>
    </Sheet>
  );
}
