'use client';

import { useState, type FormEvent } from 'react';
import { KeyRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import AuthCardHeader from '@/components/auth/common/AuthCardHeader';
import { AppButton } from '@/components/shared/AppButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BulkImageApiError, verifyBulkImageAccessKey } from '@/lib/bulk-image-upload/api';

interface Props {
  notice?: string | null;
  onVerified: (key: string) => void;
}

export function AccessKeyGate({ notice, onVerified }: Props) {
  const t = useTranslations('bulkImageUpload.accessGate');
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const key = value.trim();
    if (!key) {
      setError(t('errors.required'));
      return;
    }
    setChecking(true);
    setError(null);
    try {
      await verifyBulkImageAccessKey(key);
      onVerified(key);
    } catch (err) {
      const kind = err instanceof BulkImageApiError ? err.kind : 'other';
      setError(
        kind === 'invalid_key'
          ? t('errors.invalid')
          : kind === 'rate_limited'
            ? t('errors.rateLimited')
            : kind === 'network'
              ? t('errors.network')
              : t('errors.generic'),
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[12px] border bg-white p-8 shadow-lg">
        <AuthCardHeader title={t('title')} description={t('description')} />

        {notice && (
          <p className="mt-5 rounded-lg border border-help-orange/40 bg-help-orange/10 px-3 py-2 text-sm text-foreground">
            {notice}
          </p>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="bulk-upload-access-key">{t('label')}</Label>
            <Input
              id="bulk-upload-access-key"
              type="password"
              autoComplete="off"
              autoFocus
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(null);
              }}
              placeholder={t('placeholder')}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'bulk-upload-access-key-error' : undefined}
            />
            {error && (
              <p id="bulk-upload-access-key-error" role="alert" className="text-sm text-help-red">
                {error}
              </p>
            )}
          </div>

          <AppButton
            type="submit"
            className="w-full"
            isLoading={checking}
            disabled={checking}
            leftIcon={<KeyRound size={16} />}
          >
            {t('submit')}
          </AppButton>
          <p className="text-center text-xs text-mute">{t('help')}</p>
        </form>
      </div>
    </div>
  );
}
