"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconMail,
  IconCalendar,
  IconRefresh,
  IconPlus,
  IconLoader,
  IconAlertTriangle,
  IconHourglass,
  IconCheck,
  IconX,
  IconSend,
  IconArrowLeft,
  IconArrowRight,
} from "@tabler/icons-react";
import {
  sendInvitation,
  getInvitations,
  CreateInvitationRequest,
  InvitationListItem,
  InvitationsListResponse,
} from "@/services/invitationsService";
import { formatDateTime } from "@/lib/date-utils";
import { toast } from "sonner";

const STATUS_STYLES: Record<
  InvitationListItem["attributes"]["status"],
  {
    border: string;
    bg: string;
    text: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  pending: {
    border: "border-[#e0b84f]/40",
    bg: "bg-[#e0b84f]/10",
    text: "text-[#8a6d1f]",
    icon: IconHourglass,
  },
  sent: {
    border: "border-[#5a7fb5]/40",
    bg: "bg-[#5a7fb5]/10",
    text: "text-[#3d5a82]",
    icon: IconSend,
  },
  accepted: {
    border: "border-[#3d7a5c]/40",
    bg: "bg-[#3d7a5c]/10",
    text: "text-[#3d7a5c]",
    icon: IconCheck,
  },
  expired: {
    border: "border-[#b73823]/40",
    bg: "bg-[#b73823]/10",
    text: "text-[#7d2418]",
    icon: IconX,
  },
};

function StatusPill({
  status,
}: {
  status: InvitationListItem["attributes"]["status"];
}) {
  const style = STATUS_STYLES[status];
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${style.border} ${style.bg} ${style.text}`}
    >
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

function RolePill({ role }: { role: "user" | "admin" }) {
  const isAdmin = role === "admin";
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${
        isAdmin
          ? "border-[#8b4a36]/40 bg-[#8b4a36]/10 text-[#8b4a36]"
          : "border-[#3d7a5c]/40 bg-[#3d7a5c]/10 text-[#3d7a5c]"
      }`}
    >
      {role}
    </span>
  );
}

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <div className="h-4 w-40 bg-[#241d18]/8 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-6 w-16 bg-[#241d18]/8 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-6 w-20 bg-[#241d18]/8 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-32 bg-[#241d18]/8 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-32 bg-[#241d18]/8 animate-pulse" />
      </TableCell>
    </TableRow>
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

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<InvitationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<InvitationsListResponse["meta"] | null>(
    null
  );

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [createForm, setCreateForm] = useState<CreateInvitationRequest>({
    email: "",
    role: "user",
  });

  useEffect(() => {
    fetchInvitations(currentPage);
  }, [currentPage]);

  const fetchInvitations = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getInvitations(page, 20);
      setInvitations(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(getErrorMessage(err) || "Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSending(true);
      const response = await sendInvitation(createForm);
      toast.success(
        response.message ||
          "Invitation sent successfully! The user will receive an email to complete their registration."
      );
      setCreateModalOpen(false);
      setCreateForm({ email: "", role: "user" });
      fetchInvitations(currentPage);
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to send invitation");
    } finally {
      setIsSending(false);
    }
  };

  const statusCounts = invitations.reduce(
    (acc, inv) => {
      acc[inv.attributes.status] = (acc[inv.attributes.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalInvitations = meta?.total ?? invitations.length;
  const acceptedCount = statusCounts["accepted"] || 0;
  const pendingCount = statusCounts["pending"] || 0;
  const expiredCount = statusCounts["expired"] || 0;

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 pt-0">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            Access Management
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#241d18]">
            Invitations
          </h1>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="h-11 rounded-none border border-[#241d18] bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none transition-transform hover:-translate-y-0.5 hover:bg-[#8b4a36]"
        >
          <IconPlus className="h-4 w-4 mr-2" />
          Send Invitation
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="group relative border border-[#241d18]/10 bg-[#fffaf1] p-5 transition-all hover:border-[#5a7fb5]/30 hover:shadow-[4px_4px_0px_0px_rgba(36,29,24,0.08)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-[#5a7fb5]/20 bg-[#5a7fb5]/10">
              <IconMail className="h-4 w-4 text-[#3d5a82]" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                Total Sent
              </p>
              <p className="text-2xl font-bold text-[#241d18]">{totalInvitations}</p>
            </div>
          </div>
        </div>
        <div className="group relative border border-[#241d18]/10 bg-[#fffaf1] p-5 transition-all hover:border-[#e0b84f]/30 hover:shadow-[4px_4px_0px_0px_rgba(36,29,24,0.08)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-[#e0b84f]/20 bg-[#e0b84f]/10">
              <IconHourglass className="h-4 w-4 text-[#8a6d1f]" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                Pending
              </p>
              <p className="text-2xl font-bold text-[#241d18]">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="group relative border border-[#241d18]/10 bg-[#fffaf1] p-5 transition-all hover:border-[#3d7a5c]/30 hover:shadow-[4px_4px_0px_0px_rgba(36,29,24,0.08)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-[#3d7a5c]/20 bg-[#3d7a5c]/10">
              <IconCheck className="h-4 w-4 text-[#3d7a5c]" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                Accepted
              </p>
              <p className="text-2xl font-bold text-[#241d18]">{acceptedCount}</p>
            </div>
          </div>
        </div>
        <div className="group relative border border-[#241d18]/10 bg-[#fffaf1] p-5 transition-all hover:border-[#b73823]/30 hover:shadow-[4px_4px_0px_0px_rgba(36,29,24,0.08)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-[#b73823]/20 bg-[#b73823]/10">
              <IconX className="h-4 w-4 text-[#b73823]" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                Expired
              </p>
              <p className="text-2xl font-bold text-[#241d18]">{expiredCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 border border-[#b73823]/30 bg-[#b73823]/8 px-4 py-3 text-[#7d2418]">
          <IconAlertTriangle className="h-4 w-4 shrink-0" />
          <p className="text-sm">{error}</p>
          <button
            onClick={() => fetchInvitations(currentPage)}
            className="ml-auto font-mono text-[10px] uppercase tracking-wide underline underline-offset-2 hover:text-[#b73823]"
          >
            Retry
          </button>
        </div>
      )}

      {/* Invitations Table */}
      <div className="border border-[#241d18]/10 bg-[#fffaf1]">
        <div className="flex items-center justify-between border-b border-[#241d18]/10 px-5 py-3">
          <p className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
            All sent invitations
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchInvitations(currentPage)}
            disabled={loading}
            className="h-8 rounded-none font-mono text-[10px] uppercase tracking-wide text-[#6f665d] hover:bg-[#f4efe4] hover:text-[#241d18]"
          >
            <IconRefresh className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-[#241d18]/10 hover:bg-transparent">
              <TableHead className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                Email
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                Role
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                Status
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                Expires
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                Sent
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : invitations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-40 text-center text-[#9d9389]"
                >
                  <div className="flex flex-col items-center gap-3">
                    <IconMail className="h-8 w-8 text-[#9d9389]/40" />
                    <p className="text-sm">No invitations sent yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCreateModalOpen(true)}
                      className="rounded-none border-[#241d18]/15 text-[#574d43] hover:bg-[#f4efe4]"
                    >
                      <IconPlus className="h-3.5 w-3.5 mr-1.5" />
                      Send your first invitation
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              invitations.map((invitation, index) => {
                const attrs = invitation.attributes;
                const isExpired =
                  attrs.status === "expired" ||
                  new Date(attrs.expires_at) < new Date();
                return (
                  <TableRow
                    key={invitation.id}
                    className="group border-[#241d18]/5 transition-colors hover:bg-[#f4efe4]/60"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconMail className="h-3.5 w-3.5 text-[#9d9389]" />
                        <span className="font-mono text-sm text-[#574d43]">
                          {attrs.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RolePill role={attrs.role} />
                    </TableCell>
                    <TableCell>
                      <StatusPill status={attrs.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <IconCalendar className="h-3.5 w-3.5 text-[#9d9389]" />
                        <span
                          className={
                            isExpired ? "text-[#b73823]" : "text-[#574d43]"
                          }
                        >
                          {formatDateTime(attrs.expires_at)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-[#9d9389]">
                        <IconCalendar className="h-3.5 w-3.5" />
                        {formatDateTime(attrs.created_at)}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {meta && meta.pages > 1 && (
          <div className="flex items-center justify-between border-t border-[#241d18]/10 px-5 py-3">
            <p className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
              Page {meta.page} of {meta.pages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || loading}
                className="h-8 rounded-none border-[#241d18]/15 text-[#574d43] hover:bg-[#f4efe4]"
              >
                <IconArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(meta.pages, p + 1))
                }
                disabled={currentPage >= meta.pages || loading}
                className="h-8 rounded-none border-[#241d18]/15 text-[#574d43] hover:bg-[#f4efe4]"
              >
                Next
                <IconArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Invitation Dialog */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md rounded-none border-[#241d18]/15 bg-[#fffaf1] p-0 shadow-[8px_8px_0px_0px_rgba(36,29,24,0.06)]">
          <DialogHeader className="border-b border-[#241d18]/10 px-6 py-5">
            <DialogTitle className="text-lg font-bold text-[#241d18]">
              Send Invitation
            </DialogTitle>
            <DialogDescription className="text-sm text-[#6f665d]">
              Invite a new member to join the team. They will receive an email
              with a secure registration link.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateInvitation} className="space-y-5 px-6 py-5">
            <div className="space-y-2">
              <Label
                htmlFor="create-email"
                className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]"
              >
                Email Address
              </Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
                placeholder="colleague@company.com"
                required
                className="rounded-none border-[#241d18]/15 bg-[#f4efe4] text-[#241d18] placeholder:text-[#9d9389] focus:border-[#8b4a36] focus:ring-[#8b4a36]/20"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="create-role"
                className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]"
              >
                Role
              </Label>
              <Select
                value={createForm.role}
                onValueChange={(value: "user" | "admin") =>
                  setCreateForm({ ...createForm, role: value })
                }
              >
                <SelectTrigger className="rounded-none border-[#241d18]/15 bg-[#f4efe4] text-[#241d18] focus:ring-[#8b4a36]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none border-[#241d18]/15 bg-[#fffaf1]">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 border-t border-[#241d18]/10 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                disabled={isSending}
                className="rounded-none border-[#241d18]/15 text-[#574d43] hover:bg-[#f4efe4]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSending}
                className="rounded-none border border-[#241d18] bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] hover:bg-[#8b4a36]"
              >
                {isSending ? (
                  <>
                    <IconLoader className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <IconMail className="mr-2 h-3.5 w-3.5" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
