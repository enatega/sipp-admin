'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { AppButton } from '@/components/shared/AppButton';
import AppLoader from '@/components/shared/AppLoader';
import { Heading } from '@/components/shared/Heading';
import { useBulkImageHistory } from '@/hooks/bulk-image-upload/use-bulk-image-history';
import {
  createId,
  useBulkImageUploader,
  type UploadItem,
} from '@/hooks/bulk-image-upload/use-bulk-image-uploader';
import {
  BULK_IMAGE_ACCEPTED_TYPES,
  BULK_IMAGE_MAX_FILES,
  BULK_IMAGE_MAX_FILE_SIZE,
  BulkImageApiError,
  verifyBulkImageAccessKey,
  type BulkImageUploadResponse,
} from '@/lib/bulk-image-upload/api';
import {
  addToHistory,
  getStoredAccessKey,
  setStoredAccessKey,
} from '@/lib/bulk-image-upload/history';
import { AccessKeyGate } from './AccessKeyGate';
import { UploadDropzone } from './UploadDropzone';
import { UploadHistory } from './UploadHistory';
import { UploadProgressPanel, type SkippedFile } from './UploadProgressPanel';

const EXTENSION_PATTERN = /\.(jpe?g|png|webp)$/i;

const isAcceptedImage = (file: File) =>
  BULK_IMAGE_ACCEPTED_TYPES.includes(file.type) ||
  (!file.type && EXTENSION_PATTERN.test(file.name));

type KeyState = 'checking' | 'missing' | 'ready';

export function BulkImageUploadPage() {
  const t = useTranslations('bulkImageUpload');
  const [accessKey, setAccessKey] = useState<string | null>(null);
  const [keyState, setKeyState] = useState<KeyState>('checking');
  const [gateNotice, setGateNotice] = useState<string | null>(null);
  const [skipped, setSkipped] = useState<SkippedFile[]>([]);
  const storageWarned = useRef(false);
  const { records, now, ready } = useBulkImageHistory();

  // Re-check a remembered key once, so a key changed by an admin is caught
  // before the user selects 50 images.
  useEffect(() => {
    let active = true;
    const stored = getStoredAccessKey();
    const check = stored ? verifyBulkImageAccessKey(stored) : Promise.reject(null);
    check
      .then(() => {
        if (!active) return;
        setAccessKey(stored);
        setKeyState('ready');
      })
      .catch((err) => {
        if (!active) return;
        if (!stored) {
          setKeyState('missing');
        } else if (err instanceof BulkImageApiError && err.kind === 'invalid_key') {
          setStoredAccessKey(null);
          setGateNotice(t('accessGate.keyChanged'));
          setKeyState('missing');
        } else {
          // Offline or rate limited: let them in; uploads will report errors.
          setAccessKey(stored);
          setKeyState('ready');
        }
      });
    return () => {
      active = false;
    };
  }, [t]);

  const lockOut = useCallback(
    (notice: string | null) => {
      setStoredAccessKey(null);
      setAccessKey(null);
      setGateNotice(notice);
      setKeyState('missing');
    },
    [],
  );

  const handleUploaded = useCallback(
    (item: UploadItem, response: BulkImageUploadResponse) => {
      const saved = addToHistory({
        id: createId(),
        fileName: item.fileName,
        url: response.url,
        size: response.size ?? item.size,
        uploadedAt: new Date().toISOString(),
      });
      if (!saved && !storageWarned.current) {
        storageWarned.current = true;
        toast.error(t('toasts.storageFull'));
      }
    },
    [t],
  );

  const handleInvalidKey = useCallback(() => {
    lockOut(t('accessGate.keyChanged'));
  }, [lockOut, t]);

  const uploader = useBulkImageUploader({
    accessKey,
    onUploaded: handleUploaded,
    onInvalidKey: handleInvalidKey,
  });

  // Notify once when a batch finishes.
  const wasRunning = useRef(false);
  useEffect(() => {
    if (wasRunning.current && !uploader.isRunning) {
      const { done, failed } = uploader.summary;
      if (failed === 0 && done > 0) toast.success(t('toasts.batchDone', { count: done }));
      else if (failed > 0) toast.error(t('toasts.batchPartial', { done, failed }));
    }
    wasRunning.current = uploader.isRunning;
  }, [uploader.isRunning, uploader.summary, t]);

  const handleFiles = (files: File[]) => {
    const accepted: File[] = [];
    const rejected: SkippedFile[] = [];
    for (const file of files) {
      if (!isAcceptedImage(file)) rejected.push({ fileName: file.name, reason: 'type' });
      else if (file.size > BULK_IMAGE_MAX_FILE_SIZE) rejected.push({ fileName: file.name, reason: 'size' });
      else if (accepted.length >= BULK_IMAGE_MAX_FILES) rejected.push({ fileName: file.name, reason: 'limit' });
      else accepted.push(file);
    }
    setSkipped(rejected);
    if (rejected.some((r) => r.reason === 'limit')) {
      toast.error(t('toasts.overLimit', { max: BULK_IMAGE_MAX_FILES }));
    }
    if (accepted.length) uploader.startBatch(accepted);
  };

  if (keyState === 'checking') {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <AppLoader />
      </div>
    );
  }

  if (keyState === 'missing' || !accessKey) {
    return (
      <AccessKeyGate
        notice={gateNotice}
        onVerified={(key) => {
          setStoredAccessKey(key);
          setAccessKey(key);
          setGateNotice(null);
          setKeyState('ready');
        }}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Heading title={t('page.title')} subTitle={t('page.subtitle')} />
        <AppButton
          variant="mute"
          size="sm"
          leftIcon={<LogOut size={14} />}
          disabled={uploader.isRunning}
          onClick={() => lockOut(null)}
        >
          {t('page.changeKey')}
        </AppButton>
      </div>

      <section className="rounded-xl border bg-white p-4 sm:p-5">
        <UploadDropzone disabled={uploader.isRunning} onFiles={handleFiles} />
      </section>

      <UploadProgressPanel
        items={uploader.items}
        skipped={skipped}
        isRunning={uploader.isRunning}
        summary={uploader.summary}
        onRetry={uploader.retry}
        onCancel={uploader.cancel}
        onDismiss={() => {
          uploader.dismiss();
          setSkipped([]);
        }}
      />

      {ready && <UploadHistory records={records} now={now} />}
    </div>
  );
}
