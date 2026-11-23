import Axios from '@/config/axios';
import { ApiErrorResponse } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface BulkImageAccessKeyStatus {
  configured: boolean;
  hint: string | null;
  updated_at: string | null;
}

const BASE = '/apps/deliveries/bulk-image-upload/settings';
const QUERY_KEY = ['bulk-image-upload-settings'];

export const useGetBulkImageAccessKeyStatus = () =>
  useQuery<BulkImageAccessKeyStatus, ApiErrorResponse>({
    queryKey: QUERY_KEY,
    queryFn: async () => (await Axios.get<BulkImageAccessKeyStatus>(BASE)).data,
  });

export const useSetBulkImageAccessKey = () => {
  const queryClient = useQueryClient();
  return useMutation<BulkImageAccessKeyStatus, ApiErrorResponse, string>({
    mutationFn: async (accessKey) =>
      (await Axios.put<BulkImageAccessKeyStatus>(`${BASE}/access-key`, { access_key: accessKey }))
        .data,
    onSuccess: (data) => queryClient.setQueryData(QUERY_KEY, data),
  });
};

export const useRemoveBulkImageAccessKey = () => {
  const queryClient = useQueryClient();
  return useMutation<BulkImageAccessKeyStatus, ApiErrorResponse, void>({
    mutationFn: async () =>
      (await Axios.delete<BulkImageAccessKeyStatus>(`${BASE}/access-key`)).data,
    onSuccess: (data) => queryClient.setQueryData(QUERY_KEY, data),
  });
};
