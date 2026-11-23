import {
  WalletOwnerType,
  WalletSummary,
  WalletTransaction,
} from '../../../entities/super-admin/enatega-deliveries/wallet';

export type GetWalletSummaryResponse = WalletSummary;

export interface GetWalletTransactionsResponse {
  data: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CreateWalletTransactionPayload {
  ownerType: WalletOwnerType;
  ownerId: string;
  description: string;
  amount: number;
}

export interface CreateWalletTransactionResponse {
  message: string;
  balance: number;
  transaction: WalletTransaction;
}
