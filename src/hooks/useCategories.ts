import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { fetchUserTransactions } from "@/lib/dashboard-api";
import { getDummyCategoryBreakdown } from "@/lib/dummy-data";
import type { CategoryBreakdownItem, DateRange } from "@/types/dashboard";

// ── Generic async state ──

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// ── Global filter state ──

export interface CategoriesFilter {
  walletID: string; // "" = all wallets
  range?: DateRange;
}

// ── Categories Hook ──
// Fetches all transaction categories and computes percentage for each category
// based on the total amount within the selected category type (income/expense).

export function useCategories(
  filter: CategoriesFilter,
  categoryType: "expense" | "income",
) {
  const { token } = useAuth();
  const { isDemo } = useDemo();
  const [state, setState] = useState<AsyncState<CategoryBreakdownItem[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchRef = useRef(0);

  const refetch = useCallback(() => {
    // Demo mode: use dummy data
    if (isDemo) {
      setState({
        data: getDummyCategoryBreakdown(categoryType),
        loading: false,
        error: null,
      });
      return;
    }

    // Live mode: fetch from API
    if (!token) return;

    const id = ++fetchRef.current;
    setState((s) => ({ ...s, loading: true, error: null }));

    const dateOption = filter.range
      ? { range: filter.range }
      : ({} as { range?: DateRange });

    fetchUserTransactions(token, {
      walletID: filter.walletID || undefined,
      dateOption,
    })
      .then((res) => {
        if (id !== fetchRef.current) return;

        // Client-side filter by category type (exclude fund_transfer)
        const filtered = (res.data ?? []).filter(
          (t) => t.category_type === categoryType,
        );

        // Calculate total amount for percentage computation
        const totalAmount = filtered.reduce(
          (sum, t) => sum + t.total_amount,
          0,
        );

        // Map to CategoryBreakdownItem with percentage
        const categories: CategoryBreakdownItem[] = filtered.map((t) => ({
          category_id: t.category_id,
          category_name: t.category_name,
          category_type: categoryType,
          group_name: t.parent_category_name ?? "",
          total_amount: t.total_amount,
          total_transactions: t.total_transactions,
          percentage:
            totalAmount > 0 ? (t.total_amount / totalAmount) * 100 : 0,
        }));

        setState({ data: categories, loading: false, error: null });
      })
      .catch((err) => {
        if (id === fetchRef.current)
          setState({ data: null, loading: false, error: err.message });
      });
  }, [token, filter.walletID, filter.range, categoryType, isDemo]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}
