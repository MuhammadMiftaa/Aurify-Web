import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

// Placeholder illustration SVGs
function IllustrationEmpty({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 90"
      fill="none"
      className={cn("opacity-40", className)}
      aria-hidden="true"
    >
      <rect
        x="10"
        y="20"
        width="100"
        height="60"
        rx="8"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4 3"
      />
      <circle cx="60" cy="50" r="18" stroke="currentColor" strokeWidth="2" />
      <path
        d="M52 50h16M60 42v16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M25 15 Q60 5 95 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="3 2"
      />
    </svg>
  );
}

function IllustrationChart({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      className={cn("opacity-40", className)}
      aria-hidden="true"
    >
      <rect
        x="8"
        y="8"
        width="104"
        height="64"
        rx="6"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M20 60 L35 40 L50 48 L65 28 L80 36 L95 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="4 3"
      />
      <circle cx="35" cy="40" r="2.5" fill="currentColor" opacity="0.5" />
      <circle cx="65" cy="28" r="2.5" fill="currentColor" opacity="0.5" />
      <circle cx="95" cy="18" r="2.5" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function IllustrationWallet({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      className={cn("opacity-40", className)}
      aria-hidden="true"
    >
      <rect
        x="10"
        y="20"
        width="100"
        height="50"
        rx="8"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M10 35h100" stroke="currentColor" strokeWidth="1.5" />
      <rect
        x="75"
        y="42"
        width="22"
        height="14"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="86" cy="49" r="2" fill="currentColor" opacity="0.5" />
      <path
        d="M20 26V20a8 8 0 0 1 8-8h64a8 8 0 0 1 8 8v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 2"
      />
    </svg>
  );
}

const ILLUSTRATIONS = {
  empty: IllustrationEmpty,
  chart: IllustrationChart,
  wallet: IllustrationWallet,
};

export type IllustrationType = keyof typeof ILLUSTRATIONS;

interface EmptyStateFullProps extends EmptyStateProps {
  illustration?: IllustrationType;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  size = "md",
  illustration,
}: EmptyStateFullProps) {
  const Illustration = illustration ? ILLUSTRATIONS[illustration] : null;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        size === "sm" && "gap-1.5 py-4",
        size === "md" && "gap-2.5 py-8",
        size === "lg" && "gap-3 py-12",
        className,
      )}
    >
      {Illustration ? (
        <Illustration
          className={cn(
            "text-(--muted-foreground)",
            size === "sm" && "h-12 w-16",
            size === "md" && "h-16 w-20",
            size === "lg" && "h-24 w-32",
          )}
        />
      ) : icon ? (
        <div className="text-(--muted-foreground) opacity-40">{icon}</div>
      ) : null}
      <div>
        <p
          className={cn(
            "font-semibold text-(--foreground)",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base",
          )}
        >
          {title}
        </p>
        {description && (
          <p
            className={cn(
              "mt-0.5 text-(--muted-foreground)",
              size === "sm" && "text-[10px]",
              size === "md" && "text-xs",
              size === "lg" && "text-sm",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

// ── Pre-built empty states for common dashboard sections ──

export function EmptyFinancialData() {
  return (
    <EmptyState
      illustration="empty"
      title="No financial data yet"
      description="Your financial data will appear here once you record your first transaction."
      size="lg"
    />
  );
}

export function EmptyChartData({
  title = "No chart data available",
}: {
  title?: string;
}) {
  return (
    <EmptyState
      illustration="chart"
      title={title}
      description="Data will appear here once there is financial activity."
      size="md"
    />
  );
}

export function EmptyTransactions() {
  return (
    <EmptyState
      illustration="empty"
      title="No transactions found"
      description="No transactions in this category for the selected period."
      size="md"
    />
  );
}

export function EmptyNetWorth() {
  return (
    <EmptyState
      illustration="wallet"
      title="Net worth data unavailable"
      description="Add assets or investments to see your net worth composition."
      size="md"
    />
  );
}

export function EmptyWallets() {
  return (
    <EmptyState
      illustration="wallet"
      title="No wallets found"
      description="Add a wallet or bank account to start tracking your finances."
      size="md"
    />
  );
}
