import type {
  BudgetItem,
  CreateBudgetPayload,
  UpdateBudgetPayload,
} from "@/types/budget";
import type { ApiResponse, ApiError } from "./api";
import { BFF_BASE_URL } from "./const";

/** Fetch wrapper targeting the BFF */
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

// ════════════════════════════════════════════
// BUDGET API
// ════════════════════════════════════════════

/** GET /budgets — List all budgets for a specific period */
export async function fetchBudgets(token: string, period: string) {
  const query = new URLSearchParams();
  if (period) query.set("period", period);

  return bffCall<BudgetItem[]>(`/budgets?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** POST /budgets — Create a new budget */
export async function createBudget(
  token: string,
  payload: CreateBudgetPayload,
) {
  return bffCall<BudgetItem>("/budgets", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

/** PUT /budgets/:id — Update budget limit (resets streak to 0) */
export async function updateBudget(
  token: string,
  id: string,
  payload: UpdateBudgetPayload,
) {
  return bffCall<BudgetItem>(`/budgets/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

/** DELETE /budgets/:id — Delete a budget */
export async function deleteBudget(token: string, id: string) {
  return bffCall<{ message: string }>(`/budgets/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** POST /budgets/:id/reset — Reset budget (refresh current_spent) */
export async function resetBudget(token: string, id: string) {
  return bffCall<BudgetItem>(`/budgets/${id}/reset`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}
