'use client';

import type { ApiErrorResponse } from '@/types';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import {
  useAdminDeliveryLanguages,
  useUpdateDeliveryLanguageStatus,
} from '@/hooks/api/deliveries/languages';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

export function LanguageSettings() {
  const t = useTranslations('settings.languages');
  const {
    data: languages,
    isLoading,
    isError,
    refetch,
  } = useAdminDeliveryLanguages();
  const updateStatus = useUpdateDeliveryLanguageStatus();

  if (isLoading) {
    return (
      <div className="space-y-3" aria-label={t('loading')}>
        {[1, 2, 3, 4, 5].map((item) => (
          <Skeleton key={item} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <section className="rounded-xl border bg-white p-5">
        <h3 className="text-base font-semibold text-foreground">
          {t('loadErrorTitle')}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('loadErrorDescription')}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {t('retry')}
        </button>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border bg-white">
      <div className="border-b px-5 py-4">
        <h3 className="text-lg font-bold text-foreground">{t('title')}</h3>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <div className="divide-y">
        {languages?.map((language) => {
          const isUpdating =
            updateStatus.isPending &&
            updateStatus.variables?.code === language.code;
          const isEnglish = language.code === 'en' || language.isDefault;

          return (
            <div
              key={language.code}
              className="flex min-w-0 items-center justify-between gap-4 px-5 py-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden="true"
                  className="inline-flex h-7 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-semibold uppercase text-muted-foreground"
                >
                  {language.countryCode}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">
                      {language.name}
                    </p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium uppercase text-muted-foreground">
                      {language.code}
                    </span>
                    {isEnglish && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {t('defaultBadge')}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isEnglish ? t('englishHelper') : t('languageHelper')}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {language.isActive ? t('enabled') : t('disabled')}
                </span>
                <Switch
                  checked={Boolean(language.isActive)}
                  disabled={isEnglish || isUpdating}
                  aria-label={t('toggleLabel', { language: language.name })}
                  onCheckedChange={async (isActive) => {
                    try {
                      await updateStatus.mutateAsync({
                        code: language.code,
                        isActive,
                      });
                      toast.success(
                        isActive ? t('enabledToast') : t('disabledToast'),
                      );
                    } catch (error) {
                      handleApiError(error as ApiErrorResponse);
                    }
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
