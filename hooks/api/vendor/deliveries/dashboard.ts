import Axios from "@/config/axios";
import { useQueryParams } from "@/hooks/use-query-params";
import { ApiErrorResponse, GetVendorDashboardParams, GetVendorDashboardResponse, VendorDashboardPeriod } from "@/types";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useParams } from "next/navigation";


export const useVendorDashboard = (options?: Omit<UseQueryOptions<GetVendorDashboardResponse, ApiErrorResponse>, 'queryKey' | 'queryFn'>) => {

    const { getParam } = useQueryParams()
    const { vendorId } = useParams() as { vendorId: string }

    const rawPeriod = getParam('period') || 'all';
    const allowedPeriods: VendorDashboardPeriod[] = ['today', 'this_week', 'this_month', 'all', 'custom'];
    const period = allowedPeriods.includes(rawPeriod as VendorDashboardPeriod)
        ? (rawPeriod as VendorDashboardPeriod)
        : 'all';
    const startDate = period === 'custom' ? getParam('startDate') || undefined : undefined;
    const endDate = period === 'custom' ? getParam('endDate') || undefined : undefined;

    const params: GetVendorDashboardParams = {
        vendorId,
        period,
        startDate,
        endDate
    }

    return useQuery<GetVendorDashboardResponse, ApiErrorResponse>({
        queryKey: ['get-vendor-dashboard', vendorId, period, startDate, endDate],
        queryFn: async () => {

            const query = new URLSearchParams()
            if (params.period) query.append('period', params.period)
            if (params.startDate) query.append('startDate', params.startDate)
            if (params.endDate) query.append('endDate', params.endDate)
            const qs = query.toString()
            const apiUrl = qs
                ? `/apps/deliveries/vendor/dashboard/${vendorId}?${qs}`
                : `/apps/deliveries/vendor/dashboard/${vendorId}`
            const response = await Axios.get<GetVendorDashboardResponse>(apiUrl)
            return response.data

        },
        enabled: Boolean(vendorId),
        retry: false,
        ...options

    })

}
