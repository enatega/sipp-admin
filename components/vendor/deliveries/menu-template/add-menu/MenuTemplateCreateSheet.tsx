'use client';

import type { CreateVendorChainMenuApiResponse } from '@/types';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import VendorAddMenuForm from './VendorAddMenuForm';

type MenuTemplateCreateSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (menu: CreateVendorChainMenuApiResponse) => void;
};

export default function MenuTemplateCreateSheet({
  open,
  onOpenChange,
  onCreated,
}: MenuTemplateCreateSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-3xl w-full overflow-y-auto p-0">
        <VendorAddMenuForm
          inlineMode
          onClose={() => onOpenChange(false)}
          onCreated={(menu) => {
            onCreated?.(menu);
            onOpenChange(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
