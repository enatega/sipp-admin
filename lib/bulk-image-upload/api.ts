import axios, { AxiosError } from 'axios';

/**
 * The bulk image upload page is public, so it uses its own client: no admin
 * token is attached and an error never triggers the admin logout redirect.
 */
const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL as string,
  timeout: 60_000,
});

const BASE = '/apps/deliveries/bulk-image-upload';
const KEY_HEADER = 'x-bulk-upload-key';

export const BULK_IMAGE_MAX_FILES = 50;
export const BULK_IMAGE_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const BULK_IMAGE_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
export const BULK_IMAGE_ACCEPT_ATTR = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';
export const BULK_IMAGE_UPLOAD_CONCURRENCY = 4;

export interface BulkImageUploadResponse {
  file_name: string;
  url: string;
  size: number;
}

export type BulkImageApiErrorKind = 'invalid_key' | 'rate_limited' | 'too_large' | 'network' | 'other';

export class BulkImageApiError extends Error {
  constructor(
    public readonly kind: BulkImageApiErrorKind,
    message: string,
  ) {
    super(message);
  }
}

const toApiError = (error: unknown): BulkImageApiError => {
  const err = error as AxiosError<{ message?: string | string[] }>;
  const status = err.response?.status;
  const raw = err.response?.data?.message;
  const message = Array.isArray(raw) ? raw.join(', ') : raw || err.message;

  if (status === 401) return new BulkImageApiError('invalid_key', message);
  if (status === 429) return new BulkImageApiError('rate_limited', message);
  if (status === 413) return new BulkImageApiError('too_large', message);
  if (!err.response) return new BulkImageApiError('network', message);
  return new BulkImageApiError('other', message);
};

export const verifyBulkImageAccessKey = async (accessKey: string): Promise<void> => {
  try {
    await client.post(`${BASE}/verify-key`, null, { headers: { [KEY_HEADER]: accessKey } });
  } catch (error) {
    throw toApiError(error);
  }
};

export const uploadBulkImage = async (
  file: File,
  accessKey: string,
  onProgress?: (fraction: number) => void,
): Promise<BulkImageUploadResponse> => {
  const body = new FormData();
  body.append('image', file);
  try {
    const { data } = await client.post<BulkImageUploadResponse>(`${BASE}/upload`, body, {
      headers: { [KEY_HEADER]: accessKey },
      onUploadProgress: (event) => {
        if (onProgress && event.total) onProgress(event.loaded / event.total);
      },
    });
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};
