import { useState, useMemo, useEffect } from "react";
import {
  Sun,
  Moon,
  Plus,
  Pause,
  Play,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowLeftRight,
  TrendingUp,
  CalendarClock,
  Repeat,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Wallet,
  Tag,
  Calendar,
  Timer,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/components/layout/MainLayout";
import { useTheme } from "@/contexts/ThemeContext";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getDummyScheduledJobs,
  getDummyCategoryBreakdown,
  DUMMY_DASHBOARD_WALLETS,
  type ScheduledJob,
  type ScheduledJobLog,
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

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtShortCurrency(n: number): string {
  if (n >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `Rp${(n / 1_000).toFixed(0)}K`;
  return `Rp${n.toLocaleString("id-ID")}`;
}

function getStatusStyle(status: ScheduledJob["status"]) {
  switch (status) {
    case "active":
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-500",
        border: "border-emerald-500/30",
        dot: "bg-emerald-500",
        label: "Active",
      };
    case "paused":
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-500",
        border: "border-amber-500/30",
        dot: "bg-amber-500",
        label: "Paused",
      };
    case "completed":
      return {
        bg: "bg-(--muted)",
        text: "text-(--muted-foreground)",
        border: "border-(--border)",
        dot: "bg-(--muted-foreground)",
        label: "Completed",
      };
  }
}

// ════════════════════════════════════════════
// MODAL WRAPPER
// ════════════════════════════════════════════

function Modal({
  open,
  title,
  onClose,
  children,
  maxWidth = "max-w-md",
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
        <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// CREATE SCHEDULE FORM
// ════════════════════════════════════════════

function CreateScheduleForm({ onClose }: { onClose: () => void }) {
  const [jobType, setJobType] = useState<"transaction" | "investment">(
    "transaction",
  );
  const [scheduleType, setScheduleType] = useState<"once" | "repeat">("repeat");
  const categories = getDummyCategoryBreakdown("expense");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Demo mode — data is read-only", { icon: "🔒" });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      {/* Job Type */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-(--foreground) opacity-80">
          Job Type
        </label>
        <div className="flex gap-2">
          {(["transaction", "investment"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setJobType(t)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition",
                jobType === t
                  ? t === "transaction"
                    ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                    : "border-gold-400/40 bg-gold-400/10 text-gold-400"
                  : "border-(--border) text-(--muted-foreground) hover:text-(--foreground)",
              )}
            >
              {t === "transaction" ? (
                <ArrowLeftRight size={12} />
              ) : (
                <TrendingUp size={12} />
              )}
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Type */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-(--foreground) opacity-80">
          Schedule Type
        </label>
        <div className="flex gap-2">
          {(["repeat", "once"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setScheduleType(t)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition",
                scheduleType === t
                  ? "border-gold-400/40 bg-gold-400/10 text-gold-400"
                  : "border-(--border) text-(--muted-foreground) hover:text-(--foreground)",
              )}
            >
              {t === "repeat" ? <Repeat size={12} /> : <Zap size={12} />}
              {t === "repeat" ? "Recurring" : "One-time"}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-(--foreground) opacity-80">
          Description
        </label>
        <input
          type="text"
          placeholder="e.g. Monthly Netflix"
          className="w-full rounded-lg border border-(--border) bg-(--input) px-3 py-2 text-xs text-(--foreground) outline-none focus:border-(--ring)"
        />
      </div>

      {/* Amount */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-(--foreground) opacity-80">
          Amount (IDR)
        </label>
        <input
          type="number"
          placeholder="e.g. 150000"
          className="w-full rounded-lg border border-(--border) bg-(--input) px-3 py-2 text-xs text-(--foreground) outline-none focus:border-(--ring)"
        />
      </div>

      {/* Category / Asset */}
      {jobType === "transaction" ? (
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-(--foreground) opacity-80">
            Category
          </label>
          <select className="w-full rounded-lg border border-(--border) bg-(--input) px-3 py-2 text-xs text-(--foreground) outline-none focus:border-(--ring)">
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_name}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-(--foreground) opacity-80">
            Asset Code
          </label>
          <select className="w-full rounded-lg border border-(--border) bg-(--input) px-3 py-2 text-xs text-(--foreground) outline-none focus:border-(--ring)">
            <option value="">Select asset</option>
            <option value="XAU">XAU — Gold</option>
            <option value="BTC">BTC — Bitcoin</option>
            <option value="ETH">ETH — Ethereum</option>
            <option value="BBCA">BBCA — Bank Central Asia</option>
          </select>
        </div>
      )}

      {/* Wallet */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-(--foreground) opacity-80">
          Wallet
        </label>
        <select className="w-full rounded-lg border border-(--border) bg-(--input) px-3 py-2 text-xs text-(--foreground) outline-none focus:border-(--ring)">
          <option value="">Select wallet</option>
          {DUMMY_DASHBOARD_WALLETS.map((w) => (
            <option key={w.wallet_id} value={w.wallet_id}>
              {w.wallet_name}
            </option>
          ))}
        </select>
      </div>

      {/* Interval (if repeat) */}
      {scheduleType === "repeat" && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-(--foreground) opacity-80">
              Interval
            </label>
            <select className="w-full rounded-lg border border-(--border) bg-(--input) px-3 py-2 text-xs text-(--foreground) outline-none focus:border-(--ring)">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-(--foreground) opacity-80">
              Detail
            </label>
            <input
              type="text"
              placeholder="e.g. Every 1st"
              className="w-full rounded-lg border border-(--border) bg-(--input) px-3 py-2 text-xs text-(--foreground) outline-none focus:border-(--ring)"
            />
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-(--foreground) opacity-80">
            Start Date
          </label>
          <input
            type="date"
            className="w-full rounded-lg border border-(--border) bg-(--input) px-3 py-2 text-xs text-(--foreground) outline-none focus:border-(--ring)"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-(--foreground) opacity-80">
            End Date
          </label>
          <input
            type="date"
            className="w-full rounded-lg border border-(--border) bg-(--input) px-3 py-2 text-xs text-(--foreground) outline-none focus:border-(--ring)"
          />
          <span className="text-[10px] text-(--muted-foreground)">
            Leave empty for no end date
          </span>
        </div>
      </div>

      {/* Actions */}
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
          Create Schedule
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
  variant: "danger" | "warning" | "info";
  onClose: () => void;
}) {
  const handleConfirm = () => {
    toast("Demo mode — data is read-only", { icon: "🔒" });
  };

  const icon =
    variant === "danger" ? "🗑️" : variant === "warning" ? "⏸️" : "▶️";

  return (
    <div className="flex flex-col gap-4 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-(--muted) text-xl">
        {icon}
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
            "flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition border",
            variant === "danger"
              ? "bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30"
              : variant === "warning"
                ? "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30"
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30",
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

function ScheduledSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* KPI skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-(--border) bg-(--card) px-4 py-3"
          >
            <Skeleton className="h-2 w-12 mb-2" />
            <Skeleton className="h-6 w-16 mb-1" />
          </div>
        ))}
      </div>
      {/* Cards skeleton */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-(--border) bg-(--card) p-4"
        >
          <div className="flex items-start gap-3 mb-3">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-4 w-48 mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-2 w-10 ml-auto" />
            </div>
          </div>
          <div className="flex gap-2 ml-[52px]">
            <Skeleton className="h-7 w-24 rounded-lg" />
            <Skeleton className="h-7 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════
// EXECUTION LOG
// ════════════════════════════════════════════

function ExecutionLogTable({ logs }: { logs: ScheduledJobLog[] }) {
  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-(--border) bg-(--secondary)/20 px-4 py-6 text-center">
        <Clock
          size={20}
          className="mx-auto mb-2 text-(--muted-foreground) opacity-40"
        />
        <div className="text-xs text-(--muted-foreground)">
          No execution history yet
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-(--border) bg-(--secondary)/10 overflow-hidden">
      <div className="divide-y divide-(--border)">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-center gap-3 px-3 py-2.5 sm:px-4"
          >
            {log.status === "success" ? (
              <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
            ) : (
              <XCircle size={14} className="shrink-0 text-rose-500" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-(--foreground) truncate">
                {fmtDateTime(log.executed_at)}
              </div>
              {log.reason && (
                <div className="text-[10px] text-rose-400 truncate">
                  {log.reason}
                </div>
              )}
            </div>
            <span
              className={cn(
                "shrink-0 text-[10px] font-semibold",
                log.status === "success" ? "text-emerald-500" : "text-rose-500",
              )}
            >
              {log.status === "success" ? "Success" : "Failed"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// SCHEDULE CARD
// ════════════════════════════════════════════

function ScheduleCard({
  job,
  onOpenModal,
}: {
  job: ScheduledJob;
  onOpenModal: (modal: ModalState) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusStyle = getStatusStyle(job.status);

  const successCount = job.execution_logs.filter(
    (l) => l.status === "success",
  ).length;
  const failedCount = job.execution_logs.filter(
    (l) => l.status === "failed",
  ).length;

  return (
    <div
      className={cn(
        "group relative rounded-xl overflow-hidden transition-all duration-300",
        job.status === "active"
          ? "hover:shadow-lg hover:shadow-emerald-500/10"
          : job.status === "paused"
            ? "opacity-90 hover:opacity-100"
            : "opacity-75 hover:opacity-90",
      )}
      style={{
        background:
          job.status === "active"
            ? "linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.03) 15%, var(--card) 30%)"
            : job.status === "paused"
              ? "linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.03) 15%, var(--card) 30%)"
              : "linear-gradient(180deg, rgba(120, 120, 120, 0.05) 0%, rgba(120, 120, 120, 0.02) 15%, var(--card) 30%)",
        border:
          job.status === "active"
            ? "1px solid rgba(16, 185, 129, 0.3)"
            : job.status === "paused"
              ? "1px solid rgba(245, 158, 11, 0.3)"
              : "1px solid var(--border)",
      }}
    >
      <div className="p-3.5 sm:p-4">
        {/* Row 1: Title + Amount */}
        <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3">
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
            <div
              className={cn(
                "mt-0.5 flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-105",
                job.job_type === "transaction"
                  ? "bg-linear-to-br from-blue-500/15 to-indigo-500/10 border-blue-500/30 shadow-sm shadow-blue-500/10"
                  : "bg-linear-to-br from-gold-400/15 to-amber-500/10 border-gold-400/30 shadow-sm shadow-gold-400/10",
              )}
            >
              {job.job_type === "transaction" ? (
                <ArrowLeftRight size={15} className="text-blue-400" />
              ) : (
                <TrendingUp size={15} className="text-gold-400" />
              )}
            </div>

            <div className="min-w-0">
              <div className="text-xs sm:text-[13px] font-semibold text-(--foreground) truncate mb-1">
                {job.description}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2 sm:px-2.5 py-0.5 text-[10px] font-semibold",
                    statusStyle.bg,
                    statusStyle.text,
                    statusStyle.border,
                  )}
                >
                  <span
                    className={cn("h-1.5 w-1.5 rounded-full", statusStyle.dot)}
                  />
                  {statusStyle.label}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                    job.schedule_type === "repeat"
                      ? "border-violet-500/30 bg-linear-to-r from-violet-500/15 to-purple-500/10 text-violet-400"
                      : "border-cyan-500/30 bg-linear-to-r from-cyan-500/15 to-blue-500/10 text-cyan-400",
                  )}
                >
                  {job.schedule_type === "repeat" ? (
                    <Repeat size={9} className="animate-spin-slow" />
                  ) : (
                    <Zap size={9} />
                  )}
                  {job.schedule_type === "repeat" ? "Recurring" : "One-time"}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="font-mono text-xs sm:text-sm font-bold text-(--foreground) group-hover:text-gold-300 transition-colors">
              {fmtShortCurrency(job.amount)}
            </div>
            <div
              className={cn(
                "text-[10px] font-medium",
                job.schedule_type === "repeat"
                  ? "text-violet-400/70"
                  : "text-cyan-400/70",
              )}
            >
              {job.repeat_interval
                ? `/${job.repeat_interval.slice(0, 2)}`
                : "once"}
            </div>
          </div>
        </div>

        {/* Row 2: Detail pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-3 sm:ml-12">
          {job.repeat_detail && (
            <div className="flex items-center gap-1.5 rounded-lg bg-linear-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20 px-2 sm:px-2.5 py-1.5 group/pill transition-all hover:border-amber-500/40">
              <Timer
                size={11}
                className="shrink-0 text-amber-400 group-hover/pill:scale-110 transition-transform"
              />
              <span className="text-[10px] sm:text-[11px] text-amber-300/90 truncate font-medium">
                {job.repeat_detail}
              </span>
            </div>
          )}
          {(job.category_name || job.asset_code) && (
            <div className="flex items-center gap-1.5 rounded-lg bg-linear-to-r from-pink-500/10 to-rose-500/5 border border-pink-500/20 px-2 sm:px-2.5 py-1.5 group/pill transition-all hover:border-pink-500/40">
              <Tag
                size={11}
                className="shrink-0 text-pink-400 group-hover/pill:scale-110 transition-transform"
              />
              <span className="text-[10px] sm:text-[11px] text-pink-300/90 truncate font-medium">
                {job.category_name || job.asset_code}
              </span>
            </div>
          )}
          {job.wallet_name && (
            <div className="flex items-center gap-1.5 rounded-lg bg-linear-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 px-2 sm:px-2.5 py-1.5 group/pill transition-all hover:border-emerald-500/40">
              <Wallet
                size={11}
                className="shrink-0 text-emerald-400 group-hover/pill:scale-110 transition-transform"
              />
              <span className="text-[10px] sm:text-[11px] text-emerald-300/90 truncate font-medium">
                {job.wallet_name}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded-lg bg-linear-to-r from-blue-500/10 to-indigo-500/5 border border-blue-500/20 px-2 sm:px-2.5 py-1.5 group/pill transition-all hover:border-blue-500/40">
            <Calendar
              size={11}
              className="shrink-0 text-blue-400 group-hover/pill:scale-110 transition-transform"
            />
            <span className="text-[10px] sm:text-[11px] text-blue-300/90 truncate font-medium">
              {job.end_date ? fmtDate(job.end_date) : "Forever"}
            </span>
          </div>
        </div>

        {/* Row 3: Execution info */}
        <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 mb-3 sm:ml-12">
          {job.next_execution && (
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] px-2 py-1 rounded-md bg-gold-400/5 border border-gold-400/20">
              <span className="text-(--muted-foreground)">Next →</span>
              <span className="font-semibold text-gold-400">
                {fmtDate(job.next_execution)}
              </span>
            </div>
          )}
          {job.last_execution && (
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] px-2 py-1 rounded-md bg-(--secondary)/20">
              <span className="text-(--muted-foreground)">Last →</span>
              <span className="font-medium text-(--foreground)">
                {fmtDate(job.last_execution)}
              </span>
            </div>
          )}
          {job.execution_logs.length > 0 && (
            <div className="flex items-center gap-2.5 text-[10px] sm:text-[11px] px-2 py-1 rounded-md bg-(--secondary)/20">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 size={10} className="drop-shadow-sm" />{" "}
                {successCount}
              </span>
              {failedCount > 0 && (
                <span className="flex items-center gap-1 text-rose-400 font-medium">
                  <XCircle size={10} className="drop-shadow-sm" /> {failedCount}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Row 4: Actions */}
        <div className="flex items-center justify-between sm:ml-12">
          <div className="flex gap-1.5">
            {job.status === "active" && (
              <button
                onClick={() =>
                  onOpenModal({
                    type: "pause",
                    name: job.description,
                  })
                }
                className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/5 px-2 sm:px-2.5 py-1.5 text-[10px] font-semibold text-amber-400 transition-all hover:bg-amber-500/15 hover:border-amber-500/50 hover:scale-[1.02]"
              >
                <Pause size={10} /> Pause
              </button>
            )}
            {job.status === "paused" && (
              <button
                onClick={() =>
                  onOpenModal({
                    type: "resume",
                    name: job.description,
                  })
                }
                className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-2 sm:px-2.5 py-1.5 text-[10px] font-semibold text-emerald-400 transition-all hover:bg-emerald-500/15 hover:border-emerald-500/50 hover:scale-[1.02]"
              >
                <Play size={10} /> Resume
              </button>
            )}
            <button
              onClick={() =>
                onOpenModal({
                  type: "delete",
                  name: job.description,
                })
              }
              className="flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/5 px-2 sm:px-2.5 py-1.5 text-[10px] font-semibold text-rose-400 transition-all hover:bg-rose-500/15 hover:border-rose-500/50 hover:scale-[1.02]"
            >
              <Trash2 size={10} />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition-all",
              expanded
                ? "bg-violet-500/10 text-violet-400 border border-violet-500/30"
                : "bg-(--secondary)/30 text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--secondary)/50",
            )}
          >
            <Activity size={10} />
            {expanded ? (
              <>
                Hide <ChevronUp size={11} />
              </>
            ) : (
              <>
                Logs ({job.execution_logs.length}) <ChevronDown size={11} />
              </>
            )}
          </button>
        </div>

        {/* Expanded logs */}
        {expanded && (
          <div className="mt-3 sm:ml-12">
            <ExecutionLogTable logs={job.execution_logs} />
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// MODAL STATE
// ════════════════════════════════════════════

type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "pause"; name: string }
  | { type: "resume"; name: string }
  | { type: "delete"; name: string };

// ════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════

export function ScheduledPage() {
  const { theme, toggleTheme } = useTheme();

  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "paused" | "completed"
  >("all");

  const [modal, setModal] = useState<ModalState>({ type: "none" });

  // Simulate loading
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const allJobs = useMemo(() => getDummyScheduledJobs(), []);

  const filteredJobs = useMemo(() => {
    if (statusFilter === "all") return allJobs;
    return allJobs.filter((j) => j.status === statusFilter);
  }, [allJobs, statusFilter]);

  // KPI stats
  const totalActive = allJobs.filter((j) => j.status === "active").length;
  const totalPaused = allJobs.filter((j) => j.status === "paused").length;
  const nextExec = allJobs
    .filter((j) => j.next_execution)
    .sort(
      (a, b) =>
        new Date(a.next_execution!).getTime() -
        new Date(b.next_execution!).getTime(),
    )[0]?.next_execution;
  const totalExecuted = allJobs.reduce(
    (s, j) => s + j.execution_logs.length,
    0,
  );
  const totalMonthlyAmount = allJobs
    .filter((j) => j.status === "active")
    .reduce((s, j) => {
      if (j.repeat_interval === "monthly") return s + j.amount;
      if (j.repeat_interval === "weekly") return s + j.amount * 4;
      if (j.repeat_interval === "daily") return s + j.amount * 30;
      return s;
    }, 0);

  const closeModal = () => setModal({ type: "none" });

  return (
    <MainLayout>
      {/* ════════ MODALS ════════ */}
      <Modal
        open={modal.type === "create"}
        title="Create Schedule"
        onClose={closeModal}
      >
        <CreateScheduleForm onClose={closeModal} />
      </Modal>

      <Modal
        open={modal.type === "pause"}
        title="Pause Schedule"
        onClose={closeModal}
        maxWidth="max-w-sm"
      >
        <ConfirmDialog
          message={`Pause "${modal.type === "pause" ? modal.name : ""}"? It will stop executing until resumed.`}
          confirmLabel="Pause"
          variant="warning"
          onClose={closeModal}
        />
      </Modal>

      <Modal
        open={modal.type === "resume"}
        title="Resume Schedule"
        onClose={closeModal}
        maxWidth="max-w-sm"
      >
        <ConfirmDialog
          message={`Resume "${modal.type === "resume" ? modal.name : ""}"? It will start executing again based on its schedule.`}
          confirmLabel="Resume"
          variant="info"
          onClose={closeModal}
        />
      </Modal>

      <Modal
        open={modal.type === "delete"}
        title="Delete Schedule"
        onClose={closeModal}
        maxWidth="max-w-sm"
      >
        <ConfirmDialog
          message={`Are you sure you want to delete "${modal.type === "delete" ? modal.name : ""}"? This action cannot be undone.`}
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
              Scheduled
            </div>
            <div className="text-[10px] text-(--muted-foreground)">
              Automated transactions & investments
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
          <div className="flex gap-1 overflow-x-auto">
            {(["all", "active", "paused", "completed"] as const).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "whitespace-nowrap rounded-lg border px-2 sm:px-2.5 py-1.5 text-[10px] sm:text-[11px] font-semibold capitalize transition",
                    statusFilter === status
                      ? "border-gold-400/40 bg-gold-400/10 text-gold-400"
                      : "border-(--border) text-(--muted-foreground) hover:text-(--foreground)",
                  )}
                >
                  {status}
                </button>
              ),
            )}
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
          <ScheduledSkeleton />
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <div
                className="relative flex flex-col gap-1 overflow-hidden rounded-xl px-3 sm:px-4 py-3 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.04) 20%, var(--card) 40%)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                }}
              >
                <span className="text-[9px] font-semibold uppercase tracking-widest text-(--muted-foreground)">
                  Active
                </span>
                <div className="flex items-end gap-1.5">
                  <span className="font-mono text-lg sm:text-xl font-bold text-emerald-400">
                    {totalActive}
                  </span>
                  {totalPaused > 0 && (
                    <span className="text-[10px] text-amber-500 mb-0.5">
                      +{totalPaused} paused
                    </span>
                  )}
                </div>
              </div>

              <div
                className="relative flex flex-col gap-1 overflow-hidden rounded-xl px-3 sm:px-4 py-3 transition-all duration-300 hover:shadow-lg hover:shadow-gold-400/10"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(218, 165, 32, 0.1) 0%, rgba(218, 165, 32, 0.04) 20%, var(--card) 40%)",
                  border: "1px solid rgba(218, 165, 32, 0.25)",
                }}
              >
                <span className="text-[9px] font-semibold uppercase tracking-widest text-(--muted-foreground)">
                  Next Run
                </span>
                <span className="font-mono text-xs sm:text-sm font-bold text-gold-400">
                  {nextExec ? fmtDate(nextExec) : "—"}
                </span>
              </div>

              <div
                className="relative flex flex-col gap-1 overflow-hidden rounded-xl px-3 sm:px-4 py-3 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.04) 20%, var(--card) 40%)",
                  border: "1px solid rgba(59, 130, 246, 0.25)",
                }}
              >
                <span className="text-[9px] font-semibold uppercase tracking-widest text-(--muted-foreground)">
                  Executed
                </span>
                <span className="font-mono text-lg sm:text-xl font-bold text-blue-400">
                  {totalExecuted}
                </span>
              </div>

              <div
                className="relative flex flex-col gap-1 overflow-hidden rounded-xl px-3 sm:px-4 py-3 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.04) 20%, var(--card) 40%)",
                  border: "1px solid rgba(139, 92, 246, 0.25)",
                }}
              >
                <span className="text-[9px] font-semibold uppercase tracking-widest text-(--muted-foreground)">
                  Monthly Auto
                </span>
                <span className="font-mono text-xs sm:text-sm font-bold text-violet-400">
                  {fmtShortCurrency(totalMonthlyAmount)}
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <div className="text-xs sm:text-[13px] font-bold tracking-wide text-(--foreground)">
                Scheduled Jobs
                <span className="ml-1.5 sm:ml-2 text-[10px] sm:text-[11px] font-normal text-(--muted-foreground)">
                  ({filteredJobs.length})
                </span>
              </div>
              <button
                onClick={() => setModal({ type: "create" })}
                className="flex items-center gap-1.5 rounded-lg border border-(--border) px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium text-(--muted-foreground) transition hover:text-(--foreground) hover:border-(--ring)"
              >
                <Plus size={14} />{" "}
                <span className="hidden sm:inline">Create</span> Schedule
              </button>
            </div>

            {/* Schedule List */}
            {filteredJobs.length === 0 ? (
              <EmptyState
                illustration="empty"
                title="No scheduled jobs"
                description={
                  statusFilter !== "all"
                    ? `No ${statusFilter} schedules found. Try a different filter.`
                    : "Create your first scheduled transaction or investment to automate your finances."
                }
                size="lg"
                icon={<CalendarClock size={40} />}
                action={
                  statusFilter === "all" ? (
                    <button
                      onClick={() => setModal({ type: "create" })}
                      className="flex items-center gap-1.5 rounded-lg bg-gold-btn px-4 py-2 text-xs font-semibold text-dark transition hover:opacity-90"
                    >
                      <Plus size={14} /> Create Schedule
                    </button>
                  ) : undefined
                }
              />
            ) : (
              <div className="flex flex-col gap-3">
                {filteredJobs.map((job) => (
                  <ScheduleCard key={job.id} job={job} onOpenModal={setModal} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </MainLayout>
  );
}
