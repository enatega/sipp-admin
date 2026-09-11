import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import {
  ApiErrorResponse,
  GetStoreRatingReviewsParams,
  GetStoreRatingReviewsResponse,
  ManageStoreReviewParams,
  ManageStoreReviewPayload,
  ManageStoreReviewResponse,
  GetVendorRatingReviewsParams,
  GetVendorRatingReviewsResponse,
} from '@/types';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query';
import { useParams } from 'next/navigation';

export const useVendorRatingReviews = (
  options?: Omit<
    UseQueryOptions<GetVendorRatingReviewsResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) => {
  const { getParam } = useQueryParams();
  const params = useParams();
  const routeVendorId = params?.vendorId;
  const vendorId = Array.isArray(routeVendorId) ? routeVendorId[0] : routeVendorId;

  const searchStoreName = getParam('search_store_name') || undefined;
  const startDate = getParam('start_date') || undefined;
  const endDate = getParam('end_date') || undefined;
  const starRatings = getParam('star_ratings') || undefined;
  const page = Number(getParam('page')) || 1;
  const limit = Number(getParam('limit')) || 10;

  const queryParams: GetVendorRatingReviewsParams | null = vendorId
    ? {
        vendor_id: vendorId,
        search_store_name: searchStoreName,
        start_date: startDate,
        end_date: endDate,
        star_ratings: starRatings,
        page,
        limit,
      }
    : null;

  return useQuery<GetVendorRatingReviewsResponse, ApiErrorResponse>({
    queryKey: [
      'get-vendor-rating-reviews',
      vendorId,
      searchStoreName,
      startDate,
      endDate,
      starRatings,
      page,
      limit,
    ],
    queryFn: async () => {
      if (!queryParams) {
        throw new Error('vendor_id is required');
      }

      const query = new URLSearchParams();
      if (queryParams.search_store_name) {
        query.append('search_store_name', queryParams.search_store_name);
      }
      if (queryParams.start_date) query.append('start_date', queryParams.start_date);
      if (queryParams.end_date) query.append('end_date', queryParams.end_date);
      if (queryParams.star_ratings) {
        query.append('star_ratings', queryParams.star_ratings);
      }
      if (queryParams.page) query.append('page', String(queryParams.page));
      if (queryParams.limit) query.append('limit', String(queryParams.limit));

      const qs = query.toString();
      const apiUrl = qs
        ? `/apps/deliveries/admin/reviews/vendor/${queryParams.vendor_id}?${qs}`
        : `/apps/deliveries/admin/reviews/vendor/${queryParams.vendor_id}`;

      const response = await Axios.get<GetVendorRatingReviewsResponse>(apiUrl);
      return response.data;
    },
    enabled: Boolean(vendorId),
    retry: false,
    ...options,
  });
};

export const useStoreRatingReviewsByStoreId = (
  options?: Omit<
    UseQueryOptions<GetStoreRatingReviewsResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) => {
  const { getParam } = useQueryParams();
  const params = useParams();
  const routeStoreId = params?.id;
  const storeId = Array.isArray(routeStoreId) ? routeStoreId[0] : routeStoreId;

  const startDate = getParam('start_date') || undefined;
  const endDate = getParam('end_date') || undefined;
  const starRatings = getParam('star_ratings') || undefined;
  const page = Number(getParam('page')) || 1;
  const limit = Number(getParam('limit')) || 10;

  const queryParams: GetStoreRatingReviewsParams | null = storeId
    ? {
        store_id: storeId,
        start_date: startDate,
        end_date: endDate,
        star_ratings: starRatings,
        page,
        limit,
      }
    : null;

  return useQuery<GetStoreRatingReviewsResponse, ApiErrorResponse>({
    queryKey: [
      'get-store-rating-reviews',
      storeId,
      startDate,
      endDate,
      starRatings,
      page,
      limit,
    ],
    queryFn: async () => {
      if (!queryParams) {
        throw new Error('store_id is required');
      }

      const query = new URLSearchParams();
      if (queryParams.start_date) query.append('start_date', queryParams.start_date);
      if (queryParams.end_date) query.append('end_date', queryParams.end_date);
      if (queryParams.star_ratings) {
        query.append('star_ratings', queryParams.star_ratings);
      }
      if (queryParams.page) query.append('page', String(queryParams.page));
      if (queryParams.limit) query.append('limit', String(queryParams.limit));

      const qs = query.toString();
      const apiUrl = qs
        ? `/apps/deliveries/admin/reviews/store/${queryParams.store_id}?${qs}`
        : `/apps/deliveries/admin/reviews/store/${queryParams.store_id}`;

      const response = await Axios.get<GetStoreRatingReviewsResponse>(apiUrl);
      return response.data;
    },
    enabled: Boolean(storeId),
    retry: false,
    ...options,
  });
};

export const useManageStoreReview = (
  options?: Omit<
    UseMutationOptions<
      ManageStoreReviewResponse,
      ApiErrorResponse,
      ManageStoreReviewParams
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    ManageStoreReviewResponse,
    ApiErrorResponse,
    ManageStoreReviewParams
  >({
    mutationFn: async ({ review_id, action }) => {
      const payload: ManageStoreReviewPayload = { review_id, action };
      const response = await Axios.patch<ManageStoreReviewResponse>(
        '/apps/deliveries/admin/reviews/manage',
        payload,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['get-store-rating-reviews', variables.store_id],
        exact: false,
      });
    },
    ...options,
  });
};
