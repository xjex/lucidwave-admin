"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    login,
    isLoading,
    error,
    clearError,
    checkAuth,
    isAuthenticated,
  } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);
      window.location.href = "/dashboard";
    } catch {
      // Error is handled by the store
    }
  };

  // Check if already logged in
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/dashboard";
    }
  }, [isAuthenticated]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4efe4] text-[#241d18]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden min-h-screen border-r border-[#241d18]/15 bg-[#24231f] px-12 py-10 text-[#f8f1e5] lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:46px_46px]" />
          <div className="absolute right-0 top-0 h-full w-24 bg-[#d95c3f]" />
          <div className="relative flex items-center gap-3">
            <div className="grid size-10 place-items-center border border-[#f8f1e5]/25 bg-[#f8f1e5]/10">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="font-mono text-xs uppercase text-[#f8f1e5]/55">
                Lucidwave Studios
              </p>
              <p className="font-serif text-xl">Invoicer Control</p>
            </div>
          </div>

          <div className="relative max-w-2xl">
            <div className="mb-8 flex w-fit items-center gap-2 border border-[#f8f1e5]/20 bg-[#f8f1e5]/8 px-3 py-2 font-mono text-xs uppercase text-[#f8f1e5]/70">
              <span className="size-2 bg-[#e0b84f]" />
              Admin access
            </div>
            <h1 className="font-serif text-7xl leading-[0.95]">
              Clear books.
              <br />
              Clean handoff.
            </h1>
          </div>

          <div className="relative grid grid-cols-3 border-y border-[#f8f1e5]/15 font-mono text-xs uppercase text-[#f8f1e5]/55">
            <div className="border-r border-[#f8f1e5]/15 py-5">
              Invoice queue
            </div>
            <div className="border-r border-[#f8f1e5]/15 py-5 pl-5">
              Receipts
            </div>
            <div className="py-5 pl-5">Contacts</div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[430px]">
            <div className="mb-8 lg:hidden">
              <div className="mb-4 grid size-11 place-items-center border border-[#241d18]/15 bg-white/50">
                <ShieldCheck className="size-5" />
              </div>
              <p className="font-mono text-xs uppercase text-[#6f665d]">
                Lucidwave Studios
              </p>
              <h1 className="font-serif text-4xl text-[#241d18]">
                Invoicer Control
              </h1>
            </div>

            <div className="border border-[#241d18]/15 bg-[#fffaf1] p-6 shadow-[14px_14px_0_#241d18] sm:p-8">
              <div className="mb-7">
                <p className="mb-2 font-mono text-xs uppercase text-[#8b4a36]">
                  Secure sign in
                </p>
                <h2 className="font-serif text-4xl text-[#241d18]">
                  Welcome back
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#6f665d]">
                  Use your Lucid admin credentials to continue.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="font-mono text-xs uppercase text-[#574d43]"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8b4a36]" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) clearError();
                      }}
                      placeholder="admin@lucidwave.studio"
                      autoComplete="email"
                      required
                      aria-invalid={!!error}
                      className="h-12 rounded-none border-[#241d18]/20 bg-white pl-10 text-[#241d18] shadow-none placeholder:text-[#9d9389] focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="font-mono text-xs uppercase text-[#574d43]"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8b4a36]" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) clearError();
                      }}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      aria-invalid={!!error}
                      className="h-12 rounded-none border-[#241d18]/20 bg-white pl-10 pr-12 text-[#241d18] shadow-none placeholder:text-[#9d9389] focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-[#6f665d] transition-colors hover:text-[#241d18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4a36]/30"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <Alert
                    variant="destructive"
                    className="rounded-none border-[#b73823] bg-[#fff1e8] text-[#7d2418]"
                  >
                    <AlertTriangle className="size-4" />
                    <AlertDescription className="text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full rounded-none bg-[#241d18] font-mono text-xs uppercase text-[#fffaf1] shadow-none transition-transform hover:-translate-y-0.5 hover:bg-[#8b4a36] disabled:translate-y-0"
                >
                  {isLoading ? "Signing in" : "Sign in"}
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
