// ── Wallet Types ──

export interface WalletType {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  type: string;
  description: string | null;
}

export interface Wallet {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user_id: string;
  wallet_type_id: string;
  name: string;
  balance: number;
  number: string;
  wallet_type_detail?: WalletType;
  transaction_count?: number;
}

export interface WalletSummary {
  total_wallets: number;
  total_balance: number;
  total_transactions: number;
}

export interface CreateWalletPayload {
  wallet_type_id: string;
  name: string;
  balance: number; // initial deposit
  number: string;
}

export interface UpdateWalletPayload {
  name?: string;
  wallet_type_id?: string;
  number?: string;
}
