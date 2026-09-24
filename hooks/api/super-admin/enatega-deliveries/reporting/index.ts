'use client';

import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import type { ApiErrorResponse } from '@/types';
import type {
  AdminReportKey,
  AdminReportQuery,
  AdminReportRow,
  AdminReportResponse,
  SalesReportSummaryResponse,
  TaxCommissionReportKey,
  TaxCommissionReportSummaryResponse,
} from '@/types/api/super-admin/enatega-deliveries/reporting/reporting.api';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

const REPORTS_BASE = '/apps/deliveries/admin/reports';

export function useAdminReportQueryParams(): AdminReportQuery {
  const { getParam } = useQueryParams();
  const paymentMethod = getParam('paymentMethod');

  return {
    dateFrom: getParam('dateFrom') || undefined,
    dateTo: getParam('dateTo') || undefined,
    zoneId: getParam('zoneId') || undefined,
    storeId: getParam('storeId') || undefined,
    paymentMethod:
      paymentMethod === 'cash' ||
      paymentMethod === 'card' ||
      paymentMethod === 'wallet'
        ? paymentMethod
        : undefined,
    orderStatus: getParam('orderStatus') || undefined,
    search: getParam('search') || undefined,
    page: Number(getParam('page')) || 1,
    limit: Number(getParam('limit')) || 10,
  };
}

export function useGetAdminReport(
  reportKey: AdminReportKey,
  options?: Omit<
    UseQueryOptions<AdminReportResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) {
  const params = useAdminReportQueryParams();

  return useQuery<AdminReportResponse, ApiErrorResponse>({
    queryKey: ['admin-report', reportKey, params],
    queryFn: async () => {
      const { data } = await Axios.get<AdminReportResponse>(
        `${REPORTS_BASE}/${reportKey}`,
        { params },
      );
      return data;
    },
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[1] === reportKey ? previous : undefined,
    ...options,
  });
}

export function useGetSalesReportSummary(
  options?: Omit<
    UseQueryOptions<SalesReportSummaryResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) {
  const params = useAdminReportQueryParams();
  const summaryParams = { ...params };
  delete summaryParams.page;
  delete summaryParams.limit;

  return useQuery<SalesReportSummaryResponse, ApiErrorResponse>({
    queryKey: ['admin-report', 'sales/summary', summaryParams],
    queryFn: async () => {
      const { data } = await Axios.get<SalesReportSummaryResponse>(
        `${REPORTS_BASE}/sales/summary`,
        { params: summaryParams },
      );
      return data;
    },
    ...options,
  });
}

export function useGetTaxCommissionReportSummary(
  reportKey: TaxCommissionReportKey,
  options?: Omit<
    UseQueryOptions<TaxCommissionReportSummaryResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) {
  const params = useAdminReportQueryParams();
  const summaryParams = { ...params };
  delete summaryParams.page;
  delete summaryParams.limit;

  return useQuery<TaxCommissionReportSummaryResponse, ApiErrorResponse>({
    queryKey: ['admin-report', reportKey, 'summary', summaryParams],
    queryFn: async () => {
      const { data } = await Axios.get<TaxCommissionReportSummaryResponse>(
        `${REPORTS_BASE}/${reportKey}/summary`,
        { params: summaryParams },
      );
      return data;
    },
    ...options,
  });
}

export async function fetchAdminReportRows(
  reportKey: AdminReportKey,
  params: AdminReportQuery,
): Promise<AdminReportRow[]> {
  const rows: AdminReportRow[] = [];
  const limit = 100;

  for (let page = 1; ; page += 1) {
    const { data } = await Axios.get<AdminReportResponse>(
      `${REPORTS_BASE}/${reportKey}`,
      { params: { ...params, page, limit } },
    );
    rows.push(...data.data);
    if (rows.length >= data.total || page >= data.totalPages || !data.data.length)
      break;
  }

  return rows;
}
