'use client';

import { format, parseISO } from 'date-fns';
import { Calendar, FileText, Star, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useGetDeliveryVendorProfile } from '@/hooks/api/super-admin/enatega-deliveries/vendors';
import { AppDialog } from '@/components/shared/AppDialog';
import NoDataFound from '@/components/shared/NoDataFound';
import Status from '@/components/shared/Status';

interface Props {
  open: boolean;
  vendorId: string | null;
  onOpenChange: (open: boolean) => void;
}

const getDisplayDate = (dateString?: string | null, fallback = 'N/A') => {
  if (!dateString) return fallback;
  try {
    return format(parseISO(dateString), 'dd MMM yyyy, hh:mm a');
  } catch {
    return fallback;
  }
};

const DocumentPreviewCard = ({
  title,
  imageUrl,
  emptyLabel,
}: {
  title: string;
  imageUrl?: string | null;
  emptyLabel: string;
}) => {
  return (
    <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
      <p className="text-sm font-medium">{title}</p>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={title}
          className="h-28 w-full rounded-lg border object-cover"
        />
      ) : (
        <div className="h-28 w-full rounded-lg border border-dashed bg-white/70 flex items-center justify-center text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      )}
    </div>
  );
};

export default function VendorDetailDialog({
  open,
  vendorId,
  onOpenChange,
}: Props) {
  const t = useTranslations('lumiFood.vendors.detailDialog');
  const tVendorDetail = useTranslations('vendorProfile.detail');
  const tVendorDetailFields = useTranslations('vendorProfile.detail.fields');
  const tVendorDocuments = useTranslations('vendorProfile.detail.documents');
  const tVendorSections = useTranslations('vendorProfile.detail.sections');

  const { data: vendor, isLoading } = useGetDeliveryVendorProfile(
    vendorId || '',
    {
      enabled: open && !!vendorId,
    },
  );

  const notAvailable = t('notAvailable');
  const formattedCreatedDate = getDisplayDate(vendor?.created_date, notAvailable);
  const averageRating = vendor?.rating?.average_rating ?? 0;
  const totalReviews = vendor?.rating?.total_reviews ?? 0;

  return (
    <AppDialog
      open={open}
      onClose={() => onOpenChange(false)}
      title={t('title')}
      size="4xl"
      showDefaultFooter={false}
    >
      {isLoading ? (
        <div className="space-y-6">
          <div className="rounded-2xl h-32 bg-muted/50 animate-pulse" />
          <div className="rounded-xl border bg-white p-5 space-y-4">
            <div className="h-6 w-48 bg-muted/50 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border bg-muted/20 p-4 space-y-2"
                >
                  <div className="h-3 w-24 bg-muted/50 rounded animate-pulse" />
                  <div className="h-4 w-40 bg-muted/50 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border bg-white p-5 space-y-4">
            <div className="h-6 w-40 bg-muted/50 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="rounded-xl border bg-muted/20 p-4">
                  <div className="h-4 w-32 bg-muted/50 rounded animate-pulse mb-2" />
                  <div className="h-28 w-full bg-muted/50 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : !vendor ? (
        <NoDataFound title={t('noDataTitle')} />
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl p-6 text-white shadow-sm bg-gradient-to-r from-blue-700 to-blue-500">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex items-start gap-4">
                {vendor.profile_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={vendor.profile_image}
                    alt={tVendorDetail('profileImageAlt')}
                    className="size-16 rounded-full object-cover border border-white/30"
                  />
                ) : (
                  <div className="size-16 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                    <User className="size-7" />
                  </div>
                )}

                <div>
                  <h3 className="text-2xl font-bold">{vendor.name || notAvailable}</h3>
                  <div className="mt-2 flex items-center gap-3 flex-wrap">
                    <Status status={vendor.status?.toLowerCase() || 'pending'} />
                    <span className="text-sm">{vendor.email || notAvailable}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-white/90">
                    <span className="font-semibold">{averageRating}</span>
                    <Star className="size-4 fill-current text-yellow-300" />
                    <span>
                      ({totalReviews} {tVendorDetail('reviewsLabel', { count: totalReviews })})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg w-fit">
                <Calendar className="size-4" />
                <span className="text-sm font-medium">{formattedCreatedDate}</span>
              </div>
            </div>
          </div>

          <section className="rounded-xl border bg-white p-5 space-y-4">
            <h3 className="text-lg font-semibold">{tVendorSections('vendorInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground mb-1">{tVendorDetailFields('email')}</p>
                <p className="font-medium break-all">{vendor.email || notAvailable}</p>
              </div>
              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground mb-1">{tVendorDetailFields('phoneNumber')}</p>
                <p className="font-medium">{vendor.phone || notAvailable}</p>
              </div>
              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground mb-1">{tVendorDetailFields('createdDate')}</p>
                <p className="font-medium">{formattedCreatedDate}</p>
              </div>
              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground mb-1">{tVendorDetailFields('city')}</p>
                <p className="font-medium">{vendor.city || notAvailable}</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-5 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              {tVendorSections('kycDocuments')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DocumentPreviewCard
                title={tVendorDocuments('businessLicenseFront')}
                imageUrl={vendor.business_license_front}
                emptyLabel={tVendorDocuments('businessLicenseFront')}
              />
              <DocumentPreviewCard
                title={tVendorDocuments('businessLicenseBack')}
                imageUrl={vendor.business_license_back}
                emptyLabel={tVendorDocuments('businessLicenseBack')}
              />
              <DocumentPreviewCard
                title={tVendorDocuments('nationalIdFront')}
                imageUrl={vendor.national_id_front}
                emptyLabel={tVendorDocuments('nationalIdFront')}
              />
              <DocumentPreviewCard
                title={tVendorDocuments('nationalIdBack')}
                imageUrl={vendor.national_id_back}
                emptyLabel={tVendorDocuments('nationalIdBack')}
              />
            </div>
          </section>
        </div>
      )}
    </AppDialog>
  );
}
