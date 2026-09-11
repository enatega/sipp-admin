import Image from 'next/image';
import { GetVendorProfileResponse } from '@/types';
import { Star } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import Status from '@/components/shared/Status';

const ProfileDetail = ({
  vendorProfile,
}: {
  vendorProfile: GetVendorProfileResponse | undefined;
}) => {
  const t = useTranslations('vendorProfile.detail');
  const tFields = useTranslations('vendorProfile.detail.fields');
  const tDocuments = useTranslations('vendorProfile.detail.documents');
  const tSections = useTranslations('vendorProfile.detail.sections');
  const notAvailable = t('notAvailable');
  const totalReviews = vendorProfile?.rating?.total_reviews || 0;
  const averageRating = vendorProfile?.rating?.average_rating || 0;

  const createdDate = vendorProfile?.created_date
    ? moment(vendorProfile.created_date)
    : null;
  const formattedCreatedDate =
    createdDate && createdDate.isValid()
      ? createdDate.format('DD MMM YYYY, hh:mm A')
      : notAvailable;

  const vendorInformation = [
    { label: tFields('email'), value: vendorProfile?.email || notAvailable },
    {
      label: tFields('phoneNumber'),
      value: vendorProfile?.phone || notAvailable,
    },
    {
      label: tFields('createdDate'),
      value: formattedCreatedDate,
    },
    {
      label: tFields('city'),
      value: vendorProfile?.city || notAvailable,
    },
  ];

  const kycDocuments = [
    {
      label: tDocuments('businessLicenseFront'),
      value: vendorProfile?.business_license_front,
    },
    {
      label: tDocuments('businessLicenseBack'),
      value: vendorProfile?.business_license_back,
    },
    {
      label: tDocuments('nationalIdFront'),
      value: vendorProfile?.national_id_front,
    },
    {
      label: tDocuments('nationalIdBack'),
      value: vendorProfile?.national_id_back,
    },
  ];

  return (
    <div className="rounded-xl border bg-white">
      <div className="flex items-center gap-4 bg-mute/10 p-4 rounded-tl-lg rounded-tr-lg">
        <Image
          src={vendorProfile?.profile_image || '/images/enatega-deliveries/profile.jpg'}
          width={70}
          height={70}
          alt={t('profileImageAlt')}
          className="rounded-full object-cover h-16 w-16"
        />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="font-medium">
              {vendorProfile?.name || notAvailable}
            </h2>
            <Status status={vendorProfile?.status || ''} />
          </div>
          <p className="text-mute text-xs">
            {vendorProfile?.email || notAvailable}
          </p>
          <div className="mt-1 flex items-center gap-2 text-sm text-mute">
            <span className="font-medium text-foreground">{averageRating}</span>
            <div className="flex items-center gap-0.5 text-orange-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= averageRating ? 'fill-current' : ''}`}
                />
              ))}
            </div>
            <span>{t('reviewsLabel', { count: totalReviews })}</span>
          </div>
        </div>
      </div>
      <div className="space-y-8 p-4 md:p-6">
        <section>
          <h3 className="text-lg font-semibold text-foreground">
            {tSections('vendorInformation')}
          </h3>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {vendorInformation?.map((item) => (
              <div key={item.label} className="space-y-1">
                <p className="text-sm text-mute">{item.label}</p>
                <p className="text-sm text-foreground">{item?.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-foreground">
            {tSections('kycDocuments')}
          </h3>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row">
            <div className="flex flex-wrap gap-4 flex-1">
              {kycDocuments.slice(0, 2).map((doc) => (
                <div key={doc?.label} className="space-y-2">
                  <p className="text-sm text-mute">{doc?.label}</p>
                  <div className="overflow-hidden rounded-lg border bg-mute/5">
                    <Image
                      src={doc?.value || '/images/enatega-deliveries/profile.jpg'}
                      width={200}
                      height={200}
                      alt={doc?.label || t('documentImageAlt')}
                      className="h-28 w-44 object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 flex-1">
              {kycDocuments.slice(2, 4).map((doc) => (
                <div key={doc?.label} className="space-y-2">
                  <p className="text-sm text-mute">{doc?.label}</p>
                  <div className="overflow-hidden rounded-lg border bg-mute/5">
                    <Image
                      src={doc?.value || '/images/enatega-deliveries/profile.jpg'}
                      width={200}
                      height={200}
                      alt={doc?.label || t('documentImageAlt')}
                      className="h-28 w-44 object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfileDetail;
