import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input, Button } from "@/components/ui/FormElements";
import { requestSetPasswordApi } from "@/lib/api";
import type { ApiError } from "@/lib/api";
import { resolveErrorMessage, SUCCESS_MESSAGES } from "@/lib/messages";
import toast from "react-hot-toast";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});

  // Ref for auto-focus
  const emailRef = useRef<HTMLInputElement>(null);

  // Auto-focus email input on mount
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Invalid email address";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await requestSetPasswordApi(email);
      toast.success(SUCCESS_MESSAGES.otpSent);
      navigate("/verify-otp", { state: { email, flow: "forgot-password" } });
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
          Reset your password
        </h2>
        <p className="text-sm text-(--muted-foreground)">
          Enter your email and we&apos;ll send you a verification code
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
          ref={emailRef}
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Send Code
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-(--muted-foreground)">
        Remember your password?{" "}
        <Link
          to="/login"
          className="font-medium text-(--primary) hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
