import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  ArrowLeftRight,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const MAIN_NAV: NavItem[] = [
  { icon: LayoutDashboard, label: "Home", path: "/" },
  { icon: Wallet, label: "Wallet", path: "/wallet" },
  { icon: TrendingUp, label: "Investment", path: "/investment" },
  { icon: ArrowLeftRight, label: "Transaction", path: "/transaction" },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "AU";

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r border-(--border) bg-(--card) transition-all duration-300",
        collapsed ? "w-16" : "w-56",
      )}
    >
      {/* ── Logo ── */}
      <div
        className={cn(
          "flex items-center gap-2.5 border-b border-(--border) px-4 py-4",
          collapsed && "justify-center px-2",
        )}
      >
        <img
          className="h-10 w-10"
          src="/public/images/logo.png"
          alt="Aurify Logo"
        />
        {!collapsed && (
          <div>
            <div className="font-heading font-bold tracking-wide text-gold-gradient">
              Aurify
            </div>
            <div className="text-[10px] text-(--muted-foreground)">
              Financial Management
            </div>
          </div>
        )}
      </div>

      {/* ── Main Nav ── */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        <div
          className={cn(
            "mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-(--muted-foreground)",
            collapsed && "hidden",
          )}
        >
          Main Menu
        </div>
        {MAIN_NAV.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all",
                isActive
                  ? "bg-gold-400/10 text-gold-400 shadow-sm"
                  : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)",
                collapsed && "justify-center px-2",
              )}
            >
              <Icon
                size={16}
                className={cn("shrink-0", isActive && "text-gold-400")}
              />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Bottom Section ── */}
      <div className="flex flex-col gap-1 border-t border-(--border) p-2">
        {/* ── User Card ── */}
        {collapsed ? (
          /* Collapsed: just avatar with glow */
          <div className="flex justify-center py-1">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold text-black"
              style={{
                background:
                  "linear-gradient(135deg, #ffd700 0%, #daa520 60%, #c5961e 100%)",
                boxShadow: "0 0 10px 2px rgba(218,165,32,0.45)",
              }}
              title={user?.email ?? "Profile"}
            >
              {initials}
            </div>
          </div>
        ) : (
          /* Expanded: full user card with golden glow */
          <div
            className="mt-1 overflow-hidden rounded-xl border"
            style={{
              borderColor: "rgba(218,165,32,0.3)",
              background:
                "linear-gradient(135deg, rgba(218,165,32,0.08) 0%, rgba(255,215,0,0.04) 50%, rgba(218,165,32,0.06) 100%)",
              boxShadow:
                "0 0 16px 0 rgba(218,165,32,0.12), inset 0 1px 0 rgba(255,215,0,0.1)",
            }}
          >
            {/* Top: avatar + email */}
            <div className="flex items-center gap-3 px-3 py-2.5">
              {/* Avatar */}
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-black"
                style={{
                  background:
                    "linear-gradient(135deg, #ffd700 0%, #daa520 60%, #c5961e 100%)",
                  boxShadow: "0 0 8px 1px rgba(218,165,32,0.5)",
                }}
              >
                {initials}
              </div>
              {/* Info */}
              <div className="min-w-0 flex-1">
                <div
                  className="truncate text-[11px] font-bold leading-tight"
                  style={{
                    background: "linear-gradient(90deg, #ffd700, #daa520)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {user?.email?.split("@")[0] ?? "User"}
                </div>
                <div className="truncate text-[10px] text-(--muted-foreground)">
                  {user?.email ?? ""}
                </div>
              </div>
              {/* Profile icon button */}
              <button
                className="shrink-0 rounded-md p-1 text-(--muted-foreground) transition hover:text-gold-400"
                title="Profile"
              >
                <User size={13} />
              </button>
            </div>

            {/* Divider with gold tint */}
            <div
              className="mx-3"
              style={{
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent, rgba(218,165,32,0.3), transparent)",
              }}
            />

            {/* Bottom: logout */}
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-medium text-rose-400/80 transition hover:bg-rose-500/10 hover:text-rose-400"
            >
              <LogOut size={12} />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Collapse toggle ── */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-5 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-(--border) bg-(--card) text-(--muted-foreground) transition hover:text-(--foreground)"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
