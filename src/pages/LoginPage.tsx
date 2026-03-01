import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import {
  Input,
  Button,
  Divider,
  OAuthButton,
} from "@/components/ui/FormElements";
import { OAuthPasswordModal } from "@/components/ui/OAuthPasswordModal";
import { loginApi, getOAuthUrl, requestSetPasswordApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { ApiError } from "@/lib/api";
import {
  resolveErrorMessage,
  isOAuthPasswordConflict,
  SUCCESS_MESSAGES,
} from "@/lib/messages";
import toast from "react-hot-toast";

export function LoginPage() {
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  // 409 modal state
  const [showOAuthModal, setShowOAuthModal] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Invalid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 6)
      e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await loginApi(email, password);
      setToken(res.data.token);
      toast.success(SUCCESS_MESSAGES.loginSuccess);
      navigate("/");
    } catch (err) {
      const apiErr = err as ApiError;
      if (
        apiErr.statusCode === 409 &&
        isOAuthPasswordConflict(apiErr.message)
      ) {
        setShowOAuthModal(true);
      } else {
        toast.error(resolveErrorMessage(apiErr.message, "Login failed"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPasswordFromModal = async () => {
    setIsLoading(true);
    try {
      await requestSetPasswordApi(email);
      toast.success(SUCCESS_MESSAGES.otpSent);
      navigate("/verify-otp", { state: { email, flow: "set-password" } });
    } catch (err) {
      const apiErr = err as ApiError;
      toast.error(resolveErrorMessage(apiErr.message));
    } finally {
      setIsLoading(false);
      setShowOAuthModal(false);
    }
  };

  const handleOAuth = (provider: "google" | "github" | "microsoft") => {
    window.location.href = getOAuthUrl(provider);
  };

  return (
    <AuthLayout>
      <div className="space-y-1 text-center">
        <h2 className="font-heading text-2xl font-semibold text-(--foreground)">
          Welcome back
        </h2>
        <p className="text-sm text-(--muted-foreground)">
          Sign in to your Aurify account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
        />

        <div className="relative">
          <Input
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
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

        <div className="flex items-center justify-end">
          <Link
            to="/forgot-password"
            className="text-xs text-(--primary) hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      <Divider text="or continue with" />

      <div className="grid grid-cols-3 gap-3">
        <OAuthButton provider="google" onClick={() => handleOAuth("google")} />
        <OAuthButton provider="github" onClick={() => handleOAuth("github")} />
        <OAuthButton
          provider="microsoft"
          onClick={() => handleOAuth("microsoft")}
        />
      </div>

      <p className="mt-6 text-center text-sm text-(--muted-foreground)">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          className="font-medium text-(--primary) hover:underline"
        >
          Sign up
        </Link>
      </p>

      {/* 409 OAuth password modal */}
      <OAuthPasswordModal
        isOpen={showOAuthModal}
        isLoading={isLoading}
        email={email}
        onClose={() => setShowOAuthModal(false)}
        onSetPassword={handleSetPasswordFromModal}
      />
    </AuthLayout>
  );
}
