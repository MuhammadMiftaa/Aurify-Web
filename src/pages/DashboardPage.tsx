import { useState, useMemo } from "react";
import {
  ComposedChart,
  Area,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
} from "recharts";
import { Sun, Moon } from "lucide-react";
import {
  useWallets,
  useFinancialSummary,
  useBalance,
  useTransactions,
  useNetWorthComposition,
  type GlobalFilter,
} from "@/hooks/useDashboard";
import {
  fmtShort,
  fmtPct,
  snapshotLabel,
  healthColor,
} from "@/lib/dashboard-helpers";
import { cn } from "@/lib/utils";
import type { FinancialSummary } from "@/types/dashboard";
import { MainLayout } from "@/components/layout/MainLayout";
import { useTheme } from "@/contexts/ThemeContext";
import {
  SkeletonKPICard,
  SkeletonChart,
  SkeletonCategoryList,
  SkeletonHealthBars,
  SkeletonNetWorth,
  SkeletonInvestmentSummary,
} from "@/components/ui/Skeleton";
import {
  EmptyChartData,
  EmptyFinancialData,
  EmptyTransactions,
} from "@/components/ui/EmptyState";

// ── Chart Color Tokens ──
const CHART = {
  green: "#10b981",
  red: "#f43f5e",
  gold: "#daa520",
  accent: "#ffd700",
  blue: "#3b82f6",
  amber: "#f59e0b",
  pie: ["#daa520", "#10b981"],
};

// ════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════

function GrowthBadge({ value }: { value: number }) {
  const isPos = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        isPos
          ? "bg-emerald-500/10 text-emerald-500"
          : "bg-rose-500/10 text-rose-500",
      )}
    >
      {isPos ? "▲" : "▼"} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function KPICard({
  label,
  value,
  growth,
  accent,
  sub,
}: {
  label: string;
  value: string;
  growth?: number;
  accent: string;
  sub?: string;
}) {
  return (
    <div className="relative flex flex-1 flex-col gap-2 overflow-hidden rounded-xl border border-(--border) bg-(--card) px-5 py-4">
      <div
        className="absolute left-0 right-0 top-0 h-0.5 rounded-t-xl opacity-70"
        style={{ background: accent }}
      />
      <span className="text-[11px] font-semibold uppercase tracking-widest text-(--muted-foreground)">
        {label}
      </span>
      <span className="font-mono text-xl font-bold text-(--foreground)">
        {value}
      </span>
      <div className="flex items-center gap-2">
        {growth !== undefined && <GrowthBadge value={growth} />}
        {sub && (
          <span className="text-[11px] text-(--muted-foreground)">{sub}</span>
        )}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-3">
      <div className="text-[13px] font-bold tracking-wide text-(--foreground)">
        {title}
      </div>
      {subtitle && (
        <div className="mt-0.5 text-[11px] text-(--muted-foreground)">
          {subtitle}
        </div>
      )}
    </div>
  );
}

function Card({
  children,
  className: cls,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("rounded-xl border border-(--border) bg-(--card) p-5", cls)}
    >
      {children}
    </div>
  );
}

function HealthBar({
  label,
  value,
  max,
  color,
  suffix = "",
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  suffix?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] text-(--muted-foreground)">{label}</span>
        <span className="font-mono text-xs font-semibold" style={{ color }}>
          {typeof value === "number" && value > 999 ? fmtShort(value) : value}
          {suffix}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-(--muted)">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function CategoryRow({
  name,
  amount,
  pct,
  count,
  color,
}: {
  name: string;
  amount: number;
  pct: number;
  count: number;
  color: string;
}) {
  return (
    <div className="mb-2.5">
      <div className="mb-1 flex items-center justify-between">
        <span className="flex-1 truncate text-xs text-(--foreground) opacity-80">
          {name}
        </span>
        <span className="mr-2 text-[11px] text-(--muted-foreground)">
          {count}x
        </span>
        <span className="font-mono text-xs font-semibold text-(--foreground)">
          {fmtShort(amount)}
        </span>
      </div>
      <div className="h-0.75 overflow-hidden rounded-full bg-(--muted)">
        <div
          className="h-full rounded-full opacity-80"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-(--border) bg-(--card) px-3.5 py-2.5 text-xs shadow-lg">
      <div className="mb-1.5 font-semibold text-(--muted-foreground)">
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }} className="mb-0.5">
          {p.name}: <strong>{fmtShort(p.value)}</strong>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════
// MAIN DASHBOARD
// ════════════════════════════════════════════

export function DashboardPage() {
  // ── Global filter state ──
  const [walletID, setWalletID] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const globalFilter: GlobalFilter = useMemo(
    () => ({
      walletID,
      range:
        dateRange.start && dateRange.end
          ? { start: dateRange.start, end: dateRange.end }
          : undefined,
    }),
    [walletID, dateRange],
  );

  // ── Local filter state ──
  const [aggregation, setAggregation] = useState<
    "daily" | "weekly" | "monthly"
  >("monthly");
  const [categoryTab, setCategoryTab] = useState<"expense" | "income">(
    "expense",
  );

  // ── Theme ──
  const { theme, toggleTheme } = useTheme();

  // ── Data hooks ──
  const wallets = useWallets();
  const financialSummary = useFinancialSummary(globalFilter);
  const balance = useBalance(globalFilter, aggregation);
  const transactions = useTransactions(globalFilter, categoryTab);
  const netWorth = useNetWorthComposition();

  // ── Derived: latest financial summary ──
  const latest: FinancialSummary | null = useMemo(() => {
    if (!financialSummary.data?.length) return null;
    return financialSummary.data[financialSummary.data.length - 1];
  }, [financialSummary.data]);

  // ── Derived: balance chart data ──
  const balanceChartData = useMemo(() => {
    if (!balance.data) return [];
    return balance.data.map((s) => ({
      label: snapshotLabel(s),
      closing: s.closing_balance ?? 0,
      income: s.total_income ?? 0,
      expense: s.total_expense ?? 0,
    }));
  }, [balance.data]);

  // ── Derived: income vs expense chart data ──
  const incomeExpenseData = useMemo(() => {
    if (!financialSummary.data) return [];
    return financialSummary.data.map((s) => ({
      period: s.period_key,
      income: s.income_now,
      expense: s.expense_now,
      profit: s.profit_now,
    }));
  }, [financialSummary.data]);

  // ── Derived: top categories ──
  const topCategories = useMemo(() => {
    if (!transactions.data?.length) return [];
    const total = transactions.data.reduce((s, c) => s + c.total_amount, 0);
    return transactions.data.slice(0, 5).map((c) => ({
      name: c.category_name,
      amount: c.total_amount,
      pct: total > 0 ? (c.total_amount / total) * 100 : 0,
      count: c.total_transactions,
    }));
  }, [transactions.data]);

  // ── Pie chart slice colors ──
  const pieSliceColors = CHART.pie;

  const axisStyle = {
    fill: "var(--muted-foreground)",
    fontSize: 11,
  };

  return (
    <MainLayout>
      {/* ════════ HEADER — Sticky Global Filter ════════ */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-(--border) bg-(--card) px-6 py-3.5">
        <div>
          <div className="text-sm font-bold tracking-wide text-(--foreground)">
            Financial Dashboard
          </div>
          <div className="text-[10px] text-(--muted-foreground)">
            Overview of your financial health
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme toggle — icon only */}
          <button
            onClick={toggleTheme}
            title={
              theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-(--border) text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground)"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <span className="mr-1 text-[10px] uppercase tracking-widest text-(--muted-foreground)">
            Filter
          </span>

          {/* Wallet selector */}
          <select
            value={walletID}
            onChange={(e) => setWalletID(e.target.value)}
            className="rounded-lg border border-(--border) bg-(--input) px-2.5 py-1.5 text-xs text-(--foreground) outline-none focus:border-(--ring)"
          >
            <option value="">All Wallets</option>
            {wallets.data?.map((w) => (
              <option key={w.wallet_id} value={w.wallet_id}>
                {w.wallet_name}
              </option>
            ))}
          </select>

          {/* Date range */}
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((p) => ({ ...p, start: e.target.value }))
            }
            className="rounded-lg border border-(--border) bg-(--input) px-2.5 py-1.5 text-xs text-(--foreground) outline-none focus:border-(--ring)"
          />
          <span className="text-xs text-(--muted-foreground)">→</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((p) => ({ ...p, end: e.target.value }))
            }
            className="rounded-lg border border-(--border) bg-(--input) px-2.5 py-1.5 text-xs text-(--foreground) outline-none focus:border-(--ring)"
          />
        </div>
      </header>

      {/* ════════ CONTENT ════════ */}
      <main className="mx-auto flex max-w-350 flex-col gap-4 p-5">
        {/* ── TIER 1: KPI Cards ── */}
        {financialSummary.loading ? (
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonKPICard key={i} />
            ))}
          </div>
        ) : latest ? (
          <div className="flex gap-3">
            <KPICard
              label="Total Income"
              value={fmtShort(latest.income_now)}
              growth={latest.income_growth_pct}
              accent={CHART.green}
              sub={
                latest.largest_income !== undefined
                  ? `Largest: ${fmtShort(latest.largest_income)}`
                  : undefined
              }
            />
            <KPICard
              label="Total Expense"
              value={fmtShort(latest.expense_now)}
              growth={latest.expense_growth_pct}
              accent={CHART.red}
              sub={
                latest.largest_expense !== undefined
                  ? `Largest: ${fmtShort(latest.largest_expense)}`
                  : undefined
              }
            />
            <KPICard
              label="Net Profit"
              value={fmtShort(latest.profit_now)}
              growth={latest.profit_growth_pct}
              accent={CHART.gold}
              sub={`Savings: ${latest.savings_rate?.toFixed(1) ?? 0}%`}
            />
            <KPICard
              label="Balance"
              value={fmtShort(latest.balance_now)}
              growth={latest.balance_growth_pct}
              accent={CHART.amber}
              sub={
                latest.runway_days !== undefined
                  ? `Runway: ${latest.runway_days} days`
                  : undefined
              }
            />
          </div>
        ) : (
          <EmptyFinancialData />
        )}

        {/* ── TIER 2: Balance Trend (Full Width) ── */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <SectionHeader
              title="Balance Trend"
              subtitle={
                wallets.data?.find((w) => w.wallet_id === walletID)
                  ?.wallet_name ?? "All Wallets"
              }
            />
            <div className="flex gap-1">
              {(["daily", "weekly", "monthly"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAggregation(a)}
                  className={cn(
                    "rounded-lg border px-3 py-1 text-[11px] font-semibold capitalize transition",
                    aggregation === a
                      ? "border-gold-400/40 bg-gold-400/10 text-gold-400"
                      : "border-(--border) text-(--muted-foreground) hover:text-(--foreground)",
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {balance.loading ? (
            <SkeletonChart height={220} />
          ) : balanceChartData.length === 0 ? (
            <EmptyChartData title="No balance data available" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart
                data={balanceChartData}
                margin={{ top: 4, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={CHART.gold}
                      stopOpacity={0.15}
                    />
                    <stop
                      offset="100%"
                      stopColor={CHART.gold}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={fmtShort}
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="closing"
                  name="Balance"
                  fill="url(#balGrad)"
                  stroke={CHART.gold}
                  strokeWidth={2.5}
                  dot={false}
                />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill={CHART.green}
                  opacity={0.5}
                  radius={[3, 3, 0, 0]}
                  barSize={14}
                />
                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill={CHART.red}
                  opacity={0.5}
                  radius={[3, 3, 0, 0]}
                  barSize={14}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: 11,
                    paddingTop: 8,
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* ── TIER 3: Detail Breakdown (3 columns) ── */}
        <div className="grid grid-cols-3 gap-4">
          {/* Col 1: Income vs Expense Bar Chart */}
          <Card>
            <SectionHeader
              title="Income vs Expense"
              subtitle="Monthly comparison"
            />
            {financialSummary.loading ? (
              <SkeletonChart height={200} />
            ) : incomeExpenseData.length === 0 ? (
              <EmptyChartData title="No comparison data available" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={incomeExpenseData}
                  barGap={2}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="period"
                    tick={axisStyle}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={fmtShort}
                    tick={axisStyle}
                    axisLine={false}
                    tickLine={false}
                    width={42}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="income"
                    name="Income"
                    fill={CHART.green}
                    radius={[3, 3, 0, 0]}
                    barSize={10}
                    opacity={0.85}
                  />
                  <Bar
                    dataKey="expense"
                    name="Expense"
                    fill={CHART.red}
                    radius={[3, 3, 0, 0]}
                    barSize={10}
                    opacity={0.85}
                  />
                  <Bar
                    dataKey="profit"
                    name="Profit"
                    fill={CHART.blue}
                    radius={[3, 3, 0, 0]}
                    barSize={10}
                    opacity={0.85}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Col 2: Top Categories */}
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <SectionHeader
                title="Top Categories"
                subtitle={
                  categoryTab === "expense" ? "By spending" : "By income source"
                }
              />
              <div className="flex gap-1">
                {(["expense", "income"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCategoryTab(t)}
                    className={cn(
                      "rounded-md border px-2.5 py-0.5 text-[10px] font-semibold capitalize transition",
                      categoryTab === t
                        ? t === "expense"
                          ? "border-rose-500/40 bg-rose-500/10 text-rose-500"
                          : "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                        : "border-(--border) text-(--muted-foreground)",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {transactions.loading ? (
              <SkeletonCategoryList rows={5} />
            ) : topCategories.length > 0 ? (
              topCategories.map((c, i) => (
                <CategoryRow
                  key={i}
                  name={c.name}
                  amount={c.amount}
                  pct={c.pct}
                  count={c.count}
                  color={categoryTab === "expense" ? CHART.red : CHART.green}
                />
              ))
            ) : (
              <EmptyTransactions />
            )}
          </Card>

          {/* Col 3: Financial Health Indicators */}
          <Card>
            <SectionHeader
              title="Financial Health"
              subtitle="Current period indicators"
            />
            {financialSummary.loading ? (
              <SkeletonHealthBars rows={4} />
            ) : !latest ? (
              <EmptyChartData title="No health indicators available" />
            ) : (
              <>
                <HealthBar
                  label="Expense / Income Ratio"
                  value={latest.expense_to_income_ratio ?? 0}
                  max={100}
                  color={healthColor(
                    latest.expense_to_income_ratio ?? 0,
                    { green: 60, yellow: 80 },
                    true,
                  )}
                  suffix="%"
                />
                <HealthBar
                  label="Savings Rate"
                  value={latest.savings_rate ?? 0}
                  max={100}
                  color={healthColor(latest.savings_rate ?? 0, {
                    green: 20,
                    yellow: 10,
                  })}
                  suffix="%"
                />
                <HealthBar
                  label="Daily Burn Rate"
                  value={latest.burn_rate_daily ?? 0}
                  max={1000000}
                  color={CHART.amber}
                />
                <HealthBar
                  label="Runway Days"
                  value={latest.runway_days ?? 0}
                  max={365}
                  color={
                    (latest.runway_days ?? 0) > 90 ? CHART.green : CHART.red
                  }
                  suffix=" d"
                />
                <div className="mt-1 flex justify-between border-t border-(--border) pt-2.5">
                  <div>
                    <div className="text-[10px] text-(--muted-foreground)">
                      Avg Transaction
                    </div>
                    <div className="font-mono text-[13px] font-semibold text-(--foreground)">
                      {fmtShort(latest.avg_transaction_amount ?? 0)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-(--muted-foreground)">
                      Largest Expense
                    </div>
                    <div className="font-mono text-[13px] font-semibold text-rose-500">
                      {fmtShort(latest.largest_expense ?? 0)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* ── TIER 4: Net Worth (40%) + Investment (60%) ── */}
        <div className="grid grid-cols-5 gap-4">
          {/* Net Worth Composition — 2/5 */}
          <Card className="col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <SectionHeader
                title="Net Worth Composition"
                subtitle="Asset allocation"
              />
              {latest?.net_worth?.net_worth_growth_pct !== undefined && (
                <GrowthBadge value={latest.net_worth.net_worth_growth_pct} />
              )}
            </div>

            {netWorth.loading ? (
              <SkeletonNetWorth />
            ) : !netWorth.data ? (
              <EmptyChartData title="No net worth data available" />
            ) : (
              <div className="flex items-center gap-6">
                {/* Donut — shape prop instead of deprecated Cell */}
                <div className="relative h-40 w-40 shrink-0">
                  <PieChart width={160} height={160}>
                    <Pie
                      data={netWorth.data.slices}
                      cx={75}
                      cy={75}
                      innerRadius={52}
                      outerRadius={72}
                      dataKey="amount"
                      strokeWidth={0}
                      paddingAngle={3}
                      shape={(props: {
                        cx?: number;
                        cy?: number;
                        innerRadius?: number;
                        outerRadius?: number;
                        startAngle?: number;
                        endAngle?: number;
                        index?: number;
                      }) => {
                        const {
                          cx = 0,
                          cy = 0,
                          innerRadius = 0,
                          outerRadius = 0,
                          startAngle = 0,
                          endAngle = 0,
                          index = 0,
                        } = props;
                        const color = pieSliceColors[index] ?? CHART.gold;
                        const toRad = (deg: number) => (deg * Math.PI) / 180;
                        const x1 =
                          cx + outerRadius * Math.cos(toRad(-startAngle));
                        const y1 =
                          cy + outerRadius * Math.sin(toRad(-startAngle));
                        const x2 =
                          cx + outerRadius * Math.cos(toRad(-endAngle));
                        const y2 =
                          cy + outerRadius * Math.sin(toRad(-endAngle));
                        const x3 =
                          cx + innerRadius * Math.cos(toRad(-endAngle));
                        const y3 =
                          cy + innerRadius * Math.sin(toRad(-endAngle));
                        const x4 =
                          cx + innerRadius * Math.cos(toRad(-startAngle));
                        const y4 =
                          cy + innerRadius * Math.sin(toRad(-startAngle));
                        const largeArcFlag =
                          endAngle - startAngle > 180 ? 1 : 0;
                        const d = [
                          `M ${x1} ${y1}`,
                          `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${x2} ${y2}`,
                          `L ${x3} ${y3}`,
                          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${x4} ${y4}`,
                          "Z",
                        ].join(" ");
                        return <path d={d} fill={color} />;
                      }}
                    />
                  </PieChart>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-[10px] uppercase tracking-widest text-(--muted-foreground)">
                      Total
                    </div>
                    <div className="font-mono text-sm font-bold text-(--foreground)">
                      {fmtShort(netWorth.data.total)}
                    </div>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="flex flex-1 flex-col gap-2.5">
                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-widest text-(--muted-foreground)">
                      Total Net Worth
                    </div>
                    <div className="font-mono text-xl font-bold text-(--foreground)">
                      {fmtShort(netWorth.data.total)}
                    </div>
                  </div>
                  {netWorth.data.slices?.map((s, i) => (
                    <div key={i}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[11px] text-(--muted-foreground)">
                          <span
                            className="inline-block h-1.75 w-1.75 rounded-sm"
                            style={{
                              background: pieSliceColors[i] ?? CHART.gold,
                            }}
                          />
                          {s.label}
                        </span>
                        <span
                          className="font-mono text-[11px] font-semibold"
                          style={{ color: pieSliceColors[i] ?? CHART.gold }}
                        >
                          {fmtShort(s.amount)}
                        </span>
                      </div>
                      <div className="h-0.75 overflow-hidden rounded-full bg-(--muted)">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${s.percentage}%`,
                            background: pieSliceColors[i] ?? CHART.gold,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Investment Summary — 3/5 */}
          <Card className="col-span-3">
            <SectionHeader
              title="Investment Summary"
              subtitle="Portfolio overview"
            />
            {financialSummary.loading ? (
              <SkeletonInvestmentSummary />
            ) : !latest?.investment_summary ? (
              <EmptyChartData title="No investment data available" />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {/* Left: financial rows */}
                <div className="flex flex-col gap-2.5">
                  {[
                    {
                      label: "Total Invested",
                      value: fmtShort(latest.investment_summary.total_invested),
                      color: "var(--foreground)",
                    },
                    {
                      label: "Current Valuation",
                      value: fmtShort(
                        latest.investment_summary.total_current_valuation ?? 0,
                      ),
                      color: CHART.gold,
                    },
                    {
                      label: "Unrealized Gain",
                      value: `${(latest.investment_summary.unrealized_gain ?? 0) >= 0 ? "+" : ""}${fmtShort(latest.investment_summary.unrealized_gain ?? 0)}`,
                      color: CHART.green,
                    },
                    {
                      label: "Realized Gain",
                      value: `${(latest.investment_summary.realized_gain ?? 0) >= 0 ? "+" : ""}${fmtShort(latest.investment_summary.realized_gain ?? 0)}`,
                      color: CHART.green,
                    },
                    {
                      label: "Total Sold",
                      value: fmtShort(
                        latest.investment_summary.total_sold_amount ?? 0,
                      ),
                      color: "var(--foreground)",
                    },
                    {
                      label: "Total Deficit",
                      value: fmtShort(
                        latest.investment_summary.total_deficit ?? 0,
                      ),
                      color: CHART.red,
                    },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-b border-(--border) pb-2"
                    >
                      <span className="text-[11px] text-(--muted-foreground)">
                        {row.label}
                      </span>
                      <span
                        className="font-mono text-[13px] font-bold"
                        style={{ color: row.color }}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Right: progress + stats grid */}
                <div className="flex flex-col gap-3.5">
                  {/* Invested vs Current progress */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[11px] text-(--muted-foreground)">
                        Invested → Current
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-500">
                        +
                        {latest.investment_summary.investment_growth_pct?.toFixed(
                          1,
                        )}
                        %
                      </span>
                    </div>
                    <div className="mb-0.5 h-2 overflow-hidden rounded bg-(--muted)">
                      <div className="h-full w-full rounded bg-(--muted-foreground) opacity-30" />
                    </div>
                    <div className="h-2 overflow-hidden rounded bg-(--muted)">
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${Math.min(
                            ((latest.investment_summary
                              .total_current_valuation ?? 0) /
                              Math.max(
                                latest.investment_summary.total_invested,
                                1,
                              )) *
                              100,
                            100,
                          )}%`,
                          background: `linear-gradient(90deg, ${CHART.gold}, ${CHART.green})`,
                        }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between">
                      <span className="text-[10px] text-(--muted-foreground)">
                        Invested
                      </span>
                      <span className="text-[10px] text-emerald-500">
                        Current
                      </span>
                    </div>
                  </div>

                  {/* Stats grid 2x2 */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        label: "Active Positions",
                        value: latest.investment_summary.active_positions,
                        color: CHART.gold,
                      },
                      {
                        label: "Investment Growth",
                        value: fmtPct(
                          latest.investment_summary.investment_growth_pct ?? 0,
                        ),
                        color: CHART.green,
                      },
                      {
                        label: "Total Buys",
                        value: latest.investment_summary.buy_count,
                        color: CHART.green,
                      },
                      {
                        label: "Total Sells",
                        value: latest.investment_summary.sell_count ?? 0,
                        color: CHART.red,
                      },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-(--border) bg-(--secondary) p-3"
                      >
                        <div
                          className="font-mono text-lg font-bold"
                          style={{ color: stat.color }}
                        >
                          {stat.value}
                        </div>
                        <div className="mt-0.5 text-[10px] text-(--muted-foreground)">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </MainLayout>
  );
}
