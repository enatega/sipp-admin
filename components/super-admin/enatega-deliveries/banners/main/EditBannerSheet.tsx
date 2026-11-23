import { useTranslations } from 'next-intl';
import { EnategaDeliveriesBanner } from '@/types/api/super-admin/enatega-deliveries/banners.api';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { InitialValues } from '../add-banner/AddBannerSheet';
import { BannerForm } from '../add-banner/BannerForm';

export function EditBannerSheet({
  open,
  onOpenChange,
  bannerData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bannerData: EnategaDeliveriesBanner | null;
}) {
  const t = useTranslations('enategaDeliveriesPages.banners.form');
  const initialValues: InitialValues = {
    title: bannerData?.title || '',
    description: bannerData?.description || '',
    action_type:
      (bannerData?.actionType as InitialValues['action_type']) || 'none',
    related_store: bannerData?.relatedStore || '',
    related_product: bannerData?.relatedProduct || '',
    related_shop_type: bannerData?.relatedShopType || '',
    image: bannerData?.bannerImageLink || null,
    video: bannerData?.bannerVideoLink || null,
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{t('editTitle')}</SheetTitle>
        </SheetHeader>
        <BannerForm
          initialValues={initialValues}
          onOpenChange={onOpenChange}
          type="edit"
          bannerId={bannerData?.id}
          bannerData={bannerData}
        />
      </SheetContent>
    </Sheet>
  );
}
