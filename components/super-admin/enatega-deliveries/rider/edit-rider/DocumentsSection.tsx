'use client';

import { useTranslations } from 'next-intl';
import { DeliveryRider } from '@/types/entities/super-admin/enatega-deliveries/rider';
import EditableDocumentField from '@/components/shared/form/EditableDocumentFIeld';

interface DocumentsSectionProps {
  rider?: DeliveryRider;
}

export const DocumentsSection = ({ rider }: DocumentsSectionProps) => {
  const t = useTranslations('driverManagement.editDriver');

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {t('documentsTitle')}
      </h2>
      <p className="text-sm text-gray-500 mb-6">{t('documentsDescription')}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2">
          <EditableDocumentField
            name="profile_picture"
            label={t('profilePicture')}
            existingImageUrl={rider?.userProfile?.user?.profile}
          />
        </div>

        <EditableDocumentField
          name="driver_license_front"
          label={t('driverLicenseFront')}
          existingImageUrl={rider?.driver_license_front}
        />
        <EditableDocumentField
          name="driver_license_back"
          label={t('driverLicenseBack')}
          existingImageUrl={rider?.driver_license_back}
        />
        <EditableDocumentField
          name="national_id_front"
          label={t('nationalIdPassportFront')}
          existingImageUrl={rider?.national_id_passport_front}
        />
        <EditableDocumentField
          name="national_id_back"
          label={t('nationalIdPassportBack')}
          existingImageUrl={rider?.national_id_passport_back}
        />
        <EditableDocumentField
          name="vehicle_registration_front"
          label={t('vehicleRegistrationFront')}
          existingImageUrl={rider?.vehicle_registration_front}
        />
        <EditableDocumentField
          name="vehicle_registration_back"
          label={t('vehicleRegistrationBack')}
          existingImageUrl={rider?.vehicle_registration_back}
        />
      </div>
    </div>
  );
};
