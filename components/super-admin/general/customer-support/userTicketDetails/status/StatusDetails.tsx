import moment from 'moment';
import { useTranslations } from 'next-intl';
import { GetCustomerSupportTicketMessagesByIdResponse } from '@/types/api/super-admin/general/customerSupport.api';
import StatusDropdown from './StatusDropdown';
import { useAssignSupportTicket, useSupportAdmins } from '@/hooks/api/super-admin/general/customerSupport';
import { getUser } from '@/lib/user';

const formatDateTime = (value?: string) =>
  value ? moment(value).format('DD MMM YYYY, hh:mm A') : 'N/A';

export const StatusDetails: React.FC<{
  data: GetCustomerSupportTicketMessagesByIdResponse | undefined;
  isLoading: boolean;
}> = ({ data, isLoading }) => {
  const t = useTranslations('customerSupport.details.status');
  if (isLoading || !data) {
    return null;
  }
  const admins = useSupportAdmins().data?.admins ?? [];
  const assign = useAssignSupportTicket();
  const currentUserId = getUser()?.id;

  const createdOn = data?.sender?.createdAt;
  const lastUpdated = data?.sender.updatedAt;

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
      key: 'assignedBy',
      label: t('assignedBy'),
      value: data.sender?.name ?? t('unassigned'),
    },
  ];

  return (
    <div className="w-full border rounded-md p-4 bg-gray-50">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-mute mb-1">ID: {data?.chatBoxId}</div>
          <h3 className="text-lg font-medium capitalize">
            {data.sender?.name ?? t('customerTicket')}
          </h3>
        </div>
        <div className="flex gap-2 items-center">
          <StatusDropdown id={data?.chatBoxId} status={data?.status} />
          <select className="border rounded px-2 py-1 text-sm" value={data.assignedAdminId ?? ''} onChange={(e) => assign.mutate({ chatBoxId: data.chatBoxId, assignedAdminId: e.target.value || null })} disabled={assign.isPending}>
            <option value="">Unassigned</option>
            {admins.map((admin) => <option key={admin.id} value={admin.id}>{admin.name}{admin.id === currentUserId ? ' (You)' : ''}</option>)}
          </select>
          {!data.assignedAdminId && currentUserId ? <button className="border rounded px-2 py-1 text-sm" onClick={() => assign.mutate({ chatBoxId: data.chatBoxId, assignedAdminId: currentUserId })}>Take Ticket</button> : null}
          {/* <PriorityStatus /> */}
        </div>
      </div>

      <div className="mt-3 text-xs text-mute flex flex-wrap gap-x-6 gap-y-1">
        {meta.map((m) => (
          <div key={m.key}>
            <span className="font-medium text-mute">{m.label}:&nbsp;</span>
            <span
              className={
                m.key === 'assignedBy'
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
