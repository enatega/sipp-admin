'use client';

import { Heading } from '@/components/shared/Heading';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import AddZoneForm from './AddZoneForm';

interface AddZoneDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddZoneDrawer({
  isOpen,
  onClose,
}: AddZoneDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl h-full overflow-y-auto p-4">
        <SheetHeader className="mb-5 !p-0">
          <SheetTitle>
            <Heading title="Add Deliveries Zone" />
          </SheetTitle>
        </SheetHeader>
        <AddZoneForm onClose={onClose} />
      </SheetContent>
    </Sheet>
  );
}
