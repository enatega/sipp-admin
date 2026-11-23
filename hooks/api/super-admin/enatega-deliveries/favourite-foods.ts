import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import type {
  ApiErrorResponse,
  FavouriteFood,
  FavouriteFoodPayload,
  GetFavouriteFoodsResponse,
} from '@/types';

const QUERY_KEY = ['delivery-favourite-foods'] as const;
const ENDPOINT = '/apps/deliveries/admin/favourite-foods';

function toFormData(payload: FavouriteFoodPayload) {
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('nameTranslations', JSON.stringify(payload.nameTranslations));
  formData.append('shopTypeIds', JSON.stringify(payload.shopTypeIds));
  formData.append('displayOrder', String(payload.displayOrder));
  formData.append('isActive', String(payload.isActive));
  if (payload.image instanceof File) formData.append('image', payload.image);
  if (payload.removeImage) formData.append('removeImage', 'true');
  return formData;
}

export function useFavouriteFoods() {
  const { getParam } = useQueryParams();
  const params = {
    page: Number(getParam('page')) || 1,
    limit: Number(getParam('limit')) || 10,
    search: getParam('search') || undefined,
    status: getParam('status') || undefined,
    shopTypeId: getParam('shopTypeId') || undefined,
  };

  return useQuery<GetFavouriteFoodsResponse, ApiErrorResponse>({
    queryKey: [...QUERY_KEY, params],
    queryFn: async () => (await Axios.get(ENDPOINT, { params })).data,
    placeholderData: (previous) => previous,
  });
}

export function useCreateFavouriteFood() {
  const queryClient = useQueryClient();
  return useMutation<FavouriteFood, ApiErrorResponse, FavouriteFoodPayload>({
    mutationFn: async (payload) =>
      (await Axios.post(ENDPOINT, toFormData(payload))).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateFavouriteFood() {
  const queryClient = useQueryClient();
  return useMutation<
    FavouriteFood,
    ApiErrorResponse,
    { id: string; payload: FavouriteFoodPayload }
  >({
    mutationFn: async ({ id, payload }) =>
      (await Axios.patch(`${ENDPOINT}/${id}`, toFormData(payload))).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteFavouriteFood() {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean; message: string }, ApiErrorResponse, string>({
    mutationFn: async (id) => (await Axios.delete(`${ENDPOINT}/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateFavouriteFoodStatus() {
  const queryClient = useQueryClient();
  return useMutation<
    FavouriteFood,
    ApiErrorResponse,
    { item: FavouriteFood; isActive: boolean }
  >({
    mutationFn: async ({ item, isActive }) => {
      const payload: FavouriteFoodPayload = {
        name: item.name,
        nameTranslations: item.nameTranslations,
        shopTypeIds: item.shopTypes.map((shopType) => shopType.id),
        displayOrder: item.displayOrder,
        isActive,
      };
      return (await Axios.patch(`${ENDPOINT}/${item.id}`, toFormData(payload))).data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
