// ── Wallet Types ──

/**
 * "asset" wallets hold money and count towards net worth. "liability" wallets
 * are credit lines (credit card, paylater) whose balance is the *remaining*
 * limit: spending lowers it, paying the bill restores it.
 */
export type WalletNature = "asset" | "liability";

export interface WalletType {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  type: string;
  description: string | null;
  nature?: WalletNature;
  /**
   * Logo uploaded from the admin panel. Absent for types created before
   * uploads existed, which fall back to the name-derived asset path.
   */
  icon_url?: string;
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
  wallet_type_nature?: WalletNature;
  transaction_count?: number;
}

export interface WalletSummary {
  total_wallets: number;
  /** Asset wallets only — liability wallets are excluded from net worth. */
  total_balance: number;
  total_transactions: number;
  /** Combined remaining limit across credit lines. */
  total_credit_available?: number;
}

export interface CreateWalletPayload {
  wallet_type_id: string;
  name: string;
  balance: number; // initial deposit, or credit limit for liability wallets
  number: string;
}

export interface UpdateWalletPayload {
  name?: string;
  wallet_type_id?: string;
  number?: string;
  /** Only accepted for liability wallets, where it is the credit limit. */
  balance?: number;
}

/** True when the wallet is a credit line rather than money held. */
export function isLiabilityWallet(wallet: Wallet): boolean {
  return (
    (wallet.wallet_type_nature ?? wallet.wallet_type_detail?.nature) ===
    "liability"
  );
}

/**
 * Resolves the logo for a wallet type.
 *
 * Prefers the uploaded logo, which is stored on the type itself and therefore
 * survives a rename. Falls back to the legacy convention of slugifying the name
 * into a fixed asset path, so the types that predate uploads keep their logos.
 */
export function walletTypeLogoUrl(
  detail: WalletType | undefined,
  legacyBaseUrl: string,
  slugify: (text: string) => string,
): string {
  if (detail?.icon_url) return detail.icon_url;
  return `${legacyBaseUrl}${slugify(detail?.name ?? "")}.png`;
}
