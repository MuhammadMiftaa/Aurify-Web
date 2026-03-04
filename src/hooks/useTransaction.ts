import { useState, useEffect, useCallback, useRef } from "react";
import type {
  TransactionListResponse,
  TransactionListParams,
  Category,
} from "@/types/transaction";
import {
  fetchTransactions,
  fetchCategories,
} from "@/lib/wallet-transaction-api";
import { useAuth } from "@/contexts/AuthContext";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useTransactionList(params: TransactionListParams) {
  const { token } = useAuth();
  const [state, setState] = useState<AsyncState<TransactionListResponse>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchRef = useRef(0);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const refetch = useCallback(async () => {
    if (!token) return;

    const id = ++fetchRef.current;
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const result = await fetchTransactions(token, paramsRef.current);
      if (id === fetchRef.current) {
        setState({
          data: result.data as TransactionListResponse,
          loading: false,
          error: null,
        });
      }
    } catch (err: unknown) {
      if (id === fetchRef.current) {
        const message =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Failed to fetch transactions";
        setState({ data: null, loading: false, error: message });
      }
    }
  }, [token]);

  useEffect(() => {
    refetch();
  }, [
    params.page,
    params.page_size,
    params.sort_by,
    params.sort_order,
    params.search,
    params.wallet_id,
    params.category_id,
    params.category_type,
    params.date_from,
    params.date_to,
    refetch,
  ]);

  return { ...state, refetch };
}

export function useCategories() {
  const { token } = useAuth();
  const [state, setState] = useState<AsyncState<Category[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const result = await fetchCategories(token);
        setState({
          data: result.data as Category[],
          loading: false,
          error: null,
        });
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Failed to fetch categories";
        setState({ data: null, loading: false, error: message });
      }
    })();
  }, [token]);

  return state;
}
