'use client';

import { useState, useSyncExternalStore, type FormEvent } from 'react';
import { KeyRound, Power, RefreshCw } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import { AppButton } from '@/components/shared/AppButton';
import CopyButton from '@/components/shared/CopyButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useGetBulkImageAccessKeyStatus,
  useRemoveBulkImageAccessKey,
  useSetBulkImageAccessKey,
} from '@/hooks/api/super-admin/enatega-deliveries/bulk-image-upload';
import { handleApiError } from '@/lib/toast-error';

const MIN_LENGTH = 16;
const MAX_LENGTH = 128;
const KEY_PATTERN = /^[A-Za-z0-9_-]+$/;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

const PAGE_PATH = '/bulk-image-upload';
const noopSubscribe = () => () => {};

const generateKey = (length = 24) => {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (n) => ALPHABET[n % ALPHABET.length]).join('');
};

export function BulkImageAccessKeySection() {
  const t = useTranslations('settings.configuration.bulkImageAccess');
  const locale = useLocale();
  const { data: status, isLoading } = useGetBulkImageAccessKeyStatus();
  const { mutateAsync: saveKey, isPending: isSaving } = useSetBulkImageAccessKey();
  const { mutateAsync: removeKey, isPending: isRemoving } = useRemoveBulkImageAccessKey();

  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const pageUrl = useSyncExternalStore(
    noopSubscribe,
    () => `${window.location.origin}${PAGE_PATH}`,
    () => PAGE_PATH,
  );

  const validate = (key: string) => {
    if (!key) return t('validation.required');
    if (key.length < MIN_LENGTH) return t('validation.min', { min: MIN_LENGTH });
    if (key.length > MAX_LENGTH) return t('validation.max', { max: MAX_LENGTH });
    if (!KEY_PATTERN.test(key)) return t('validation.pattern');
    return null;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const key = value.trim();
    const problem = validate(key);
    setError(problem);
    if (problem) return;
    try {
      await saveKey(key);
      setSavedKey(key);
      setValue('');
      toast.success(t('toasts.saved'));
    } catch (err) {
      handleApiError(err as Parameters<typeof handleApiError>[0]);
    }
  };

  const handleRemove = async () => {
    try {
      await removeKey();
      setSavedKey(null);
      toast.success(t('toasts.removed'));
    } catch (err) {
      handleApiError(err as Parameters<typeof handleApiError>[0]);
    } finally {
      setConfirmRemove(false);
    }
  };

  const updatedAt = status?.updated_at
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(status.updated_at),
      )
    : null;

  return (
    <div className="mt-8">
      <h3 className="mb-2 text-lg font-bold text-foreground">{t('sectionTitle')}</h3>
      <section className="space-y-5 rounded-xl border bg-white p-4">
        <p className="text-sm text-mute">{t('description')}</p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-slate-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-mute">
              {t('status.label')}
            </p>
            {isLoading ? (
              <div className="mt-2 h-5 w-40 animate-pulse rounded bg-muted" />
            ) : status?.configured ? (
              <>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span className="h-2 w-2 rounded-full bg-help-green" aria-hidden />
                  {t('status.active', { hint: status.hint ?? '' })}
                </p>
                {updatedAt && (
                  <p className="mt-0.5 text-xs text-mute">{t('status.updated', { date: updatedAt })}</p>
                )}
              </>
            ) : (
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="h-2 w-2 rounded-full bg-help-red" aria-hidden />
                {t('status.off')}
              </p>
            )}
          </div>

          <div className="rounded-lg border bg-slate-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-mute">{t('pageLink')}</p>
            <div className="mt-1 flex items-center gap-1">
              <a
                href={pageUrl}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex-1 truncate font-mono text-sm text-primary hover:underline"
              >
                {pageUrl}
              </a>
              <CopyButton text={pageUrl} />
            </div>
          </div>
        </div>

        {savedKey && (
          <div className="rounded-lg border border-help-green/40 bg-help-green/10 p-3">
            <p className="text-sm font-semibold text-foreground">{t('savedNotice.title')}</p>
            <p className="mt-0.5 text-xs text-mute">{t('savedNotice.description')}</p>
            <div className="mt-2 flex items-center gap-1 rounded-md border bg-white px-3 py-1.5">
              <code className="min-w-0 flex-1 truncate text-sm">{savedKey}</code>
              <CopyButton text={savedKey} />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-2">
          <Label htmlFor="bulk-image-access-key">
            {status?.configured ? t('fields.changeLabel') : t('fields.setLabel')}
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="bulk-image-access-key"
              value={value}
              autoComplete="off"
              spellCheck={false}
              className="font-mono"
              placeholder={t('fields.placeholder')}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(null);
              }}
              aria-invalid={Boolean(error)}
            />
            <AppButton
              type="button"
              variant="secondary"
              leftIcon={<RefreshCw size={14} />}
              onClick={() => {
                setValue(generateKey());
                setError(null);
              }}
            >
              {t('generate')}
            </AppButton>
          </div>
          {error ? (
            <p role="alert" className="text-sm text-help-red">
              {error}
            </p>
          ) : (
            <p className="text-xs text-mute">{t('fields.helper', { min: MIN_LENGTH })}</p>
          )}
          {status?.configured && (
            <p className="text-xs text-mute">{t('fields.changeWarning')}</p>
          )}

          <div className="flex flex-wrap justify-end gap-2 pt-3">
            {status?.configured && (
              <AppButton
                type="button"
                variant="mute"
                leftIcon={<Power size={14} />}
                onClick={() => setConfirmRemove(true)}
                disabled={isRemoving || isSaving}
              >
                {t('remove')}
              </AppButton>
            )}
            <AppButton
              type="submit"
              className="px-8"
              leftIcon={<KeyRound size={14} />}
              isLoading={isSaving}
              disabled={isSaving || !value.trim()}
            >
              {t('save')}
            </AppButton>
          </div>
        </form>
      </section>

      <AppAlertDialog
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        variant="delete"
        title={t('removeConfirm.title')}
        subTitle={t('removeConfirm.subtitle')}
        confirmLabel={t('removeConfirm.confirm')}
        cancelLabel={t('removeConfirm.cancel')}
        loading={isRemoving}
        onConfirm={handleRemove}
        onCancel={() => setConfirmRemove(false)}
      />
    </div>
  );
}
