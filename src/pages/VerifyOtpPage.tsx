import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/FormElements";
import {
  verifyOtpApi,
  registerApi,
  requestSetPasswordApi,
} from "@/lib/api";
import type { ApiError } from "@/lib/api";
import { resolveErrorMessage, SUCCESS_MESSAGES } from "@/lib/messages";
import toast from "react-hot-toast";

const OTP_LENGTH = 6;

export function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    email?: string;
    flow?: "register" | "forgot-password" | "set-password";
  } | null;
  const email = state?.email ?? "";
  const flow = state?.flow ?? "register";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
    }
  }, [email, navigate]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendOtp = useCallback(async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      if (flow === "register") {
        await registerApi(email);
      } else {
        // "forgot-password" and "set-password" both use requestSetPassword
        await requestSetPasswordApi(email);
      }
      toast.success(SUCCESS_MESSAGES.otpSent);
      setResendCooldown(60);
      // Reset OTP inputs
      setOtp(Array(OTP_LENGTH).fill(""));
      setError("");
      inputRefs.current[0]?.focus();
    } catch (err) {
      const apiErr = err as ApiError;
      toast.error(resolveErrorMessage(apiErr.message, "Failed to resend code"));
    } finally {
      setIsResending(false);
    }
  }, [email, flow, resendCooldown, isResending, navigate]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setError("");
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      setOtp(pasted.split(""));
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Please enter the complete code");
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyOtpApi(email, code);
      toast.success(SUCCESS_MESSAGES.otpVerified);

      if (flow === "register") {
        navigate("/complete-profile", {
          state: { email, tempToken: res.data.tempToken },
        });
      } else {
        // both "forgot-password" and "set-password" go to set-password page
        navigate("/set-password", {
          state: { email, tempToken: res.data.tempToken, flow },
        });
      }
    } catch (err) {
      const apiErr = err as ApiError;
      const msg = resolveErrorMessage(apiErr.message, "Verification failed");
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-1 text-center">
        <h2 className="font-heading text-2xl font-semibold text-(--foreground)">
          Verify your email
        </h2>
        <p className="text-sm text-(--muted-foreground)">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-(--foreground)">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* OTP Inputs */}
        <div
          className="flex items-center justify-center gap-2 sm:gap-3"
          onPaste={handlePaste}
        >
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`h-12 w-10 rounded-lg border bg-(--input) text-center text-lg font-semibold text-(--foreground) transition-colors sm:h-14 sm:w-12 sm:text-xl
                ${error ? "border-(--destructive)" : "border-(--border)"}
                focus:border-(--ring) focus:outline-none focus:ring-1 focus:ring-(--ring)`}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-xs text-(--destructive)">{error}</p>
        )}

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Verify
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-(--muted-foreground)">
        Didn&apos;t receive the code?{" "}
        {resendCooldown > 0 ? (
          <span className="font-medium text-(--muted-foreground)">
            Resend in {resendCooldown}s
          </span>
        ) : (
          <button
            type="button"
            disabled={isResending}
            className="font-medium text-(--primary) hover:underline disabled:opacity-50"
            onClick={handleResendOtp}
          >
            {isResending ? "Sending…" : "Resend code"}
          </button>
        )}
      </p>
    </AuthLayout>
  );
}
