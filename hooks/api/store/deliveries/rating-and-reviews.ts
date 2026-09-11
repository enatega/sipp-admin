import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import {
    ApiErrorResponse,
    GetStoreRatingReviewsByStoreIdParams,
    GetStoreReviewsByStoreIdResponse,
    StoreManageReviewParams,
    StoreManageReviewPayload,
    StoreManageReviewResponse,
} from '@/types';
import {
    useMutation,
    UseMutationOptions,
    useQuery,
    useQueryClient,
    UseQueryOptions,
} from '@tanstack/react-query';

export const useStoreRatingReviewsByStoreId = (
    storeId?: string,
    options?: Omit<
        UseQueryOptions<GetStoreReviewsByStoreIdResponse, ApiErrorResponse>,
        'queryKey' | 'queryFn'
    >,
) => {
    const { getParam } = useQueryParams();

    const startDate = getParam('start_date') || undefined;
    const endDate = getParam('end_date') || undefined;
    const starRatings = getParam('star_ratings') || undefined;
    const page = Number(getParam('page')) || 1;
    const limit = Number(getParam('limit')) || 10;

    const queryParams: GetStoreRatingReviewsByStoreIdParams | null = storeId
        ? {
            store_id: storeId,
            start_date: startDate,
            end_date: endDate,
            star_ratings: starRatings,
            page,
            limit,
        }
        : null;

    return useQuery<GetStoreReviewsByStoreIdResponse, ApiErrorResponse>({
        queryKey: ['get-store-rating-reviews', storeId, startDate, endDate, starRatings, page, limit],
        queryFn: async () => {
            if (!queryParams) {
                throw new Error('store_id is required');
            }

            const query = new URLSearchParams();
            if (queryParams.start_date) query.append('start_date', queryParams.start_date);
            if (queryParams.end_date) query.append('end_date', queryParams.end_date);
            if (queryParams.star_ratings) query.append('star_ratings', queryParams.star_ratings);
            if (queryParams.page) query.append('page', String(queryParams.page));
            if (queryParams.limit) query.append('limit', String(queryParams.limit));

            const qs = query.toString();
            const apiUrl = qs
                ? `/apps/deliveries/admin/reviews/store/${queryParams.store_id}?${qs}`
                : `/apps/deliveries/admin/reviews/store/${queryParams.store_id}`;

            const response = await Axios.get<GetStoreReviewsByStoreIdResponse>(apiUrl);
            return response.data;
        },
        enabled: Boolean(storeId),
        retry: false,
        ...options,
    });
};

export const useManageStoreReview = (
    options?: Omit<
        UseMutationOptions<StoreManageReviewResponse, ApiErrorResponse, StoreManageReviewParams>,
        'mutationFn'
    >,
) => {
    const queryClient = useQueryClient();

    return useMutation<StoreManageReviewResponse, ApiErrorResponse, StoreManageReviewParams>({
        mutationFn: async (params: StoreManageReviewParams) => {
            const { review_id, action } = params;
            const payload: StoreManageReviewPayload = { review_id, action };
            const response = await Axios.patch<StoreManageReviewResponse>('/apps/deliveries/admin/reviews/manage', payload);
            return response.data as StoreManageReviewResponse;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['get-store-rating-reviews', variables.store_id], exact: false });
        },
        ...options,
    });
};
