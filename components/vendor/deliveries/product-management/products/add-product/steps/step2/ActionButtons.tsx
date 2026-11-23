import { useTranslations } from 'next-intl';
import { AppButton } from '@/components/shared/AppButton';

interface ActionButtonsProps {
  onPrevious: () => void;
  onSubmit: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onPrevious,
  onSubmit,
}) => {
  const t = useTranslations('products.addProduct.step2');

  return (
    <div className="flex items-center justify-end border-t pt-4 gap-4 mt-6">
      <AppButton
        type="button"
        variant="secondary"
        className="px-12 rounded-[12px]"
        onClick={onPrevious}
      >
        {t('previousButton')}
      </AppButton>
      <AppButton
        type="button"
        onClick={onSubmit}
        className="px-12 rounded-[12px]"
      >
        {t('submitButton')}
      </AppButton>
    </div>
  );
};
