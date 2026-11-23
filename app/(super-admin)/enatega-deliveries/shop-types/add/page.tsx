import { getTranslations } from 'next-intl/server';
import { AddShopTypeForm } from '@/components/super-admin/enatega-deliveries/shop-types/add-shop-type/add-form';
import { Heading } from '@/components/shared/Heading';

export default async function Page() {
  const t = await getTranslations('lumiFood.shopTypes.pages');
  return (
    <div className="space-y-5">
      <Heading title={t('addTitle')} containerClassName="mt-4" showBackBtn />
      <div className="mt-6 gap-10 bg-light rounded-lg p-6 border">
        <AddShopTypeForm />
      </div>
    </div>
  );
}
