import { useQueryParams } from "@/hooks/use-query-params";
import { ApiErrorResponse } from "@/types/api/common";
import { VendorEarningSummaryResponse, VendorEarningViewResponse } from "@/types/api/vendor/deliveries/earnings-report";
import { UseQueryOptions } from "@tanstack/react-query";
import { useApiQuery } from "../../use-api-query";

type GetVendorEarningSummaryOptions = Omit<
    UseQueryOptions<VendorEarningSummaryResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
>;

/**
 * Hook to fetch vendor earning summary cards
 */
export function useGetSummaryCard(
    vendorId: string,
    options?: GetVendorEarningSummaryOptions
) {
    return useApiQuery<VendorEarningSummaryResponse>(
        '/apps/deliveries/admin/vendor-earning-reports',
        options,
        {
            mapper: () => ({
                vendorId,
            }),
        }
    );
}

type GetVendorEarningViewOptions = Omit<
    UseQueryOptions<VendorEarningViewResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
>;


/**
 * Hook to fetch vendor earning report table view
 * Reads filters from URL query params
 */
export function useGetEarningView(
    vendorId: string,
    options?: GetVendorEarningViewOptions
) {
    const { getParam } = useQueryParams();

    const page = Number(getParam('page')) || 1;
    const limit = Number(getParam('limit')) || 10;
    const search = getParam('search') || undefined;
    const startDate = getParam('startDate') || undefined;
    const endDate = getParam('endDate') || undefined;
    const storeId = getParam('storeId') || undefined;
    const zoneId = getParam('zoneId') || undefined;
    const statusParam = getParam('status');
    const status =
        statusParam === 'all' || !statusParam ? undefined : statusParam;

    return useApiQuery<VendorEarningViewResponse>(
        '/apps/deliveries/admin/vendor-earning-reports/view',
        options,
        {
            mapper: () => ({
                vendorId,
                page,
                limit,
                search,
                startDate,
                endDate,
                storeId,
                zoneId,
                status,
            }),
        }
    );
}