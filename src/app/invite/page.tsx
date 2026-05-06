"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IconMail,
  IconUser,
  IconLock,
  IconAlertCircle,
  IconCheck,
  IconLoader,
  IconArrowLeft,
  IconSparkles,
} from "@tabler/icons-react";
import {
  validateToken,
  acceptInvitation,
  ValidateInvitationResponse,
  AcceptInvitationRequest,
} from "@/services/invitationsService";
import axios from "axios";

/* ─── Background ornament ─── */
function BackgroundCanvas() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Warm gradient orbs */}
      <div
        className="absolute -top-40 -left-40 h-[50vw] w-[50vw] rounded-full opacity-[0.08]"
        style={{
          background: "radial-gradient(circle, #8b4a36 0%, transparent 70%)",
          animation: "drift 20s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute -bottom-40 -right-40 h-[60vw] w-[60vw] rounded-full opacity-[0.06]"
        style={{
          background: "radial-gradient(circle, #e0b84f 0%, transparent 70%)",
          animation: "drift 25s ease-in-out infinite alternate-reverse",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 h-[40vw] w-[40vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.05]"
        style={{
          background: "radial-gradient(circle, #3d7a5c 0%, transparent 70%)",
          animation: "drift 18s ease-in-out infinite alternate",
          animationDelay: "-5s",
        }}
      />
      {/* Subtle noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes drift {
              0% { transform: translate(0, 0) scale(1); }
              100% { transform: translate(30px, -20px) scale(1.05); }
            }
            @keyframes shrink {
              from { transform: scaleX(1); }
              to { transform: scaleX(0); }
            }
          `,
        }}
      />
    </div>
  );
}

/* ─── Step indicator ─── */
function StepIndicator({
  steps,
  active,
}: {
  steps: string[];
  active: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center font-mono text-[10px] font-bold transition-colors ${
              i <= active
                ? "bg-[#8b4a36] text-white"
                : "border border-[#241d18]/15 text-[#9d9389]"
            }`}
          >
            {i + 1}
          </span>
          <span
            className={`hidden font-mono text-[10px] uppercase tracking-wide sm:inline ${
              i <= active ? "text-[#241d18]" : "text-[#9d9389]"
            }`}
          >
            {step}
          </span>
          {i < steps.length - 1 && (
            <div
              className={`mx-1 h-px w-4 transition-colors ${
                i < active ? "bg-[#8b4a36]" : "bg-[#241d18]/10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function getErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null) {
    const e = err as Record<string, unknown>;
    if (e.response && typeof e.response === "object") {
      const r = e.response as Record<string, unknown>;
      if (typeof r.data === "object" && r.data !== null) {
        const d = r.data as Record<string, string>;
        return d.message || d.error || "An error occurred";
      }
    }
  }
  return "An error occurred";
}

/* ─── Main content ─── */
function InvitePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("invitation_token");

  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] =
    useState<ValidateInvitationResponse | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<AcceptInvitationRequest>({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const validateInvitationToken = useCallback(async () => {
    if (!token) return;
    try {
      setValidating(true);
      setError(null);
      const response = await validateToken(token);
      setInvitation(response);
    } catch (err) {
      setError(
        getErrorMessage(err) || "Invalid or expired invitation token"
      );
    } finally {
      setLoading(false);
      setValidating(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setError("Invalid invitation link. No token provided.");
      setLoading(false);
      return;
    }
    validateInvitationToken();
  }, [token, validateInvitationToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (!token) {
      setError("Invalid invitation token");
      return;
    }

    try {
      setSubmitting(true);
      const response = await acceptInvitation(token, formData);

      if (response.tokens) {
        localStorage.setItem("authToken", response.tokens.access_token);
        localStorage.setItem("refreshToken", response.tokens.refresh_token);
        localStorage.setItem("userData", JSON.stringify(response.user));
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.tokens.access_token}`;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1800);
    } catch (err) {
      setError(
        getErrorMessage(err) || "Failed to accept invitation. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading / Validating ── */
  if (loading || validating) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="h-10 w-10 border-2 border-[#241d18]/10 border-t-[#8b4a36] animate-spin" />
          </div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            Validating invitation…
          </p>
        </div>
      </div>
    );
  }

  /* ── Invalid / Expired ── */
  if (error && !invitation) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm border border-[#b73823]/20 bg-[#fffaf1] p-8 shadow-[8px_8px_0px_0px_rgba(183,56,35,0.08)]">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center border border-[#b73823]/20 bg-[#b73823]/10">
              <IconAlertCircle className="h-7 w-7 text-[#b73823]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#241d18]">
                Invalid Invitation
              </h2>
              <p className="mt-1 text-sm text-[#6f665d]">
                This invitation link is invalid or has expired.
              </p>
            </div>
            <div className="w-full border-t border-[#241d18]/10 pt-4">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full rounded-none border-[#241d18]/15 text-[#574d43] hover:bg-[#f4efe4]"
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Success ── */
  if (success) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm border border-[#3d7a5c]/20 bg-[#fffaf1] p-8 shadow-[8px_8px_0px_0px_rgba(61,122,92,0.08)]">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center border border-[#3d7a5c]/20 bg-[#3d7a5c]/10">
              <IconCheck className="h-7 w-7 text-[#3d7a5c]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#241d18]">
                Welcome Aboard
              </h2>
              <p className="mt-1 text-sm text-[#6f665d]">
                Your account has been created successfully. Redirecting to your
                dashboard…
              </p>
            </div>
            <div className="h-1 w-full overflow-hidden bg-[#241d18]/5">
              <div
                className="h-full w-full origin-left bg-[#3d7a5c]"
                style={{
                  animation: "shrink 1.8s linear forwards",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Form ── */
  const stepIndex =
    formData.firstName || formData.lastName
      ? formData.username
        ? formData.password && formData.confirmPassword
          ? 3
          : 2
        : 1
      : 0;

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg border border-[#241d18]/10 bg-[#fffaf1] shadow-[12px_12px_0px_0px_rgba(36,29,24,0.06)]">
        {/* Card header */}
        <div className="border-b border-[#241d18]/10 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-[#8b4a36]/20 bg-[#8b4a36]/10">
              <IconSparkles className="h-5 w-5 text-[#8b4a36]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#241d18]">
                Accept Invitation
              </h1>
              <p className="text-xs text-[#6f665d]">
                Complete your registration to join the team.
              </p>
            </div>
          </div>

          <div className="mt-5">
            <StepIndicator
              steps={["Name", "Details", "Password", "Done"]}
              active={stepIndex}
            />
          </div>

          {invitation && (
            <div className="mt-4 border border-[#241d18]/10 bg-[#f4efe4] p-3">
              <div className="flex items-center gap-2 text-sm">
                <IconMail className="h-3.5 w-3.5 text-[#8b4a36]" />
                <span className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                  Email:
                </span>
                <span className="font-mono text-xs text-[#574d43]">
                  {invitation.data.attributes.email}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <IconUser className="h-3.5 w-3.5 text-[#8b4a36]" />
                <span className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                  Role:
                </span>
                <span className="font-mono text-xs capitalize text-[#574d43]">
                  {invitation.data.attributes.role}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 px-8 py-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]"
              >
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="Jane"
                required
                className="rounded-none border-[#241d18]/15 bg-[#f4efe4] text-[#241d18] placeholder:text-[#9d9389] focus:border-[#8b4a36] focus:ring-[#8b4a36]/20"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]"
              >
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Doe"
                required
                className="rounded-none border-[#241d18]/15 bg-[#f4efe4] text-[#241d18] placeholder:text-[#9d9389] focus:border-[#8b4a36] focus:ring-[#8b4a36]/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]"
            >
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="jane_doe"
              required
              minLength={3}
              className="rounded-none border-[#241d18]/15 bg-[#f4efe4] text-[#241d18] placeholder:text-[#9d9389] focus:border-[#8b4a36] focus:ring-[#8b4a36]/20"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              className="rounded-none border-[#241d18]/15 bg-[#f4efe4] text-[#241d18] placeholder:text-[#9d9389] focus:border-[#8b4a36] focus:ring-[#8b4a36]/20"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]"
            >
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="Re-enter your password"
              required
              minLength={8}
              className="rounded-none border-[#241d18]/15 bg-[#f4efe4] text-[#241d18] placeholder:text-[#9d9389] focus:border-[#8b4a36] focus:ring-[#8b4a36]/20"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 border border-[#b73823]/20 bg-[#b73823]/8 px-3 py-2.5 text-[#7d2418]">
              <IconAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="h-11 w-full rounded-none border border-[#241d18] bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none transition-transform hover:-translate-y-0.5 hover:bg-[#8b4a36]"
          >
            {submitting ? (
              <>
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                Creating Account…
              </>
            ) : (
              <>
                <IconLock className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>

          <div className="text-center">
            <p className="text-xs text-[#9d9389]">
              Already have an account?{" "}
              <Button
                variant="link"
                onClick={() => router.push("/")}
                className="h-auto p-0 font-mono text-[10px] uppercase tracking-wide text-[#8b4a36] underline-offset-2 hover:text-[#241d18]"
              >
                Sign in
              </Button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Page shell ─── */
export default function InvitePage() {
  return (
    <div className="relative min-h-screen bg-[#f4efe4]">
      <BackgroundCanvas />
      <Suspense
        fallback={
          <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
            <div className="flex flex-col items-center gap-5">
              <div className="h-10 w-10 border-2 border-[#241d18]/10 border-t-[#8b4a36] animate-spin" />
              <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                Loading…
              </p>
            </div>
          </div>
        }
      >
        <InvitePageContent />
      </Suspense>
    </div>
  );
}
