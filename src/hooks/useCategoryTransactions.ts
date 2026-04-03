import { useState, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { fetchCategoryTransactions } from "@/lib/dashboard-api";
import type { CategoryTransaction, DateRange } from "@/types/dashboard";

// ── Async state ──

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// ── Dummy data for demo mode ──

function getDummyCategoryTransactions(
  categoryName: string,
): CategoryTransaction[] {
  // Generate different data based on category name
  const baseData: Record<string, CategoryTransaction[]> = {
    Gaji: [
      {
        id: "tx-1",
        description: "Gaji Bulanan April",
        amount: 8000000,
        transaction_date: "2026-04-01",
      },
      {
        id: "tx-2",
        description: "Gaji Bulanan Maret",
        amount: 8000000,
        transaction_date: "2026-03-01",
      },
      {
        id: "tx-3",
        description: "Gaji Bulanan Februari",
        amount: 7500000,
        transaction_date: "2026-02-01",
      },
    ],
    Freelance: [
      {
        id: "tx-4",
        description: "Project Web Design",
        amount: 2500000,
        transaction_date: "2026-04-02",
      },
      {
        id: "tx-5",
        description: "Konsultasi IT",
        amount: 1500000,
        transaction_date: "2026-03-15",
      },
      {
        id: "tx-6",
        description: "Development API",
        amount: 3000000,
        transaction_date: "2026-03-10",
      },
    ],
    Makanan: [
      {
        id: "tx-7",
        description: "Warteg Sederhana",
        amount: 25000,
        transaction_date: "2026-04-03",
      },
      {
        id: "tx-8",
        description: "Makan Siang Kantor",
        amount: 45000,
        transaction_date: "2026-04-02",
      },
      {
        id: "tx-9",
        description: "Groceries Indomaret",
        amount: 150000,
        transaction_date: "2026-04-01",
      },
      {
        id: "tx-10",
        description: "Kopi & Snack",
        amount: 35000,
        transaction_date: "2026-03-31",
      },
      {
        id: "tx-11",
        description: "Dinner dengan Teman",
        amount: 120000,
        transaction_date: "2026-03-30",
      },
    ],
    Transportasi: [
      {
        id: "tx-12",
        description: "Grab ke Kantor",
        amount: 25000,
        transaction_date: "2026-04-03",
      },
      {
        id: "tx-13",
        description: "Isi Bensin Motor",
        amount: 50000,
        transaction_date: "2026-04-01",
      },
      {
        id: "tx-14",
        description: "Parkir Mall",
        amount: 5000,
        transaction_date: "2026-03-30",
      },
      {
        id: "tx-15",
        description: "TransJakarta",
        amount: 3500,
        transaction_date: "2026-03-29",
      },
    ],
  };

  // Return matching data or generate generic data
  if (baseData[categoryName]) {
    return baseData[categoryName];
  }

  // Generic fallback data
  return [
    {
      id: `tx-${Date.now()}-1`,
      description: `${categoryName} Transaction 1`,
      amount: 100000,
      transaction_date: "2026-04-03",
    },
    {
      id: `tx-${Date.now()}-2`,
      description: `${categoryName} Transaction 2`,
      amount: 75000,
      transaction_date: "2026-04-02",
    },
    {
      id: `tx-${Date.now()}-3`,
      description: `${categoryName} Transaction 3`,
      amount: 50000,
      transaction_date: "2026-04-01",
    },
  ];
}

// ── Category Transactions Hook ──
// Fetches transaction list for a specific category

export function useCategoryTransactions() {
  const { token } = useAuth();
  const { isDemo } = useDemo();
  const [state, setState] = useState<AsyncState<CategoryTransaction[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchRef = useRef(0);

  const fetch = useCallback(
    (
      categoryID: string,
      categoryName: string,
      walletID?: string,
      range?: DateRange,
    ) => {
      // Demo mode: use dummy data
      if (isDemo) {
        setState({
          data: getDummyCategoryTransactions(categoryName),
          loading: false,
          error: null,
        });
        return;
      }

      // Live mode: fetch from API
      if (!token) return;

      const id = ++fetchRef.current;
      setState((s) => ({ ...s, loading: true, error: null }));

      const dateOption = range ? { range } : ({} as { range?: DateRange });

      fetchCategoryTransactions(token, {
        walletID: walletID || undefined,
        categoryID,
        dateOption,
      })
        .then((res) => {
          if (id !== fetchRef.current) return;
          setState({ data: res.data ?? [], loading: false, error: null });
        })
        .catch((err) => {
          if (id === fetchRef.current)
            setState({ data: null, loading: false, error: err.message });
        });
    },
    [token, isDemo],
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, fetch, reset };
}
