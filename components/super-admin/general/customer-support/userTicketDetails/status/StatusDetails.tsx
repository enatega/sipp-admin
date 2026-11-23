import moment from 'moment';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { GetCustomerSupportTicketMessagesByIdResponse } from '@/types/api/super-admin/general/customerSupport.api';
import StatusDropdown from './StatusDropdown';
import { useAssignSupportTicket, useSupportAdmins } from '@/hooks/api/super-admin/general/customerSupport';
import { getUser } from '@/lib/user';
import { supportReference } from '@/lib/support-reference';
import PriorityStatus from './PriorityStatus';

const formatDateTime = (value?: string) =>
  value ? moment(value).format('DD MMM YYYY, hh:mm A') : 'N/A';

export const StatusDetails: React.FC<{
  data: GetCustomerSupportTicketMessagesByIdResponse | undefined;
  isLoading: boolean;
}> = ({ data, isLoading }) => {
  const t = useTranslations('customerSupport.details.status');
  const admins = useSupportAdmins().data?.admins ?? [];
  const assign = useAssignSupportTicket();
  const currentUser = getUser();
  const currentUserId = currentUser?.id;
  if (isLoading || !data) {
    return null;
  }

  // Ticket dates, not the customer's sign-up and last-login dates.
  const createdOn = data.ticketCreatedAt;
  const lastUpdated = data.ticketUpdatedAt;

  const meta = [
    {
      key: 'createdOn',
      label: t('createdOn'),
      value: formatDateTime(createdOn),
    },
    {
      key: 'lastUpdated',
      label: t('lastUpdated'),
      value: formatDateTime(lastUpdated),
    },
    {
      key: 'assignedTo',
      label: t('assignedTo'),
      value: data.assignedAdminName?.trim() || t('unassigned'),
    },
    // Only known for assignments made after the assigner was recorded.
    ...(data.assignedAdminId && data.assignedByName
      ? [
          {
            key: 'assignedBy',
            label: t('assignedBy'),
            value: data.assignedByName.trim(),
          },
        ]
      : []),
  ];

  return (
    <div className="w-full border rounded-md p-4 bg-gray-50">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-mute mb-1">{supportReference('ticket', data.ticket?.id || data.chatBoxId)}</div>
          <h3 className="text-lg font-medium capitalize">
            {data.sender?.name ?? t('customerTicket')}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <StatusDropdown id={data?.chatBoxId} status={data?.status} />
          <select className="border rounded px-2 py-1 text-sm" value={data.assignedAdminId ?? ''} onChange={(e) => {
            const assignedAdminId = e.target.value || null;
            assign.mutate({
              chatBoxId: data.chatBoxId,
              assignedAdminId,
              assignedAdminName: admins.find((admin) => admin.id === assignedAdminId)?.name ?? null,
            });
          }} disabled={assign.isPending} aria-busy={assign.isPending}>
            <option value="">Unassigned</option>
            {data.assignedAdminId && !admins.some((admin) => admin.id === data.assignedAdminId) ? (
              <option value={data.assignedAdminId}>
                {data.assignedAdminName ?? (data.assignedAdminId === currentUserId ? currentUser?.name : data.assignedAdminId)}
              </option>
            ) : null}
            {admins.map((admin) => <option key={admin.id} value={admin.id}>{admin.name}{admin.id === currentUserId ? ' (You)' : ''}</option>)}
          </select>
          {assign.isPending ? <span role="status"><Loader2 className="h-4 w-4 animate-spin" aria-hidden /><span className="sr-only">{t('assigning')}</span></span> : null}
          {!data.assignedAdminId && currentUserId ? (
            <button
              className="inline-flex min-w-[102px] items-center justify-center gap-2 rounded border px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-70"
              onClick={() =>
                assign.mutate({
                  chatBoxId: data.chatBoxId,
                  assignedAdminId: currentUserId,
                  assignedAdminName: currentUser.name,
                })
              }
              disabled={assign.isPending}
            >
              {assign.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              {assign.isPending ? 'Taking...' : 'Take Ticket'}
            </button>
          ) : null}
          {data.ticket?.priority ? <PriorityStatus chatBoxId={data.chatBoxId} priority={data.ticket.priority} /> : null}
        </div>
      </div>

      <div className="mt-3 text-xs text-mute flex flex-wrap gap-x-6 gap-y-1">
        {meta.map((m) => (
          <div key={m.key}>
            <span className="font-medium text-mute">{m.label}:&nbsp;</span>
            <span
              className={
                m.key === 'assignedTo' || m.key === 'assignedBy'
                  ? 'text-foreground font-medium'
                  : 'text-foreground'
              }
            >
              {m.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
