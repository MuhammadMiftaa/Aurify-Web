import { useState, useMemo, useEffect } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sun,
  Moon,
  ArrowDownCircle,
  ArrowUpCircle,
  PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/components/layout/MainLayout";
import { useTheme } from "@/contexts/ThemeContext";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getDummyCategoryBreakdown,
  DUMMY_DASHBOARD_WALLETS,
  type CategoryBreakdownItem,
} from "@/lib/dummy-data";

// ════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtShort(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString("id-ID");
}

// ════════════════════════════════════════════
// SKELETON
// ════════════════════════════════════════════

function CategoriesSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Toggle + summary skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-16" />
        </div>
      </div>
      {/* Table skeleton */}
      <div className="rounded-xl border border-(--border) bg-(--card) p-4">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="ml-auto h-4 w-20" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-1.5 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// SORT HEADER
// ════════════════════════════════════════════

function SortHeader({
  label,
  field,
  currentSort,
  currentOrder,
  onSort,
  className,
}: {
  label: string;
  field: string;
  currentSort: string;
  currentOrder: "asc" | "desc";
  onSort: (field: string) => void;
  className?: string;
}) {
  const isActive = currentSort === field;
  return (
    <button
      onClick={() => onSort(field)}
      className={cn(
        "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-(--muted-foreground) transition hover:text-(--foreground)",
        isActive && "text-gold-400",
        className,
      )}
    >
      {label}
      {isActive ? (
        currentOrder === "asc" ? (
          <ArrowUp size={12} />
        ) : (
          <ArrowDown size={12} />
        )
      ) : (
        <ArrowUpDown size={12} className="opacity-40" />
      )}
    </button>
  );
}

// ════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════

export function CategoriesPage() {
  const { theme, toggleTheme } = useTheme();

  // Simulate loading
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  // Filters
  const [categoryTab, setCategoryTab] = useState<"expense" | "income">(
    "expense",
  );
  const [walletFilter, setWalletFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Sorting
  const [sortBy, setSortBy] = useState("total_amount");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Data
  const allCategories = useMemo(
    () => getDummyCategoryBreakdown(categoryTab),
    [categoryTab],
  );

  // Sort
  const sorted = useMemo(() => {
    const data = [...allCategories];
    data.sort((a, b) => {
      const aVal =
        sortBy === "total_transactions"
          ? a.total_transactions
          : a.total_amount;
      const bVal =
        sortBy === "total_transactions"
          ? b.total_transactions
          : b.total_amount;
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });
    return data;
  }, [allCategories, sortBy, sortOrder]);

  // Summary
  const totalAmount = allCategories.reduce((s, c) => s + c.total_amount, 0);
  const totalTx = allCategories.reduce((s, c) => s + c.total_transactions, 0);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleTabChange = (tab: "expense" | "income") => {
    setCategoryTab(tab);
    setSortBy("total_amount");
    setSortOrder("desc");
  };

  const maxAmount = sorted.length > 0 ? sorted[0].total_amount : 1;

  return (
    <MainLayout>
      {/* ════════ HEADER ════════ */}
      <header className="sticky top-0 z-40 flex flex-col gap-3 border-b border-(--border) bg-(--card) px-4 py-3 sm:px-6 sm:py-3.5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between sm:inline">
          <div>
            <div className="text-sm font-bold tracking-wide text-(--foreground)">
              Categories
            </div>
            <div className="text-[10px] text-(--muted-foreground)">
              Complete breakdown of income & expense categories
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="flex sm:hidden h-8 w-8 items-center justify-center rounded-lg border border-(--border) text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground)"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select
            value={walletFilter}
            onChange={(e) => setWalletFilter(e.target.value)}
            className="min-w-0 w-full sm:w-auto rounded-lg border border-(--border) bg-(--input) px-2.5 py-1.5 text-xs text-(--foreground) outline-none focus:border-(--ring)"
          >
            <option value="">All Wallets</option>
            {DUMMY_DASHBOARD_WALLETS.map((w) => (
              <option key={w.wallet_id} value={w.wallet_id}>
                {w.wallet_name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 sm:gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((p) => ({ ...p, start: e.target.value }))
              }
              className="w-[7.5rem] rounded-lg border border-(--border) bg-(--input) px-2 py-1.5 text-xs text-(--foreground) outline-none focus:border-(--ring)"
            />
            <span className="text-xs text-(--muted-foreground)">→</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((p) => ({ ...p, end: e.target.value }))
              }
              className="w-[7.5rem] rounded-lg border border-(--border) bg-(--input) px-2 py-1.5 text-xs text-(--foreground) outline-none focus:border-(--ring)"
            />
          </div>

          <button
            onClick={toggleTheme}
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg border border-(--border) text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground)"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </header>

      {/* ════════ CONTENT ════════ */}
      <main className="mx-auto flex max-w-350 flex-col gap-4 p-3 sm:p-5">
        {loading ? (
          <CategoriesSkeleton />
        ) : sorted.length === 0 ? (
          <EmptyState
            illustration="chart"
            title="No categories found"
            description="Transaction categories will appear here once you start recording transactions."
            size="lg"
            icon={<PieChart size={40} />}
          />
        ) : (
          <>
            {/* Toggle + Summary */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-1">
                {(["expense", "income"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleTabChange(t)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-3 sm:px-4 py-2 text-xs font-semibold capitalize transition",
                      categoryTab === t
                        ? t === "expense"
                          ? "border-rose-500/40 bg-rose-500/10 text-rose-500"
                          : "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                        : "border-(--border) text-(--muted-foreground) hover:text-(--foreground)",
                    )}
                  >
                    {t === "expense" ? (
                      <ArrowUpCircle size={14} />
                    ) : (
                      <ArrowDownCircle size={14} />
                    )}
                    <span className="hidden sm:inline">{t}</span>
                    <span className="sm:hidden">{t.charAt(0).toUpperCase() + t.slice(1, 3)}.</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-(--muted-foreground)">
                    Total
                  </div>
                  <div
                    className={cn(
                      "font-mono text-xs sm:text-sm font-bold",
                      categoryTab === "expense"
                        ? "text-rose-500"
                        : "text-emerald-500",
                    )}
                  >
                    {fmtCurrency(totalAmount)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-(--muted-foreground)">
                    Cat.
                  </div>
                  <div className="font-mono text-xs sm:text-sm font-bold text-(--foreground)">
                    {allCategories.length}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-(--muted-foreground)">
                    Txns
                  </div>
                  <div className="font-mono text-xs sm:text-sm font-bold text-(--foreground)">
                    {totalTx}
                  </div>
                </div>
              </div>
            </div>

            {/* Table (Desktop) */}
            <div className="hidden md:block rounded-xl border border-(--border) bg-(--card) overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-(--border) bg-(--secondary)/30">
                    <th className="px-4 py-3 text-left">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-(--muted-foreground)">
                        Category
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-(--muted-foreground)">
                        Group
                      </span>
                    </th>
                    <th className="px-4 py-3">
                      <SortHeader
                        label="Amount"
                        field="total_amount"
                        currentSort={sortBy}
                        currentOrder={sortOrder}
                        onSort={handleSort}
                        className="justify-end"
                      />
                    </th>
                    <th className="px-4 py-3">
                      <SortHeader
                        label="Txns"
                        field="total_transactions"
                        currentSort={sortBy}
                        currentOrder={sortOrder}
                        onSort={handleSort}
                        className="justify-center"
                      />
                    </th>
                    <th className="px-4 py-3">
                      <span className="flex justify-center text-[11px] font-semibold uppercase tracking-wider text-(--muted-foreground)">
                        Share
                      </span>
                    </th>
                    <th className="px-4 py-3 w-36">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-(--muted-foreground)">
                        Distribution
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((cat) => {
                    const barColor =
                      categoryTab === "expense" ? "#f43f5e" : "#10b981";
                    const pct =
                      maxAmount > 0
                        ? (cat.total_amount / maxAmount) * 100
                        : 0;
                    return (
                      <tr
                        key={cat.category_id}
                        className="border-b border-(--border) last:border-0 transition hover:bg-(--muted)/30"
                      >
                        <td className="px-4 py-3 text-xs font-semibold text-(--foreground)">
                          {cat.category_name}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md border border-(--border) bg-(--secondary)/30 px-2 py-0.5 text-[10px] font-medium text-(--muted-foreground)">
                            {cat.group_name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "font-mono text-xs font-semibold",
                              categoryTab === "expense"
                                ? "text-rose-500"
                                : "text-emerald-500",
                            )}
                          >
                            {fmtCurrency(cat.total_amount)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-(--foreground)">
                            {cat.total_transactions}x
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs text-(--muted-foreground)">
                            {cat.percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-1.5 overflow-hidden rounded-full bg-(--muted)">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                background: barColor,
                                opacity: 0.7,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Cards (Mobile) */}
            <div className="flex flex-col gap-2 md:hidden">
              {sorted.map((cat) => (
                <CategoryCard
                  key={cat.category_id}
                  category={cat}
                  type={categoryTab}
                  maxAmount={maxAmount}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </MainLayout>
  );
}

// ════════════════════════════════════════════
// CARD (Mobile)
// ════════════════════════════════════════════

function CategoryCard({
  category,
  type,
  maxAmount,
}: {
  category: CategoryBreakdownItem;
  type: "expense" | "income";
  maxAmount: number;
}) {
  const barColor = type === "expense" ? "#f43f5e" : "#10b981";
  const pct = maxAmount > 0 ? (category.total_amount / maxAmount) * 100 : 0;

  return (
    <div className="rounded-xl border border-(--border) bg-(--card) p-3.5 transition hover:border-gold-400/20">
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-(--foreground) truncate">
            {category.category_name}
          </div>
          <span className="text-[10px] text-(--muted-foreground)">
            {category.group_name}
          </span>
        </div>
        <div className="text-right shrink-0 ml-2">
          <span
            className={cn(
              "font-mono text-sm font-bold",
              type === "expense" ? "text-rose-500" : "text-emerald-500",
            )}
          >
            {fmtShort(category.total_amount)}
          </span>
          <div className="text-[10px] text-(--muted-foreground)">
            {category.total_transactions}x · {category.percentage.toFixed(1)}%
          </div>
        </div>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-(--muted)">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor, opacity: 0.7 }}
        />
      </div>
    </div>
  );
}
