import { useState, useEffect } from "react";
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
  Menu,
  X,
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
  const { user, logout, cachedProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Use cached profile fullname initials if available, otherwise fallback to email
  const initials = cachedProfile?.fullname
    ? cachedProfile.fullname
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email
      ? user.email.slice(0, 2).toUpperCase()
      : "AU";

  // Profile photo URL from cached profile
  const photoUrl = cachedProfile?.photo_url || "";

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-2.5 border-b border-(--border) px-4 py-4",
          collapsed && "justify-center px-2",
        )}
      >
        <img
          className="h-10 w-10"
          src="/images/icons/logo.png"
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
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-(--muted-foreground) transition hover:text-(--foreground) md:hidden"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Nav */}
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

      {/* Bottom Section */}
      <div className="flex flex-col gap-1 border-t border-(--border) p-2">
        {collapsed ? (
          <div className="flex justify-center py-1">
            <button
              onClick={() => navigate("/profile")}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-[12px] font-bold text-black transition hover:ring-2 hover:ring-gold-400/50"
              style={
                !photoUrl
                  ? {
                      background:
                        "linear-gradient(135deg, #ffd700 0%, #daa520 60%, #c5961e 100%)",
                      boxShadow: "0 0 10px 2px rgba(218,165,32,0.45)",
                    }
                  : undefined
              }
              title={user?.email ?? "Profile"}
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </button>
          </div>
        ) : (
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
            <div className="flex items-center gap-3 px-3 py-2.5">
              <button
                onClick={() => navigate("/profile")}
                className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-[12px] font-bold text-black transition hover:ring-2 hover:ring-gold-400/50"
                style={
                  !photoUrl
                    ? {
                        background:
                          "linear-gradient(135deg, #ffd700 0%, #daa520 60%, #c5961e 100%)",
                        boxShadow: "0 0 8px 1px rgba(218,165,32,0.5)",
                      }
                    : undefined
                }
              >
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </button>
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
                  {cachedProfile?.fullname ||
                    user?.email?.split("@")[0] ||
                    "User"}
                </div>
                <div className="truncate text-[10px] text-(--muted-foreground)">
                  {user?.email ?? ""}
                </div>
              </div>
              <button
                onClick={() => navigate("/profile")}
                className="shrink-0 rounded-md p-1 text-(--muted-foreground) transition hover:text-gold-400"
                title="Profile"
              >
                <User size={13} />
              </button>
            </div>

            <div
              className="mx-3"
              style={{
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent, rgba(218,165,32,0.3), transparent)",
              }}
            />

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

      {/* Collapse toggle (desktop only) */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-5 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-(--border) bg-(--card) text-(--muted-foreground) transition hover:text-(--foreground) md:flex"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-(--border) bg-(--card) px-4 py-3 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-(--muted-foreground) transition hover:text-(--foreground)"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <img
            className="h-7 w-7"
            src="/images/icons/logo.png"
            alt="Aurify Logo"
          />
          <span className="font-heading text-sm font-bold text-gold-gradient">
            Aurify
          </span>
        </div>
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-black"
          style={{
            background:
              "linear-gradient(135deg, #ffd700 0%, #daa520 60%, #c5961e 100%)",
          }}
        >
          {initials}
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-(--border) bg-(--card) transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "relative hidden h-screen flex-col border-r border-(--border) bg-(--card) transition-all duration-300 md:flex",
          collapsed ? "w-16" : "w-56",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
