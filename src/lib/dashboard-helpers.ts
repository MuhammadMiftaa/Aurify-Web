/**
 * Format number as IDR currency
 */
export function fmtCurrency(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * Short format: 1.2M, 456K, etc.
 */
export function fmtShort(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
}

/**
 * Format percentage with sign
 */
export function fmtPct(n: number): string {
  return `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;
}

/**
 * Get month label from number (1-12)
 */
export function monthLabel(m: number): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months[m - 1] ?? String(m);
}

/**
 * Balance snapshot → chart label
 */
export function snapshotLabel(s: {
  year?: number;
  month?: number;
  day?: number;
  week?: number;
  date?: string;
}): string {
  if (s.day) return `${s.day} ${monthLabel(s.month ?? 1)}`;
  if (s.week) return `W${s.week}`;
  if (s.month) return monthLabel(s.month);
  return String(s.year ?? "");
}

/**
 * Color for health indicator based on value
 */
export function healthColor(
  value: number,
  thresholds: { green: number; yellow: number },
  inverse = false,
): string {
  const green = "var(--color-emerald-500, #10b981)";
  const yellow = "var(--color-amber-500, #f59e0b)";
  const red = "var(--color-rose-500, #f43f5e)";

  if (inverse) {
    // Lower is better (e.g., expense/income ratio)
    if (value <= thresholds.green) return green;
    if (value <= thresholds.yellow) return yellow;
    return red;
  }
  // Higher is better (e.g., savings rate)
  if (value >= thresholds.green) return green;
  if (value >= thresholds.yellow) return yellow;
  return red;
}
