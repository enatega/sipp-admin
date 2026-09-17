import Image from 'next/image';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { GetCustomerSupportTicketMessagesByIdResponse } from '@/types/api/super-admin/general/customerSupport.api';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const UserInformation = ({
  data,
  isLoading,
}: {
  data: GetCustomerSupportTicketMessagesByIdResponse | undefined;
  isLoading: boolean;
}) => {
  const t = useTranslations('customerSupport.details.userInfo');
  const { sender } = data ?? {};
  const {
    id,
    profile,
    name,
    email,
    phone,
    google_id,
    createdAt,
    active_status,
    last_login,
  } = sender ?? {};

  const registrationDate = createdAt
    ? moment(createdAt).format('DD MMM YYYY, hh:mm A')
    : 'N/A';
  const lastLoginDate = last_login
    ? moment(last_login).format('DD MMM YYYY, hh:mm A')
    : 'N/A';

  if (isLoading) {
    return (
      <Card className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48 mt-2" />
              </div>
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6 text-sm">
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div>
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-48 w-full rounded-md" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Image
              src={profile || '/avatar.jpg'}
              alt="User Avatar"
              width={56}
              height={56}
              className="h-14 w-14 rounded-full"
            />
            <div>
              <h3 className="text-lg font-medium text-black">
                {name || 'N/A'}
              </h3>
              <p className="text-sm text-mute">{email || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-mute">
            <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-md">
              <span className="text-orange-500">★</span>
              <span className="font-medium">
                {data?.reviews?.totalReceived}
              </span>
              <span className="text-xs text-slate-400">
                ({data?.reviews?.averageRating}{' '}
                {t('review', { count: data?.reviews?.averageRating ?? 0 })})
              </span>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6 text-sm">
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <span className="text-mute">{t('id')}</span>
              <span className="font-medium text-black">{id || 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-mute">{t('phone')}</span>
              <span className="font-medium text-black">{phone || 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-mute">{t('regMethod')}</span>
              <span className="font-medium text-black">
                {google_id === null
                  ? t('regMethodPhone')
                  : t('regMethodGoogle')}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-mute">{t('regDate')}</span>
              <span className="font-medium text-black">{registrationDate}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <span className="text-mute">{t('accountStatus')}</span>
              <span className="font-medium text-black">
                {active_status === true
                  ? t('statusActive')
                  : t('statusInactive')}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-mute">{t('lastLogin')}</span>
              <span className="font-medium text-black">{lastLoginDate}</span>
            </div>
          </div>
        </div>

        {/* Security and Audit table */}
        {/* <div>
          <h4 className="text-base font-medium text-black mb-4">
            {t('securityAudit')}
          </h4>
          <div className="overflow-x-auto bg-white rounded-md border">
            <table className="w-full text-sm table-fixed">
              <thead className="bg-slate-50 text-mute">
                <tr>
                  <th className="py-3 px-4 text-left">{t('status')}</th>
                  <th className="py-3 px-4 text-left">{t('comments')}</th>
                  <th className="py-3 px-4 text-left">{t('performedBy')}</th>
                  <th className="py-3 px-4 text-left">{t('date')}</th>
                </tr>
              </thead>
              <tbody>
                {data?.auditLogs?.data?.length ? (
                  data.auditLogs.data.map((row: AuditLog, idx: number) => (
                    <tr key={idx} className="border-t last:border-b">
                      <td className="py-4 px-4 align-top">
                        <Status status={row?.status} />
                      </td>
                      <td className="py-4 px-4 align-top text-black">
                        {row?.comment}
                      </td>
                      <td className="py-4 px-4 align-top text-black">
                        {row?.entity}
                      </td>
                      <td className="py-4 px-4 align-top text-black">
                        {moment(row.createdAt).format('DD MMM YYYY, hh:mm A')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-6 px-4" colSpan={4}>
                      <NoDataFound
                        title={t('noAudits')}
                        subtitle={t('noAuditsSubtitle')}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div> */}
      </div>
    </Card>
  );
};

export default UserInformation;
