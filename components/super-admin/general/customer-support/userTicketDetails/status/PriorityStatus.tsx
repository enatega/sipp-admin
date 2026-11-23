'use client';

import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { useUpdateSupportTicketPriority } from '@/hooks/api/super-admin/general/customerSupport';
import type { Priority } from '@/types/entities/super-admin/general/customer-support';
import { Loader2 } from 'lucide-react';

export default function PriorityStatus({ chatBoxId, priority }: { chatBoxId: string; priority: Priority }) {
  const t = useTranslations('customerSupport.details.priorityStatus');
  const update = useUpdateSupportTicketPriority();

  return (
    <label className="inline-flex items-center gap-2 text-sm" aria-busy={update.isPending}>
      <span>{t('label')}</span>
      <select
        aria-label={t('label')}
        className="rounded border bg-white px-2 py-1 text-sm"
        value={priority}
        disabled={update.isPending}
        onChange={(event) => update.mutate(
          { chatBoxId, priority: event.target.value as Priority },
          { onSuccess: () => toast.success(t('saved')), onError: handleApiError },
        )}
      >
        <option value="low">{t('low')}</option>
        <option value="medium">{t('medium')}</option>
        <option value="high">{t('high')}</option>
        <option value="urgent">{t('critical')}</option>
      </select>
      {update.isPending ? <span role="status"><Loader2 className="size-4 animate-spin" aria-hidden /><span className="sr-only">{t('saving')}</span></span> : null}
    </label>
  );
}
