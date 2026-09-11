'use client';

import { AppDialog } from '@/components/shared/AppDialog';
import { useFormikContext } from 'formik';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { toast } from 'react-hot-toast';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import { AppButton } from '@/components/shared/AppButton';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { useDeletePromotionalBanner } from '@/hooks/api/super-admin/enatega-deliveries/settings';
import { handleApiError } from '@/lib/toast-error';
import {
  AppSettingsFormValues,
  PROMOTIONAL_BANNER_ACCEPT_TYPES,
  PROMOTIONAL_BANNER_MAX_FILE_SIZE_MB,
} from '@/schemas/enatega-deliveries/settings/app-settings.schema';
import { ApiErrorResponse } from '@/types/api/common';

interface PromotionalBannerSectionProps {
  appType: string;
  promotionalBannerUrl?: string | null;
}

export default function PromotionalBannerSection({
  appType,
  promotionalBannerUrl,
}: PromotionalBannerSectionProps) {
  const t = useTranslations('settings.appSettings.promotionalBanner');
  const { values, setFieldValue } = useFormikContext<AppSettingsFormValues>();
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [savedBannerUrl, setSavedBannerUrl] = React.useState(
    promotionalBannerUrl || null,
  );
  const { mutateAsync: deletePromotionalBanner, isPending: isDeleting } =
    useDeletePromotionalBanner();

  const currentValue = values.promotionalBanner;
  const hasLocalFile = currentValue instanceof File;
  const hasSavedBanner =
    typeof currentValue === 'string' && currentValue.trim().length > 0;

  React.useEffect(() => {
    setSavedBannerUrl(promotionalBannerUrl || null);
  }, [promotionalBannerUrl]);

  // Helper to check if URL is a video
  const isVideoUrl = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.quicktime'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  // Get the current media URL for preview
  const getCurrentMediaUrl = (): string | null => {
    if (hasLocalFile && currentValue instanceof File) {
      return URL.createObjectURL(currentValue);
    }
    if (hasSavedBanner && typeof currentValue === 'string') {
      return currentValue;
    }
    if (savedBannerUrl) {
      return savedBannerUrl;
    }
    return null;
  };

  const currentMediaUrl = getCurrentMediaUrl();
  const isCurrentMediaVideo = isVideoUrl(currentMediaUrl);

  const handleClearSelectedFile = () => {
    setFieldValue('promotionalBanner', savedBannerUrl);
  };

  const handleDeleteSavedBanner = async () => {
    try {
      await deletePromotionalBanner({ appType });
      setSavedBannerUrl(null);
      setFieldValue('promotionalBanner', null);
      setDeleteOpen(false);
      toast.success(t('deleteSuccess'));
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <div className="h-full rounded-lg border border-border bg-card p-6">
      <h3 className="mb-4 text-base font-semibold">{t('title')}</h3>

      <div className="space-y-4">
        <AppFileInput
          name="promotionalBanner"
          label={t('uploadLabel')}
          helperText={t('helperText')}
          previewHeight={80}
          maxSizeMB={PROMOTIONAL_BANNER_MAX_FILE_SIZE_MB}
          showClearButton={false}
          acceptTypes={[...PROMOTIONAL_BANNER_ACCEPT_TYPES]}
          invalidFileTypeMessage={t('invalidFileTypeMessage')}
          currentValueLabel={t('currentMediaLabel')}
          dropzoneText={t('dropzoneText')}
          allowedTypesLabel={t('allowedTypesLabel')}
          nonImagePreviewBadgeLabel={t('currentMediaLabel')}
          nonImagePreviewDescription={t('nonImagePreviewDescription')}
          previewUrl={promotionalBannerUrl || undefined}
        />

        {/* Preview Button - shows when there's media to preview */}
        {currentMediaUrl && (
          <AppButton
            type="button"
            variant="primary"
            onClick={() => setPreviewOpen(true)}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {isCurrentMediaVideo ? t('previewVideo') : t('previewImage')}
          </AppButton>
        )}

        {hasLocalFile && (
          <AppButton
            type="button"
            variant="mute"
            onClick={handleClearSelectedFile}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {t('clearSelectedFile')}
          </AppButton>
        )}

        {!hasLocalFile && hasSavedBanner && (
          <>
            <AppButton
              type="button"
              variant="secondary"
              onClick={() => setDeleteOpen(true)}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {t('removeButton')}
            </AppButton>

            <AppAlertDialog
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              title={t('confirmDelete.title')}
              subTitle={t('confirmDelete.subTitle')}
              description={t('confirmDelete.description')}
              confirmLabel={t('confirmDelete.confirm')}
              cancelLabel={t('confirmDelete.cancel')}
              onConfirm={handleDeleteSavedBanner}
              loading={isDeleting}
              variant="delete"
            />
          </>
        )}
      </div>

      {/* Preview Dialog */}
      <AppDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={isCurrentMediaVideo ? t('previewVideoTitle') : t('previewImageTitle')}
        size="2xl"
      >
        <div className="flex h-[60vh] items-center justify-center bg-black/5 rounded-lg">
          {currentMediaUrl && (
            isCurrentMediaVideo ? (
              <video
                src={currentMediaUrl}
                controls
                autoPlay
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={currentMediaUrl}
                alt={t('previewAlt')}
                className="max-h-full max-w-full object-contain"
              />
            )
          )}
        </div>
      </AppDialog>
    </div>
  );
}
