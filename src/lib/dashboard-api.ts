import type {
  BalanceSnapshot,
  CategoryTransaction,
  DateOption,
  DateRange,
  FinancialSummary,
  NetWorthComposition,
  TransactionCategory,
  Wallet,
} from "@/types/dashboard";
import type { ApiResponse, ApiError } from "./api";
import { BFF_BASE_URL } from "./const";

const BFF_PREFIX = "/dashboard";

/** Fetch wrapper that targets the BFF (port 3001) instead of the auth backend */
async function bffCall<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const response = await fetch(`${BFF_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok || data.status === false) {
    const error: ApiError = {
      statusCode: data.statusCode || response.status,
      message: data.message || "Something went wrong",
    };
    throw error;
  }

  return data as ApiResponse<T>;
}

// ── Wallets ──

export async function fetchUserWallets(token: string) {
  return bffCall<Wallet[]>(`${BFF_PREFIX}/wallets`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Financial Summary ──

export async function fetchFinancialSummary(
  token: string,
  opts: { walletID?: string; range?: DateRange },
) {
  return bffCall<FinancialSummary[]>(`${BFF_PREFIX}/financial-summary`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      walletID: opts.walletID,
      range: opts.range,
    }),
  });
}

// ── Balance ──

export async function fetchUserBalance(
  token: string,
  opts: {
    walletID?: string;
    aggregation: "daily" | "weekly" | "monthly";
    range?: DateRange;
  },
) {
  return bffCall<BalanceSnapshot[]>(`${BFF_PREFIX}/balance`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      walletID: opts.walletID,
      aggregation: opts.aggregation,
      range: opts.range,
    }),
  });
}

// ── Transactions by Category ──

export async function fetchUserTransactions(
  token: string,
  opts: { walletID?: string; dateOption: DateOption },
) {
  return bffCall<TransactionCategory[]>(`${BFF_PREFIX}/transactions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      walletID: opts.walletID,
      dateOption: opts.dateOption,
    }),
  });
}

// ── Net Worth Composition ──

export async function fetchNetWorthComposition(token: string) {
  return bffCall<NetWorthComposition>(`${BFF_PREFIX}/net-worth`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({}),
  });
}

// ── Category Transactions ──

export async function fetchCategoryTransactions(
  token: string,
  opts: { walletID?: string; categoryID: string; dateOption: DateOption },
) {
  return bffCall<CategoryTransaction[]>(`${BFF_PREFIX}/category-transactions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      walletID: opts.walletID,
      categoryID: opts.categoryID,
      dateOption: opts.dateOption,
    }),
  });
}
