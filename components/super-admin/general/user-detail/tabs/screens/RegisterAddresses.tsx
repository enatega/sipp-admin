'use client';

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
      OFFICE: t('office'),
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
            <div className="flex items-start gap-4 flex-1">
              <div className="mt-1 bg-gray-200 rounded-full w-5 h-5 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
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
            <div className="flex items-start gap-4 flex-1">
              {/* Icon */}
              <div className="mt-1">{getIcon(address.type)}</div>

              {/* Address Details */}
              <div className="flex-1">
                <h4 className="text-base capitalize font-semibold text-black mb-1">
                  {getTypeLabel(address.type)}
                </h4>
                <p className="text-sm text-mute">{address.address}</p>
              </div>

              {/* Timestamp */}
              <div className="text-sm text-mute whitespace-nowrap">
                {moment(address.createdAt).format('DD MMM YYYY, hh:mm A')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
