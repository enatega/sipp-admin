'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { returnErrorMessage as getErrorMessage } from '@/lib/toast-error';
import { useVendorProfile } from '@/hooks/api/vendor/deliveries/profile';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import ProfileHeader from './header/ProfileHeader';
import ProfileDetail from './profile-detail/ProfileDetail';
import { ProfileDetailSkeleton } from './profile-detail/ProfileDetailSkeleton';

const Profile = () => {
  const tErrors = useTranslations('vendorProfile.errors');
  const { vendorId } = useParams();

  const { data, isLoading, isError, error, refetch } = useVendorProfile();

  return (
    <main>
      <section className="mb-6">
        <ProfileHeader vendorId={vendorId as string} />
      </section>
      <section>
        {isLoading ? (
          <ProfileDetailSkeleton />
        ) : isError ? (
          <DisplayError
            title={tErrors('fetchProfileTitle')}
            message={getErrorMessage(error)}
            onRetry={() => refetch()}
            className="w-full"
          />
        ) : !data ? (
          <NoDataFound />
        ) : (
          <ProfileDetail vendorProfile={data} />
        )}
      </section>
    </main>
  );
};

export default Profile;
