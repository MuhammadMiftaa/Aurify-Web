// ── Investment Types ──

export interface AssetCode {
  code: string;
  name: string;
  unit: string | null;
  toUSD: number | null;
  toEUR: number | null;
  toIDR: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Investment {
  id: string;
  user_id: string;
  code: string;
  quantity: number;
  amount: number;
  initial_valuation: number;
  date: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // Joined
  asset?: AssetCode;
  sold_records?: InvestmentSold[];
}

export interface InvestmentSold {
  id: string;
  investment_id: string;
  user_id: string;
  quantity: number | null;
  amount: number;
  sell_price: number | null;
  deficit: number | null;
  date: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface InvestmentSummary {
  total_investments: number;
  total_invested: number;
  total_current_value: number;
  total_profit_loss: number;
  total_profit_loss_pct: number;
  total_sold_amount: number;
  total_realized_gain: number;
}

export interface CreateInvestmentPayload {
  code: string;
  quantity: number;
  amount: number;
  date: string;
  description?: string;
  wallet_id: string;
}

export interface SellInvestmentPayload {
  asset_code: string;
  quantity: number;
  amount: number;
  date: string;
  description?: string;
  wallet_id: string;
}

export interface InvestmentListParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  search?: string;
  code?: string;
}

export interface InvestmentListResponse {
  investments: Investment[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
