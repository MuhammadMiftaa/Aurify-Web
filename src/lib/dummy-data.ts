import type { Wallet, WalletType, WalletSummary } from "@/types/wallet";
import { isLiabilityWallet } from "@/types/wallet";
import type {
  Transaction,
  TransactionListResponse,
  Category,
} from "@/types/transaction";
import type {
  Investment,
  InvestmentSold,
  InvestmentSummary,
  AssetCode,
  InvestmentListResponse,
} from "@/types/investment";
import type {
  FinancialSummary,
  BalanceSnapshot,
  TransactionCategory,
  NetWorthComposition,
  Wallet as DashboardWallet,
} from "@/types/dashboard";

// ════════════════════════════════════════════
// WALLET TYPES (DUMMY)
// ════════════════════════════════════════════

export const DUMMY_WALLET_TYPES: WalletType[] = [
  {
    id: "wt-001",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    deleted_at: null,
    name: "BCA (Bank Central Asia)",
    type: "bank",
    description: "Bank Central Asia",
  },
  {
    id: "wt-002",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    deleted_at: null,
    name: "Mandiri",
    type: "bank",
    description: "Bank Mandiri",
  },
  {
    id: "wt-003",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    deleted_at: null,
    name: "GoPay (Gojek)",
    type: "e-wallet",
    description: "GoPay Digital Wallet",
  },
  {
    id: "wt-004",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    deleted_at: null,
    name: "OVO (Grab)",
    type: "e-wallet",
    description: "OVO Digital Wallet",
  },
  {
    id: "wt-005",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    deleted_at: null,
    name: "Dompet Fisik (Cash)",
    type: "cash",
    description: "Cash on hand",
  },
  {
    id: "wt-006",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    deleted_at: null,
    name: "BNI (Bank Negara Indonesia)",
    type: "bank",
    description: "Bank Negara Indonesia",
  },
  {
    id: "wt-007",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    deleted_at: null,
    name: "DANA",
    type: "e-wallet",
    description: "DANA Digital Wallet",
  },
  {
    id: "wt-008",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    deleted_at: null,
    name: "BCA Credit Card",
    type: "credit_card",
    description: "BCA Credit Card",
    nature: "liability",
  },
];

// ════════════════════════════════════════════
// WALLETS (DUMMY)
// ════════════════════════════════════════════

export const DUMMY_WALLETS: Wallet[] = [
  {
    id: "w-001",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2026-02-28T12:00:00Z",
    deleted_at: null,
    user_id: "user-001",
    wallet_type_id: "wt-001",
    name: "BCA Primary",
    balance: 15750000,
    number: "8901234567",
    wallet_type_detail: DUMMY_WALLET_TYPES[0],
    transaction_count: 142,
  },
  {
    id: "w-002",
    created_at: "2024-03-01T08:00:00Z",
    updated_at: "2026-02-28T12:00:00Z",
    deleted_at: null,
    user_id: "user-001",
    wallet_type_id: "wt-002",
    name: "Mandiri Savings",
    balance: 8250000,
    number: "1234567890",
    wallet_type_detail: DUMMY_WALLET_TYPES[1],
    transaction_count: 67,
  },
  {
    id: "w-003",
    created_at: "2024-06-10T14:00:00Z",
    updated_at: "2026-02-28T12:00:00Z",
    deleted_at: null,
    user_id: "user-001",
    wallet_type_id: "wt-003",
    name: "GoPay Daily",
    balance: 450000,
    number: "081234567890",
    wallet_type_detail: DUMMY_WALLET_TYPES[2],
    transaction_count: 89,
  },
  {
    id: "w-004",
    created_at: "2024-09-20T10:00:00Z",
    updated_at: "2026-02-28T12:00:00Z",
    deleted_at: null,
    user_id: "user-001",
    wallet_type_id: "wt-004",
    name: "OVO Cashback",
    balance: 125000,
    number: "081234567891",
    wallet_type_detail: DUMMY_WALLET_TYPES[3],
    transaction_count: 34,
  },
  {
    id: "w-005",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2026-02-28T12:00:00Z",
    deleted_at: null,
    user_id: "user-001",
    wallet_type_id: "wt-005",
    name: "Cash Wallet",
    balance: 0,
    number: "-",
    wallet_type_detail: DUMMY_WALLET_TYPES[4],
    transaction_count: 12,
  },
  {
    id: "w-006",
    created_at: "2025-01-05T08:30:00Z",
    updated_at: "2026-02-28T12:00:00Z",
    deleted_at: null,
    user_id: "user-001",
    wallet_type_id: "wt-006",
    name: "BNI Payroll",
    balance: 22300000,
    number: "0987654321",
    wallet_type_detail: DUMMY_WALLET_TYPES[5],
    transaction_count: 24,
  },
  {
    id: "w-007",
    created_at: "2025-06-18T09:00:00Z",
    updated_at: "2026-02-28T12:00:00Z",
    deleted_at: null,
    user_id: "user-001",
    wallet_type_id: "wt-008",
    name: "BCA Everyday Card",
    // For a credit line this is the limit still available: a 20jt limit with
    // 6,4jt already spent.
    balance: 13600000,
    number: "4532",
    wallet_type_detail: DUMMY_WALLET_TYPES[7],
    wallet_type_nature: "liability",
    transaction_count: 38,
  },
];

// ════════════════════════════════════════════
// WALLET SUMMARY (DUMMY)
// ════════════════════════════════════════════

export const DUMMY_WALLET_SUMMARY: WalletSummary = {
  total_wallets: DUMMY_WALLETS.length,
  total_balance: DUMMY_WALLETS.filter((w) => !isLiabilityWallet(w)).reduce(
    (sum, w) => sum + w.balance,
    0,
  ),
  total_credit_available: DUMMY_WALLETS.filter(isLiabilityWallet).reduce(
    (sum, w) => sum + w.balance,
    0,
  ),
  total_transactions: DUMMY_WALLETS.reduce(
    (sum, w) => sum + (w.transaction_count ?? 0),
    0,
  ),
};

// ════════════════════════════════════════════
// CATEGORIES (DUMMY)
// ════════════════════════════════════════════

export const DUMMY_CATEGORIES: Category[] = [
  // Income
  {
    id: "cat-001",
    name: "Salary",
    type: "income",
    group_name: "Employment",
  },
  {
    id: "cat-002",
    name: "Freelance",
    type: "income",
    group_name: "Employment",
  },
  {
    id: "cat-003",
    name: "Investment Return",
    type: "income",
    group_name: "Passive Income",
  },
  // Expense
  {
    id: "cat-010",
    name: "Food & Beverage",
    type: "expense",
    group_name: "Daily Needs",
  },
  {
    id: "cat-011",
    name: "Transportation",
    type: "expense",
    group_name: "Daily Needs",
  },
  {
    id: "cat-012",
    name: "Utilities",
    type: "expense",
    group_name: "Bills",
  },
  {
    id: "cat-013",
    name: "Entertainment",
    type: "expense",
    group_name: "Lifestyle",
  },
  {
    id: "cat-014",
    name: "Shopping",
    type: "expense",
    group_name: "Lifestyle",
  },
  {
    id: "cat-015",
    name: "Health",
    type: "expense",
    group_name: "Essentials",
  },
  // Fund Transfer
  {
    id: "cat-020",
    name: "Transfer",
    type: "fund_transfer",
    group_name: "Transfer",
  },
];

// ════════════════════════════════════════════
// TRANSACTIONS (DUMMY)
// ════════════════════════════════════════════

export const DUMMY_TRANSACTIONS: Transaction[] = [
  {
    id: "txn-001",
    created_at: "2026-03-01T09:00:00Z",
    updated_at: "2026-03-01T09:00:00Z",
    deleted_at: null,
    wallet_id: "w-001",
    category_id: "cat-001",
    amount: 12500000,
    transaction_date: "2026-03-01T09:00:00Z",
    description: "Monthly salary - March 2026",
    wallet_name: "BCA Primary",
    category_name: "Salary",
    category_type: "income",
    attachments: [],
  },
  {
    id: "txn-002",
    created_at: "2026-03-01T12:30:00Z",
    updated_at: "2026-03-01T12:30:00Z",
    deleted_at: null,
    wallet_id: "w-003",
    category_id: "cat-010",
    amount: 85000,
    transaction_date: "2026-03-01T12:30:00Z",
    description: "Lunch at Japanese restaurant",
    wallet_name: "GoPay Daily",
    category_name: "Food & Beverage",
    category_type: "expense",
    attachments: [
      {
        id: "att-001",
        created_at: "2026-03-01T12:30:00Z",
        updated_at: "2026-03-01T12:30:00Z",
        deleted_at: null,
        transaction_id: "txn-002",
        image: null,
        format: "image/jpeg",
        size: 245000,
      },
    ],
  },
  {
    id: "txn-003",
    created_at: "2026-03-02T07:15:00Z",
    updated_at: "2026-03-02T07:15:00Z",
    deleted_at: null,
    wallet_id: "w-004",
    category_id: "cat-011",
    amount: 25000,
    transaction_date: "2026-03-02T07:15:00Z",
    description: "Grab ride to office",
    wallet_name: "OVO Cashback",
    category_name: "Transportation",
    category_type: "expense",
    attachments: [],
  },
  {
    id: "txn-004",
    created_at: "2026-03-02T14:00:00Z",
    updated_at: "2026-03-02T14:00:00Z",
    deleted_at: null,
    wallet_id: "w-001",
    category_id: "cat-002",
    amount: 3500000,
    transaction_date: "2026-03-02T14:00:00Z",
    description: "Freelance project - UI/UX Design",
    wallet_name: "BCA Primary",
    category_name: "Freelance",
    category_type: "income",
    attachments: [],
  },
  {
    id: "txn-005",
    created_at: "2026-03-03T10:00:00Z",
    updated_at: "2026-03-03T10:00:00Z",
    deleted_at: null,
    wallet_id: "w-002",
    category_id: "cat-012",
    amount: 750000,
    transaction_date: "2026-03-03T10:00:00Z",
    description: "Monthly electricity bill",
    wallet_name: "Mandiri Savings",
    category_name: "Utilities",
    category_type: "expense",
    attachments: [
      {
        id: "att-002",
        created_at: "2026-03-03T10:00:00Z",
        updated_at: "2026-03-03T10:00:00Z",
        deleted_at: null,
        transaction_id: "txn-005",
        image: null,
        format: "image/png",
        size: 180000,
      },
    ],
  },
  {
    id: "txn-006",
    created_at: "2026-02-28T16:00:00Z",
    updated_at: "2026-02-28T16:00:00Z",
    deleted_at: null,
    wallet_id: "w-001",
    category_id: "cat-020",
    amount: 500000,
    transaction_date: "2026-02-28T16:00:00Z",
    description: "Transfer to GoPay for daily spending",
    wallet_name: "BCA Primary",
    category_name: "Transfer",
    category_type: "fund_transfer",
    attachments: [],
  },
  {
    id: "txn-007",
    created_at: "2026-02-27T11:00:00Z",
    updated_at: "2026-02-27T11:00:00Z",
    deleted_at: null,
    wallet_id: "w-003",
    category_id: "cat-013",
    amount: 150000,
    transaction_date: "2026-02-27T11:00:00Z",
    description: "Netflix monthly subscription",
    wallet_name: "GoPay Daily",
    category_name: "Entertainment",
    category_type: "expense",
    attachments: [],
  },
  {
    id: "txn-008",
    created_at: "2026-02-26T18:30:00Z",
    updated_at: "2026-02-26T18:30:00Z",
    deleted_at: null,
    wallet_id: "w-001",
    category_id: "cat-014",
    amount: 1250000,
    transaction_date: "2026-02-26T18:30:00Z",
    description: "New headphones - Sony WH-1000XM5",
    wallet_name: "BCA Primary",
    category_name: "Shopping",
    category_type: "expense",
    attachments: [
      {
        id: "att-003",
        created_at: "2026-02-26T18:30:00Z",
        updated_at: "2026-02-26T18:30:00Z",
        deleted_at: null,
        transaction_id: "txn-008",
        image: null,
        format: "image/jpeg",
        size: 320000,
      },
    ],
  },
  {
    id: "txn-009",
    created_at: "2026-02-25T09:00:00Z",
    updated_at: "2026-02-25T09:00:00Z",
    deleted_at: null,
    wallet_id: "w-006",
    category_id: "cat-001",
    amount: 12500000,
    transaction_date: "2026-02-25T09:00:00Z",
    description: "Monthly salary - February 2026",
    wallet_name: "BNI Payroll",
    category_name: "Salary",
    category_type: "income",
    attachments: [],
  },
  {
    id: "txn-010",
    created_at: "2026-02-24T13:45:00Z",
    updated_at: "2026-02-24T13:45:00Z",
    deleted_at: null,
    wallet_id: "w-002",
    category_id: "cat-015",
    amount: 350000,
    transaction_date: "2026-02-24T13:45:00Z",
    description: "Medical checkup",
    wallet_name: "Mandiri Savings",
    category_name: "Health",
    category_type: "expense",
    attachments: [],
  },
  {
    id: "txn-011",
    created_at: "2026-02-23T20:00:00Z",
    updated_at: "2026-02-23T20:00:00Z",
    deleted_at: null,
    wallet_id: "w-003",
    category_id: "cat-010",
    amount: 55000,
    transaction_date: "2026-02-23T20:00:00Z",
    description: "Dinner delivery - GoFood",
    wallet_name: "GoPay Daily",
    category_name: "Food & Beverage",
    category_type: "expense",
    attachments: [],
  },
  {
    id: "txn-012",
    created_at: "2026-02-22T15:00:00Z",
    updated_at: "2026-02-22T15:00:00Z",
    deleted_at: null,
    wallet_id: "w-001",
    category_id: "cat-003",
    amount: 750000,
    transaction_date: "2026-02-22T15:00:00Z",
    description: "Stock dividend - BBCA",
    wallet_name: "BCA Primary",
    category_name: "Investment Return",
    category_type: "income",
    attachments: [],
  },
  {
    id: "txn-013",
    created_at: "2026-02-21T09:30:00Z",
    updated_at: "2026-02-21T09:30:00Z",
    deleted_at: null,
    wallet_id: "w-004",
    category_id: "cat-011",
    amount: 18000,
    transaction_date: "2026-02-21T09:30:00Z",
    description: "Commuter line ticket",
    wallet_name: "OVO Cashback",
    category_name: "Transportation",
    category_type: "expense",
    attachments: [],
  },
  {
    id: "txn-014",
    created_at: "2026-02-20T17:00:00Z",
    updated_at: "2026-02-20T17:00:00Z",
    deleted_at: null,
    wallet_id: "w-002",
    category_id: "cat-012",
    amount: 450000,
    transaction_date: "2026-02-20T17:00:00Z",
    description: "Internet subscription",
    wallet_name: "Mandiri Savings",
    category_name: "Utilities",
    category_type: "expense",
    attachments: [],
  },
  {
    id: "txn-015",
    created_at: "2026-02-19T12:00:00Z",
    updated_at: "2026-02-19T12:00:00Z",
    deleted_at: null,
    wallet_id: "w-001",
    category_id: "cat-020",
    amount: 2000000,
    transaction_date: "2026-02-19T16:00:00Z",
    description: "Transfer to Mandiri for savings",
    wallet_name: "BCA Primary",
    category_name: "Transfer",
    category_type: "fund_transfer",
    attachments: [],
  },
];

/** Generate paginated transaction list from dummy data */
export function getDummyTransactionList(
  params: {
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    search?: string;
  } = {},
): TransactionListResponse {
  const {
    page = 1,
    page_size = 10,
    sort_by = "transaction_date",
    sort_order = "desc",
    search = "",
  } = params;

  let filtered = [...DUMMY_TRANSACTIONS];

  // Search
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.description?.toLowerCase().includes(q) ||
        t.wallet_name?.toLowerCase().includes(q) ||
        t.category_name?.toLowerCase().includes(q) ||
        t.amount.toString().includes(q),
    );
  }

  // Sort
  filtered.sort((a, b) => {
    let aVal: string | number = 0;
    let bVal: string | number = 0;

    switch (sort_by) {
      case "amount":
        aVal = a.amount;
        bVal = b.amount;
        break;
      case "wallet_name":
        aVal = a.wallet_name ?? "";
        bVal = b.wallet_name ?? "";
        break;
      case "category_name":
        aVal = a.category_name ?? "";
        bVal = b.category_name ?? "";
        break;
      case "description":
        aVal = a.description ?? "";
        bVal = b.description ?? "";
        break;
      case "transaction_date":
      default:
        aVal = new Date(a.transaction_date).getTime();
        bVal = new Date(b.transaction_date).getTime();
        break;
    }

    if (typeof aVal === "string") {
      return sort_order === "asc"
        ? aVal.localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal);
    }
    return sort_order === "asc"
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  // Paginate
  const total = filtered.length;
  const start = page_size === -1 ? 0 : (page - 1) * page_size;
  const end = page_size === -1 ? total : start + page_size;
  const transactions = filtered.slice(start, end);

  return {
    transactions,
    total,
    page_size,
    next_cursor: "",
    has_next: end < total,
    next_cursor_amount:
      transactions.length > 0
        ? transactions[transactions.length - 1].amount
        : 0,
    next_cursor_date:
      transactions.length > 0
        ? transactions[transactions.length - 1].transaction_date
        : "",
  };
}

// ════════════════════════════════════════════
// ASSET CODES (DUMMY)
// ════════════════════════════════════════════

export const DUMMY_ASSET_CODES: AssetCode[] = [
  {
    code: "XAU",
    name: "Gold",
    unit: "troy oz",
    toUSD: 2650.0,
    toEUR: 2430.0,
    toIDR: 42400000,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
    deleted_at: null,
  },
  {
    code: "XAG",
    name: "Silver",
    unit: "troy oz",
    toUSD: 31.5,
    toEUR: 28.9,
    toIDR: 504000,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
    deleted_at: null,
  },
  {
    code: "BBCA",
    name: "Bank Central Asia Tbk",
    unit: "lot",
    toUSD: null,
    toEUR: null,
    toIDR: 9875,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
    deleted_at: null,
  },
  {
    code: "BBRI",
    name: "Bank Rakyat Indonesia Tbk",
    unit: "lot",
    toUSD: null,
    toEUR: null,
    toIDR: 4520,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
    deleted_at: null,
  },
  {
    code: "BTC",
    name: "Bitcoin",
    unit: "BTC",
    toUSD: 87500.0,
    toEUR: 80250.0,
    toIDR: 1400000000,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
    deleted_at: null,
  },
  {
    code: "ETH",
    name: "Ethereum",
    unit: "ETH",
    toUSD: 3250.0,
    toEUR: 2980.0,
    toIDR: 52000000,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
    deleted_at: null,
  },
  {
    code: "TLKM",
    name: "Telkom Indonesia Tbk",
    unit: "lot",
    toUSD: null,
    toEUR: null,
    toIDR: 3880,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
    deleted_at: null,
  },
];

// ════════════════════════════════════════════
// INVESTMENTS (DUMMY)
// ════════════════════════════════════════════

const SOLD_RECORDS: InvestmentSold[] = [
  {
    id: "sold-001",
    investment_id: "inv-002",
    user_id: "user-001",
    quantity: 200,
    amount: 1940000,
    sell_price: 9700,
    deficit: -60000,
    date: "2026-01-15T10:00:00Z",
    description: "Partial profit taking",
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-15T10:00:00Z",
    deleted_at: null,
  },
  {
    id: "sold-002",
    investment_id: "inv-005",
    user_id: "user-001",
    quantity: 0.005,
    amount: 437500,
    sell_price: 87500,
    deficit: 37500,
    date: "2026-02-10T14:00:00Z",
    description: "Selling some BTC",
    created_at: "2026-02-10T14:00:00Z",
    updated_at: "2026-02-10T14:00:00Z",
    deleted_at: null,
  },
];

export const DUMMY_INVESTMENTS: Investment[] = [
  {
    id: "inv-001",
    user_id: "user-001",
    code: "XAU",
    quantity: 2,
    amount: 78000000,
    initial_valuation: 39000000,
    date: "2025-06-15T10:00:00Z",
    description: "Gold bar investment",
    created_at: "2025-06-15T10:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
    deleted_at: null,
    asset: DUMMY_ASSET_CODES[0],
    sold_records: [],
  },
  {
    id: "inv-002",
    user_id: "user-001",
    code: "BBCA",
    quantity: 500,
    amount: 4500000,
    initial_valuation: 9000,
    date: "2025-03-10T09:00:00Z",
    description: "BCA stocks - long term hold",
    created_at: "2025-03-10T09:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
    deleted_at: null,
    asset: DUMMY_ASSET_CODES[2],
    sold_records: [SOLD_RECORDS[0]],
  },
  {
    id: "inv-003",
    user_id: "user-001",
    code: "BBRI",
    quantity: 1000,
    amount: 4200000,
    initial_valuation: 4200,
    date: "2025-08-20T11:00:00Z",
    description: "BRI stocks",
    created_at: "2025-08-20T11:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
    deleted_at: null,
    asset: DUMMY_ASSET_CODES[3],
    sold_records: [],
  },
  {
    id: "inv-004",
    user_id: "user-001",
    code: "XAG",
    quantity: 10,
    amount: 4500000,
    initial_valuation: 450000,
    date: "2025-10-01T14:00:00Z",
    description: "Silver investment",
    created_at: "2025-10-01T14:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
    deleted_at: null,
    asset: DUMMY_ASSET_CODES[1],
    sold_records: [],
  },
  {
    id: "inv-005",
    user_id: "user-001",
    code: "BTC",
    quantity: 0.05,
    amount: 56000000,
    initial_valuation: 1120000000,
    date: "2025-01-05T08:00:00Z",
    description: "Bitcoin DCA",
    created_at: "2025-01-05T08:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
    deleted_at: null,
    asset: DUMMY_ASSET_CODES[4],
    sold_records: [SOLD_RECORDS[1]],
  },
  {
    id: "inv-006",
    user_id: "user-001",
    code: "ETH",
    quantity: 1.5,
    amount: 60000000,
    initial_valuation: 40000000,
    date: "2025-04-20T10:00:00Z",
    description: "Ethereum hold",
    created_at: "2025-04-20T10:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
    deleted_at: null,
    asset: DUMMY_ASSET_CODES[5],
    sold_records: [],
  },
  {
    id: "inv-007",
    user_id: "user-001",
    code: "TLKM",
    quantity: 2000,
    amount: 7000000,
    initial_valuation: 3500,
    date: "2025-07-12T09:30:00Z",
    description: "Telkom long-term",
    created_at: "2025-07-12T09:30:00Z",
    updated_at: "2026-03-01T00:00:00Z",
    deleted_at: null,
    asset: DUMMY_ASSET_CODES[6],
    sold_records: [],
  },
];

// ════════════════════════════════════════════
// INVESTMENT SUMMARY (DUMMY)
// ════════════════════════════════════════════

function computeCurrentValue(inv: Investment): number {
  const price = inv.asset?.toIDR ?? inv.initial_valuation;
  return inv.quantity * price;
}

export function getDummyInvestmentSummary(): InvestmentSummary {
  const totalInvested = DUMMY_INVESTMENTS.reduce((s, i) => s + i.amount, 0);
  const totalCurrentValue = DUMMY_INVESTMENTS.reduce(
    (s, i) => s + computeCurrentValue(i),
    0,
  );
  const totalSoldAmount = DUMMY_INVESTMENTS.reduce(
    (s, i) => s + (i.sold_records?.reduce((ss, r) => ss + r.amount, 0) ?? 0),
    0,
  );
  const totalRealizedGain = DUMMY_INVESTMENTS.reduce(
    (s, i) =>
      s + (i.sold_records?.reduce((ss, r) => ss + (r.deficit ?? 0), 0) ?? 0),
    0,
  );
  const pl = totalCurrentValue - totalInvested;
  const plPct = totalInvested > 0 ? (pl / totalInvested) * 100 : 0;
  return {
    total_investments: DUMMY_INVESTMENTS.length,
    total_invested: totalInvested,
    total_current_value: totalCurrentValue,
    total_profit_loss: pl,
    total_profit_loss_pct: plPct,
    total_sold_amount: totalSoldAmount,
    total_realized_gain: totalRealizedGain,
  };
}

/** Generate paginated investment list from dummy data */
export function getDummyInvestmentList(
  params: {
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    search?: string;
    code?: string;
  } = {},
): InvestmentListResponse {
  const {
    page = 1,
    page_size = 10,
    sort_by = "date",
    sort_order = "desc",
    search = "",
    code = "",
  } = params;

  let filtered = [...DUMMY_INVESTMENTS];

  if (code) {
    filtered = filtered.filter((i) => i.code === code);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.code.toLowerCase().includes(q) ||
        i.asset?.name.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q),
    );
  }

  filtered.sort((a, b) => {
    let aVal: string | number = 0;
    let bVal: string | number = 0;
    switch (sort_by) {
      case "amount":
        aVal = a.amount;
        bVal = b.amount;
        break;
      case "quantity":
        aVal = a.quantity;
        bVal = b.quantity;
        break;
      case "code":
        aVal = a.code;
        bVal = b.code;
        break;
      case "current_value":
        aVal = computeCurrentValue(a);
        bVal = computeCurrentValue(b);
        break;
      case "date":
      default:
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
        break;
    }
    if (typeof aVal === "string") {
      return sort_order === "asc"
        ? aVal.localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal);
    }
    return sort_order === "asc"
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  const total = filtered.length;
  const totalPages = page_size === -1 ? 1 : Math.ceil(total / page_size);
  const start = page_size === -1 ? 0 : (page - 1) * page_size;
  const end = page_size === -1 ? total : start + page_size;
  const investments = filtered.slice(start, end);

  return {
    investments,
    total,
    page,
    page_size,
    total_pages: totalPages,
  };
}

// ════════════════════════════════════════════
// DASHBOARD DUMMY DATA
// ════════════════════════════════════════════

export const DUMMY_DASHBOARD_WALLETS: DashboardWallet[] = DUMMY_WALLETS.map(
  (w) => ({
    wallet_id: w.id,
    user_id: w.user_id,
    wallet_name: w.name,
    wallet_type: w.wallet_type_detail?.type ?? "bank",
    wallet_type_name: w.wallet_type_detail?.name ?? w.name,
    balance: w.balance,
    currency: "IDR",
    is_active: true,
  }),
);

export function getDummyFinancialSummary(): FinancialSummary[] {
  const totalBalance = DUMMY_WALLETS.reduce((s, w) => s + w.balance, 0);
  const invSummary = getDummyInvestmentSummary();

  return [
    {
      user_id: "user-001",
      period_type: "monthly",
      period_key: "2026-03",
      period_start: "2026-03-01T00:00:00Z",
      period_end: "2026-03-31T23:59:59Z",

      income_now: 18500000,
      expense_now: 12300000,
      profit_now: 6200000,
      balance_now: totalBalance,

      income_prev: 16200000,
      expense_prev: 11500000,
      profit_prev: 4700000,
      balance_prev: totalBalance - 6200000,

      income_growth_pct: 14.2,
      expense_growth_pct: 7.0,
      profit_growth_pct: 31.9,
      balance_growth_pct: 12.5,

      savings_rate: 33.5,
      expense_to_income_ratio: 66.5,
      burn_rate_daily: 410000,
      avg_income_daily: 616667,
      avg_expense_daily: 410000,
      runway_days: Math.round(totalBalance / 410000),

      total_transactions: 45,
      income_transaction_count: 12,
      expense_transaction_count: 33,
      avg_transaction_amount: 683333,
      largest_income: 8500000,
      largest_expense: 3200000,

      investment_summary: {
        total_invested: invSummary.total_invested,
        total_current_valuation: invSummary.total_current_value,
        total_sold_amount: invSummary.total_sold_amount,
        total_deficit: invSummary.total_realized_gain,
        unrealized_gain: invSummary.total_profit_loss,
        realized_gain: invSummary.total_realized_gain,
        investment_growth_pct: invSummary.total_profit_loss_pct,
        buy_count: 7,
        sell_count: 2,
        active_positions: invSummary.total_investments,
      },

      net_worth: {
        total: totalBalance + invSummary.total_current_value,
        wallet_portion: totalBalance,
        investment_portion: invSummary.total_current_value,
        net_worth_prev:
          totalBalance - 6200000 + invSummary.total_current_value * 0.95,
        net_worth_growth_pct: 8.3,
      },

      top_expense_categories: [
        {
          category_id: "cat-001",
          category_name: "Food & Dining",
          amount: 3200000,
          percentage: 26.0,
          transaction_count: 12,
        },
        {
          category_id: "cat-002",
          category_name: "Transportation",
          amount: 2100000,
          percentage: 17.1,
          transaction_count: 8,
        },
        {
          category_id: "cat-003",
          category_name: "Shopping",
          amount: 1850000,
          percentage: 15.0,
          transaction_count: 5,
        },
      ],
      top_income_categories: [
        {
          category_id: "cat-006",
          category_name: "Salary",
          amount: 12000000,
          percentage: 64.9,
          transaction_count: 1,
        },
        {
          category_id: "cat-007",
          category_name: "Freelance",
          amount: 4500000,
          percentage: 24.3,
          transaction_count: 3,
        },
        {
          category_id: "cat-008",
          category_name: "Investment Returns",
          amount: 2000000,
          percentage: 10.8,
          transaction_count: 2,
        },
      ],
    },
  ];
}

export function getDummyBalanceSnapshots(
  aggregation: "daily" | "weekly" | "monthly" = "monthly",
): BalanceSnapshot[] {
  if (aggregation === "monthly") {
    return [
      {
        year: 2025,
        month: 10,
        opening_balance: 28000000,
        closing_balance: 30500000,
        total_income: 15800000,
        total_expense: 13300000,
        net_change: 2500000,
        transaction_count: 38,
      },
      {
        year: 2025,
        month: 11,
        opening_balance: 30500000,
        closing_balance: 33200000,
        total_income: 16500000,
        total_expense: 13800000,
        net_change: 2700000,
        transaction_count: 41,
      },
      {
        year: 2025,
        month: 12,
        opening_balance: 33200000,
        closing_balance: 35800000,
        total_income: 17200000,
        total_expense: 14600000,
        net_change: 2600000,
        transaction_count: 44,
      },
      {
        year: 2026,
        month: 1,
        opening_balance: 35800000,
        closing_balance: 38900000,
        total_income: 16200000,
        total_expense: 13100000,
        net_change: 3100000,
        transaction_count: 40,
      },
      {
        year: 2026,
        month: 2,
        opening_balance: 38900000,
        closing_balance: 42300000,
        total_income: 16200000,
        total_expense: 12800000,
        net_change: 3400000,
        transaction_count: 42,
      },
      {
        year: 2026,
        month: 3,
        opening_balance: 42300000,
        closing_balance: 48500000,
        total_income: 18500000,
        total_expense: 12300000,
        net_change: 6200000,
        transaction_count: 45,
      },
    ];
  }

  // weekly
  if (aggregation === "weekly") {
    return Array.from({ length: 8 }, (_, i) => {
      const base = 40000000 + i * 1200000;
      return {
        year: 2026,
        month: i < 4 ? 2 : 3,
        week: (i % 4) + 1,
        opening_balance: base,
        closing_balance: base + 1200000,
        total_income: 4200000 + Math.round(Math.random() * 500000),
        total_expense: 3000000 + Math.round(Math.random() * 400000),
        net_change: 1200000,
        transaction_count: 10 + Math.floor(Math.random() * 5),
      };
    });
  }

  // daily
  return Array.from({ length: 14 }, (_, i) => {
    const day = i + 1;
    const base = 42300000 + i * 440000;
    return {
      year: 2026,
      month: 3,
      day,
      opening_balance: base,
      closing_balance: base + 440000,
      total_income: 1300000 + Math.round(Math.random() * 300000),
      total_expense: 860000 + Math.round(Math.random() * 200000),
      net_change: 440000,
      transaction_count: 3 + Math.floor(Math.random() * 3),
      date: `2026-03-${String(day).padStart(2, "0")}`,
    };
  });
}

export function getDummyTransactionCategories(
  categoryType: "expense" | "income",
): TransactionCategory[] {
  if (categoryType === "expense") {
    return [
      {
        category_id: "cat-001",
        category_name: "Food & Dining",
        category_type: "expense",
        total_amount: 3200000,
        total_transactions: 12,
      },
      {
        category_id: "cat-002",
        category_name: "Transportation",
        category_type: "expense",
        total_amount: 2100000,
        total_transactions: 8,
      },
      {
        category_id: "cat-003",
        category_name: "Shopping",
        category_type: "expense",
        total_amount: 1850000,
        total_transactions: 5,
      },
      {
        category_id: "cat-004",
        category_name: "Utilities",
        category_type: "expense",
        total_amount: 1500000,
        total_transactions: 4,
      },
      {
        category_id: "cat-005",
        category_name: "Entertainment",
        category_type: "expense",
        total_amount: 950000,
        total_transactions: 3,
      },
    ];
  }
  return [
    {
      category_id: "cat-006",
      category_name: "Salary",
      category_type: "income",
      total_amount: 12000000,
      total_transactions: 1,
    },
    {
      category_id: "cat-007",
      category_name: "Freelance",
      category_type: "income",
      total_amount: 4500000,
      total_transactions: 3,
    },
    {
      category_id: "cat-008",
      category_name: "Investment Returns",
      category_type: "income",
      total_amount: 2000000,
      total_transactions: 2,
    },
  ];
}

// ════════════════════════════════════════════
// CATEGORIES — FULL BREAKDOWN (MONEY FLOW)
// ════════════════════════════════════════════

export interface CategoryBreakdownItem {
  category_id: string;
  category_name: string;
  category_type: "income" | "expense";
  group_name: string;
  total_amount: number;
  total_transactions: number;
  percentage: number;
}

export function getDummyCategoryBreakdown(
  type: "income" | "expense",
): CategoryBreakdownItem[] {
  if (type === "expense") {
    const items = [
      { category_id: "cat-010", category_name: "Food & Beverage", group_name: "Daily Needs", total_amount: 3200000, total_transactions: 12 },
      { category_id: "cat-011", category_name: "Transportation", group_name: "Daily Needs", total_amount: 2100000, total_transactions: 8 },
      { category_id: "cat-014", category_name: "Shopping", group_name: "Lifestyle", total_amount: 1850000, total_transactions: 5 },
      { category_id: "cat-012", category_name: "Utilities", group_name: "Bills", total_amount: 1500000, total_transactions: 4 },
      { category_id: "cat-013", category_name: "Entertainment", group_name: "Lifestyle", total_amount: 950000, total_transactions: 3 },
      { category_id: "cat-015", category_name: "Health", group_name: "Essentials", total_amount: 850000, total_transactions: 2 },
      { category_id: "cat-016", category_name: "Education", group_name: "Self Development", total_amount: 650000, total_transactions: 2 },
      { category_id: "cat-017", category_name: "Insurance", group_name: "Bills", total_amount: 500000, total_transactions: 1 },
      { category_id: "cat-018", category_name: "Subscriptions", group_name: "Bills", total_amount: 350000, total_transactions: 3 },
      { category_id: "cat-019", category_name: "Gifts & Donations", group_name: "Social", total_amount: 200000, total_transactions: 1 },
      { category_id: "cat-021", category_name: "Personal Care", group_name: "Essentials", total_amount: 180000, total_transactions: 2 },
      { category_id: "cat-022", category_name: "Home & Living", group_name: "Essentials", total_amount: 420000, total_transactions: 3 },
    ];
    const total = items.reduce((s, i) => s + i.total_amount, 0);
    return items.map((i) => ({
      ...i,
      category_type: "expense" as const,
      percentage: total > 0 ? (i.total_amount / total) * 100 : 0,
    }));
  }

  const items = [
    { category_id: "cat-001", category_name: "Salary", group_name: "Employment", total_amount: 12500000, total_transactions: 1 },
    { category_id: "cat-002", category_name: "Freelance", group_name: "Employment", total_amount: 3500000, total_transactions: 2 },
    { category_id: "cat-003", category_name: "Investment Return", group_name: "Passive Income", total_amount: 750000, total_transactions: 1 },
    { category_id: "cat-004", category_name: "Side Business", group_name: "Business", total_amount: 1200000, total_transactions: 3 },
    { category_id: "cat-005", category_name: "Cashback & Rewards", group_name: "Passive Income", total_amount: 85000, total_transactions: 4 },
    { category_id: "cat-006", category_name: "Rental Income", group_name: "Passive Income", total_amount: 2000000, total_transactions: 1 },
    { category_id: "cat-007", category_name: "Bonus", group_name: "Employment", total_amount: 5000000, total_transactions: 1 },
  ];
  const total = items.reduce((s, i) => s + i.total_amount, 0);
  return items.map((i) => ({
    ...i,
    category_type: "income" as const,
    percentage: total > 0 ? (i.total_amount / total) * 100 : 0,
  }));
}

// ════════════════════════════════════════════
// BUDGET — MONTHLY GOAL & STREAK (MONEY FLOW)
// ════════════════════════════════════════════

export interface BudgetItem {
  id: string;
  scope: "overall" | "category";
  category_id?: string;
  category_name?: string;
  wallet_scope: "all" | string;
  wallet_name?: string;
  monthly_limit: number;
  current_spent: number;
  period: string; // "2026-03"
  streak_count: number;
  streak_active: boolean;
}

export function getDummyBudgets(): BudgetItem[] {
  return [
    {
      id: "bgt-001",
      scope: "overall",
      wallet_scope: "all",
      monthly_limit: 15000000,
      current_spent: 12750000,
      period: "2026-03",
      streak_count: 5,
      streak_active: true,
    },
    {
      id: "bgt-002",
      scope: "category",
      category_id: "cat-010",
      category_name: "Food & Beverage",
      wallet_scope: "all",
      monthly_limit: 3500000,
      current_spent: 3200000,
      period: "2026-03",
      streak_count: 3,
      streak_active: true,
    },
    {
      id: "bgt-003",
      scope: "category",
      category_id: "cat-011",
      category_name: "Transportation",
      wallet_scope: "all",
      monthly_limit: 2000000,
      current_spent: 2100000,
      period: "2026-03",
      streak_count: 0,
      streak_active: false,
    },
    {
      id: "bgt-004",
      scope: "category",
      category_id: "cat-013",
      category_name: "Entertainment",
      wallet_scope: "all",
      monthly_limit: 1000000,
      current_spent: 950000,
      period: "2026-03",
      streak_count: 7,
      streak_active: true,
    },
    {
      id: "bgt-005",
      scope: "category",
      category_id: "cat-014",
      category_name: "Shopping",
      wallet_scope: "w-001",
      wallet_name: "BCA Primary",
      monthly_limit: 2000000,
      current_spent: 1850000,
      period: "2026-03",
      streak_count: 2,
      streak_active: true,
    },
    {
      id: "bgt-006",
      scope: "category",
      category_id: "cat-012",
      category_name: "Utilities",
      wallet_scope: "all",
      monthly_limit: 1500000,
      current_spent: 1500000,
      period: "2026-03",
      streak_count: 1,
      streak_active: true,
    },
  ];
}

// ════════════════════════════════════════════
// SCHEDULED — SCHEDULED TRANSACTIONS (MONEY FLOW)
// ════════════════════════════════════════════

export interface ScheduledJobLog {
  id: string;
  executed_at: string;
  status: "success" | "failed";
  reason?: string;
}

export interface ScheduledJob {
  id: string;
  schedule_type: "once" | "repeat";
  job_type: "transaction" | "investment";
  description: string;
  amount: number;
  wallet_name?: string;
  category_name?: string;
  asset_code?: string;
  repeat_interval?: "daily" | "weekly" | "monthly";
  repeat_detail?: string;
  start_date: string;
  end_date: string | null;
  status: "active" | "paused" | "completed";
  next_execution: string | null;
  last_execution: string | null;
  created_at: string;
  execution_logs: ScheduledJobLog[];
}

export function getDummyScheduledJobs(): ScheduledJob[] {
  return [
    {
      id: "sj-001",
      schedule_type: "repeat",
      job_type: "transaction",
      description: "Monthly Salary Auto-Record",
      amount: 12500000,
      wallet_name: "BNI Payroll",
      category_name: "Salary",
      repeat_interval: "monthly",
      repeat_detail: "Every 1st",
      start_date: "2025-01-01T00:00:00Z",
      end_date: null,
      status: "active",
      next_execution: "2026-04-01T01:00:00+07:00",
      last_execution: "2026-03-01T01:00:00+07:00",
      created_at: "2025-01-01T00:00:00Z",
      execution_logs: [
        { id: "log-001", executed_at: "2026-03-01T01:00:00+07:00", status: "success" },
        { id: "log-002", executed_at: "2026-02-01T01:00:00+07:00", status: "success" },
        { id: "log-003", executed_at: "2026-01-01T01:00:00+07:00", status: "success" },
      ],
    },
    {
      id: "sj-002",
      schedule_type: "repeat",
      job_type: "transaction",
      description: "Weekly Grocery Budget",
      amount: 500000,
      wallet_name: "BCA Primary",
      category_name: "Food & Beverage",
      repeat_interval: "weekly",
      repeat_detail: "Every Monday",
      start_date: "2025-06-01T00:00:00Z",
      end_date: null,
      status: "active",
      next_execution: "2026-04-07T01:00:00+07:00",
      last_execution: "2026-03-31T01:00:00+07:00",
      created_at: "2025-06-01T00:00:00Z",
      execution_logs: [
        { id: "log-004", executed_at: "2026-03-31T01:00:00+07:00", status: "success" },
        { id: "log-005", executed_at: "2026-03-24T01:00:00+07:00", status: "success" },
        { id: "log-006", executed_at: "2026-03-17T01:00:00+07:00", status: "failed", reason: "Wallet balance insufficient" },
        { id: "log-007", executed_at: "2026-03-10T01:00:00+07:00", status: "success" },
      ],
    },
    {
      id: "sj-003",
      schedule_type: "repeat",
      job_type: "investment",
      description: "Monthly Bitcoin DCA",
      amount: 1000000,
      asset_code: "BTC",
      wallet_name: "BCA Primary",
      repeat_interval: "monthly",
      repeat_detail: "Every 15th",
      start_date: "2025-03-15T00:00:00Z",
      end_date: "2026-12-15T00:00:00Z",
      status: "active",
      next_execution: "2026-04-15T01:00:00+07:00",
      last_execution: "2026-03-15T01:00:00+07:00",
      created_at: "2025-03-15T00:00:00Z",
      execution_logs: [
        { id: "log-008", executed_at: "2026-03-15T01:00:00+07:00", status: "success" },
        { id: "log-009", executed_at: "2026-02-15T01:00:00+07:00", status: "success" },
        { id: "log-010", executed_at: "2026-01-15T01:00:00+07:00", status: "success" },
      ],
    },
    {
      id: "sj-004",
      schedule_type: "repeat",
      job_type: "transaction",
      description: "Internet Subscription",
      amount: 450000,
      wallet_name: "Mandiri Savings",
      category_name: "Utilities",
      repeat_interval: "monthly",
      repeat_detail: "Every 20th",
      start_date: "2025-01-20T00:00:00Z",
      end_date: null,
      status: "active",
      next_execution: "2026-04-20T01:00:00+07:00",
      last_execution: "2026-03-20T01:00:00+07:00",
      created_at: "2025-01-20T00:00:00Z",
      execution_logs: [
        { id: "log-011", executed_at: "2026-03-20T01:00:00+07:00", status: "success" },
        { id: "log-012", executed_at: "2026-02-20T01:00:00+07:00", status: "success" },
      ],
    },
    {
      id: "sj-005",
      schedule_type: "once",
      job_type: "transaction",
      description: "Annual Insurance Premium",
      amount: 6000000,
      wallet_name: "BCA Primary",
      category_name: "Insurance",
      start_date: "2026-06-01T00:00:00Z",
      end_date: "2026-06-01T00:00:00Z",
      status: "active",
      next_execution: "2026-06-01T01:00:00+07:00",
      last_execution: null,
      created_at: "2026-03-01T00:00:00Z",
      execution_logs: [],
    },
    {
      id: "sj-006",
      schedule_type: "repeat",
      job_type: "transaction",
      description: "Netflix Subscription",
      amount: 150000,
      wallet_name: "GoPay Daily",
      category_name: "Entertainment",
      repeat_interval: "monthly",
      repeat_detail: "Every 5th",
      start_date: "2024-06-05T00:00:00Z",
      end_date: null,
      status: "paused",
      next_execution: null,
      last_execution: "2026-02-05T01:00:00+07:00",
      created_at: "2024-06-05T00:00:00Z",
      execution_logs: [
        { id: "log-013", executed_at: "2026-02-05T01:00:00+07:00", status: "success" },
        { id: "log-014", executed_at: "2026-01-05T01:00:00+07:00", status: "success" },
      ],
    },
    {
      id: "sj-007",
      schedule_type: "repeat",
      job_type: "investment",
      description: "Monthly Gold Savings",
      amount: 2000000,
      asset_code: "XAU",
      wallet_name: "Mandiri Savings",
      repeat_interval: "monthly",
      repeat_detail: "Every 10th",
      start_date: "2025-01-10T00:00:00Z",
      end_date: "2025-12-10T00:00:00Z",
      status: "completed",
      next_execution: null,
      last_execution: "2025-12-10T01:00:00+07:00",
      created_at: "2025-01-10T00:00:00Z",
      execution_logs: [
        { id: "log-015", executed_at: "2025-12-10T01:00:00+07:00", status: "success" },
        { id: "log-016", executed_at: "2025-11-10T01:00:00+07:00", status: "success" },
        { id: "log-017", executed_at: "2025-10-10T01:00:00+07:00", status: "failed", reason: "API timeout" },
      ],
    },
    {
      id: "sj-008",
      schedule_type: "repeat",
      job_type: "transaction",
      description: "Daily Coffee Allowance",
      amount: 35000,
      wallet_name: "GoPay Daily",
      category_name: "Food & Beverage",
      repeat_interval: "daily",
      repeat_detail: "Every day",
      start_date: "2026-03-01T00:00:00Z",
      end_date: "2026-03-31T00:00:00Z",
      status: "completed",
      next_execution: null,
      last_execution: "2026-03-31T01:00:00+07:00",
      created_at: "2026-03-01T00:00:00Z",
      execution_logs: [
        { id: "log-018", executed_at: "2026-03-31T01:00:00+07:00", status: "success" },
        { id: "log-019", executed_at: "2026-03-30T01:00:00+07:00", status: "success" },
        { id: "log-020", executed_at: "2026-03-29T01:00:00+07:00", status: "success" },
      ],
    },
  ];
}

export function getDummyNetWorthComposition(): NetWorthComposition {
  const totalBalance = DUMMY_WALLETS.reduce((s, w) => s + w.balance, 0);
  const invSummary = getDummyInvestmentSummary();
  const total = totalBalance + invSummary.total_current_value;

  return {
    user_id: "user-001",
    total,
    slices: [
      {
        label: "Bank Accounts",
        amount: 42450000,
        percentage: (42450000 / total) * 100,
        details: {
          item_count: 3,
          description: "BCA, Mandiri, BNI",
        },
      },
      {
        label: "E-Wallets",
        amount: 5050000,
        percentage: (5050000 / total) * 100,
        details: {
          item_count: 3,
          description: "GoPay, OVO, DANA",
        },
      },
      {
        label: "Cash",
        amount: 1000000,
        percentage: (1000000 / total) * 100,
        details: {
          item_count: 1,
          description: "Cash on hand",
        },
      },
      {
        label: "Investments",
        amount: invSummary.total_current_value,
        percentage: (invSummary.total_current_value / total) * 100,
        details: {
          item_count: invSummary.total_investments,
          description: "Gold, Stocks, Crypto",
          unrealized_gain: invSummary.total_profit_loss,
        },
      },
    ],
  };
}
