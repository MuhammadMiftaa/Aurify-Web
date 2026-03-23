import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input, Button } from "@/components/ui/FormElements";
import { setPasswordApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { ApiError } from "@/lib/api";
import { resolveErrorMessage, SUCCESS_MESSAGES } from "@/lib/messages";
import toast from "react-hot-toast";

export function SetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const state = location.state as {
    email?: string;
    tempToken?: string;
    flow?: "forgot-password" | "set-password";
  } | null;
  const email = state?.email ?? "";
  const tempToken = state?.tempToken ?? "";
  const flow = state?.flow ?? "forgot-password";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  // Ref for auto-focus
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!email || !tempToken) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, tempToken, navigate]);

  // Auto-focus password input on mount
  useEffect(() => {
    passwordRef.current?.focus();
  }, []);

  const validate = () => {
    const e: typeof errors = {};
    if (!password || password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (password !== confirmPassword)
      e.confirmPassword = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await setPasswordApi(
        { password, confirmPassword },
        tempToken,
      );
      setToken(res.data.token);
      toast.success(SUCCESS_MESSAGES.passwordUpdated);
      navigate("/");
    } catch (err) {
      const apiErr = err as ApiError;
      toast.error(resolveErrorMessage(apiErr.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-1 text-center">
        <h2 className="font-heading text-2xl font-semibold text-(--foreground)">
          {flow === "set-password" ? "Set your password" : "Set new password"}
        </h2>
        <p className="text-sm text-(--muted-foreground)">
          {flow === "set-password"
            ? "Create a password for"
            : "Enter a new password for"}{" "}
          <span className="font-medium text-(--foreground)">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="relative">
          <Input
            id="password"
            label="New Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="new-password"
            ref={passwordRef}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-10 text-(--muted-foreground) hover:text-(--foreground) transition-colors"
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        <div className="relative">
          <Input
            id="confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-10 text-(--muted-foreground) hover:text-(--foreground) transition-colors"
          >
            {showConfirmPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Set Password
        </Button>
      </form>
    </AuthLayout>
  );
}
