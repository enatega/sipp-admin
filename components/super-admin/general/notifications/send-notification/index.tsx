'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Heading } from '@/components/shared/Heading';
import SendNotificationForm from './SendNotificationForm';
import { useTranslations } from 'next-intl';

interface SendNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SendNotificationDrawer({
  isOpen,
  onClose,
}: SendNotificationDrawerProps) {
  const t = useTranslations('notifications');
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl h-full overflow-y-auto p-4">
        <SheetHeader className="mb-5 !p-0">
          <SheetTitle>
            <Heading title={t('send')} />
          </SheetTitle>
        </SheetHeader>
        <SendNotificationForm onClose={onClose} />
      </SheetContent>
    </Sheet>
  );
}
