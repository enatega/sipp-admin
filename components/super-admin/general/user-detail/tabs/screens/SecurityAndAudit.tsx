'use client';

import { ApiErrorResponse } from '@/types';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { returnErrorMessage } from '@/lib/toast-error';
import { useGetUserAuditLogs } from '@/hooks/api/super-admin/general/users';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import Status from '@/components/shared/Status';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';

export function SecurityAndAudit({ userId }: { userId: string }) {
  const t = useTranslations('userDetail.security');
  const { data, isLoading, isError, error } = useGetUserAuditLogs(userId);

  return (
    <div className="bg-white  border-t mt-4 rounded-b-lg">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('title')}
        </h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-light">
              <TableRow>
                <TableHead>{t('action')}</TableHead>
                <TableHead>{t('userStatus')}</TableHead>
                <TableHead>{t('actionBy')}</TableHead>
                <TableHead>{t('date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableShimmer limit={10 as TLimitType} columns={4} />
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={4} className="p-4">
                    <DisplayError
                      title={t('fetchFailed')}
                      message={
                        returnErrorMessage(error as ApiErrorResponse) ||
                        t('../../errors.tryAgain')
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium capitalize">
                      {log.action.toLowerCase().split('_').join(' ')}
                    </TableCell>
                    <TableCell>
                      <Status
                        status={
                          log.newValue.block_status ? 'blocked' : 'active'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {log.entity}, {log.entityId}
                    </TableCell>

                    <TableCell className="text-gray-600">
                      {moment(log.createdAt).format('DD MMM YYYY, hh:mm A')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center p-4">
                    <NoDataFound
                      title={t('noLogsTitle')}
                      subtitle={t('noLogsSubtitle')}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
