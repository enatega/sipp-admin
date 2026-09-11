'use client';

import { useTranslations } from 'next-intl';
import { useFormikContext } from 'formik';
import EditableDocumentField from '@/components/shared/form/EditableDocumentFIeld';
import { EditVendorFormValues } from '@/schemas/enatega-deliveries/vendor/vendor-form';

// interface BusinessDocumentsSection {
//   rider: DriverPersonalInfo | undefined;
// }

export const BusinessDocumentsSection = () => {
  const t = useTranslations('lumiFood.vendors.editVendor.businessDocuments');
  const { values } = useFormikContext<EditVendorFormValues>();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {t('title')}
      </h2>
      <p className="text-sm text-gray-500 mb-6">{t('documentsDescription')}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2">
          <EditableDocumentField
            name="logo"
            label={t('businessTrademarkLabel')}
            existingImageUrl={typeof values.logo === 'string' ? values.logo : null}
            requiredAsterisk
          />
        </div>
        <EditableDocumentField
          name="business_license_front"
          label={t('businessLicenseFrontLabel')}
          existingImageUrl={
            typeof values.business_license_front === 'string'
              ? values.business_license_front
              : null
          }
          requiredAsterisk
        />
        <EditableDocumentField
          name="business_license_back"
          label={t('businessLicenseBackLabel')}
          existingImageUrl={
            typeof values.business_license_back === 'string'
              ? values.business_license_back
              : null
          }
          requiredAsterisk
        />
        <EditableDocumentField
          name="national_id_passport_front"
          label={t('nationalIdPassportFrontLabel')}
          existingImageUrl={
            typeof values.national_id_passport_front === 'string'
              ? values.national_id_passport_front
              : null
          }
          requiredAsterisk
        />
        <EditableDocumentField
          name="national_id_passport_back"
          label={t('nationalIdPassportBackLabel')}
          existingImageUrl={
            typeof values.national_id_passport_back === 'string'
              ? values.national_id_passport_back
              : null
          }
          requiredAsterisk
        />
      </div>
    </div>
  );
};
