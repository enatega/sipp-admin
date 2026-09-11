import { useTranslations } from 'next-intl';
import { AppFileInput } from '@/components/shared/form/AppFileInput';

const documentFields = [
  { name: 'businessLicenseFront', labelKey: 'businessLicenseFront' },
  { name: 'businessLicenseBack', labelKey: 'businessLicenseBack' },
  { name: 'identityCardFront', labelKey: 'identityCardFront' },
  { name: 'identityCardBack', labelKey: 'identityCardBack' },
  { name: 'storeRegistrationDoc', labelKey: 'storeRegistrationDoc' },
  { name: 'taxCertificate', labelKey: 'taxCertificate' },
] as const;

export function DocumentSection() {
  const t = useTranslations('lumiFood.stores.addStore.step5');
  const tEdit = useTranslations('lumiFood.stores.editStore.documents');

  return (
    <div className="rounded-xl bg-white p-10 shadow">
      <div className="mb-10 space-y-2">
        <h3 className="text-2xl font-semibold">{t('title')}</h3>
        <p className="text-sm text-mute">{tEdit('description')}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {documentFields.map((field) => (
          <AppFileInput
            key={field.name}
            name={field.name}
            label={t(`fields.${field.labelKey}`)}
            requiredAsterisk
            previewHeight={120}
          />
        ))}
      </div>
    </div>
  );
}
