'use client';

import { UMUserProfile } from '@/types';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { SecurityAndAudit } from './SecurityAndAudit';

interface ProfileInfoProps {
  userId: string;
  user: UMUserProfile;
}

const InfoRow = ({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string | null | undefined;
  fullWidth?: boolean;
}) => (
  <div className={`${fullWidth ? 'col-span-2' : ''}`}>
    <dt className="text-sm font-medium text-mute mb-1">{label}</dt>
    <dd className="text-sm ">{value}</dd>
  </div>
);

export function ProfileInfo({ user, userId }: ProfileInfoProps) {
  const t = useTranslations('userDetail');
  const tUsers = useTranslations('users');

  const getRegistrationMethod = () => {
    if (user?.user?.google_id) return tUsers('registrationMethods.google');
    return tUsers('registrationMethods.manual');
  };

  const getAccountStatus = () => {
    if (user?.user?.block_status) return tUsers('statuses.blocked');
    if (!user?.user?.active_status) return tUsers('statuses.deactivated');
    return tUsers('statuses.active');
  };

  const formatDate = (dateString: string | null | undefined) => {
    return dateString
      ? moment(dateString).format('DD MMM YYYY, hh:mm A')
      : t('notAvailable');
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoRow
              label={t('profile.id')}
              value={user?.user_id || t('notAvailable')}
            />
            <InfoRow
              label={t('profile.name')}
              value={user?.user?.name || t('notAvailable')}
            />
            <InfoRow
              label={t('profile.email')}
              value={user?.user?.email || t('notAvailable')}
            />
            <InfoRow
              label={t('profile.emailVerified')}
              value={
                user?.user?.email_is_verified
                  ? t('profile.true')
                  : t('profile.false')
              }
            />
            <InfoRow
              label={t('profile.phone')}
              value={user?.user?.phone || t('notAvailable')}
            />
            <InfoRow
              label={t('profile.phoneVerified')}
              value={
                user?.user?.phone_is_verified
                  ? t('profile.true')
                  : t('profile.false')
              }
            />
            <InfoRow
              label={t('profile.registrationMethod')}
              value={getRegistrationMethod()}
            />
            <InfoRow
              label={t('profile.accountStatus')}
              value={getAccountStatus()}
            />
            <InfoRow
              label={t('profile.twoFactorEnabled')}
              value={
                user?.user?.two_factor_enabled
                  ? t('profile.true')
                  : t('profile.false')
              }
            />
            <InfoRow
              label={t('profile.dateOfRegistration')}
              value={formatDate(user.createdAt)}
            />
            <InfoRow
              label={t('profile.lastLogin')}
              value={
                user?.user?.last_login
                  ? formatDate(user?.user?.last_login)
                  : t('notAvailable')
              }
            />
            <InfoRow
              label={t('profile.internalNote')}
              value={user?.user?.internal_notes || t('notAvailable')}
              fullWidth
            />
          </dl>
        </div>
        <SecurityAndAudit userId={userId} />
      </div>
    </>
  );
}
