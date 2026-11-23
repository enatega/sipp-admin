'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import type { ApiErrorResponse } from '@/types';
import { usePendingInvitations, useResendInvitation } from '@/hooks/api/super-admin/general/role-and-permissions';
import { handleApiError } from '@/lib/toast-error';
import { AppButton } from '@/components/shared/AppButton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function PendingInvitations() {
  const t = useTranslations('roleAndPermissions.pendingInvitations');
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = usePendingInvitations();
  const { mutateAsync: resend } = useResendInvitation();
  const [resendingId, setResendingId] = useState<string | null>(null);

  const handleResend = async (id: string) => {
    setResendingId(id);
    try {
      const result = await resend(id);
      if (result.emailSent === false) toast.error(result.message);
      else toast.success(result.message || t('resendSuccess'));
      await queryClient.invalidateQueries({ queryKey: ['get-pending-invitations'] });
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    } finally {
      setResendingId(null);
    }
  };

  return (
    <section aria-labelledby="pending-invitations-title" className="space-y-3">
      <div>
        <h2 id="pending-invitations-title" className="text-lg font-semibold">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[650px]">
          <TableHeader className="bg-accent">
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('role')}</TableHead>
              <TableHead>{t('expires')}</TableHead>
              <TableHead>{t('action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5}>{t('loading')}</TableCell></TableRow>
            ) : isError ? (
              <TableRow><TableCell colSpan={5}>
                {t('loadError')}{' '}
                <button type="button" onClick={() => refetch()} className="text-primary underline underline-offset-2">{t('retry')}</button>
              </TableCell></TableRow>
            ) : !data?.invitations.length ? (
              <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">{t('empty')}</TableCell></TableRow>
            ) : data.invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell className="font-medium max-w-48 break-words">{invitation.name}</TableCell>
                <TableCell className="max-w-64 break-all">{invitation.email}</TableCell>
                <TableCell>{invitation.role_name || t('noRole')}</TableCell>
                <TableCell>{invitation.invitation_expires_at ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(invitation.invitation_expires_at)) : '—'}</TableCell>
                <TableCell>
                  <AppButton type="button" size="sm" variant="secondary" isLoading={resendingId === invitation.id} disabled={resendingId !== null} onClick={() => handleResend(invitation.id)}>
                    {t('resend')}
                  </AppButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
