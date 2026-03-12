// ── Transaction Types ──

export interface CategoryItem {
  id: string;
  name: string;
}

export interface CategoryGroup {
  group_name: string;
  type: "income" | "expense" | "fund_transfer";
  categories: CategoryItem[];
}

/** Flat category (derived from CategoryGroup for easier use in select components) */
export interface Category {
  id: string;
  name: string;
  type: "income" | "expense" | "fund_transfer";
  group_name: string;
}

export interface Attachment {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  transaction_id: string;
  image: string | null;
  format: string | null;
  size: number | null;
}

export interface Transaction {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  wallet_id: string;
  category_id: string;
  amount: number;
  transaction_date: string;
  description: string | null;
  // Joined fields
  wallet_name?: string;
  category_name?: string;
  category_type?: "income" | "expense" | "fund_transfer";
  attachments?: Attachment[];
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  page_size: number;
  next_cursor: string;
  has_next: boolean;
  next_cursor_amount: number;
  next_cursor_date: string;
}

export interface TransactionListParams {
  page_size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  search?: string;
  wallet_id?: string;
  category_id?: string;
  category_type?: "income" | "expense" | "fund_transfer";
  date_from?: string;
  date_to?: string;
  cursor?: string;
  cursor_amount?: number;
  cursor_date?: string;
}

export interface CreateTransactionPayload {
  wallet_id: string;
  category_id: string;
  amount: number;
  transaction_date: string;
  description?: string;
  attachments?: string[]; // base64 encoded images
}

export interface UpdateTransactionPayload {
  wallet_id?: string;
  category_id?: string;
  amount?: number;
  transaction_date?: string;
  description?: string;
  attachment_actions?: UpdateAttachmentAction[];
}

export interface UpdateAttachmentAction {
  status: "create" | "delete";
  files: string[]; // base64 for "create", attachment IDs for "delete"
}

export interface CreateTransferPayload {
  from_wallet_id: string;
  to_wallet_id: string;
  amount: number;
  admin_fee: number;
  cash_out_category_id: string;
  cash_in_category_id: string;
  transaction_date: string;
  description?: string;
}

export interface CreateAttachmentPayload {
  transaction_id: string;
  image: string; // base64 encoded
  format: string;
  size: number;
}
