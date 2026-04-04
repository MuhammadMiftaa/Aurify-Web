// ════════════════════════════════════════════
// BUDGET TYPES
// ════════════════════════════════════════════

export interface BudgetItem {
  id: string;
  scope: "overall" | "category";
  category_id?: string;
  category_name?: string;
  wallet_scope: string; // "all" for all wallets, or wallet_id for specific wallet
  wallet_id?: string;
  wallet_name?: string;
  monthly_limit: number;
  current_spent: number;
  period: string; // "YYYY-MM" format, e.g., "2026-03"
  streak_count: number;
  streak_active: boolean;
}

export interface CreateBudgetPayload {
  scope: "overall" | "category";
  category_id?: string;
  wallet_id?: string;
  monthly_limit: number;
  period: string;
}

export interface UpdateBudgetPayload {
  monthly_limit: number;
}

export interface BudgetListResponse {
  budgets: BudgetItem[];
}
