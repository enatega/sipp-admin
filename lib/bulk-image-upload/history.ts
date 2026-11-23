/**
 * Browser-only history of uploaded image URLs for the bulk image upload page.
 * Records are kept for three calendar days (today, yesterday, two days ago)
 * and anything older is removed whenever the history is read.
 */

export const BULK_IMAGE_HISTORY_DAYS = 3;
const HISTORY_STORAGE_KEY = 'sipp.bulk-image-upload.history.v1';
const ACCESS_KEY_STORAGE_KEY = 'sipp.bulk-image-upload.access-key';
export const HISTORY_CHANGE_EVENT = 'sipp-bulk-image-history-change';

export interface BulkImageRecord {
  id: string;
  fileName: string;
  url: string;
  size: number;
  uploadedAt: string; // ISO timestamp
}

/** Local calendar day, e.g. "2026-11-05". */
export const toDayKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** Day keys for the visible tabs, newest first. */
export const getRetainedDayKeys = (now = new Date()): string[] =>
  Array.from({ length: BULK_IMAGE_HISTORY_DAYS }, (_, offset) => {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    return toDayKey(day);
  });

const isRecord = (value: unknown): value is BulkImageRecord => {
  const r = value as BulkImageRecord;
  return (
    !!r &&
    typeof r.id === 'string' &&
    typeof r.fileName === 'string' &&
    typeof r.url === 'string' &&
    typeof r.uploadedAt === 'string' &&
    !Number.isNaN(Date.parse(r.uploadedAt))
  );
};

const readRawString = (): string | null => {
  try {
    return window.localStorage.getItem(HISTORY_STORAGE_KEY);
  } catch {
    return null;
  }
};

const parseRecords = (raw: string | null): BulkImageRecord[] => {
  try {
    const parsed = JSON.parse(raw ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isRecord) : [];
  } catch {
    return [];
  }
};

const readRaw = (): BulkImageRecord[] => parseRecords(readRawString());

const withinRetention = (records: BulkImageRecord[], now: Date) => {
  const retained = new Set(getRetainedDayKeys(now));
  return records.filter((r) => retained.has(toDayKey(new Date(r.uploadedAt))));
};

/** Side-effect free read, for rendering. */
export const readHistorySnapshot = (now = new Date()) => {
  const raw = readRawString();
  return { raw, records: withinRetention(parseRecords(raw), now) };
};

/** Deletes expired records from storage. */
export const pruneHistory = (now = new Date()): void => {
  const all = readRaw();
  const kept = withinRetention(all, now);
  if (kept.length !== all.length) writeRaw(kept);
};

const writeRaw = (records: BulkImageRecord[]): boolean => {
  try {
    if (records.length) {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(records));
    } else {
      window.localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
    window.dispatchEvent(new Event(HISTORY_CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
};

/** Reads the history and drops records older than the retention window. */
export const readHistory = (now = new Date()): BulkImageRecord[] => {
  if (typeof window === 'undefined') return [];
  const all = readRaw();
  const kept = withinRetention(all, now);
  if (kept.length !== all.length) writeRaw(kept);
  return kept;
};

export const addToHistory = (record: BulkImageRecord): boolean =>
  writeRaw([record, ...readHistory()]);

export const removeFromHistory = (id: string): boolean =>
  writeRaw(readHistory().filter((r) => r.id !== id));

export const clearHistoryDay = (dayKey: string): boolean =>
  writeRaw(readHistory().filter((r) => toDayKey(new Date(r.uploadedAt)) !== dayKey));

export const clearAllHistory = (): boolean => writeRaw([]);

export const getStoredAccessKey = (): string | null => {
  try {
    return window.localStorage.getItem(ACCESS_KEY_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setStoredAccessKey = (key: string | null): void => {
  try {
    if (key) window.localStorage.setItem(ACCESS_KEY_STORAGE_KEY, key);
    else window.localStorage.removeItem(ACCESS_KEY_STORAGE_KEY);
  } catch {
    // Storage blocked (private mode): the key just won't be remembered.
  }
};
