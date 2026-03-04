import { useState, useMemo } from "react";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowLeftRight,
  Search,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sun,
  Moon,
  Paperclip,
  Upload,
  ChevronDown,
  Pencil,
  Trash2,
  Calendar,
  Wallet,
  Tag,
  FileText,
  AlertTriangle,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/components/layout/MainLayout";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactionList, useCategories } from "@/hooks/useTransaction";
import { useWalletList } from "@/hooks/useWallet";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button, Input } from "@/components/ui/FormElements";
import {
  createTransaction,
  createTransfer,
  updateTransaction as updateTransactionAPI,
  deleteTransaction as deleteTransactionAPI,
} from "@/lib/wallet-transaction-api";
import type {
  Transaction,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  CreateTransferPayload,
} from "@/types/transaction";
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

function getCategoryTypeColor(type: string) {
  switch (type) {
    case "income":
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-500",
        border: "border-emerald-500/30",
      };
    case "expense":
      return {
        bg: "bg-rose-500/10",
        text: "text-rose-500",
        border: "border-rose-500/30",
      };
    case "fund_transfer":
      return {
        bg: "bg-blue-500/10",
        text: "text-blue-500",
        border: "border-blue-500/30",
      };
    default:
      return {
        bg: "bg-gray-500/10",
        text: "text-gray-500",
        border: "border-gray-500/30",
      };
  }
}

function getCategoryTypeIcon(type: string, size = 16) {
  switch (type) {
    case "income":
      return <ArrowDownCircle size={size} className="text-emerald-500" />;
    case "expense":
      return <ArrowUpCircle size={size} className="text-rose-500" />;
    case "fund_transfer":
      return <ArrowLeftRight size={size} className="text-blue-500" />;
    default:
      return null;
  }
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
// TRANSACTION ROW (Desktop)
// ════════════════════════════════════════════

function TransactionRow({
  transaction,
  onView,
}: {
  transaction: Transaction;
  onView: (t: Transaction) => void;
}) {
  const typeColors = getCategoryTypeColor(
    transaction.category_type ?? "expense",
  );

  return (
    <tr
      className="border-b border-(--border) transition hover:bg-(--muted)/30 cursor-pointer"
      onClick={() => onView(transaction)}
    >
      <td className="whitespace-nowrap px-4 py-3 text-xs text-(--foreground)">
        {fmtDate(transaction.transaction_date)}
      </td>
      <td className="max-w-50 truncate px-4 py-3 text-xs text-(--foreground)">
        {transaction.description || "—"}
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
            typeColors.bg,
            typeColors.text,
            typeColors.border,
          )}
        >
          {getCategoryTypeIcon(transaction.category_type ?? "expense", 12)}
          {transaction.category_name}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-xs text-(--muted-foreground)">
        {transaction.wallet_name}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right">
        <span
          className={cn(
            "font-mono text-xs font-semibold",
            transaction.category_type === "income"
              ? "text-emerald-500"
              : transaction.category_type === "expense"
                ? "text-rose-500"
                : "text-blue-500",
          )}
        >
          {transaction.category_type === "income"
            ? "+"
            : transaction.category_type === "expense"
              ? "-"
              : ""}
          {fmtCurrency(transaction.amount)}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        {(transaction.attachments?.length ?? 0) > 0 ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-gold-400">
            <Paperclip size={12} />
            {transaction.attachments?.length}
          </span>
        ) : (
          <span className="text-[11px] text-(--muted-foreground)">—</span>
        )}
      </td>
    </tr>
  );
}

// ════════════════════════════════════════════
// TRANSACTION CARD (Mobile)
// ════════════════════════════════════════════

function TransactionCard({
  transaction,
  onView,
}: {
  transaction: Transaction;
  onView: (t: Transaction) => void;
}) {
  const typeColors = getCategoryTypeColor(
    transaction.category_type ?? "expense",
  );

  return (
    <div
      className="rounded-xl border border-(--border) bg-(--card) p-4 transition hover:border-gold-400/20 cursor-pointer"
      onClick={() => onView(transaction)}
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          {getCategoryTypeIcon(transaction.category_type ?? "expense")}
          <div>
            <div className="text-xs font-semibold text-(--foreground)">
              {transaction.description || "No description"}
            </div>
            <div className="text-[10px] text-(--muted-foreground)">
              {fmtDateTime(transaction.transaction_date)}
            </div>
          </div>
        </div>
        <span
          className={cn(
            "font-mono text-sm font-bold",
            transaction.category_type === "income"
              ? "text-emerald-500"
              : transaction.category_type === "expense"
                ? "text-rose-500"
                : "text-blue-500",
          )}
        >
          {transaction.category_type === "income"
            ? "+"
            : transaction.category_type === "expense"
              ? "-"
              : ""}
          {fmtCurrency(transaction.amount)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
            typeColors.bg,
            typeColors.text,
            typeColors.border,
          )}
        >
          {transaction.category_name}
        </span>
        <span className="text-[10px] text-(--muted-foreground)">
          {transaction.wallet_name}
        </span>
        {(transaction.attachments?.length ?? 0) > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] text-gold-400">
            <Paperclip size={10} /> {transaction.attachments?.length}
          </span>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// ATTACHMENT PREVIEW MODAL
// ════════════════════════════════════════════

function AttachmentPreviewModal({
  url,
  format,
  onClose,
}: {
  url: string | null;
  format: string | null;
  onClose: () => void;
}) {
  if (!url) return null;

  const isImage =
    format?.startsWith("image") || /\.(jpe?g|png|gif|webp|svg|bmp)$/i.test(url);

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-(--border) bg-(--card)"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow:
            "0 0 40px rgba(218,165,32,0.1), 0 25px 50px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-center justify-between border-b border-(--border) px-5 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-(--foreground)">
            <Paperclip size={14} className="text-gold-400" />
            Attachment Preview
          </div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-lg border border-(--border) px-2.5 py-1 text-[11px] text-(--muted-foreground) transition hover:text-(--foreground)"
            >
              <ExternalLink size={12} /> Open
            </a>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-(--muted-foreground) transition hover:text-(--foreground)"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center p-4 max-h-[75vh] overflow-auto">
          {isImage ? (
            <img
              src={url}
              alt="Attachment"
              className="max-w-full max-h-[65vh] rounded-lg object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 py-12">
              <FileText
                size={48}
                className="text-(--muted-foreground) opacity-40"
              />
              <div className="text-sm font-semibold text-(--foreground)">
                Preview not available
              </div>
              <div className="text-xs text-(--muted-foreground)">
                {format ?? "Unknown format"}
              </div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-1.5 rounded-lg border border-(--border) px-4 py-2 text-xs text-(--foreground) transition hover:border-gold-400/30"
              >
                <ExternalLink size={14} /> Open in new tab
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// TRANSACTION DETAIL / EDIT / DELETE MODAL
// ════════════════════════════════════════════

function TransactionDetailModal({
  transaction,
  onClose,
  onRefetch,
}: {
  transaction: Transaction | null;
  onClose: () => void;
  onRefetch: () => void;
}) {
  const { token } = useAuth();
  const categories = useCategories();
  const wallets = useWalletList();

  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const [loading, setLoading] = useState(false);

  // Attachment preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFormat, setPreviewFormat] = useState<string | null>(null);

  // Edit form state
  const [editWalletId, setEditWalletId] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  // Track new attachments to add / existing ones to remove during edit
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>(
    [],
  );

  const isTransfer = transaction?.category_type === "fund_transfer";

  // The visible attachments in edit mode (existing minus removed)
  const visibleAttachments = useMemo(() => {
    if (!transaction?.attachments) return [];
    return transaction.attachments.filter(
      (a) => !removedAttachmentIds.includes(a.id),
    );
  }, [transaction?.attachments, removedAttachmentIds]);

  // Populate edit fields when switching to edit mode
  const startEdit = () => {
    if (!transaction) return;
    setEditWalletId(transaction.wallet_id);
    setEditCategoryId(transaction.category_id);
    setEditAmount(String(transaction.amount));
    setEditDate(
      new Date(transaction.transaction_date).toISOString().slice(0, 10),
    );
    setEditDescription(transaction.description ?? "");
    setNewAttachments([]);
    setRemovedAttachmentIds([]);
    setMode("edit");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction || !token) return;
    setLoading(true);
    try {
      const payload: UpdateTransactionPayload = {
        wallet_id: editWalletId,
        category_id: editCategoryId,
        amount: parseFloat(editAmount) || 0,
        transaction_date: new Date(editDate).toISOString(),
        description: editDescription || undefined,
      };
      await updateTransactionAPI(token, transaction.id, payload);
      toast.success("Transaction updated successfully!");
      setNewAttachments([]);
      setRemovedAttachmentIds([]);
      onRefetch();
      onClose();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to update transaction";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction || !token) return;
    setLoading(true);
    try {
      await deleteTransactionAPI(token, transaction.id);
      toast.success("Transaction deleted successfully!");
      onRefetch();
      onClose();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to delete transaction";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) return null;

  const typeColors = getCategoryTypeColor(
    transaction.category_type ?? "expense",
  );
  const filteredCategories =
    categories.data?.filter((c) => c.type === transaction.category_type) ?? [];

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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--border) px-6 py-4">
          <h3 className="font-bold text-(--foreground)">
            {mode === "view"
              ? "Transaction Detail"
              : mode === "edit"
                ? "Edit Transaction"
                : "Delete Transaction"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-(--muted-foreground) transition hover:text-(--foreground)"
          >
            <X size={16} />
          </button>
        </div>

        {mode === "view" && (
          <div className="p-6 space-y-5">
            {/* Amount highlight */}
            <div className="text-center">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-(--muted-foreground)">
                Amount
              </div>
              <div
                className={cn(
                  "font-mono text-2xl font-bold",
                  transaction.category_type === "income"
                    ? "text-emerald-500"
                    : transaction.category_type === "expense"
                      ? "text-rose-500"
                      : "text-blue-500",
                )}
              >
                {transaction.category_type === "income"
                  ? "+"
                  : transaction.category_type === "expense"
                    ? "-"
                    : ""}
                {fmtCurrency(transaction.amount)}
              </div>
            </div>

            {/* Type badge */}
            <div className="flex justify-center">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                  typeColors.bg,
                  typeColors.text,
                  typeColors.border,
                )}
              >
                {getCategoryTypeIcon(
                  transaction.category_type ?? "expense",
                  14,
                )}
                {transaction.category_name}
              </span>
            </div>

            {/* Detail rows */}
            <div className="space-y-3 rounded-xl border border-(--border) bg-(--secondary)/30 p-4">
              <div className="flex items-center gap-3">
                <Calendar size={14} className="text-(--muted-foreground)" />
                <div>
                  <div className="text-[10px] text-(--muted-foreground)">
                    Date
                  </div>
                  <div className="text-xs font-medium text-(--foreground)">
                    {fmtDateTime(transaction.transaction_date)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Wallet size={14} className="text-(--muted-foreground)" />
                <div>
                  <div className="text-[10px] text-(--muted-foreground)">
                    Wallet
                  </div>
                  <div className="text-xs font-medium text-(--foreground)">
                    {transaction.wallet_name}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Tag size={14} className="text-(--muted-foreground)" />
                <div>
                  <div className="text-[10px] text-(--muted-foreground)">
                    Category
                  </div>
                  <div className="text-xs font-medium text-(--foreground)">
                    {transaction.category_name}
                  </div>
                </div>
              </div>
              {transaction.description && (
                <div className="flex items-start gap-3">
                  <FileText
                    size={14}
                    className="mt-0.5 text-(--muted-foreground)"
                  />
                  <div>
                    <div className="text-[10px] text-(--muted-foreground)">
                      Description
                    </div>
                    <div className="text-xs font-medium text-(--foreground)">
                      {transaction.description}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Attachments */}
            {(transaction.attachments?.length ?? 0) > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-(--muted-foreground)">
                  Attachments
                </div>
                <div className="flex flex-wrap gap-2">
                  {transaction.attachments?.map((att) => (
                    <button
                      key={att.id}
                      type="button"
                      onClick={() => {
                        setPreviewUrl(att.image);
                        setPreviewFormat(att.format);
                      }}
                      className="group flex items-center gap-1.5 rounded-lg border border-(--border) bg-(--secondary)/30 px-3 py-1.5 text-xs text-(--foreground) transition hover:border-gold-400/30 hover:bg-gold-400/5 cursor-pointer"
                    >
                      {att.format?.startsWith("image") ||
                      /\.(jpe?g|png|gif|webp)$/i.test(att.image ?? "") ? (
                        <ImageIcon size={12} className="text-gold-400" />
                      ) : (
                        <Paperclip size={12} className="text-gold-400" />
                      )}
                      <span className="max-w-32 truncate">
                        {att.format ?? "file"}
                      </span>
                      {att.size ? (
                        <span className="text-(--muted-foreground)">
                          · {Math.round(att.size / 1024)}KB
                        </span>
                      ) : null}
                      <ExternalLink
                        size={10}
                        className="ml-0.5 opacity-0 transition group-hover:opacity-100 text-(--muted-foreground)"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions (not available for transfers) */}
            {!isTransfer && (
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={startEdit}
                >
                  <Pencil size={14} /> Edit
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/50"
                  onClick={() => setMode("delete")}
                >
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            )}
            {isTransfer && (
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-[11px] text-blue-400">
                Fund transfer transactions cannot be edited or deleted
                individually. They are managed as paired transactions.
              </div>
            )}
          </div>
        )}

        {mode === "edit" && (
          <form onSubmit={handleUpdate} className="flex flex-col gap-4 p-6">
            {/* Wallet */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-(--foreground) opacity-80">
                Wallet
              </label>
              <div className="relative">
                <select
                  value={editWalletId}
                  onChange={(e) => setEditWalletId(e.target.value)}
                  required
                  className="w-full appearance-none rounded-lg border border-(--border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) outline-none transition-colors focus:border-(--ring) focus:ring-1 focus:ring-(--ring)"
                >
                  <option value="">Select wallet...</option>
                  {wallets.data?.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-(--foreground) opacity-80">
                Category
              </label>
              <div className="relative">
                <select
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                  required
                  className="w-full appearance-none rounded-lg border border-(--border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) outline-none transition-colors focus:border-(--ring) focus:ring-1 focus:ring-(--ring)"
                >
                  <option value="">Select category...</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)"
                />
              </div>
            </div>

            <Input
              label="Amount (IDR)"
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              min="1"
              required
            />
            <Input
              label="Transaction Date"
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-(--foreground) opacity-80">
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Add a note..."
                rows={2}
                className="w-full rounded-lg border border-(--border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) outline-none transition-colors focus:border-(--ring) focus:ring-1 focus:ring-(--ring) placeholder:text-(--muted-foreground)"
              />
            </div>

            {/* Attachment Management */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-(--foreground) opacity-80">
                Attachments
              </label>

              {/* Existing attachments */}
              {visibleAttachments.length > 0 && (
                <div className="space-y-1.5">
                  {visibleAttachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-2 rounded-lg border border-(--border) bg-(--secondary)/30 px-3 py-2"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl(att.image);
                          setPreviewFormat(att.format);
                        }}
                        className="flex flex-1 items-center gap-2 text-xs text-(--foreground) hover:text-gold-400 transition truncate"
                      >
                        {att.format?.startsWith("image") ? (
                          <ImageIcon
                            size={12}
                            className="text-gold-400 shrink-0"
                          />
                        ) : (
                          <Paperclip
                            size={12}
                            className="text-gold-400 shrink-0"
                          />
                        )}
                        <span className="truncate">{att.format ?? "file"}</span>
                        {att.size ? (
                          <span className="text-(--muted-foreground) shrink-0">
                            · {Math.round(att.size / 1024)}KB
                          </span>
                        ) : null}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setRemovedAttachmentIds((prev) => [...prev, att.id])
                        }
                        className="rounded p-1 text-(--muted-foreground) transition hover:text-rose-500 hover:bg-rose-500/10"
                        title="Remove attachment"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* New attachments queued for upload */}
              {newAttachments.length > 0 && (
                <div className="space-y-1.5">
                  {newAttachments.map((file, i) => (
                    <div
                      key={`new-${i}`}
                      className="flex items-center gap-2 rounded-lg border border-gold-400/20 bg-gold-400/5 px-3 py-2"
                    >
                      <Upload size={12} className="text-gold-400 shrink-0" />
                      <span className="flex-1 truncate text-xs text-(--foreground)">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-(--muted-foreground) shrink-0">
                        {Math.round(file.size / 1024)}KB
                      </span>
                      <span className="rounded-full bg-gold-400/10 px-1.5 py-0.5 text-[9px] font-semibold text-gold-400 shrink-0">
                        NEW
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setNewAttachments((prev) =>
                            prev.filter((_, idx) => idx !== i),
                          )
                        }
                        className="rounded p-1 text-(--muted-foreground) transition hover:text-rose-500 hover:bg-rose-500/10"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add attachment button */}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-(--border) px-4 py-2.5 text-xs text-(--muted-foreground) transition hover:border-(--ring) hover:text-(--foreground)">
                <Upload size={14} />
                <span>Add attachment</span>
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    if (files.length > 0) {
                      setNewAttachments((prev) => [...prev, ...files]);
                    }
                    e.target.value = "";
                  }}
                />
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMode("view")}
                className="flex-1"
              >
                Back
              </Button>
              <Button type="submit" isLoading={loading} className="flex-1">
                Save Changes
              </Button>
            </div>
          </form>
        )}

        {mode === "delete" && (
          <div className="p-6 space-y-5">
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10">
                <AlertTriangle size={24} className="text-rose-500" />
              </div>
              <div className="text-sm font-bold text-(--foreground)">
                Delete this transaction?
              </div>
              <div className="mt-1 text-xs text-(--muted-foreground)">
                This action cannot be undone. The transaction of{" "}
                <span className="font-semibold text-(--foreground)">
                  {fmtCurrency(transaction.amount)}
                </span>{" "}
                will be permanently removed.
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setMode("view")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                isLoading={loading}
                onClick={handleDelete}
                className="flex-1 bg-rose-600 text-white hover:bg-rose-700"
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Attachment Preview (rendered outside the modal card so it overlays on top) */}
      <AttachmentPreviewModal
        url={previewUrl}
        format={previewFormat}
        onClose={() => {
          setPreviewUrl(null);
          setPreviewFormat(null);
        }}
      />
    </div>
  );
}

// ════════════════════════════════════════════
// ADD TRANSACTION MODAL
// ════════════════════════════════════════════

type TransactionFormTab = "income" | "expense" | "transfer";

function AddTransactionModal({
  open,
  onClose,
  onRefetch,
}: {
  open: boolean;
  onClose: () => void;
  onRefetch: () => void;
}) {
  const { token } = useAuth();
  const [tab, setTab] = useState<TransactionFormTab>("expense");
  const categories = useCategories();
  const wallets = useWalletList();

  const [walletId, setWalletId] = useState("");
  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [adminFee, setAdminFee] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredCategories = useMemo(() => {
    if (!categories.data) return [];
    return categories.data.filter((c) => c.type === tab);
  }, [categories.data, tab]);

  const fundTransferCategories = useMemo(() => {
    if (!categories.data) return [];
    return categories.data.filter((c) => c.type === "fund_transfer");
  }, [categories.data]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);

    try {
      if (tab === "transfer") {
        const cashOutCat = fundTransferCategories.find((c) =>
          c.name.toLowerCase().includes("transfer"),
        );
        const cashInCat = fundTransferCategories.find((c) =>
          c.name.toLowerCase().includes("transfer"),
        );
        const payload: CreateTransferPayload = {
          from_wallet_id: fromWalletId,
          to_wallet_id: toWalletId,
          amount: parseFloat(amount) || 0,
          admin_fee: parseFloat(adminFee) || 0,
          cash_out_category_id: cashOutCat?.id ?? "",
          cash_in_category_id: cashInCat?.id ?? "",
          transaction_date: new Date(date).toISOString(),
          description: description || undefined,
        };
        await createTransfer(token, payload);
        toast.success("Transfer created successfully!");
      } else {
        const payload: CreateTransactionPayload = {
          wallet_id: walletId,
          category_id: categoryId,
          amount: parseFloat(amount) || 0,
          transaction_date: new Date(date).toISOString(),
          description: description || undefined,
        };
        await createTransaction(token, payload);
        toast.success(
          `${tab === "income" ? "Income" : "Expense"} transaction created successfully!`,
        );
      }

      onRefetch();
      onClose();
      resetForm();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to create transaction";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setWalletId("");
    setFromWalletId("");
    setToWalletId("");
    setCategoryId("");
    setAmount("");
    setAdminFee("");
    setDate(new Date().toISOString().slice(0, 10));
    setDescription("");
    setAttachment(null);
  };

  const tabs: {
    key: TransactionFormTab;
    label: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      key: "income",
      label: "Income",
      icon: <ArrowDownCircle size={14} />,
      color: "text-emerald-500",
    },
    {
      key: "expense",
      label: "Expense",
      icon: <ArrowUpCircle size={14} />,
      color: "text-rose-500",
    },
    {
      key: "transfer",
      label: "Transfer",
      icon: <ArrowLeftRight size={14} />,
      color: "text-blue-500",
    },
  ];

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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--border) px-6 py-4">
          <h3 className="font-bold text-(--foreground)">Add Transaction</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-(--muted-foreground) transition hover:text-(--foreground)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-(--border)">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold transition",
                tab === t.key
                  ? `${t.color} border-b-2`
                  : "text-(--muted-foreground) hover:text-(--foreground)",
              )}
              style={
                tab === t.key
                  ? {
                      borderColor:
                        t.key === "income"
                          ? "#10b981"
                          : t.key === "expense"
                            ? "#f43f5e"
                            : "#3b82f6",
                    }
                  : undefined
              }
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          {tab === "transfer" ? (
            <>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-(--foreground) opacity-80">
                  From Wallet
                </label>
                <div className="relative">
                  <select
                    value={fromWalletId}
                    onChange={(e) => setFromWalletId(e.target.value)}
                    required
                    className="w-full appearance-none rounded-lg border border-(--border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) outline-none transition-colors focus:border-(--ring) focus:ring-1 focus:ring-(--ring)"
                  >
                    <option value="">Select source wallet...</option>
                    {wallets.data?.map((w) => (
                      <option
                        key={w.id}
                        value={w.id}
                        disabled={w.id === toWalletId}
                      >
                        {w.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-(--foreground) opacity-80">
                  To Wallet
                </label>
                <div className="relative">
                  <select
                    value={toWalletId}
                    onChange={(e) => setToWalletId(e.target.value)}
                    required
                    className="w-full appearance-none rounded-lg border border-(--border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) outline-none transition-colors focus:border-(--ring) focus:ring-1 focus:ring-(--ring)"
                  >
                    <option value="">Select destination wallet...</option>
                    {wallets.data?.map((w) => (
                      <option
                        key={w.id}
                        value={w.id}
                        disabled={w.id === fromWalletId}
                      >
                        {w.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-(--foreground) opacity-80">
                  Wallet
                </label>
                <div className="relative">
                  <select
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    required
                    className="w-full appearance-none rounded-lg border border-(--border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) outline-none transition-colors focus:border-(--ring) focus:ring-1 focus:ring-(--ring)"
                  >
                    <option value="">Select wallet...</option>
                    {wallets.data?.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-(--foreground) opacity-80">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="w-full appearance-none rounded-lg border border-(--border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) outline-none transition-colors focus:border-(--ring) focus:ring-1 focus:ring-(--ring)"
                  >
                    <option value="">Select category...</option>
                    {filteredCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)"
                  />
                </div>
              </div>
            </>
          )}

          <Input
            label="Amount (IDR)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            min="1"
            required
          />

          {/* Admin Fee - only for transfers */}
          {tab === "transfer" && (
            <Input
              label="Admin Fee (IDR)"
              type="number"
              value={adminFee}
              onChange={(e) => setAdminFee(e.target.value)}
              placeholder="0"
              min="0"
            />
          )}

          {/* Show total deducted for transfers */}
          {tab === "transfer" &&
            (parseFloat(amount) > 0 || parseFloat(adminFee) > 0) && (
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3 space-y-1">
                <div className="flex justify-between text-[11px] text-(--muted-foreground)">
                  <span>Transfer amount</span>
                  <span className="font-mono">
                    {fmtCurrency(parseFloat(amount) || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-(--muted-foreground)">
                  <span>Admin fee</span>
                  <span className="font-mono">
                    {fmtCurrency(parseFloat(adminFee) || 0)}
                  </span>
                </div>
                <div className="border-t border-blue-500/20 pt-1 flex justify-between text-xs font-semibold text-blue-400">
                  <span>Total deducted from source</span>
                  <span className="font-mono">
                    {fmtCurrency(
                      (parseFloat(amount) || 0) + (parseFloat(adminFee) || 0),
                    )}
                  </span>
                </div>
              </div>
            )}

          <Input
            label="Transaction Date"
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

          {tab !== "transfer" && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-(--foreground) opacity-80">
                Attachment
              </label>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-xs transition",
                  attachment
                    ? "border-gold-400/40 bg-gold-400/5 text-gold-400"
                    : "border-(--border) text-(--muted-foreground) hover:border-(--ring)",
                )}
              >
                <Upload size={14} />
                <span>
                  {attachment ? attachment.name : "Upload receipt or proof"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
                />
                {attachment && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setAttachment(null);
                    }}
                    className="ml-auto"
                  >
                    <X size={14} />
                  </button>
                )}
              </label>
            </div>
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
              Create Transaction
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// PAGINATION
// ════════════════════════════════════════════

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, -1] as const;

function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-(--border) px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-[11px] text-(--muted-foreground)">
        <span>Show</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
          className="rounded-md border border-(--border) bg-(--input) px-2 py-1 text-[11px] text-(--foreground) outline-none focus:border-(--ring)"
        >
          {PAGE_SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === -1 ? "All" : s}
            </option>
          ))}
        </select>
        <span>of {total} entries</span>
      </div>

      {pageSize !== -1 && totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            className="rounded-md border border-(--border) p-1.5 text-(--muted-foreground) transition hover:text-(--foreground) disabled:opacity-30"
          >
            <ChevronsLeft size={14} />
          </button>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="rounded-md border border-(--border) p-1.5 text-(--muted-foreground) transition hover:text-(--foreground) disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) pageNum = i + 1;
            else if (page <= 3) pageNum = i + 1;
            else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
            else pageNum = page - 2 + i;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-semibold transition",
                  page === pageNum
                    ? "border border-gold-400/40 bg-gold-400/10 text-gold-400"
                    : "border border-(--border) text-(--muted-foreground) hover:text-(--foreground)",
                )}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="rounded-md border border-(--border) p-1.5 text-(--muted-foreground) transition hover:text-(--foreground) disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
            className="rounded-md border border-(--border) p-1.5 text-(--muted-foreground) transition hover:text-(--foreground) disabled:opacity-30"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// MAIN TRANSACTION PAGE
// ════════════════════════════════════════════

export function TransactionPage() {
  const { theme, toggleTheme } = useTheme();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("transaction_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailTransaction, setDetailTransaction] =
    useState<Transaction | null>(null);

  const txnList = useTransactionList({
    page,
    page_size: pageSize,
    sort_by: sortBy,
    sort_order: sortOrder,
    search: searchQuery,
  });

  const handleSort = (field: string) => {
    if (sortBy === field) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };
  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  };
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return (
    <MainLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 flex gap-3 border-b border-(--border) bg-(--card) px-4 py-3 sm:px-6 sm:py-3.5 flex-row items-center justify-between">
        <div>
          <div className="text-sm font-bold tracking-wide text-(--foreground)">
            Transactions
          </div>
          <div className="text-[10px] text-(--muted-foreground)">
            View and manage all your transactions
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setAddModalOpen(true)}>
            <Plus size={14} />
            <span className="hidden sm:inline">Add Transaction</span>
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
        {/* Search */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search by description, wallet, category, or amount..."
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

        {/* Desktop Table */}
        <div className="hidden overflow-hidden rounded-xl border border-(--border) bg-(--card) md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-(--border) bg-(--secondary)">
                  <th className="px-4 py-3 text-left">
                    <SortHeader
                      label="Date"
                      field="transaction_date"
                      currentSort={sortBy}
                      currentOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortHeader
                      label="Description"
                      field="description"
                      currentSort={sortBy}
                      currentOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortHeader
                      label="Category"
                      field="category_name"
                      currentSort={sortBy}
                      currentOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortHeader
                      label="Wallet"
                      field="wallet_name"
                      currentSort={sortBy}
                      currentOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-4 py-3 text-right">
                    <SortHeader
                      label="Amount"
                      field="amount"
                      currentSort={sortBy}
                      currentOrder={sortOrder}
                      onSort={handleSort}
                      className="justify-end"
                    />
                  </th>
                  <th className="px-4 py-3 text-center">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-(--muted-foreground)">
                      Attachments
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {txnList.loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-(--border)">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : txnList.data?.transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <ArrowLeftRight
                        size={32}
                        className="mx-auto mb-3 text-(--muted-foreground) opacity-40"
                      />
                      <div className="text-xs font-semibold text-(--foreground)">
                        No transactions found
                      </div>
                      <div className="mt-1 text-[11px] text-(--muted-foreground)">
                        {searchQuery
                          ? "Try adjusting your search"
                          : "Add your first transaction to get started"}
                      </div>
                    </td>
                  </tr>
                ) : (
                  txnList.data?.transactions.map((txn) => (
                    <TransactionRow
                      key={txn.id}
                      transaction={txn}
                      onView={setDetailTransaction}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
          {txnList.data && (
            <Pagination
              page={txnList.data.page}
              totalPages={txnList.data.total_pages}
              total={txnList.data.total}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </div>

        {/* Mobile Cards */}
        <div className="flex flex-col gap-3 md:hidden">
          {txnList.loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          ) : txnList.data?.transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ArrowLeftRight
                size={32}
                className="mb-3 text-(--muted-foreground) opacity-40"
              />
              <div className="text-xs font-semibold text-(--foreground)">
                No transactions found
              </div>
              <div className="mt-1 text-[11px] text-(--muted-foreground)">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Add your first transaction"}
              </div>
            </div>
          ) : (
            txnList.data?.transactions.map((txn) => (
              <TransactionCard
                key={txn.id}
                transaction={txn}
                onView={setDetailTransaction}
              />
            ))
          )}
          {txnList.data && (
            <Pagination
              page={txnList.data.page}
              totalPages={txnList.data.total_pages}
              total={txnList.data.total}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <AddTransactionModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onRefetch={txnList.refetch}
      />
      <TransactionDetailModal
        transaction={detailTransaction}
        onClose={() => setDetailTransaction(null)}
        onRefetch={txnList.refetch}
      />
    </MainLayout>
  );
}
