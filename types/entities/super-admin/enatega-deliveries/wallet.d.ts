export type WalletOwnerType = 'customer' | 'rider' | 'store';

export type WalletTransactionDirection = 'credit' | 'debit';

export interface WalletSummary {
  owner_type: WalletOwnerType;
  owner_id: string;
  owner_name: string | null;
  wallet_id: string | null;
  balance: number;
  updated_at: string | null;
}

export interface WalletTransaction {
  transaction_id: string;
  type: string;
  direction: WalletTransactionDirection;
  amount: number;
  balance_after: number;
  description: string | null;
  entry_type: string | null;
  order_id: string | null;
  created_at: string;
}
