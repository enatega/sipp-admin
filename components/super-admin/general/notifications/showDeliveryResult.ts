import toast from 'react-hot-toast';
import { SendNotificationResponse } from '@/types';

type Translate = (key: string, values?: Record<string, string | number>) => string;

/**
 * Shows exactly one toast describing what happened to a send or resend:
 * all delivered, partially delivered, all failed, or nobody to deliver to.
 * A queued resend has no counts yet, so it only confirms the job started.
 */
export function showDeliveryResult(
  t: Translate,
  response: Partial<SendNotificationResponse> | undefined,
  successKey: 'sendSuccess' | 'resendSuccess',
) {
  const sent = Number(response?.sentCount);
  const failed = Number(response?.failedCount);

  if (!Number.isFinite(sent) || !Number.isFinite(failed)) {
    toast.success(t('resendQueued'));
    return;
  }

  const total = sent + failed;
  if (total === 0) {
    if (response?.success === false) toast.error(t('sendError'));
    else toast(t('sendNoRecipients'), { icon: 'ℹ️' });
    return;
  }
  if (failed === 0) {
    toast.success(t(successKey, { count: sent }));
    return;
  }
  if (sent === 0) {
    toast.error(t('sendAllFailed', { count: failed }));
    return;
  }
  toast(t('sendPartial', { sent, failed, total }), { icon: '⚠️', duration: 6000 });
}
