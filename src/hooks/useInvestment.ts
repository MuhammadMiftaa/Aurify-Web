import { useState, useEffect, useCallback, useRef } from "react";
import type {
  InvestmentListResponse,
  InvestmentListParams,
  InvestmentSummary,
  AssetCode,
} from "@/types/investment";
import { fetchInvestments, fetchAssetCodes } from "@/lib/investment-api";
import { fetchFinancialSummary } from "@/lib/dashboard-api";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import {
  getDummyInvestmentList,
  getDummyInvestmentSummary,
  DUMMY_ASSET_CODES,
} from "@/lib/dummy-data";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useInvestmentList(params: InvestmentListParams) {
  const { token } = useAuth();
  const { isDemo } = useDemo();
  const [state, setState] = useState<AsyncState<InvestmentListResponse>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchRef = useRef(0);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const refetch = useCallback(async () => {
    if (isDemo) {
      const data = getDummyInvestmentList(paramsRef.current);
      setState({ data, loading: false, error: null });
      return;
    }
    if (!token) return;

    const id = ++fetchRef.current;
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const result = await fetchInvestments(token, paramsRef.current);
      if (id === fetchRef.current) {
        setState({
          data: result.data as InvestmentListResponse,
          loading: false,
          error: null,
        });
      }
    } catch (err: unknown) {
      if (id === fetchRef.current) {
        const message =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Failed to fetch investments";
        setState({ data: null, loading: false, error: message });
      }
    }
  }, [token, isDemo]);

  useEffect(() => {
    refetch();
  }, [
    params.page,
    params.page_size,
    params.sort_by,
    params.sort_order,
    params.search,
    params.code,
    refetch,
  ]);

  return { ...state, refetch };
}

export function useInvestmentSummary() {
  const { token } = useAuth();
  const { isDemo } = useDemo();
  const [state, setState] = useState<AsyncState<InvestmentSummary>>({
    data: null,
    loading: true,
    error: null,
  });

  const refetch = useCallback(async () => {
    if (isDemo) {
      setState({
        data: getDummyInvestmentSummary(),
        loading: false,
        error: null,
      });
      return;
    }
    if (!token) return;

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const result = await fetchFinancialSummary(token, {});
      const summaries = result.data;
      // Take the latest period's investment_summary
      const latest =
        Array.isArray(summaries) && summaries.length > 0
          ? summaries[summaries.length - 1]
          : null;
      const inv = latest?.investment_summary;

      if (inv) {
        const mapped: InvestmentSummary = {
          total_investments: inv.active_positions + (inv.sell_count ?? 0),
          total_invested: inv.total_invested,
          total_current_value: inv.total_current_valuation ?? 0,
          total_profit_loss: inv.unrealized_gain ?? 0,
          total_profit_loss_pct: inv.investment_growth_pct,
          total_sold_amount: inv.total_sold_amount ?? 0,
          total_realized_gain: inv.realized_gain ?? 0,
        };
        setState({ data: mapped, loading: false, error: null });
      } else {
        setState({
          data: {
            total_investments: 0,
            total_invested: 0,
            total_current_value: 0,
            total_profit_loss: 0,
            total_profit_loss_pct: 0,
            total_sold_amount: 0,
            total_realized_gain: 0,
          },
          loading: false,
          error: null,
        });
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to fetch investment summary";
      setState({ data: null, loading: false, error: message });
    }
  }, [token, isDemo]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}

export function useAssetCodes() {
  const { token } = useAuth();
  const { isDemo } = useDemo();
  const [state, setState] = useState<AsyncState<AssetCode[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (isDemo) {
      setState({ data: DUMMY_ASSET_CODES, loading: false, error: null });
      return;
    }
    if (!token) return;

    (async () => {
      try {
        const result = await fetchAssetCodes(token);
        const data = result.data as { asset_codes: AssetCode[] };
        setState({
          data: data.asset_codes ?? [],
          loading: false,
          error: null,
        });
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Failed to fetch asset codes";
        setState({ data: null, loading: false, error: message });
      }
    })();
  }, [token, isDemo]);

  return state;
}
