import { useTranslations } from 'next-intl';

export const Header = () => {
  const t = useTranslations('products.addProduct.step2');

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-gray-900">{t('title')}</h2>
      <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
    </div>
  );
};
