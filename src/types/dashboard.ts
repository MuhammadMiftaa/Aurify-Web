// ── Dashboard API Types ──

export interface DateRange {
  start: string;
  end: string;
}

export interface DateOption {
  date?: string;
  year?: number;
  month?: number;
  day?: number;
  range?: DateRange;
}

// ── Wallet ──

export interface Wallet {
  wallet_id: string;
  user_id: string;
  wallet_name: string;
  wallet_type: string;
  wallet_type_name: string;
  balance?: number;
  currency: string;
  is_active: boolean;
}

// ── Financial Summary ──

export interface InvestmentSummary {
  total_invested: number;
  total_current_valuation?: number;
  total_sold_amount?: number;
  total_deficit?: number;
  unrealized_gain?: number;
  realized_gain?: number;
  investment_growth_pct: number;
  buy_count: number;
  sell_count?: number;
  active_positions: number;
}

export interface NetWorth {
  total: number;
  wallet_portion?: number;
  investment_portion?: number;
  net_worth_prev?: number;
  net_worth_growth_pct?: number;
}

export interface TopCategory {
  category_id: string;
  category_name: string;
  amount: number;
  percentage: number;
  transaction_count: number;
}

export interface FinancialSummary {
  user_id: string;
  period_type: string;
  period_key: string;
  period_start: string;
  period_end: string;

  income_now: number;
  expense_now: number;
  profit_now: number;
  balance_now: number;

  income_prev?: number;
  expense_prev?: number;
  profit_prev?: number;
  balance_prev?: number;

  income_growth_pct?: number;
  expense_growth_pct?: number;
  profit_growth_pct?: number;
  balance_growth_pct?: number;

  savings_rate: number;
  expense_to_income_ratio: number;
  burn_rate_daily: number;
  avg_income_daily?: number;
  avg_expense_daily?: number;
  runway_days?: number;

  total_transactions: number;
  income_transaction_count?: number;
  expense_transaction_count?: number;
  avg_transaction_amount?: number;
  largest_income?: number;
  largest_expense?: number;

  investment_summary?: InvestmentSummary;
  net_worth?: NetWorth;
  top_expense_categories?: TopCategory[];
  top_income_categories?: TopCategory[];
}

// ── Balance Snapshot ──

export interface BalanceSnapshot {
  year: number;
  month: number;
  day?: number;
  week?: number;
  wallet_id?: string;
  wallet_name?: string;
  opening_balance: number;
  closing_balance?: number;
  total_income?: number;
  total_expense?: number;
  net_change: number;
  transaction_count?: number;
  date?: string;
}

// ── Transaction Category ──

export interface TransactionCategory {
  category_id: string;
  category_name: string;
  category_type: "income" | "expense" | "fund_transfer";
  parent_category_name?: string;
  total_amount: number;
  total_transactions: number;
}

// ── Category Transaction (for transaction list modal) ──

export interface CategoryTransaction {
  id: string;
  description: string;
  amount: number;
  transaction_date: string;
}

// ── Net Worth Composition ──

export interface NetWorthSlice {
  label: string;
  amount: number;
  percentage: number;
  details?: {
    item_count: number;
    description: string;
    unrealized_gain?: number;
  };
}

export interface NetWorthComposition {
  user_id: string;
  total: number;
  slices: NetWorthSlice[];
}

// ── Category Breakdown (Money Flow) ──

export interface CategoryBreakdownItem {
  category_id: string;
  category_name: string;
  category_type: "income" | "expense";
  group_name: string;
  total_amount: number;
  total_transactions: number;
  percentage: number;
}
