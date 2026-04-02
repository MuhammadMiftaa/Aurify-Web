import { useState, useMemo, useEffect } from "react";
import {
  Sun,
  Moon,
  Plus,
  RotateCcw,
  Trash2,
  Flame,
  X,
  Target,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/components/layout/MainLayout";
import { useTheme } from "@/contexts/ThemeContext";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getDummyBudgets,
  getDummyCategoryBreakdown,
  type BudgetItem,
} from "@/lib/dummy-data";
import toast from "react-hot-toast";

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
  if (n >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `Rp${(n / 1_000).toFixed(0)}K`;
  return `Rp${n.toLocaleString("id-ID")}`;
}

function getMonthLabel(period: string): string {
  const [year, month] = period.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ════════════════════════════════════════════
// GREEN FIRE SVG
// ════════════════════════════════════════════

function GreenFire({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M12 2C12 2 4.5 10 4.5 14.5C4.5 18.64 7.86 22 12 22C16.14 22 19.5 18.64 19.5 14.5C19.5 10 12 2 12 2Z"
        fill="url(#gf1)"
        opacity="0.8"
      />
      <path
        d="M12 6C12 6 7.5 12 7.5 15C7.5 17.49 9.51 19.5 12 19.5C14.49 19.5 16.5 17.49 16.5 15C16.5 12 12 6 12 6Z"
        fill="url(#gf2)"
      />
      <path
        d="M12 10C12 10 9.5 13.5 9.5 15.5C9.5 16.88 10.62 18 12 18C13.38 18 14.5 16.88 14.5 15.5C14.5 13.5 12 10 12 10Z"
        fill="url(#gf3)"
      />
      <defs>
        <linearGradient id="gf1" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4ade80" stopOpacity="0.6" />
          <stop offset="1" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id="gf2" x1="12" y1="6" x2="12" y2="19.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#86efac" />
          <stop offset="1" stopColor="#4ade80" />
        </linearGradient>
        <linearGradient id="gf3" x1="12" y1="10" x2="12" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#bbf7d0" />
          <stop offset="1" stopColor="#86efac" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ════════════════════════════════════════════
// MODAL WRAPPER
// ════════════════════════════════════════════

function Modal({
  open,
  title,
  onClose,
  children,
  maxWidth = "max-w-sm",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full overflow-hidden rounded-2xl border border-(--border) bg-(--card)",
          maxWidth,
        )}
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow:
            "0 0 40px rgba(218,165,32,0.1), 0 25px 50px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-center justify-between border-b border-(--border) px-5 py-3">
          <h3 className="text-sm font-bold text-(--foreground)">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-(--muted-foreground) transition hover:text-(--foreground)"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// SET BUDGET FORM
// ════════════════════════════════════════════

function SetBudgetForm({
  onClose,
  categoryName,
}: {
  onClose: () => void;
  categoryName?: string;
}) {
  const [amount, setAmount] = useState("");
  const categories = getDummyCategoryBreakdown("expense");
  const [selectedCategory, setSelectedCategory] = useState(categoryName || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Demo mode — data is read-only", { icon: "🔒" });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {!categoryName && (
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-(--foreground) opacity-80">
            Scope
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-lg border border-(--border) bg-(--input) px-3 py-2 text-xs text-(--foreground) outline-none focus:border-(--ring)"
          >
            <option value="">Overall Budget</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_name}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-(--foreground) opacity-80">
          Monthly Limit (IDR)
        </label>
        <input
          type="number"
          placeholder="e.g. 5000000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-lg border border-(--border) bg-(--input) px-3 py-2 text-xs text-(--foreground) outline-none focus:border-(--ring)"
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-(--foreground) opacity-80">
          Period
        </label>
        <input
          type="month"
          defaultValue="2026-03"
          className="w-full rounded-lg border border-(--border) bg-(--input) px-3 py-2 text-xs text-(--foreground) outline-none focus:border-(--ring)"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-(--border) px-3 py-2 text-xs font-medium text-(--muted-foreground) transition hover:text-(--foreground)"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 rounded-lg bg-gold-btn px-3 py-2 text-xs font-semibold text-dark transition hover:opacity-90"
        >
          Save Budget
        </button>
      </div>
    </form>
  );
}

// ════════════════════════════════════════════
// CONFIRM DIALOG
// ════════════════════════════════════════════

function ConfirmDialog({
  message,
  confirmLabel,
  variant,
  onClose,
}: {
  message: string;
  confirmLabel: string;
  variant: "danger" | "warning";
  onClose: () => void;
}) {
  const handleConfirm = () => {
    toast("Demo mode — data is read-only", { icon: "🔒" });
  };

  return (
    <div className="flex flex-col gap-4 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-(--muted) text-xl">
        {variant === "danger" ? "🗑️" : "⚠️"}
      </div>
      <p className="text-xs text-(--muted-foreground)">{message}</p>
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 rounded-lg border border-(--border) px-3 py-2 text-xs font-medium text-(--muted-foreground) transition hover:text-(--foreground)"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className={cn(
            "flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition",
            variant === "danger"
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30"
              : "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30",
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// SKELETON
// ════════════════════════════════════════════

function BudgetSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
        <div className="lg:col-span-7 lg:row-start-1 row-start-2 rounded-xl border border-(--border) bg-(--card) p-5">
          <div className="flex justify-between mb-4">
            <div>
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <div className="lg:col-span-3 row-start-1">
          <div className="rounded-xl border border-(--border) bg-(--card) p-5 flex flex-col items-center justify-center min-h-[180px]">
            <Skeleton className="h-12 w-12 rounded-full mb-3" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-(--border) bg-(--card) p-4">
            <div className="flex justify-between mb-3">
              <div>
                <Skeleton className="h-3 w-24 mb-1" />
                <Skeleton className="h-2 w-16" />
              </div>
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="h-2.5 w-full mb-2" />
            <div className="flex justify-between">
              <Skeleton className="h-2 w-20" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// PROGRESS BAR
// ════════════════════════════════════════════

function BudgetProgressBar({
  spent,
  limit,
  overBudget,
  height = "h-2.5",
}: {
  spent: number;
  limit: number;
  overBudget: boolean;
  height?: string;
}) {
  const pct = Math.min((spent / limit) * 100, 100);
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-(--muted)",
        height,
      )}
    >
      <div
        className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
        style={{
          width: `${pct}%`,
          background: overBudget
            ? "linear-gradient(90deg, #f43f5e, #ef4444)"
            : pct > 90
              ? "linear-gradient(90deg, #daa520, #f59e0b)"
              : "linear-gradient(90deg, #daa520, #ffd700)",
        }}
      />
    </div>
  );
}

// ════════════════════════════════════════════
// STREAK PANEL
// ════════════════════════════════════════════

function StreakPanel({ budget }: { budget: BudgetItem }) {
  if (!budget.streak_active || budget.streak_count === 0) {
    return (
      <div className="rounded-xl border border-(--border) bg-(--card) p-5 flex flex-col items-center justify-center text-center h-full min-h-[180px]">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--muted) text-2xl mb-3">
          💤
        </div>
        <div className="text-xs font-semibold text-(--muted-foreground) mb-1">
          No active streak
        </div>
        <div className="text-[10px] text-(--muted-foreground) max-w-[200px]">
          Stay under budget this month to start building your streak!
        </div>
      </div>
    );
  }

  return (
    <div className="streak-active rounded-xl border-2 bg-(--card) p-5 relative overflow-hidden flex flex-col items-center justify-center text-center h-full min-h-[180px]">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(134,239,172,1) 0%, transparent 70%)",
        }}
      />
      <div className="relative flex flex-col items-center">
        <div className="mb-2 streak-fire-icon">
          <GreenFire size={48} />
        </div>
        <div className="font-mono text-4xl font-bold text-emerald-400 mb-1">
          {budget.streak_count}
        </div>
        <div className="text-sm font-semibold text-emerald-400/80 mb-2">
          {budget.streak_count === 1 ? "month" : "months"} streak!
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 mb-2">
          <Flame size={12} className="text-emerald-400" />
          <span className="text-[11px] font-semibold text-emerald-400">
            On Track
          </span>
        </div>
        <div className="text-[10px] text-(--muted-foreground) max-w-[200px]">
          Under budget for {budget.streak_count} consecutive months
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// BUDGET CATEGORY CARD (with action buttons)
// ════════════════════════════════════════════

function BudgetCategoryCard({
  budget,
  onSetBudget,
  onResetBudget,
  onDeleteBudget,
}: {
  budget: BudgetItem;
  onSetBudget: (name: string) => void;
  onResetBudget: (name: string) => void;
  onDeleteBudget: (name: string) => void;
}) {
  const spent = budget.current_spent;
  const limit = budget.monthly_limit;
  const remaining = limit - spent;
  const overBudget = spent > limit;
  const pct = (spent / limit) * 100;

  return (
    <div
      className={cn(
        "rounded-xl border bg-(--card) p-3.5 sm:p-4 transition hover:border-gold-400/20",
        overBudget ? "border-rose-500/30" : "border-(--border)",
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-(--foreground) truncate">
            {budget.category_name}
          </div>
          <div className="text-[10px] text-(--muted-foreground)">
            {budget.wallet_scope === "all"
              ? "All Wallets"
              : budget.wallet_name}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {budget.streak_count > 0 && budget.streak_active && (
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              <Flame size={10} /> {budget.streak_count}
            </span>
          )}
          {overBudget && (
            <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-500">
              Over
            </span>
          )}
        </div>
      </div>

      <BudgetProgressBar spent={spent} limit={limit} overBudget={overBudget} />

      <div className="mt-2 flex items-center justify-between">
        <div className="text-[10px] text-(--muted-foreground)">
          <span
            className={cn(
              "font-mono font-semibold",
              overBudget ? "text-rose-500" : "text-(--foreground)",
            )}
          >
            {fmtShort(spent)}
          </span>{" "}
          / {fmtShort(limit)}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[10px] font-semibold",
              overBudget ? "text-rose-500" : "text-(--muted-foreground)",
            )}
          >
            {pct.toFixed(0)}%
          </span>
          <span
            className={cn(
              "text-[10px]",
              overBudget ? "text-rose-400" : "text-emerald-400",
            )}
          >
            {overBudget
              ? `${fmtShort(Math.abs(remaining))} over`
              : `${fmtShort(remaining)} left`}
          </span>
        </div>
      </div>

      {/* Per-category action buttons */}
      <div className="flex gap-1.5 mt-3 pt-3 border-t border-(--border)">
        <button
          onClick={() => onSetBudget(budget.category_name || "")}
          className="flex items-center gap-1 rounded-lg border border-(--border) px-2 py-1 text-[10px] font-medium text-(--muted-foreground) transition hover:text-(--foreground) hover:border-(--ring)"
        >
          <Pencil size={10} /> Edit
        </button>
        <button
          onClick={() => onResetBudget(budget.category_name || "")}
          className="flex items-center gap-1 rounded-lg border border-(--border) px-2 py-1 text-[10px] font-medium text-(--muted-foreground) transition hover:text-(--foreground) hover:border-(--ring)"
        >
          <RotateCcw size={10} /> Reset
        </button>
        <button
          onClick={() => onDeleteBudget(budget.category_name || "")}
          className="flex items-center gap-1 rounded-lg border border-rose-500/30 px-2 py-1 text-[10px] font-medium text-rose-400/80 transition hover:text-rose-400 hover:bg-rose-500/10"
        >
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════

type ModalState =
  | { type: "none" }
  | { type: "set-budget"; categoryName?: string }
  | { type: "reset-budget"; name: string }
  | { type: "delete-budget"; name: string };

export function BudgetPage() {
  const { theme, toggleTheme } = useTheme();
  const [selectedPeriod] = useState("2026-03");
  const [modal, setModal] = useState<ModalState>({ type: "none" });

  // Simulate loading
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const budgets = useMemo(() => getDummyBudgets(), []);
  const overallBudget = budgets.find((b) => b.scope === "overall");
  const categoryBudgets = budgets.filter((b) => b.scope === "category");

  const closeModal = () => setModal({ type: "none" });

  return (
    <MainLayout>
      {/* ════════ MODALS ════════ */}
      <Modal
        open={modal.type === "set-budget"}
        title={
          modal.type === "set-budget" && modal.categoryName
            ? `Edit Budget: ${modal.categoryName}`
            : "Set Budget"
        }
        onClose={closeModal}
      >
        <SetBudgetForm
          onClose={closeModal}
          categoryName={
            modal.type === "set-budget" ? modal.categoryName : undefined
          }
        />
      </Modal>

      <Modal
        open={modal.type === "reset-budget"}
        title="Reset Budget"
        onClose={closeModal}
      >
        <ConfirmDialog
          message={`Are you sure you want to reset the budget for "${modal.type === "reset-budget" ? modal.name : ""}"? This will clear the current spending progress.`}
          confirmLabel="Reset"
          variant="warning"
          onClose={closeModal}
        />
      </Modal>

      <Modal
        open={modal.type === "delete-budget"}
        title="Delete Budget"
        onClose={closeModal}
      >
        <ConfirmDialog
          message={`Are you sure you want to delete the budget for "${modal.type === "delete-budget" ? modal.name : ""}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onClose={closeModal}
        />
      </Modal>

      {/* ════════ HEADER ════════ */}
      <header className="sticky top-0 z-40 flex flex-col gap-3 border-b border-(--border) bg-(--card) px-4 py-3 sm:px-6 sm:py-3.5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between sm:inline">
          <div>
            <div className="text-sm font-bold tracking-wide text-(--foreground)">
              Budget
            </div>
            <div className="text-[10px] text-(--muted-foreground)">
              Monthly spending goals & streak tracking
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="flex sm:hidden h-8 w-8 items-center justify-center rounded-lg border border-(--border) text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground)"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="rounded-lg border border-(--border) bg-(--input) px-3 py-1.5 text-xs font-medium text-(--foreground)">
            {getMonthLabel(selectedPeriod)}
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
          <BudgetSkeleton />
        ) : budgets.length === 0 ? (
          <EmptyState
            illustration="empty"
            title="No budgets set"
            description="Set your first monthly budget to start tracking spending goals."
            size="lg"
            icon={<Target size={40} />}
            action={
              <button
                onClick={() => setModal({ type: "set-budget" })}
                className="flex items-center gap-1.5 rounded-lg bg-gold-btn px-4 py-2 text-xs font-semibold text-dark transition hover:opacity-90"
              >
                <Plus size={14} /> Set First Budget
              </button>
            }
          />
        ) : (
          <>
            {/* Overall + Streak (7:3) */}
            {overallBudget && (
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-3 sm:gap-4">
                {/* Left: Overall Budget */}
                <div className="lg:col-span-7 lg:row-start-1 row-start-2 rounded-xl border border-(--border) bg-(--card) p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2 sm:gap-3">
                    <div>
                      <div className="text-[13px] font-bold tracking-wide text-(--foreground)">
                        Overall Monthly Budget
                      </div>
                      <div className="text-[10px] text-(--muted-foreground)">
                        {getMonthLabel(overallBudget.period)} · All Wallets
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setModal({ type: "set-budget" })}
                        className="flex items-center gap-1 rounded-lg border border-(--border) px-2 py-1.5 text-[11px] font-medium text-(--muted-foreground) transition hover:text-(--foreground) hover:border-(--ring)"
                      >
                        <Pencil size={11} /> Edit
                      </button>
                      <button
                        onClick={() =>
                          setModal({
                            type: "reset-budget",
                            name: "Overall Budget",
                          })
                        }
                        className="flex items-center gap-1 rounded-lg border border-(--border) px-2 py-1.5 text-[11px] font-medium text-(--muted-foreground) transition hover:text-(--foreground) hover:border-(--ring)"
                      >
                        <RotateCcw size={11} /> Reset
                      </button>
                      <button
                        onClick={() =>
                          setModal({
                            type: "delete-budget",
                            name: "Overall Budget",
                          })
                        }
                        className="flex items-center gap-1 rounded-lg border border-rose-500/30 px-2 py-1.5 text-[11px] font-medium text-rose-400/80 transition hover:text-rose-400 hover:bg-rose-500/10"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-end gap-2 sm:gap-3 mb-4">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-(--muted-foreground)">
                        Spent
                      </div>
                      <div
                        className={cn(
                          "font-mono text-lg sm:text-2xl font-bold",
                          overallBudget.current_spent >
                            overallBudget.monthly_limit
                            ? "text-rose-500"
                            : "text-(--foreground)",
                        )}
                      >
                        {fmtCurrency(overallBudget.current_spent)}
                      </div>
                    </div>
                    <div className="text-[11px] text-(--muted-foreground) pb-0.5 sm:pb-1">
                      of {fmtCurrency(overallBudget.monthly_limit)}
                    </div>
                    <div className="ml-auto text-right pb-0.5 sm:pb-1">
                      <span
                        className={cn(
                          "font-mono text-base sm:text-lg font-bold",
                          overallBudget.current_spent >
                            overallBudget.monthly_limit
                            ? "text-rose-500"
                            : overallBudget.current_spent /
                                  overallBudget.monthly_limit >
                                0.9
                              ? "text-amber-400"
                              : "text-emerald-400",
                        )}
                      >
                        {(
                          (overallBudget.current_spent /
                            overallBudget.monthly_limit) *
                          100
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                  </div>

                  <BudgetProgressBar
                    spent={overallBudget.current_spent}
                    limit={overallBudget.monthly_limit}
                    overBudget={
                      overallBudget.current_spent > overallBudget.monthly_limit
                    }
                    height="h-3"
                  />

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] text-(--muted-foreground)">
                      {fmtCurrency(
                        Math.max(
                          0,
                          overallBudget.monthly_limit -
                            overallBudget.current_spent,
                        ),
                      )}{" "}
                      remaining
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-(--muted-foreground)">
                      ~
                      {fmtShort(
                        Math.max(
                          0,
                          Math.round(
                            (overallBudget.monthly_limit -
                              overallBudget.current_spent) /
                              30,
                          ),
                        ),
                      )}
                      /day left
                    </span>
                  </div>
                </div>

                {/* Right: Streak */}
                <div className="lg:col-span-3 row-start-1">
                  <StreakPanel budget={overallBudget} />
                </div>
              </div>
            )}

            {/* Category Budgets */}
            <div>
              <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="text-[13px] font-bold tracking-wide text-(--foreground)">
                    Category Budgets
                  </div>
                  <div className="text-[10px] text-(--muted-foreground)">
                    Per-category spending limits
                  </div>
                </div>
                <button
                  onClick={() => setModal({ type: "set-budget" })}
                  className="flex items-center gap-1 rounded-lg border border-(--border) px-2.5 py-1.5 text-[11px] font-medium text-(--muted-foreground) transition hover:text-(--foreground) hover:border-(--ring) w-fit"
                >
                  <Plus size={12} /> Add Category Budget
                </button>
              </div>

              {categoryBudgets.length === 0 ? (
                <EmptyState
                  illustration="empty"
                  title="No category budgets"
                  description="Set per-category limits to track spending in detail."
                  size="sm"
                />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryBudgets.map((b) => (
                    <BudgetCategoryCard
                      key={b.id}
                      budget={b}
                      onSetBudget={(name) =>
                        setModal({ type: "set-budget", categoryName: name })
                      }
                      onResetBudget={(name) =>
                        setModal({ type: "reset-budget", name })
                      }
                      onDeleteBudget={(name) =>
                        setModal({ type: "delete-budget", name })
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </MainLayout>
  );
}
