import { useTranslations } from 'next-intl';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { Step5Lables } from './data';

export function DocumentSection({ isLegacyMigrated = false }: { isLegacyMigrated?: boolean }) {
  const t = useTranslations('lumiFood.stores.addStore.step5');
  const tEdit = useTranslations('lumiFood.stores.editStore.documents');

  return (
    <div className="bg-white rounded-xl p-10 shadow">
      <div className="mb-10 space-y-2">
        <h3 className="text-2xl font-semibold">{t('title')}</h3>
        <p className="text-mute text-sm">
          {tEdit('description')}
        </p>
      </div>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Step5Lables.map((field) => (
            <AppFileInput
              key={field.name}
              name={field.name}
              label={t(`fields.${field.labelKey}`)}
              requiredAsterisk={!isLegacyMigrated}
              previewHeight={120}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
