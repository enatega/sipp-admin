'use client';

import { useMemo } from 'react';
import { normalizePreviewSource } from '@/lib/document-preview';
import { useParams } from 'next/navigation';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useGetStoreProfile } from '@/hooks/api/store/deliveries/profile';

const PROFILE_DATE_TIME_FORMAT = 'DD MMM YYYY, hh:mm A';

const formatProfileDateTime = (value?: string) => {
  if (!value) return '';
  const formatted = moment(value);
  return formatted.isValid() ? formatted.format(PROFILE_DATE_TIME_FORMAT) : '';
};

export const useStoreProfileViewModel = () => {
  const tBasicFields = useTranslations(
    'storeProfile.detail.basicInformation.fields',
  );
  const tContact = useTranslations('storeProfile.detail.contactDetails');
  const tKyc = useTranslations('storeProfile.detail.kycDocuments');
  const params = useParams();
  const storeId = params?.storeId as string;

  const { data, isLoading, isError, error } = useGetStoreProfile(storeId);

  const mappedData = useMemo(() => {
    if (!data) {
      return {
        profile: undefined,
        isLegacyMigrated: false,
        settings: undefined,
        additionalNotes: undefined,
        BasicInformation: [],
        taxConfiguration: undefined,
        contactDetails: undefined,
        kycDocuments: [],
      };
    }

    return {
      profile: data.profile,
      isLegacyMigrated: data.isLegacyMigrated === true,
      taxConfiguration: data.basicInformation,
      settings: data.settings,
      additionalNotes: data.additionalNotes,
      contactDetails: {
        email: {
          label: tContact('emailLabel'),
          value: data?.contactInformation?.email,
        },
        phone: {
          label: tContact('phoneLabel'),
          value: data?.contactInformation?.phoneNumber,
        },
        showContactInStorePage: {
          label: tContact('showContactInStorePageLabel'),
          value: data?.contactInformation?.showContactOnStorePage,
        },
      },

      BasicInformation: [
        {
          key: 'createdDate',
          label: tBasicFields('createdDate'),
          value: formatProfileDateTime(data?.basicInformation?.createdDate),
        },
        {
          key: 'vendorName',
          label: tBasicFields('vendorName'),
          value: data?.basicInformation?.vendor.vendorName,
        },
        {
          key: 'city',
          label: tBasicFields('city'),
          value: data?.basicInformation?.city,
        },
        {
          key: 'tagLine',
          label: tBasicFields('tagLine'),
          value: data?.basicInformation?.tagLine,
        },
        {
          key: 'description',
          label: tBasicFields('description'),
          value: data?.basicInformation?.description,
        },
        {
          key: 'minimumOrderValue',
          label: tBasicFields('minimumOrderValue'),
          value: data?.basicInformation?.minimumOrderValue,
        },
      ],

      kycDocuments: [
        {
          label: tKyc('businessLicenseFrontLabel'),
          src: normalizePreviewSource(data?.kycDocuments?.businessLicenseFront),
          alt: tKyc('businessLicenseFrontAlt'),
        },
        {
          label: tKyc('businessLicenseBackLabel'),
          src: normalizePreviewSource(data?.kycDocuments?.businessLicenseBack),
          alt: tKyc('businessLicenseBackAlt'),
        },
        {
          label: tKyc('storeRegistrationDocumentLabel'),
          src: normalizePreviewSource(data?.kycDocuments?.registeredStoreDocs),
          alt: tKyc('storeRegistrationDocumentAlt'),
        },
        {
          label: tKyc('taxCertificateLabel'),
          src: normalizePreviewSource(data?.kycDocuments?.taxIdCertificate),
          alt: tKyc('taxCertificateAlt'),
        },
        {
          label: tKyc('nationalIdFrontLabel'),
          src: normalizePreviewSource(data?.kycDocuments?.nationalIdFront),
          alt: tKyc('nationalIdFrontAlt'),
        },
        {
          label: tKyc('nationalIdBackLabel'),
          src: normalizePreviewSource(data?.kycDocuments?.nationalIdBack),
          alt: tKyc('nationalIdBackAlt'),
        },
      ],
    };
  }, [data, tBasicFields, tContact, tKyc]);

  return {
    storeId,
    isLoading,
    isError,
    error,
    ...mappedData,
  };
};
