import { useTranslations } from 'next-intl';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { BannerForm } from './BannerForm';

export interface InitialValues {
  title: string;
  description: string;
  action_type: 'none' | 'store' | 'product' | 'shop_type';
  related_store: string;
  related_product: string;
  related_shop_type: string;
  image: File | string | null;
  video: File | string | null;
}

const initialValues: InitialValues = {
  title: '',
  description: '',
  action_type: 'none',
  related_store: '',
  related_product: '',
  related_shop_type: '',
  image: null,
  video: null,
};

export function AddBannerSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations('enategaDeliveriesPages.banners.form');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{t('addTitle')}</SheetTitle>
        </SheetHeader>
        <BannerForm
          initialValues={initialValues}
          onOpenChange={onOpenChange}
          type="add"
        />
      </SheetContent>
    </Sheet>
  );
}
