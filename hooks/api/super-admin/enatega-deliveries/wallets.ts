import Axios from '@/config/axios';
import { useQueryParams } from '@/hooks/use-query-params';
import {
  ApiErrorResponse,
  CreateWalletTransactionPayload,
  CreateWalletTransactionResponse,
  GetWalletSummaryResponse,
  GetWalletTransactionsResponse,
  WalletOwnerType,
} from '@/types';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

/**
 * `admin` reads through the super-admin API (any owner type).
 * `store-dashboard` reads the store's own wallet and is allowed for admins
 * and for the logged-in store; it is read-only.
 */
export type WalletDataSource = 'admin' | 'store-dashboard';

const walletBasePath = (
  ownerType: WalletOwnerType,
  ownerId: string,
  source: WalletDataSource = 'admin',
) =>
  source === 'store-dashboard'
    ? `/apps/deliveries/store/wallet-ledger/${ownerId}`
    : `/apps/deliveries/admin/wallets/${ownerType}/${ownerId}`;

export const useGetWalletSummary = (
  ownerType: WalletOwnerType,
  ownerId: string,
  source: WalletDataSource = 'admin',
  options?: Omit<
    UseQueryOptions<GetWalletSummaryResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery<GetWalletSummaryResponse, ApiErrorResponse>({
    queryKey: ['get-wallet-summary', ownerType, ownerId, source],
    queryFn: async () => {
      const { data } = await Axios.get<GetWalletSummaryResponse>(
        walletBasePath(ownerType, ownerId, source),
      );
      return data;
    },
    enabled: !!ownerId,
    ...options,
  });
};

export const useGetWalletTransactions = (
  ownerType: WalletOwnerType,
  ownerId: string,
  source: WalletDataSource = 'admin',
  options?: Omit<
    UseQueryOptions<GetWalletTransactionsResponse, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >,
) => {
  const { getParam } = useQueryParams();
  const page = Number(getParam('page')) || 1;
  const limit = Number(getParam('limit')) || 10;

  return useQuery<GetWalletTransactionsResponse, ApiErrorResponse>({
    queryKey: [
      'get-wallet-transactions',
      ownerType,
      ownerId,
      source,
      { page, limit },
    ],
    queryFn: async () => {
      const { data } = await Axios.get<GetWalletTransactionsResponse>(
        `${walletBasePath(ownerType, ownerId, source)}/transactions`,
        { params: { page, limit } },
      );
      return data;
    },
    enabled: !!ownerId,
    ...options,
  });
};

export const useCreateWalletTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateWalletTransactionResponse,
    ApiErrorResponse,
    CreateWalletTransactionPayload
  >({
    mutationFn: async ({ ownerType, ownerId, ...body }) => {
      const { data } = await Axios.post<CreateWalletTransactionResponse>(
        `${walletBasePath(ownerType, ownerId)}/transactions`,
        body,
      );
      return data;
    },
    onSuccess: (_data, { ownerType, ownerId }) => {
      queryClient.invalidateQueries({
        queryKey: ['get-wallet-summary', ownerType, ownerId],
      });
      queryClient.invalidateQueries({
        queryKey: ['get-wallet-transactions', ownerType, ownerId],
      });
    },
  });
};
