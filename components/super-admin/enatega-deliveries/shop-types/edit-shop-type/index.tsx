import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useTranslations } from 'next-intl';
import { EditShopTypeDrawerProps } from '../common/type';
import { EditShopTypeForm } from './edit-form';

export function EditShopTypeDrawer({
  isOpen,
  onClose,
  shopTypeData,
}: EditShopTypeDrawerProps) {
  const t = useTranslations('lumiFood.shopTypes.editDrawer');

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl h-full overflow-y-auto p-4">
        <SheetHeader className="mb-5 !p-0">
          <SheetTitle className="text-lg">{t('title')}</SheetTitle>
        </SheetHeader>
        <EditShopTypeForm onClose={onClose} shopTypeData={shopTypeData} />
      </SheetContent>
    </Sheet>
  );
}
