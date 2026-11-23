'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BULK_IMAGE_UPLOAD_CONCURRENCY,
  BulkImageApiError,
  uploadBulkImage,
  type BulkImageApiErrorKind,
  type BulkImageUploadResponse,
} from '@/lib/bulk-image-upload/api';

export type UploadStatus = 'queued' | 'uploading' | 'done' | 'failed';
export type UploadFailure = BulkImageApiErrorKind | 'cancelled';

export interface UploadItem {
  id: string;
  fileName: string;
  size: number;
  status: UploadStatus;
  progress: number; // 0..1 while uploading
  failure?: UploadFailure;
  message?: string;
  url?: string;
}

interface Options {
  accessKey: string | null;
  onUploaded: (item: UploadItem, response: BulkImageUploadResponse) => void;
  onInvalidKey: () => void;
}

export const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/**
 * Uploads one image per request, a few at a time, so every image gets its
 * own progress and can be retried on its own.
 */
export function useBulkImageUploader({ accessKey, onUploaded, onInvalidKey }: Options) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const filesRef = useRef(new Map<string, File>());
  const queueRef = useRef<string[]>([]);
  const runningRef = useRef(false);
  const cancelledRef = useRef(false);
  const invalidKeyRef = useRef(false);
  const callbacksRef = useRef({ onUploaded, onInvalidKey, accessKey });
  useEffect(() => {
    callbacksRef.current = { onUploaded, onInvalidKey, accessKey };
  }, [onUploaded, onInvalidKey, accessKey]);

  const patch = useCallback((id: string, changes: Partial<UploadItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...changes } : it)));
  }, []);

  const failQueued = useCallback((failure: UploadFailure) => {
    const ids = new Set(queueRef.current);
    queueRef.current = [];
    setItems((prev) =>
      prev.map((it) => (ids.has(it.id) ? { ...it, status: 'failed', failure, progress: 0 } : it)),
    );
  }, []);

  const runQueue = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    cancelledRef.current = false;
    invalidKeyRef.current = false;
    setIsRunning(true);

    const worker = async () => {
      while (queueRef.current.length && !cancelledRef.current && !invalidKeyRef.current) {
        const id = queueRef.current.shift()!;
        const file = filesRef.current.get(id);
        const key = callbacksRef.current.accessKey;
        if (!file || !key) continue;

        patch(id, { status: 'uploading', progress: 0, failure: undefined, message: undefined });
        try {
          const response = await uploadBulkImage(file, key, (p) => patch(id, { progress: p }));
          const done: Partial<UploadItem> = { status: 'done', progress: 1, url: response.url };
          patch(id, done);
          filesRef.current.delete(id);
          callbacksRef.current.onUploaded(
            { id, fileName: file.name, size: file.size, ...done } as UploadItem,
            response,
          );
        } catch (error) {
          const err =
            error instanceof BulkImageApiError ? error : new BulkImageApiError('other', String(error));
          if (err.kind === 'invalid_key') invalidKeyRef.current = true;
          patch(id, { status: 'failed', progress: 0, failure: err.kind, message: err.message });
        }
      }
    };

    // Loop again if a retry was queued just as the workers were finishing.
    do {
      await Promise.all(Array.from({ length: BULK_IMAGE_UPLOAD_CONCURRENCY }, worker));
    } while (queueRef.current.length && !cancelledRef.current && !invalidKeyRef.current);

    if (invalidKeyRef.current) {
      failQueued('invalid_key');
      callbacksRef.current.onInvalidKey();
    } else if (cancelledRef.current) {
      failQueued('cancelled');
    }

    runningRef.current = false;
    setIsRunning(false);
  }, [failQueued, patch]);

  /** Starts a new batch. Finished items from the previous batch are cleared. */
  const startBatch = useCallback(
    (files: File[]) => {
      if (!files.length) return;
      const newItems: UploadItem[] = files.map((file) => {
        const id = createId();
        filesRef.current.set(id, file);
        return { id, fileName: file.name, size: file.size, status: 'queued', progress: 0 };
      });
      setItems((prev) => {
        // Keep files of items still in the list only.
        const keep = prev.filter((it) => it.status === 'queued' || it.status === 'uploading');
        const dropped = prev.filter((it) => !keep.includes(it));
        dropped.forEach((it) => filesRef.current.delete(it.id));
        return [...keep, ...newItems];
      });
      queueRef.current.push(...newItems.map((it) => it.id));
      void runQueue();
    },
    [runQueue],
  );

  const retry = useCallback(
    (ids: string[]) => {
      const retryable = ids.filter((id) => filesRef.current.has(id));
      if (!retryable.length) return;
      setItems((prev) =>
        prev.map((it) =>
          retryable.includes(it.id)
            ? { ...it, status: 'queued', progress: 0, failure: undefined, message: undefined }
            : it,
        ),
      );
      queueRef.current.push(...retryable);
      void runQueue();
    },
    [runQueue],
  );

  const cancel = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  const dismiss = useCallback(() => {
    if (runningRef.current) return;
    filesRef.current.clear();
    setItems([]);
  }, []);

  const summary = useMemo(() => {
    const total = items.length;
    let done = 0;
    let failed = 0;
    let inFlight = 0;
    for (const it of items) {
      if (it.status === 'done') done++;
      else if (it.status === 'failed') failed++;
      else if (it.status === 'uploading') inFlight += it.progress;
    }
    const finished = done + failed;
    return {
      total,
      done,
      failed,
      remaining: total - finished,
      percent: total ? Math.min(100, Math.round(((finished + inFlight) / total) * 100)) : 0,
    };
  }, [items]);

  // Warn before leaving while images are still uploading.
  useEffect(() => {
    if (!isRunning) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isRunning]);

  return { items, isRunning, summary, startBatch, retry, cancel, dismiss };
}
