import Axios from '@/config/axios';

type Page<T> = { data: T[]; total?: number; page?: number; limit?: number };

/** Fetch a report with the same URL filters as its table, in bounded batches. */
export async function fetchAllReport<T>(
  endpoint: string,
  options?: {
    params?: Record<string, string | number | string[] | undefined>;
    select?: (response: unknown) => Page<T>;
    offsetPagination?: boolean;
  },
): Promise<T[]> {
  const params = new URLSearchParams(window.location.search);
  for (const [key, value] of Object.entries(options?.params ?? {})) {
    params.delete(key);
    if (Array.isArray(value))
      value.forEach((entry) => params.append(key, entry));
    else if (value !== undefined && value !== '')
      params.set(key, String(value));
  }
  const rows: T[] = [];
  let batchSize = 1000;
  let previousPageSignature: string | undefined;
  for (let page = 1; ; page += 1) {
    params.set('page', String(page));
    params.set('limit', String(batchSize));
    if (options?.offsetPagination) params.set('offset', String(rows.length));
    const separator = endpoint.includes('?') ? '&' : '?';
    let response;
    try {
      response = await Axios.get<unknown>(
        `${endpoint}${separator}${params.toString()}`,
      );
    } catch (error) {
      if (page !== 1) throw error;
      // Some endpoints cap the accepted limit; keep fetching every page.
      batchSize = 100;
      params.set('limit', String(batchSize));
      response = await Axios.get<unknown>(
        `${endpoint}${separator}${params.toString()}`,
      );
    }
    const result = options?.select
      ? options.select(response.data)
      : (response.data as Page<T>);
    if (!Array.isArray(result.data))
      throw new Error('Report response did not contain records');
    const pageSignature = JSON.stringify([
      result.data[0],
      result.data[result.data.length - 1],
    ]);
    if (
      rows.length &&
      result.data.length &&
      pageSignature === previousPageSignature
    ) {
      throw new Error(
        'The report API repeated a page; the download was stopped to avoid an incomplete report',
      );
    }
    previousPageSignature = pageSignature;
    rows.push(...result.data);
    if (
      result.data.length === 0 ||
      (result.total !== undefined && rows.length >= result.total)
    )
      break;
    if (result.total === undefined && result.data.length < batchSize) break;
  }
  return rows;
}
