import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Wallet,
  CreditCard,
  Banknote,
  Search,
  X,
  Edit3,
  Trash2,
  ArrowLeftRight,
  Sun,
  Moon,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtShort } from "@/lib/dashboard-helpers";
import { MainLayout } from "@/components/layout/MainLayout";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  useWalletList,
  useWalletTypes,
  useWalletSummary,
} from "@/hooks/useWallet";
import {
  createWallet,
  updateWallet,
  deleteWallet,
} from "@/lib/wallet-transaction-api";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button, Input } from "@/components/ui/FormElements";
import type {
  Wallet as WalletT,
  CreateWalletPayload,
  UpdateWalletPayload,
} from "@/types/wallet";
import type { WalletType } from "@/types/wallet";
import toast from "react-hot-toast";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

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

function getWalletInitials(name: string): string {
  const words = name.split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getWalletTypeIcon(type: string) {
  switch (type) {
    case "bank":
      return <CreditCard size={14} />;
    case "e-wallet":
      return <Wallet size={14} />;
    case "cash":
      return <Banknote size={14} />;
    default:
      return <CreditCard size={14} />;
  }
}

// ════════════════════════════════════════════
// WALLET CARD — Luxury Black Card with Gold Glow
// ════════════════════════════════════════════

function WalletCard({
  wallet,
  onEdit,
  onDelete,
}: {
  wallet: WalletT;
  onEdit: (w: WalletT) => void;
  onDelete: (w: WalletT) => void;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border transition-all duration-500 hover:scale-[1.02]"
      style={{
        borderColor: "rgba(218,165,32,0.2)",
        background:
          "linear-gradient(145deg, #0f0f0f 0%, #1a1a1a 40%, #111111 70%, #0d0d0d 100%)",
        boxShadow:
          "0 0 30px rgba(218,165,32,0.08), 0 0 60px rgba(218,165,32,0.04), inset 0 1px 0 rgba(255,215,0,0.08)",
      }}
    >
      {/* Gold accent line at top */}
      <div
        className="h-0.5 w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, #daa520, #ffd700, #daa520, transparent)",
        }}
      />

      <div className="p-5">
        {/* Top: Logo + Actions */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Bank Logo Placeholder - Initials */}
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-black"
              style={{
                background:
                  "linear-gradient(135deg, #ffd700 0%, #daa520 60%, #c5961e 100%)",
                boxShadow: "0 0 12px rgba(218,165,32,0.5)",
              }}
            >
              {getWalletInitials(wallet.name)}
            </div>
            <div>
              <div className="text-sm font-bold text-(--foreground)">
                {wallet.name}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-(--muted-foreground)">
                {getWalletTypeIcon(wallet.wallet_type_detail?.type ?? "bank")}
                <span>{wallet.wallet_type_detail?.name ?? "Unknown"}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => onEdit(wallet)}
              className="rounded-lg p-1.5 text-(--muted-foreground) transition hover:bg-(--muted) hover:text-gold-400"
              title="Edit wallet"
            >
              <Edit3 size={14} />
            </button>
            {(!wallet.balance || wallet.balance === 0) && (
              <button
                onClick={() => onDelete(wallet)}
                className="rounded-lg p-1.5 text-(--muted-foreground) transition hover:bg-rose-500/10 hover:text-rose-400"
                title="Delete wallet"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Balance */}
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-widest text-(--muted-foreground)">
            Balance
          </div>
          <div
            className="mt-1 font-mono text-2xl font-bold"
            style={{
              background: "linear-gradient(90deg, #ffd700, #f5deb3, #daa520)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {fmtCurrency(wallet.balance ?? 0)}
          </div>
        </div>

        {/* Gold divider */}
        <div
          className="mb-3"
          style={{
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(218,165,32,0.3), transparent)",
          }}
        />

        {/* Details */}
        <div className="flex items-center justify-between text-[11px]">
          <div>
            <span className="text-(--muted-foreground)">Account: </span>
            <span className="font-mono text-(--foreground)">
              {wallet.number}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowLeftRight size={11} className="text-(--muted-foreground)" />
            <span className="font-mono text-(--foreground)">
              {wallet.transaction_count ?? 0}
            </span>
            <span className="text-(--muted-foreground)">txns</span>
          </div>
        </div>

        {/* Created date */}
        <div className="mt-2 text-[10px] text-(--muted-foreground)">
          Created{" "}
          {new Date(wallet.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Decorative corner glow */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 transition-opacity group-hover:opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(218,165,32,0.3) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

// ════════════════════════════════════════════
// SUMMARY CARDS
// ════════════════════════════════════════════

function SummaryCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-(--border) bg-(--card) px-4 py-3">
      <div
        className="absolute left-0 top-0 h-full w-0.5"
        style={{ background: accent }}
      />
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${accent}15`, color: accent }}
      >
        {icon}
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-(--muted-foreground)">
          {label}
        </div>
        <div className="font-mono text-lg font-bold text-(--foreground)">
          {value}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// CREATE/EDIT WALLET MODAL
// ════════════════════════════════════════════

function WalletFormModal({
  open,
  wallet,
  walletTypes,
  onClose,
  onSubmit,
}: {
  open: boolean;
  wallet: WalletT | null; // null = create, otherwise edit
  walletTypes: WalletType[];
  onClose: () => void;
  onSubmit: (
    data: CreateWalletPayload | UpdateWalletPayload,
    isEdit: boolean,
  ) => void;
}) {
  const isEdit = !!wallet;
  const [name, setName] = useState("");
  const [walletTypeId, setWalletTypeId] = useState("");
  const [number, setNumber] = useState("");
  const [initialDeposit, setInitialDeposit] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset / populate form when modal opens or wallet changes
  useEffect(() => {
    if (open) {
      setName(wallet?.name ?? "");
      setWalletTypeId(wallet?.wallet_type_id ?? "");
      setNumber(wallet?.number ?? "");
      setInitialDeposit("");
    }
  }, [open, wallet]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isEdit) {
      const payload: UpdateWalletPayload = {
        name,
        wallet_type_id: walletTypeId,
        number,
      };
      onSubmit(payload, true);
    } else {
      const payload: CreateWalletPayload = {
        name,
        wallet_type_id: walletTypeId,
        number,
        balance: parseFloat(initialDeposit) || 0,
      };
      onSubmit(payload, false);
    }

    setLoading(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-(--border) bg-(--card)"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow:
            "0 0 40px rgba(218,165,32,0.1), 0 25px 50px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--border) px-6 py-4">
          <h3 className="font-bold text-(--foreground)">
            {isEdit ? "Edit Wallet" : "Add New Wallet"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-(--muted-foreground) transition hover:text-(--foreground)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <Input
            label="Wallet Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. BCA Primary"
            required
          />

          <SearchableSelect
            label="Wallet Type"
            value={walletTypeId}
            onChange={setWalletTypeId}
            options={walletTypes.map((wt) => ({
              value: wt.id,
              label: wt.name,
              group: wt.type,
            }))}
            placeholder="Select type..."
            searchPlaceholder="Search wallet type..."
            grouped
            required
          />

          <Input
            label="Account Number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="e.g. 8901234567"
            required
          />

          {!isEdit && (
            <Input
              label="Initial Deposit (IDR)"
              type="number"
              value={initialDeposit}
              onChange={(e) => setInitialDeposit(e.target.value)}
              placeholder="0"
              min="0"
            />
          )}

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
              {isEdit ? "Save Changes" : "Create Wallet"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// DELETE CONFIRMATION MODAL
// ════════════════════════════════════════════

function DeleteConfirmModal({
  open,
  wallet,
  onClose,
  onConfirm,
}: {
  open: boolean;
  wallet: WalletT | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open || !wallet) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-(--border) bg-(--card)"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10">
            <AlertTriangle size={28} className="text-rose-400" />
          </div>
          <h3 className="mb-2 font-bold text-(--foreground)">Delete Wallet</h3>
          <p className="text-xs text-(--muted-foreground)">
            Are you sure you want to delete <strong>"{wallet.name}"</strong>?
            This action cannot be undone.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <button
              onClick={onConfirm}
              className="flex-1 rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// MAIN WALLET PAGE
// ════════════════════════════════════════════

export function WalletPage() {
  const { theme, toggleTheme } = useTheme();
  const { token } = useAuth();
  const walletList = useWalletList();
  const walletTypes = useWalletTypes();
  const walletSummary = useWalletSummary();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editWallet, setEditWallet] = useState<WalletT | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WalletT | null>(null);

  // Available wallet type categories for filter
  const walletTypeCategories = useMemo(() => {
    if (!walletTypes.data) return [];
    const types = new Set(walletTypes.data.map((wt) => wt.type));
    return Array.from(types);
  }, [walletTypes.data]);

  // Filtered wallets
  const filteredWallets = useMemo(() => {
    if (!walletList.data) return [];
    let list = walletList.data;

    // Search by name
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.number.toLowerCase().includes(q) ||
          w.wallet_type_detail?.name.toLowerCase().includes(q),
      );
    }

    // Filter by wallet type category
    if (filterType) {
      list = list.filter((w) => w.wallet_type_detail?.type === filterType);
    }

    return list;
  }, [walletList.data, searchQuery, filterType]);

  const handleCreateOrEdit = async (
    data: CreateWalletPayload | UpdateWalletPayload,
    isEdit: boolean,
  ) => {
    if (!token) return;
    try {
      if (isEdit && editWallet) {
        await updateWallet(token, editWallet.id, data as UpdateWalletPayload);
        toast.success("Wallet updated successfully!");
      } else {
        await createWallet(token, data as CreateWalletPayload);
        toast.success("Wallet created successfully!");
      }
      setFormOpen(false);
      setEditWallet(null);
      walletList.refetch();
      walletSummary.refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to save wallet");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    try {
      await deleteWallet(token, deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted successfully!`);
      setDeleteTarget(null);
      walletList.refetch();
      walletSummary.refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete wallet");
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 flex gap-3 border-b border-(--border) bg-(--card) px-4 py-3 sm:px-6 sm:py-3.5 flex-row items-center justify-between">
        <div>
          <div className="text-sm font-bold tracking-wide text-(--foreground)">
            My Wallets
          </div>
          <div className="text-[10px] text-(--muted-foreground)">
            Manage your wallets and view balances
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              setEditWallet(null);
              setFormOpen(true);
            }}
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Add Wallet</span>
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

      <div className="mx-auto max-w-350 p-3 sm:p-5">
        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {walletSummary.loading ? (
            <>
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </>
          ) : walletSummary.data ? (
            <>
              <SummaryCard
                label="Total Wallets"
                value={String(walletSummary.data.total_wallets)}
                icon={<Wallet size={18} />}
                accent="#daa520"
              />
              <SummaryCard
                label="Total Balance"
                value={fmtShort(walletSummary.data.total_balance)}
                icon={<Banknote size={18} />}
                accent="#10b981"
              />
              <SummaryCard
                label="Total Transactions"
                value={String(walletSummary.data.total_transactions)}
                icon={<ArrowLeftRight size={18} />}
                accent="#3b82f6"
              />
            </>
          ) : null}
        </div>

        {/* Search & Filter */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wallets..."
              className="w-full rounded-lg border border-(--border) bg-(--input) py-2 pl-9 pr-9 text-xs text-(--foreground) outline-none transition focus:border-(--ring)"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground) hover:text-(--foreground)"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter by wallet category */}
          <div className="flex gap-1.5 overflow-x-auto">
            <button
              onClick={() => setFilterType("")}
              className={cn(
                "shrink-0 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition",
                !filterType
                  ? "border-gold-400/40 bg-gold-400/10 text-gold-400"
                  : "border-(--border) text-(--muted-foreground) hover:text-(--foreground)",
              )}
            >
              All
            </button>
            {walletTypeCategories.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "shrink-0 rounded-lg border px-3 py-1.5 text-[11px] font-semibold capitalize transition",
                  filterType === type
                    ? "border-gold-400/40 bg-gold-400/10 text-gold-400"
                    : "border-(--border) text-(--muted-foreground) hover:text-(--foreground)",
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Wallet Grid */}
        {walletList.loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-56 rounded-2xl" />
            ))}
          </div>
        ) : filteredWallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Wallet
              size={48}
              className="mb-4 text-(--muted-foreground) opacity-40"
            />
            <div className="text-sm font-semibold text-(--foreground)">
              {searchQuery || filterType
                ? "No wallets found"
                : "No wallets yet"}
            </div>
            <div className="mt-1 text-xs text-(--muted-foreground)">
              {searchQuery || filterType
                ? "Try adjusting your search or filter"
                : "Create your first wallet to get started"}
            </div>
            {!searchQuery && !filterType && (
              <Button
                size="sm"
                className="mt-4"
                onClick={() => {
                  setEditWallet(null);
                  setFormOpen(true);
                }}
              >
                <Plus size={14} /> Add Wallet
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredWallets.map((w) => (
              <WalletCard
                key={w.id}
                wallet={w}
                onEdit={(wallet) => {
                  setEditWallet(wallet);
                  setFormOpen(true);
                }}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <WalletFormModal
        open={formOpen}
        wallet={editWallet}
        walletTypes={walletTypes.data ?? []}
        onClose={() => {
          setFormOpen(false);
          setEditWallet(null);
        }}
        onSubmit={handleCreateOrEdit}
      />
      <DeleteConfirmModal
        open={!!deleteTarget}
        wallet={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </MainLayout>
  );
}
