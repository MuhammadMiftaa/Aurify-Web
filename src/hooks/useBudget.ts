import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import type {
  BudgetItem,
  CreateBudgetPayload,
  UpdateBudgetPayload,
} from "@/types/budget";
import {
  fetchBudgets,
  createBudget as createBudgetApi,
  updateBudget as updateBudgetApi,
  deleteBudget as deleteBudgetApi,
  resetBudget as resetBudgetApi,
} from "@/lib/budget-api";
import { getDummyBudgets } from "@/lib/dummy-data";
import { refreshCache } from "@/lib/cache-api";
import toast from "react-hot-toast";

// ── Generic async state ──

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// ════════════════════════════════════════════
// useBudgetList — Fetch budgets for a period
// ════════════════════════════════════════════

export function useBudgetList(period: string) {
  const { token } = useAuth();
  const { isDemo } = useDemo();
  const [state, setState] = useState<AsyncState<BudgetItem[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchRef = useRef(0);

  const refetch = useCallback(() => {
    // Demo mode: use dummy data
    if (isDemo) {
      setState({ data: getDummyBudgets(), loading: false, error: null });
      return;
    }

    // Live mode: fetch from API
    if (!token) return;

    const id = ++fetchRef.current;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetchBudgets(token, period)
      .then((res) => {
        if (id === fetchRef.current) {
          setState({ data: res.data, loading: false, error: null });
        }
      })
      .catch((err) => {
        if (id === fetchRef.current) {
          setState({ data: null, loading: false, error: err.message });
        }
      });
  }, [token, isDemo, period]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Refresh cache and refetch
  const refresh = useCallback(async () => {
    if (isDemo) {
      toast("Demo mode — data is read-only", { icon: "🔒" });
      return;
    }
    if (!token) return;

    try {
      await refreshCache("budget", token);
      refetch();
      toast.success("Budget data refreshed");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to refresh";
      toast.error(message);
    }
  }, [token, isDemo, refetch]);

  return { ...state, refetch, refresh };
}

// ════════════════════════════════════════════
// useBudgetMutations — CRUD operations
// ════════════════════════════════════════════

export function useBudgetMutations(onSuccess?: () => void) {
  const { token } = useAuth();
  const { isDemo } = useDemo();
  const [loading, setLoading] = useState(false);

  const createBudget = useCallback(
    async (payload: CreateBudgetPayload) => {
      if (isDemo) {
        toast("Demo mode — data is read-only", { icon: "🔒" });
        return null;
      }
      if (!token) {
        toast.error("Authentication required");
        return null;
      }

      setLoading(true);
      try {
        const res = await createBudgetApi(token, payload);
        toast.success("Budget created successfully");
        onSuccess?.();
        return res.data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create budget";
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, isDemo, onSuccess],
  );

  const updateBudget = useCallback(
    async (id: string, payload: UpdateBudgetPayload) => {
      if (isDemo) {
        toast("Demo mode — data is read-only", { icon: "🔒" });
        return null;
      }
      if (!token) {
        toast.error("Authentication required");
        return null;
      }

      setLoading(true);
      try {
        const res = await updateBudgetApi(token, id, payload);
        toast.success("Budget updated successfully");
        onSuccess?.();
        return res.data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update budget";
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, isDemo, onSuccess],
  );

  const deleteBudget = useCallback(
    async (id: string) => {
      if (isDemo) {
        toast("Demo mode — data is read-only", { icon: "🔒" });
        return false;
      }
      if (!token) {
        toast.error("Authentication required");
        return false;
      }

      setLoading(true);
      try {
        await deleteBudgetApi(token, id);
        toast.success("Budget deleted successfully");
        onSuccess?.();
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete budget";
        toast.error(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token, isDemo, onSuccess],
  );

  const resetBudget = useCallback(
    async (id: string) => {
      if (isDemo) {
        toast("Demo mode — data is read-only", { icon: "🔒" });
        return null;
      }
      if (!token) {
        toast.error("Authentication required");
        return null;
      }

      setLoading(true);
      try {
        const res = await resetBudgetApi(token, id);
        toast.success("Budget reset successfully");
        onSuccess?.();
        return res.data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to reset budget";
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, isDemo, onSuccess],
  );

  return {
    loading,
    createBudget,
    updateBudget,
    deleteBudget,
    resetBudget,
  };
}
