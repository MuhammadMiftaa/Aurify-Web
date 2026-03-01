import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeToggle } from "@/components/ui/FormElements";
import { Link } from "react-router-dom";

/**
 * Auth layout — centered card with branding.
 * Logo placeholder uses a gold "A" monogram.
 */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:py-12">
      {/* Subtle radial glow behind card */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full radial-glow" />
      </div>

      {/* Theme toggle — top-right */}
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        {/* Logo / Brand */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <img className="h-16 w-16" src="/images/logo.png" alt="" />
        </div>

        {/* Content card */}
        <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-xl sm:p-8">
          {children}
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center align-center mt-8">
          <Link to="/">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-gold-gradient sm:text-4xl">
              Aurify
            </h1>
          </Link>
          <p className="mt-6 text-center text-xs text-(--muted-foreground)">
            © {new Date().getFullYear()} Aurify. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
