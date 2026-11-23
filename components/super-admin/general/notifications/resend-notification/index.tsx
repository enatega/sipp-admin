'use client';

import { ApiErrorResponse, GetNotification } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import { handleApiError } from '@/lib/toast-error';
import { useResendNotification } from '@/hooks/api/super-admin/general/notifications';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';
import { reverseUserTypeMapping } from '../table/Filters';
import { useTranslations } from 'next-intl';
import { showDeliveryResult } from '../showDeliveryResult';

interface ResendNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notification: GetNotification;
}

export default function ResendNotificationDrawer({
  isOpen,
  onClose,
  notification,
}: ResendNotificationDrawerProps) {
  const queryClient = useQueryClient();
  const t = useTranslations('notifications');
  const tDrawer = useTranslations('notifications.resendDrawer');
  const { mutateAsync: resendNotification, isPending } =
    useResendNotification();

  const handleResend = async () => {
    try {
      const response = await resendNotification(notification.id);

      showDeliveryResult(t, response, 'resendSuccess');

      queryClient.invalidateQueries({ queryKey: ['get-notifications'] });
      onClose();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl h-full overflow-y-auto p-4">
        <SheetHeader className="mb-5 !p-0">
          <SheetTitle>
            <Heading title={t('resend')} />
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('form.title')}
              </label>
              <p className="text-base font-semibold mt-1">
                {notification.title}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('form.description')}
              </label>
              <p className="text-sm mt-1">{notification.description}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {tDrawer('recipients')}
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {(notification.type ?? []).map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-ink"
                  >
                    {reverseUserTypeMapping[type]}
                  </span>
                ))}
              </div>
            </div>

            {!!notification.metadata?.targetUserIds?.length && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {tDrawer('people')}
                </label>
                <p className="text-sm mt-1">
                  {tDrawer('peopleCount', {
                    count: notification.metadata.targetUserIds.length,
                  })}
                </p>
              </div>
            )}

            {notification.zoneNames && notification.zoneNames.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {tDrawer('targetZones')}
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {notification.zoneNames.map((zone) => (
                    <span
                      key={zone}
                      className="capitalize inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-ink"
                    >
                      {zone}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {notification.image_url && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {tDrawer('imageUrl')}
                </label>
                <p className="text-sm mt-1 truncate">
                  {notification.image_url}
                </p>
              </div>
            )}

            {notification.deep_link && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {tDrawer('deepLink')}
                </label>
                <p className="text-sm mt-1 truncate">
                  {notification.deep_link}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {tDrawer('originallySent')}
              </label>
              <p className="text-sm mt-1">
                {moment(notification.created_at).format('DD MMM YYYY, hh:mm A')}
              </p>
            </div>
          </div>

          <div className="bg-primary-soft border border-primary-pressed/40 rounded-lg p-4">
            <p className="text-sm text-ink">
              <strong>{tDrawer('note').split(':')[0]}:</strong> {tDrawer('note').split(':')[1]}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <AppButton
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isPending}
              className="flex-1"
            >
              {t('form.cancel')}
            </AppButton>
            <AppButton
              onClick={handleResend}
              isLoading={isPending}
              className="flex-1"
            >
              {t('resend')}
            </AppButton>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
