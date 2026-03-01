import { cn } from "@/lib/utils";
import { Button } from "./FormElements";

// ============================================
// OAUTH PASSWORD MODAL
// ============================================
// Shown when login/register returns 409 (OAuth account exists).
// Offers the user to set a password or dismiss.
// ============================================

interface OAuthPasswordModalProps {
  isOpen: boolean;
  isLoading: boolean;
  email: string;
  onClose: () => void;
  onSetPassword: () => void;
}

export function OAuthPasswordModal({
  isOpen,
  isLoading,
  email,
  onClose,
  onSetPassword,
}: OAuthPasswordModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="oauth-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div
        className={cn(
          "relative z-10 w-full max-w-sm animate-fade-in-up rounded-2xl border border-(--border) bg-(--card) p-6 shadow-2xl sm:p-8",
        )}
      >
        {/* Close button */}
        <Button
          disabled={isLoading}
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-(--muted-foreground) transition-colors hover:text-(--foreground) bg-transparent"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </Button>

        {/* Icon */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-(--secondary)">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-(--primary)"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>

        {/* Content */}
        <h3
          id="oauth-modal-title"
          className="font-heading text-center text-xl font-semibold text-(--foreground)"
        >
          Set a password
        </h3>
        <p className="mt-2 text-center text-sm text-(--muted-foreground)">
          The account{" "}
          <span className="font-medium text-(--foreground)">{email}</span> was
          created with an OAuth provider. Set a password to also sign in with
          email &amp; password.
        </p>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
          <Button
            type="button"
            className="w-full rounded-lg bg-gold-btn px-5 py-2.5 text-sm font-semibold text-dark transition-all hover:opacity-90"
            isLoading={isLoading}
            onClick={onSetPassword}
          >
            Set Password
          </Button>
          <Button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full rounded-lg border border-(--border) bg-(--secondary) px-5 py-2.5 text-sm font-medium text-(--foreground) transition-colors hover:bg-(--muted)"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
