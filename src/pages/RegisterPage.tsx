import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import {
  Input,
  Button,
  Divider,
  OAuthButton,
} from "@/components/ui/FormElements";
import { OAuthPasswordModal } from "@/components/ui/OAuthPasswordModal";
import { registerApi, getOAuthUrl, requestSetPasswordApi } from "@/lib/api";
import type { ApiError } from "@/lib/api";
import {
  resolveErrorMessage,
  isOAuthPasswordConflict,
  SUCCESS_MESSAGES,
} from "@/lib/messages";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});

  // Ref for auto-focus
  const emailRef = useRef<HTMLInputElement>(null);

  // 409 modal state
  const [showOAuthModal, setShowOAuthModal] = useState(false);

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
      await registerApi(email);
      toast.success(SUCCESS_MESSAGES.otpSent);
      navigate("/verify-otp", { state: { email, flow: "register" } });
    } catch (err) {
      const apiErr = err as ApiError;
      if (
        apiErr.statusCode === 409 &&
        isOAuthPasswordConflict(apiErr.message)
      ) {
        setShowOAuthModal(true);
      } else {
        toast.error(resolveErrorMessage(apiErr.message, "Registration failed"));
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
          Create your account
        </h2>
        <p className="text-sm text-(--muted-foreground)">
          Enter your email to get started
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
          Continue
        </Button>
      </form>

      <Divider text="or continue with" />

      <div className="grid grid-cols-2 gap-3">
        <OAuthButton provider="google" onClick={() => handleOAuth("google")} />
        {/* <OAuthButton provider="github" onClick={() => handleOAuth("github")} /> */}
        <OAuthButton
          provider="microsoft"
          onClick={() => handleOAuth("microsoft")}
        />
      </div>

      <p className="mt-6 text-center text-sm text-(--muted-foreground)">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-(--primary) hover:underline"
        >
          Sign in
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
