import { useState, useMemo, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  X,
  Sun,
  Moon,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  Coins,
  ArrowRightLeft,
  Package,
  Minus,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/components/layout/MainLayout";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import {
  useInvestmentList,
  useInvestmentSummary,
  useAssetCodes,
} from "@/hooks/useInvestment";
import { useWalletList } from "@/hooks/useWallet";
import {
  createInvestment as createInvestmentAPI,
  sellInvestment as sellInvestmentAPI,
} from "@/lib/investment-api";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button, Input } from "@/components/ui/FormElements";
import type {
  Investment,
  CreateInvestmentPayload,
  SellInvestmentPayload,
} from "@/types/investment";
import toast from "react-hot-toast";

// ════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════

function fmtCurrency(n: number, compact = false): string {
  if (compact) {
    if (Math.abs(n) >= 1_000_000_000)
      return `Rp${(n / 1_000_000_000).toFixed(1)}B`;
    if (Math.abs(n) >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1)}M`;
    if (Math.abs(n) >= 1_000) return `Rp${(n / 1_000).toFixed(0)}K`;
  }
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

function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function fmtQty(n: number): string {
  return n % 1 === 0 ? String(n) : n.toFixed(4);
}

function computeCurrentValue(inv: Investment): number {
  const price = inv.asset?.toIDR ?? inv.initial_valuation;
  return inv.quantity * price;
}

function computeProfitLoss(inv: Investment): { amount: number; pct: number } {
  const current = computeCurrentValue(inv);
  const pl = current - inv.amount;
  const pct = inv.amount > 0 ? (pl / inv.amount) * 100 : 0;
  return { amount: pl, pct };
}

const PIE_COLORS = [
  "#DAA520",
  "#B8860B",
  "#CD853F",
  "#F5DEB3",
  "#D2B48C",
  "#C0A062",
  "#8B7355",
];

// ════════════════════════════════════════════
// SUMMARY CARDS
// ════════════════════════════════════════════

function SummaryCard({
  label,
  value,
  icon,
  accentColor,
  subValue,
  subColor,
  loading,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accentColor: string;
  subValue?: string;
  subColor?: string;
  loading?: boolean;
}) {
  if (loading) return <Skeleton className="h-24 rounded-xl" />;
  return (
    <div className="rounded-xl border border-(--border) bg-(--card) p-4 transition hover:border-gold-400/20">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-(--muted-foreground)">
          {label}
        </span>
        <div className={cn("rounded-lg p-1.5", accentColor)}>{icon}</div>
      </div>
      <div className="text-lg font-bold text-(--foreground)">{value}</div>
      {subValue && (
        <div className={cn("mt-0.5 text-[11px] font-semibold", subColor)}>
          {subValue}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// INVESTMENT CARD
// ════════════════════════════════════════════

function InvestmentCard({
  investment,
  onView,
}: {
  investment: Investment;
  onView: (inv: Investment) => void;
}) {
  const currentValue = computeCurrentValue(investment);
  const pl = computeProfitLoss(investment);
  const isPositive = pl.amount >= 0;
  const initials = investment.code.slice(0, 3);

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-(--border) p-5 transition-all duration-300 hover:scale-[1.02] hover:border-gold-400/30"
      style={{
        background:
          "linear-gradient(145deg, #0f0f0f 0%, #1a1a1a 30%, #141414 60%, #0d0d0d 100%)",
        boxShadow:
          "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(218,165,32,0.08)",
      }}
      onClick={() => onView(investment)}
    >
      {/* Gold accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(218,165,32,0.4) 50%, transparent 100%)",
        }}
      />

      {/* Corner glow */}
      <div
        className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle, rgba(218,165,32,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Initials logo */}
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold"
            style={{
              background:
                "linear-gradient(135deg, rgba(218,165,32,0.15), rgba(218,165,32,0.05))",
              border: "1px solid rgba(218,165,32,0.2)",
              color: "#DAA520",
            }}
          >
            {initials}
          </div>
          <div>
            <div className="text-sm font-bold text-white">
              {investment.asset?.name ?? investment.code}
            </div>
            <div className="text-[10px] text-gray-400">
              {investment.code} · {fmtQty(investment.quantity)}{" "}
              {investment.asset?.unit ?? "units"}
            </div>
          </div>
        </div>
        <div
          className={cn(
            "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold",
            isPositive
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-rose-500/10 text-rose-500",
          )}
        >
          {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {fmtPct(pl.pct)}
        </div>
      </div>

      {/* Values */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">
            Invested
          </div>
          <div className="font-mono text-xs font-semibold text-gray-300">
            {fmtCurrency(investment.amount, true)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">
            Current Value
          </div>
          <div
            className="font-mono text-xs font-semibold"
            style={{
              background: "linear-gradient(135deg, #DAA520, #F5DEB3)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {fmtCurrency(currentValue ?? 0, true)}
          </div>
        </div>
      </div>

      {/* Profit/Loss */}
      <div className="flex items-center justify-between rounded-lg bg-white/3 px-3 py-2">
        <span className="text-[10px] text-gray-500">P&L</span>
        <span
          className={cn(
            "font-mono text-xs font-bold",
            isPositive ? "text-emerald-500" : "text-rose-500",
          )}
        >
          {isPositive ? "+" : ""}
          {fmtCurrency(pl.amount, true)}
        </span>
      </div>

      {/* Sold records indicator */}
      {(investment.sold_records?.length ?? 0) > 0 && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-500">
          <ArrowRightLeft size={10} />
          {investment.sold_records?.length} sell record(s)
        </div>
      )}

      {/* Purchase date */}
      <div className="mt-2 text-[10px] text-gray-600">
        Purchased {fmtDate(investment.date)}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// INVESTMENT DETAIL MODAL
// ════════════════════════════════════════════

function InvestmentDetailModal({
  investment,
  onClose,
  onSell,
}: {
  investment: Investment | null;
  onClose: () => void;
  onSell: (inv: Investment) => void;
}) {
  if (!investment) return null;

  const currentValue = computeCurrentValue(investment);
  const pl = computeProfitLoss(investment);
  const isPositive = pl.amount >= 0;
  const currentPrice = investment.asset?.toIDR ?? investment.initial_valuation;
  const totalSold =
    investment.sold_records?.reduce((s, r) => s + r.amount, 0) ?? 0;
  const totalSoldQty =
    investment.sold_records?.reduce((s, r) => s + (r.quantity ?? 0), 0) ?? 0;
  const totalRealizedGain =
    investment.sold_records?.reduce((s, r) => s + (r.deficit ?? 0), 0) ?? 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-(--border) bg-(--card) max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow:
            "0 0 40px rgba(218,165,32,0.1), 0 25px 50px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-center justify-between border-b border-(--border) px-6 py-4">
          <h3 className="font-bold text-(--foreground)">Investment Detail</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-(--muted-foreground) transition hover:text-(--foreground)"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Asset header */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold"
              style={{
                background:
                  "linear-gradient(135deg, rgba(218,165,32,0.2), rgba(218,165,32,0.05))",
                border: "1px solid rgba(218,165,32,0.3)",
                color: "#DAA520",
              }}
            >
              {investment.code.slice(0, 3)}
            </div>
            <div>
              <div className="text-base font-bold text-(--foreground)">
                {investment.asset?.name ?? investment.code}
              </div>
              <div className="text-xs text-(--muted-foreground)">
                {investment.code} · Current price: {fmtCurrency(currentPrice)}/
                {investment.asset?.unit ?? "unit"}
              </div>
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-(--border) bg-(--secondary)/30 p-3">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-(--muted-foreground)">
                Holdings
              </div>
              <div className="text-sm font-bold text-(--foreground)">
                {fmtQty(investment.quantity)}{" "}
                <span className="text-xs text-(--muted-foreground)">
                  {investment.asset?.unit ?? "units"}
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-(--border) bg-(--secondary)/30 p-3">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-(--muted-foreground)">
                Amount Invested
              </div>
              <div className="text-sm font-bold text-(--foreground)">
                {fmtCurrency(investment.amount)}
              </div>
            </div>
            <div className="rounded-xl border border-(--border) bg-(--secondary)/30 p-3">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-(--muted-foreground)">
                Current Value
              </div>
              <div className="text-sm font-bold text-gold-400">
                {fmtCurrency(currentValue ?? 0)}
              </div>
            </div>
            <div className="rounded-xl border border-(--border) bg-(--secondary)/30 p-3">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-(--muted-foreground)">
                Unrealized P&L
              </div>
              <div
                className={cn(
                  "text-sm font-bold",
                  isPositive ? "text-emerald-500" : "text-rose-500",
                )}
              >
                {isPositive ? "+" : ""}
                {fmtCurrency(pl.amount)} ({fmtPct(pl.pct)})
              </div>
            </div>
          </div>

          {/* Detail rows */}
          <div className="space-y-2 rounded-xl border border-(--border) bg-(--secondary)/30 p-4">
            <div className="flex justify-between text-xs">
              <span className="text-(--muted-foreground)">Purchase Date</span>
              <span className="font-medium text-(--foreground)">
                {fmtDate(investment.date)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-(--muted-foreground)">Buy Price</span>
              <span className="font-mono font-medium text-(--foreground)">
                {fmtCurrency(investment.initial_valuation)}/
                {investment.asset?.unit ?? "unit"}
              </span>
            </div>
            {investment.description && (
              <div className="flex justify-between text-xs">
                <span className="text-(--muted-foreground)">Description</span>
                <span className="font-medium text-(--foreground) text-right max-w-[60%]">
                  {investment.description}
                </span>
              </div>
            )}
          </div>

          {/* Sell history */}
          {(investment.sold_records?.length ?? 0) > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-(--muted-foreground)">
                Sell History
              </div>
              <div className="space-y-2">
                {investment.sold_records?.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-lg border border-(--border) bg-(--secondary)/30 p-3 space-y-1"
                  >
                    <div className="flex justify-between text-xs">
                      <span className="text-(--muted-foreground)">
                        {fmtDate(r.date)}
                      </span>
                      <span
                        className={cn(
                          "font-mono font-semibold",
                          (r.deficit ?? 0) >= 0
                            ? "text-emerald-500"
                            : "text-rose-500",
                        )}
                      >
                        {(r.deficit ?? 0) >= 0 ? "+" : ""}
                        {fmtCurrency(r.deficit ?? 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-(--muted-foreground)">
                        Sold {fmtQty(r.quantity ?? 0)} @{" "}
                        {fmtCurrency(r.sell_price ?? 0)}
                      </span>
                      <span className="font-mono text-(--foreground)">
                        {fmtCurrency(r.amount)}
                      </span>
                    </div>
                    {r.description && (
                      <div className="text-[10px] text-(--muted-foreground)">
                        {r.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between rounded-lg bg-(--secondary)/50 px-3 py-2 text-xs">
                <span className="text-(--muted-foreground)">
                  Total sold: {fmtQty(totalSoldQty)} units ·{" "}
                  {fmtCurrency(totalSold)}
                </span>
                <span
                  className={cn(
                    "font-mono font-semibold",
                    totalRealizedGain >= 0
                      ? "text-emerald-500"
                      : "text-rose-500",
                  )}
                >
                  Realized: {totalRealizedGain >= 0 ? "+" : ""}
                  {fmtCurrency(totalRealizedGain)}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                onClose();
                onSell(investment);
              }}
            >
              <Minus size={14} /> Sell
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// CREATE INVESTMENT MODAL
// ════════════════════════════════════════════

function CreateInvestmentModal({
  open,
  onClose,
  onRefetch,
}: {
  open: boolean;
  onClose: () => void;
  onRefetch: () => void;
}) {
  const { token } = useAuth();
  const assetCodes = useAssetCodes();
  const wallets = useWalletList();
  const [code, setCode] = useState("");
  const [walletId, setWalletId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setCode("");
      setWalletId("");
      setQuantity("");
      setAmount("");
      setDate(new Date().toISOString().slice(0, 10));
      setDescription("");
    }
  }, [open]);

  if (!open) return null;

  const selectedAsset = assetCodes.data?.find((a) => a.code === code);

  const qty = parseFloat(quantity) || 0;
  const amt = parseFloat(amount) || 0;
  const pricePerUnit = qty > 0 ? amt / qty : 0;

  const handleQuantityChange = (val: string) => {
    setQuantity(val);
  };

  const handleAmountChange = (val: string) => {
    setAmount(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (qty <= 0 || amt <= 0) {
      toast.error("Quantity and amount must be greater than 0");
      return;
    }
    if (!walletId) {
      toast.error("Please select a wallet");
      return;
    }
    setLoading(true);
    const payload: CreateInvestmentPayload = {
      code,
      quantity: qty,
      amount: amt,
      date: new Date(date).toISOString(),
      description: description || undefined,
      wallet_id: walletId,
    };
    try {
      await createInvestmentAPI(token!, payload);
      toast.success("Investment created successfully!");
      onRefetch();
      onClose();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to create investment";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-(--border) bg-(--card) max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow:
            "0 0 40px rgba(218,165,32,0.1), 0 25px 50px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-center justify-between border-b border-(--border) px-6 py-4">
          <h3 className="font-bold text-(--foreground)">Add Investment</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-(--muted-foreground) transition hover:text-(--foreground)"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <SearchableSelect
            label="Asset"
            value={code}
            onChange={setCode}
            options={
              assetCodes.data?.map((a) => ({
                value: a.code,
                label: `${a.code} — ${a.name}`,
              })) ?? []
            }
            placeholder="Select asset..."
            searchPlaceholder="Search asset..."
            required
          />
          {selectedAsset && selectedAsset.toIDR != null && (
            <div className="text-[11px] text-(--muted-foreground) -mt-2">
              Current market price:{" "}
              <span className="font-mono text-gold-400">
                {fmtCurrency(selectedAsset.toIDR ?? 0)}
              </span>
              /{selectedAsset.unit ?? "unit"}
            </div>
          )}

          <SearchableSelect
            label="Wallet"
            value={walletId}
            onChange={setWalletId}
            options={
              wallets.data?.map((w) => ({
                value: w.id,
                label: w.name,
              })) ?? []
            }
            placeholder="Select wallet..."
            searchPlaceholder="Search wallet..."
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={`Quantity${selectedAsset?.unit ? ` (${selectedAsset.unit})` : ""}`}
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              placeholder="0"
              min="0.00000001"
              required
            />
            <Input
              label="Total Amount (IDR)"
              type="number"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0"
              min="1"
              required
            />
          </div>

          {/* Auto-calculated price per unit */}
          {qty > 0 && amt > 0 && (
            <div className="rounded-lg border border-(--border) bg-(--secondary)/30 px-4 py-3 space-y-1">
              <div className="flex justify-between text-[11px] text-(--muted-foreground)">
                <span>Price per {selectedAsset?.unit ?? "unit"}</span>
                <span className="font-mono font-semibold text-(--foreground)">
                  {fmtCurrency(pricePerUnit)}
                </span>
              </div>
              {selectedAsset?.toIDR != null && selectedAsset.toIDR > 0 && (
                <div className="flex justify-between text-[11px] text-(--muted-foreground)">
                  <span>Market price</span>
                  <span className="font-mono text-gold-400">
                    {fmtCurrency(selectedAsset.toIDR)}
                  </span>
                </div>
              )}
              {selectedAsset?.toIDR != null &&
                selectedAsset.toIDR > 0 &&
                pricePerUnit > 0 && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-(--muted-foreground)">
                      vs. market
                    </span>
                    <span
                      className={cn(
                        "font-mono font-semibold",
                        pricePerUnit <= selectedAsset.toIDR
                          ? "text-emerald-500"
                          : "text-rose-500",
                      )}
                    >
                      {pricePerUnit <= selectedAsset.toIDR ? "▼" : "▲"}{" "}
                      {fmtPct(
                        ((pricePerUnit - selectedAsset.toIDR) /
                          selectedAsset.toIDR) *
                          100,
                      )}
                    </span>
                  </div>
                )}
            </div>
          )}

          <Input
            label="Purchase Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-(--foreground) opacity-80">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a note..."
              rows={2}
              className="w-full rounded-lg border border-(--border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) outline-none transition-colors focus:border-(--ring) focus:ring-1 focus:ring-(--ring) placeholder:text-(--muted-foreground)"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={loading} className="flex-1">
              Add Investment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// SELL INVESTMENT MODAL
// ════════════════════════════════════════════

function SellInvestmentModal({
  investment,
  onClose,
  onRefetch,
}: {
  investment: Investment | null;
  onClose: () => void;
  onRefetch: () => void;
}) {
  const { token } = useAuth();
  const wallets = useWalletList();
  const [walletId, setWalletId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!investment) {
      setWalletId("");
      setQuantity("");
      setAmount("");
      setDate(new Date().toISOString().slice(0, 10));
      setDescription("");
      setLoading(false);
    }
  }, [investment]);

  if (!investment) return null;

  const currentPrice = investment.asset?.toIDR ?? investment.initial_valuation;
  const sellQty = parseFloat(quantity) || 0;
  const sellAmt = parseFloat(amount) || 0;
  const sellPricePerUnit = sellQty > 0 ? sellAmt / sellQty : 0;
  const costBasis = sellQty * investment.initial_valuation;
  const estimatedPL = sellAmt - costBasis;

  const handleSellQuantityChange = (val: string) => {
    setQuantity(val);
    const q = parseFloat(val) || 0;
    // Auto-fill amount based on market price if amount is empty
    if (!amount && q > 0) {
      setAmount(String(Math.round(q * currentPrice)));
    }
  };

  const handleSellAmountChange = (val: string) => {
    setAmount(val);
    const a = parseFloat(val) || 0;
    // Auto-fill quantity if empty
    if (!quantity && a > 0 && currentPrice > 0) {
      setQuantity(String(parseFloat((a / currentPrice).toFixed(8))));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sellQty > investment.quantity) {
      toast.error("Cannot sell more than your holdings!");
      return;
    }
    if (sellQty <= 0 || sellAmt <= 0) {
      toast.error("Quantity and amount must be greater than 0");
      return;
    }
    if (!walletId) {
      toast.error("Please select a wallet");
      return;
    }
    setLoading(true);
    const payload: SellInvestmentPayload = {
      asset_code: investment.code,
      quantity: sellQty,
      amount: sellAmt,
      date: new Date(date).toISOString(),
      description: description || undefined,
      wallet_id: walletId,
    };
    try {
      await sellInvestmentAPI(token!, payload);
      toast.success("Investment sold successfully!");
      onRefetch();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to sell investment";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-(--border) bg-(--card) max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow:
            "0 0 40px rgba(218,165,32,0.1), 0 25px 50px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-center justify-between border-b border-(--border) px-6 py-4">
          <div>
            <h3 className="font-bold text-(--foreground)">Sell Investment</h3>
            <div className="text-xs text-(--muted-foreground)">
              {investment.asset?.name} ({investment.code})
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-(--muted-foreground) transition hover:text-(--foreground)"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          {/* Current holdings info */}
          <div className="rounded-lg border border-(--border) bg-(--secondary)/30 px-4 py-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-(--muted-foreground)">
                Available Holdings
              </span>
              <span className="font-mono font-semibold text-(--foreground)">
                {fmtQty(investment.quantity)}{" "}
                {investment.asset?.unit ?? "units"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-(--muted-foreground)">
                Current Market Price
              </span>
              <span className="font-mono font-semibold text-gold-400">
                {fmtCurrency(currentPrice)}/{investment.asset?.unit ?? "unit"}
              </span>
            </div>
          </div>

          <SearchableSelect
            label="Wallet"
            value={walletId}
            onChange={setWalletId}
            options={
              wallets.data?.map((w) => ({
                value: w.id,
                label: w.name,
              })) ?? []
            }
            placeholder="Select wallet..."
            searchPlaceholder="Search wallet..."
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={`Quantity to Sell`}
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => handleSellQuantityChange(e.target.value)}
              placeholder="0"
              min="0.00000001"
              max={String(investment.quantity)}
              required
            />
            <Input
              label="Total Sell Amount (IDR)"
              type="number"
              value={amount}
              onChange={(e) => handleSellAmountChange(e.target.value)}
              placeholder={String(Math.round(sellQty * currentPrice))}
              min="1"
              required
            />
          </div>

          {/* Auto-calculated sell price per unit + P&L Preview */}
          {sellQty > 0 && sellAmt > 0 && (
            <div className="rounded-lg border border-(--border) bg-(--secondary)/30 px-4 py-3 space-y-1">
              <div className="flex justify-between text-[11px] text-(--muted-foreground)">
                <span>Sell price per {investment.asset?.unit ?? "unit"}</span>
                <span className="font-mono font-semibold text-(--foreground)">
                  {fmtCurrency(sellPricePerUnit)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-(--muted-foreground)">
                <span>
                  Cost basis ({fmtQty(sellQty)} ×{" "}
                  {fmtCurrency(investment.initial_valuation)})
                </span>
                <span className="font-mono">{fmtCurrency(costBasis)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-(--muted-foreground)">
                <span>Sell value</span>
                <span className="font-mono">{fmtCurrency(sellAmt)}</span>
              </div>
              <div
                className={cn(
                  "border-t border-(--border) pt-1 flex justify-between text-xs font-semibold",
                  estimatedPL >= 0 ? "text-emerald-500" : "text-rose-500",
                )}
              >
                <span>Estimated P&L</span>
                <span className="font-mono">
                  {estimatedPL >= 0 ? "+" : ""}
                  {fmtCurrency(estimatedPL)}
                </span>
              </div>
            </div>
          )}

          <Input
            label="Sell Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-(--foreground) opacity-80">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Reason for selling..."
              rows={2}
              className="w-full rounded-lg border border-(--border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) outline-none transition-colors focus:border-(--ring) focus:ring-1 focus:ring-(--ring) placeholder:text-(--muted-foreground)"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={loading} className="flex-1">
              Confirm Sell
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// MAIN INVESTMENT PAGE
// ════════════════════════════════════════════

export function InvestmentPage() {
  const { theme, toggleTheme } = useTheme();
  const summary = useInvestmentSummary();
  const investmentList = useInvestmentList({});

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailInvestment, setDetailInvestment] = useState<Investment | null>(
    null,
  );
  const [sellInvestment, setSellInvestment] = useState<Investment | null>(null);

  // Filtered investments
  const filteredInvestments = useMemo(() => {
    if (!investmentList.data?.investments) return [];
    if (!searchQuery) return investmentList.data.investments;
    const q = searchQuery.toLowerCase();
    return investmentList.data.investments.filter(
      (i) =>
        i.code.toLowerCase().includes(q) ||
        i.asset?.name.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q),
    );
  }, [investmentList.data, searchQuery]);

  // Portfolio allocation for pie chart
  const allocationData = useMemo(() => {
    if (!investmentList.data?.investments) return [];
    return investmentList.data.investments.map((inv) => ({
      name: inv.code,
      value: computeCurrentValue(inv),
    }));
  }, [investmentList.data]);

  // Performance bar chart
  const performanceData = useMemo(() => {
    if (!investmentList.data?.investments) return [];
    return investmentList.data.investments.map((inv) => {
      const pl = computeProfitLoss(inv);
      return {
        name: inv.code,
        invested: inv.amount,
        current: computeCurrentValue(inv),
        pl: pl.amount,
      };
    });
  }, [investmentList.data]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };
  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
  };

  const totalRefetch = () => {
    investmentList.refetch();
    summary.refetch();
  };

  return (
    <MainLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 flex gap-3 border-b border-(--border) bg-(--card) px-4 py-3 sm:px-6 sm:py-3.5 flex-row items-center justify-between">
        <div>
          <div className="text-sm font-bold tracking-wide text-(--foreground)">
            Investments
          </div>
          <div className="text-[10px] text-(--muted-foreground)">
            Manage and track your investment portfolio
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} />
            <span className="hidden sm:inline">Add Investment</span>
          </Button>
          <button
            onClick={toggleTheme}
            title={
              theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-(--border) text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground)"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-350 p-3 sm:p-5 space-y-5">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          <SummaryCard
            label="Total Invested"
            value={
              summary.data
                ? fmtCurrency(summary.data.total_invested, true)
                : "—"
            }
            icon={<DollarSign size={14} className="text-gold-400" />}
            accentColor="bg-gold-400/10"
            loading={summary.loading}
          />
          <SummaryCard
            label="Current Value"
            value={
              summary.data
                ? fmtCurrency(summary.data.total_current_value, true)
                : "—"
            }
            icon={<BarChart3 size={14} className="text-gold-400" />}
            accentColor="bg-gold-400/10"
            loading={summary.loading}
          />
          <SummaryCard
            label="Unrealized P&L"
            value={
              summary.data
                ? `${summary.data.total_profit_loss >= 0 ? "+" : ""}${fmtCurrency(summary.data.total_profit_loss, true)}`
                : "—"
            }
            icon={
              (summary.data?.total_profit_loss ?? 0) >= 0 ? (
                <TrendingUp size={14} className="text-emerald-500" />
              ) : (
                <TrendingDown size={14} className="text-rose-500" />
              )
            }
            accentColor={
              (summary.data?.total_profit_loss ?? 0) >= 0
                ? "bg-emerald-500/10"
                : "bg-rose-500/10"
            }
            subValue={
              summary.data
                ? fmtPct(summary.data.total_profit_loss_pct ?? 0)
                : undefined
            }
            subColor={
              (summary.data?.total_profit_loss_pct ?? 0) >= 0
                ? "text-emerald-500"
                : "text-rose-500"
            }
            loading={summary.loading}
          />
          <SummaryCard
            label="Realized Gain"
            value={
              summary.data
                ? `${summary.data.total_realized_gain >= 0 ? "+" : ""}${fmtCurrency(summary.data.total_realized_gain ?? 0, true)}`
                : "—"
            }
            icon={<Coins size={14} className="text-blue-400" />}
            accentColor="bg-blue-400/10"
            subValue={
              summary.data
                ? `From ${fmtCurrency(summary.data.total_sold_amount ?? 0, true)} sold`
                : undefined
            }
            subColor="text-(--muted-foreground)"
            loading={summary.loading}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {/* Allocation Pie */}
          <div className="rounded-xl border border-(--border) bg-(--card) p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold text-(--foreground)">
              <PieChartIcon size={14} className="text-gold-400" />
              Portfolio Allocation
            </div>
            {investmentList.loading ? (
              <Skeleton className="mx-auto h-48 w-48 rounded-full" />
            ) : allocationData.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-xs text-(--muted-foreground)">
                No investments yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={2}
                    stroke="none"
                  >
                    {allocationData.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={PIE_COLORS[idx % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => fmtCurrency(Number(v), true)}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            {/* Legend */}
            {allocationData.length > 0 && (
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                {allocationData.map((d, i) => (
                  <div
                    key={d.name}
                    className="flex items-center gap-1.5 text-[10px] text-(--muted-foreground)"
                  >
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        background: PIE_COLORS[i % PIE_COLORS.length],
                      }}
                    />
                    {d.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Performance Bars */}
          <div className="rounded-xl border border-(--border) bg-(--card) p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold text-(--foreground)">
              <BarChart3 size={14} className="text-gold-400" />
              Performance Comparison
            </div>
            {investmentList.loading ? (
              <Skeleton className="h-48 w-full rounded-lg" />
            ) : performanceData.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-xs text-(--muted-foreground)">
                No investments yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      fmtCurrency(v, true).replace("Rp", "")
                    }
                  />
                  <Tooltip
                    formatter={(v) => fmtCurrency(Number(v), true)}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                  <Bar
                    dataKey="invested"
                    name="Invested"
                    fill="#B8860B"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="current"
                    name="Current"
                    fill="#DAA520"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by code, name, or description..."
              className="w-full rounded-lg border border-(--border) bg-(--input) py-2 pl-9 pr-9 text-xs text-(--foreground) outline-none transition focus:border-(--ring)"
            />
            {searchInput && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground) hover:text-(--foreground)"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <Button size="sm" variant="secondary" onClick={handleSearch}>
            <Search size={14} /> Search
          </Button>
        </div>

        {/* Investment Cards Grid */}
        {investmentList.loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-2xl" />
            ))}
          </div>
        ) : filteredInvestments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package
              size={48}
              className="mb-3 text-(--muted-foreground) opacity-40"
            />
            <div className="text-sm font-semibold text-(--foreground)">
              {searchQuery
                ? "No investments match your search"
                : "No investments yet"}
            </div>
            <div className="mt-1 text-xs text-(--muted-foreground)">
              {searchQuery
                ? "Try adjusting your search query"
                : "Start building your portfolio by adding your first investment"}
            </div>
            {!searchQuery && (
              <Button
                size="sm"
                className="mt-4"
                onClick={() => setCreateOpen(true)}
              >
                <Plus size={14} /> Add Investment
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredInvestments.map((inv) => (
              <InvestmentCard
                key={inv.id}
                investment={inv}
                onView={setDetailInvestment}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateInvestmentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onRefetch={totalRefetch}
      />
      <InvestmentDetailModal
        investment={detailInvestment}
        onClose={() => setDetailInvestment(null)}
        onSell={(inv) => setSellInvestment(inv)}
      />
      <SellInvestmentModal
        investment={sellInvestment}
        onClose={() => setSellInvestment(null)}
        onRefetch={totalRefetch}
      />
    </MainLayout>
  );
}
