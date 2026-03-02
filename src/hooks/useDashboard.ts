import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchFinancialSummary,
  fetchUserBalance,
  fetchUserTransactions,
  fetchNetWorthComposition,
  fetchUserWallets,
} from "@/lib/dashboard-api";
import type {
  FinancialSummary,
  BalanceSnapshot,
  TransactionCategory,
  NetWorthComposition,
  Wallet,
  DateRange,
} from "@/types/dashboard";

// ── Generic async state ──

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// ── Global filter state ──

export interface GlobalFilter {
  walletID: string; // "" = all wallets
  range?: DateRange;
}

// ── Wallets Hook ──

export function useWallets() {
  const { token } = useAuth();
  const [state, setState] = useState<AsyncState<Wallet[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!token) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchUserWallets(token)
      .then((res) => setState({ data: res.data, loading: false, error: null }))
      .catch((err) =>
        setState({ data: null, loading: false, error: err.message }),
      );
  }, [token]);

  return state;
}

// ── Financial Summary Hook (shared by Tier 1, 3-col1, 3-col3, Tier 4 right) ──

export function useFinancialSummary(filter: GlobalFilter) {
  const { token } = useAuth();
  const [state, setState] = useState<AsyncState<FinancialSummary[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchRef = useRef(0);

  const refetch = useCallback(() => {
    if (!token) return;
    const id = ++fetchRef.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchFinancialSummary(token, {
      walletID: filter.walletID || undefined,
      range: filter.range,
    })
      .then((res) => {
        if (id === fetchRef.current)
          setState({ data: res.data, loading: false, error: null });
      })
      .catch((err) => {
        if (id === fetchRef.current)
          setState({ data: null, loading: false, error: err.message });
      });
  }, [token, filter.walletID, filter.range]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}

// ── Balance Hook (Tier 2) — has local aggregation filter ──

export function useBalance(
  filter: GlobalFilter,
  aggregation: "daily" | "weekly" | "monthly",
) {
  const { token } = useAuth();
  const [state, setState] = useState<AsyncState<BalanceSnapshot[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchRef = useRef(0);

  const refetch = useCallback(() => {
    if (!token) return;
    const id = ++fetchRef.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchUserBalance(token, {
      walletID: filter.walletID || undefined,
      aggregation,
      range: filter.range,
    })
      .then((res) => {
        if (id === fetchRef.current)
          setState({ data: res.data, loading: false, error: null });
      })
      .catch((err) => {
        if (id === fetchRef.current)
          setState({ data: null, loading: false, error: err.message });
      });
  }, [token, filter.walletID, filter.range, aggregation]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}

// ── Transactions Hook (Tier 3 col 2) — has local category type filter ──

export function useTransactions(
  filter: GlobalFilter,
  categoryType: "expense" | "income",
) {
  const { token } = useAuth();
  const [state, setState] = useState<AsyncState<TransactionCategory[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchRef = useRef(0);

  const refetch = useCallback(() => {
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
        setState({ data: filtered, loading: false, error: null });
      })
      .catch((err) => {
        if (id === fetchRef.current)
          setState({ data: null, loading: false, error: err.message });
      });
  }, [token, filter.walletID, filter.range, categoryType]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}

// ── Net Worth Composition Hook (Tier 4 left) ──

export function useNetWorthComposition() {
  const { token } = useAuth();
  const [state, setState] = useState<AsyncState<NetWorthComposition>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchRef = useRef(0);

  const refetch = useCallback(() => {
    if (!token) return;
    const id = ++fetchRef.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchNetWorthComposition(token)
      .then((res) => {
        if (id === fetchRef.current)
          setState({ data: res.data, loading: false, error: null });
      })
      .catch((err) => {
        if (id === fetchRef.current)
          setState({ data: null, loading: false, error: err.message });
      });
  }, [token]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}
