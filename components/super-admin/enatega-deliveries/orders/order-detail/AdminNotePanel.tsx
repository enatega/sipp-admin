'use client';

import { useId, useState } from 'react';
import { Lock, NotebookPen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';
import {
  errorStatus,
  useGetOrderAdminNote,
  useUpdateOrderAdminNote,
} from '@/hooks/api/super-admin/enatega-deliveries/orders';
import { formatAdminDateTime } from '@/lib/adminDateTime';
import { handleApiError } from '@/lib/toast-error';
import { hasNamedPermission } from '@/lib/user';
import { cn } from '@/lib/utils';
import { ApiErrorResponse } from '@/types';

// Matches the server-side limit in UpdateOrderAdminNoteDto.
const MAX_LENGTH = 2000;

interface AdminNotePanelProps {
  orderId: string;
  storeTimezone?: string | null;
}

/** Internal note kept against an order. Shown to SIPP admins only. */
export function AdminNotePanel({ orderId, storeTimezone }: AdminNotePanelProps) {
  const t = useTranslations('orders.orderDetail.adminNote');
  const textareaId = useId();
  const hintId = useId();
  const canEdit = hasNamedPermission('delivery_update_super_admin_order_status');
  const noteQuery = useGetOrderAdminNote(orderId);
  const { mutateAsync: saveNote, isPending: isSaving } = useUpdateOrderAdminNote();
  const savedNote = noteQuery.data?.note ?? '';
  const [draft, setDraft] = useState(savedNote);
  const [syncedNote, setSyncedNote] = useState(savedNote);

  // Follow the server copy whenever it changes (initial load or after a save).
  if (savedNote !== syncedNote) {
    setSyncedNote(savedNote);
    setDraft(savedNote);
  }

  // Admins without note access (e.g. vendors) should not see an empty shell.
  if (noteQuery.isError && errorStatus(noteQuery.error) === 403) return null;

  const isDirty = draft.trim() !== savedNote.trim();
  const remaining = MAX_LENGTH - draft.length;
  const updatedBy = noteQuery.data?.updatedBy?.name;
  const updatedAt = noteQuery.data?.updatedAt;

  const handleSave = async () => {
    try {
      const result = await saveNote({ orderId, note: draft });
      toast.success(result.note ? t('saved') : t('cleared'));
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <section
      aria-label={t('title')}
      className="rounded-[12px] border border-sidebar-border bg-white p-6 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <NotebookPen aria-hidden="true" className="size-5" />
          </span>
          <div>
            <Heading title={t('title')} containerClassName="mb-0" />
            <p className="mt-1 text-sm text-mute">{t('subtitle')}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
          <Lock aria-hidden="true" className="size-3.5" />
          {t('adminsOnly')}
        </span>
      </div>

      {noteQuery.isLoading ? (
        <div className="mt-5 h-32 animate-pulse rounded-lg bg-accent" aria-label={t('loading')} />
      ) : noteQuery.isError ? (
        <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {t('loadFailed')}
          <AppButton variant="mute" size="sm" onClick={() => void noteQuery.refetch()}>
            {t('retry')}
          </AppButton>
        </div>
      ) : (
        <>
          <label htmlFor={textareaId} className="sr-only">
            {t('title')}
          </label>
          <textarea
            id={textareaId}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={MAX_LENGTH}
            rows={5}
            readOnly={!canEdit}
            aria-describedby={hintId}
            placeholder={canEdit ? t('placeholder') : t('emptyReadOnly')}
            className={cn(
              'mt-5 w-full resize-y rounded-lg border border-sidebar-border bg-accent/40 p-4 text-sm leading-6 text-black outline-none transition-colors placeholder:text-mute',
              'focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20',
              !canEdit && 'cursor-default focus:ring-0',
            )}
          />

          <div className="mt-3 flex flex-col gap-3">
            <p id={hintId} className="text-xs text-mute">
              {updatedAt
                ? t('lastUpdated', {
                    name: updatedBy || t('unknownAdmin'),
                    date: formatAdminDateTime(updatedAt, '', storeTimezone || undefined),
                  })
                : t('notSavedYet')}
              {canEdit ? (
                <span className={cn('ms-2 tabular-nums', remaining < 100 && 'text-amber-700')}>
                  · {t('charactersLeft', { count: remaining })}
                </span>
              ) : null}
            </p>

            {canEdit ? (
              <div className="flex items-center justify-end gap-2">
                {isDirty ? (
                  <AppButton variant="mute" size="sm" onClick={() => setDraft(savedNote)} disabled={isSaving}>
                    {t('discard')}
                  </AppButton>
                ) : null}
                <AppButton
                  variant="primary"
                  size="sm"
                  onClick={() => void handleSave()}
                  disabled={!isDirty}
                  isLoading={isSaving}
                  className="px-5"
                >
                  {t('save')}
                </AppButton>
              </div>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
