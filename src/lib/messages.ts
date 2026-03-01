// ============================================
// CENTRALIZED MESSAGE MAPPING
// ============================================
// Maps raw backend error/success messages to
// user-friendly English wording.
// ============================================

/** Friendly error messages keyed by exact backend message */
const ERROR_MAP: Record<string, string> = {
  // ── Register ──
  "User already exists":
    "An account with this email already exists. Please sign in instead.",

  // ── Login (409) — handled via modal, but still mapped for fallback ──
  "Email already registered. Please log in with OAuth or set a password.":
    "This email is linked to an OAuth account. You can sign in with your provider or set a password.",
  "This account was created using OAuth. Please log in with OAuth or set a password.":
    "This account uses OAuth sign-in. You can continue with your provider or set a password.",

  // ── OTP ──
  "Invalid OTP": "The code you entered is incorrect. Please try again.",
  "OTP is not active":
    "This verification code is no longer active. Please request a new one.",
  "OTP has expired":
    "This verification code has expired. Please request a new one.",

  // ── Token ──
  "Invalid temp token": "Your session has expired. Please start over.",
  "Invalid token": "Your session is invalid. Please sign in again.",
  "Expired token": "Your session has expired. Please sign in again.",

  // ── User ──
  "User not found": "No account found with this email address.",

  // ── Login ──
  "Invalid password": "Incorrect password. Please try again.",

  // ── Validation (zod / frontend) ──
  "Passwords don't match": "Passwords do not match. Please re-enter.",
};

/** Friendly success messages keyed by context */
export const SUCCESS_MESSAGES = {
  otpSent: "Verification code sent to your email.",
  otpVerified: "Code verified successfully.",
  accountCreated: "Account created! Please sign in.",
  loginSuccess: "Welcome back!",
  passwordUpdated: "Password updated successfully.",
  logoutSuccess: "You have been signed out.",
} as const;

/**
 * Resolve a backend error message to a user-friendly string.
 * Returns the mapped message if found, otherwise the original.
 */
export function resolveErrorMessage(
  backendMessage: string | undefined,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!backendMessage) return fallback;
  return ERROR_MAP[backendMessage] ?? backendMessage;
}

/**
 * Check whether a backend error message indicates a 409 OAuth-password conflict.
 */
export function isOAuthPasswordConflict(message: string | undefined): boolean {
  if (!message) return false;
  return (
    message ===
      "Email already registered. Please log in with OAuth or set a password." ||
    message ===
      "This account was created using OAuth. Please log in with OAuth or set a password."
  );
}
