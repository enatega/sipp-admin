import Axios from "@/config/axios";
import { useQueryParams } from "@/hooks/use-query-params";
import { ApiErrorResponse, DeleteZoneResponse, GetZonesQueryParams, GetZonesResponse, GetZonesSimpleResponse, PostZonePayload, PostZoneResponse, PutZonePayload, Zone, ZoneBoundsResponse, ZoneType } from "@/types";
import { useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";

export const usePostZone = (
    options?: UseMutationOptions<PostZoneResponse, ApiErrorResponse, PostZonePayload>
) => {
    const queryClient = useQueryClient();
    return useMutation<PostZoneResponse, ApiErrorResponse, PostZonePayload>({
        mutationFn: async (data) => {
            const res = await Axios.post('/zones', data);
            return res.data;
        },
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ['get-paginated-zones'] });
            options?.onSuccess?.(...args);
        },
        ...options,
    });
};

export const usePutZone = (
    options?: UseMutationOptions<Zone, ApiErrorResponse, PutZonePayload>
) => {
    const queryClient = useQueryClient();
    return useMutation<Zone, ApiErrorResponse, PutZonePayload>({
        mutationFn: async (data) => {
            const res = await Axios.put(`/zones/${data.id}`, data);
            return res.data;
        },
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ['get-paginated-zones'] });
            options?.onSuccess?.(...args);
        },
        ...options,
    });
};

export const useDeleteZone = (
    options?: UseMutationOptions<DeleteZoneResponse, ApiErrorResponse, string>
) => {
    const queryClient = useQueryClient();
    return useMutation<DeleteZoneResponse, ApiErrorResponse, string>({
        mutationFn: async (id: string) => {
            const res = await Axios.delete(`/zones/${id}`);
            return res.data;
        },
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ['get-paginated-zones'] });
            options?.onSuccess?.(...args);
        },
        ...options,
    });
};

export const useGetZones = (
    options?: Omit<UseQueryOptions<GetZonesResponse, ApiErrorResponse, GetZonesResponse, readonly unknown[]>, 'queryKey' | 'queryFn'>
) => {
    const { getParam } = useQueryParams();

    const page = Number(getParam('page')) || 1;
    const limit = Number(getParam('limit')) || 10;
    const offset = (page - 1) * limit;
    const zoneType = getParam('zoneType') as ZoneType | undefined;
    const search = getParam('search') || undefined;
    const startDate = getParam('startDate') || undefined;
    const endDate = getParam('endDate') || undefined;

    const params: GetZonesQueryParams = {
        page,
        limit,
        offset,
        zoneType,
        search,
        startDate,
        endDate,
    };

    const queryKey = ['get-paginated-zones', params];
    return useQuery<GetZonesResponse, ApiErrorResponse>({
        queryKey,
        queryFn: async () => {
            const query = new URLSearchParams();
            if (params.offset !== undefined) query.append('offset', String(params.offset));
            if (params.page !== undefined) query.append('page', String(params.page));
            if (params.limit !== undefined) query.append('limit', String(params.limit));
            if (params.zoneType) query.append('zoneType', params.zoneType);
            if (params.search) query.append('search', params.search);
            if (params.startDate) query.append('startDate', params.startDate);
            if (params.endDate) query.append('endDate', params.endDate);

            const apiUrl = `/zones?${query.toString()}`;
            const res = await Axios.get<GetZonesResponse>(apiUrl);
            return res.data;
        },
        retry: false,
        ...options,
    });
};


export function useGetZonesSimple(
    options?: Omit<UseQueryOptions<GetZonesSimpleResponse, ApiErrorResponse>, 'queryKey' | 'queryFn'>,
) {
    return useQuery<GetZonesSimpleResponse, ApiErrorResponse>({
        queryKey: ['zones-all-simple'],
        queryFn: async () => {
            const { data } = await Axios.get<GetZonesSimpleResponse>('/zones/all/simple');
            return data;
        },
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: false,
        ...options,
    });
}

export function useGetZoneBounds(
    id: string,
    options?: Omit<UseQueryOptions<ZoneBoundsResponse, ApiErrorResponse>, 'queryKey' | 'queryFn'>,
) {
    return useQuery<ZoneBoundsResponse, ApiErrorResponse>({
        queryKey: ['zone-bounds', id],
        queryFn: async () => {
            const { data } = await Axios.get<ZoneBoundsResponse>(`/zones/${id}/bounds`);
            return data;
        },
        enabled: !!id,
        retry: false,
        ...options,
    });
}
