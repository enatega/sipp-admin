'use client';
import { AddressDetailsView } from '@/components/shared/AddressDetailsView';
import { ExpandableText } from '@/components/shared/ExpandableText';

import { ApiErrorResponse, UserAddressItem } from '@/types';
import { Building2, Home, MapPin } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { returnErrorMessage } from '@/lib/toast-error';
import { useGetUserAddresses } from '@/hooks/api/super-admin/general/users';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';

interface AddressesProps {
  userId: string;
}

export function RegisterAddresses({ userId }: AddressesProps) {
  const t = useTranslations('userDetail.addresses');
  const tDetails = useTranslations('addressDetails');
  const { data, isLoading, isError, error } = useGetUserAddresses(userId);

  const getIcon = (type: string) => {
    if (type === 'OFFICE' || type === 'WORK') {
      return <Building2 className="w-5 h-5 text-mute" />;
    }
    if (type === 'HOME') {
      return <Home className="w-5 h-5 text-mute" />;
    }
    return <MapPin className="w-5 h-5 text-mute" />;
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      HOME: t('home'),
      OFFICE: t('work'),
      WORK: t('work'),
    };
    return typeMap[type] || t('other');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm border p-4 flex items-start justify-between"
          >
            <div className="grid min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-2">
              <div className="mt-1 bg-gray-200 rounded-full w-5 h-5 animate-pulse"></div>
              <div className="min-w-0">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
              <div className="col-start-2 h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <DisplayError
        title={t('fetchFailed')}
        message={
          returnErrorMessage(error as ApiErrorResponse) ||
          t('../errors.tryAgain')
        }
      />
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <NoDataFound
        title={t('noAddressesTitle')}
        subtitle={t('noAddressesSubtitle')}
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        {data.data.map((address: UserAddressItem) => (
          <div
            key={address.id}
            className="bg-white rounded-lg shadow-sm border p-4 flex items-start hover:bg-light justify-between hover:shadow-md transition-shadow"
          >
            <div className="grid min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-2">
              {/* Icon */}
              <div className="mt-1">{getIcon(address.type)}</div>

              {/* Address Details */}
              <div className="min-w-0">
                {/* Show the customer's own label; the type is secondary. */}
                <h4 className="mb-1 min-w-0">
                  <ExpandableText
                    text={address.location_name?.trim() || getTypeLabel(address.type)}
                    moreLabel={tDetails('showMore')}
                    lessLabel={tDetails('showLess')}
                    className={`text-base font-semibold text-black ${address.location_name?.trim() ? '' : 'capitalize'}`}
                  />
                </h4>
                {address.location_name?.trim() ? (
                  <span className="mb-1 inline-block rounded-full border px-2 py-0.5 text-xs font-medium text-mute capitalize">
                    {getTypeLabel(address.type)}
                  </span>
                ) : null}
                <ExpandableText
                  text={address.address}
                  moreLabel={tDetails('showMore')}
                  lessLabel={tDetails('showLess')}
                  className="text-sm leading-5 text-mute"
                />
                <AddressDetailsView details={address.addressDetails} />
              </div>

              {/* Timestamp */}
              <div className="col-start-2 text-xs text-mute">
                {moment(address.createdAt).format('DD MMM YYYY, hh:mm A')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
