"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  Linkedin,
  Globe,
  Calendar,
  Trash2,
  Eye,
  ArrowLeft,
  ArrowRight,
  Inbox,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApplicationStore } from "@/stores/applicationStore";
import { JobApplication, ApplicationStatus } from "@/types/application";
import { formatDateTime } from "@/lib/date-utils";
import ApplicationDetailDrawer from "./components/ApplicationDetailDrawer";

const STATUS_OPTIONS: {
  value: ApplicationStatus;
  label: string;
  dot: string;
  border: string;
  bg: string;
  text: string;
}[] = [
  { value: "new", label: "New", dot: "bg-[#e0b84f]", border: "border-[#e0b84f]/30", bg: "bg-[#e0b84f]/8", text: "text-[#8a6d1f]" },
  { value: "interested", label: "Interested", dot: "bg-[#8b4a36]", border: "border-[#8b4a36]/30", bg: "bg-[#8b4a36]/8", text: "text-[#8b4a36]" },
  { value: "interviewed", label: "Interviewed", dot: "bg-[#6b4c9a]", border: "border-[#6b4c9a]/30", bg: "bg-[#6b4c9a]/8", text: "text-[#6b4c9a]" },
  { value: "pooling", label: "Pooling", dot: "bg-[#3d7a5c]", border: "border-[#3d7a5c]/30", bg: "bg-[#3d7a5c]/8", text: "text-[#3d7a5c]" },
  { value: "offered", label: "Offered", dot: "bg-[#d95c3f]", border: "border-[#d95c3f]/30", bg: "bg-[#d95c3f]/8", text: "text-[#d95c3f]" },
  { value: "accepted", label: "Accepted", dot: "bg-[#3d7a5c]", border: "border-[#3d7a5c]/30", bg: "bg-[#3d7a5c]/8", text: "text-[#3d7a5c]" },
  { value: "rejected", label: "Rejected", dot: "bg-[#b73823]", border: "border-[#b73823]/30", bg: "bg-[#b73823]/8", text: "text-[#7d2418]" },
];

const statusPill = (status: ApplicationStatus) => {
  const option = STATUS_OPTIONS.find((s) => s.value === status);
  if (!option) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${option.border} ${option.bg} ${option.text}`}
    >
      <span className={`size-1.5 ${option.dot}`} />
      {option.label}
    </span>
  );
};

export default function ApplicationsPage() {
  const {
    applications,
    meta,
    loading,
    error,
    statusFilter,
    fetchApplications,
    setStatusFilter,
    deleteApplication,
    clearError,
  } = useApplicationStore();

  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<JobApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleView = (app: JobApplication) => {
    setSelectedApp(app);
    setDetailOpen(true);
  };

  const handleDeleteClick = (app: JobApplication) => {
    setAppToDelete(app);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!appToDelete) return;
    setIsDeleting(true);
    await deleteApplication(appToDelete.id);
    setDeleteOpen(false);
    setAppToDelete(null);
    setIsDeleting(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4efe4]">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 border-2 border-[#241d18]/15 border-t-[#8b4a36] animate-spin" />
          <p className="font-mono text-xs uppercase text-[#6f665d]">Loading applications…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4efe4] text-[#241d18]">
      {/* Header */}
      <div className="border-b border-[#241d18]/15 bg-[#fffaf1]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-2 flex w-fit items-center gap-2 border border-[#241d18]/15 bg-[#f4efe4] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            <span className="size-2 bg-[#d95c3f]" />
            Careers
          </div>
          <h1 className="font-serif text-5xl leading-[1.05] text-[#241d18]">
            Job Applications
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#6f665d]">
            Review, filter, and manage all candidate submissions across your open
            positions.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Filter bar */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
              Submissions
            </p>
            <p className="mt-1 text-sm text-[#574d43]">
              {meta ? `${meta.total} total` : "Loading…"}
            </p>
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ApplicationStatus | "all")}
          >
            <SelectTrigger className="h-11 w-52 rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] shadow-none focus:ring-[#8b4a36]/20">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-[#241d18]/20">
              <SelectItem
                value="all"
                className="text-[#241d18] focus:bg-[#f4efe4]"
              >
                All Statuses
              </SelectItem>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem
                  key={o.value}
                  value={o.value}
                  className="text-[#241d18] focus:bg-[#f4efe4]"
                >
                  <span className={`inline-block size-2 mr-2 ${o.dot}`} />
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 border border-[#b73823] bg-[#fff1e8] px-4 py-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#7d2418]" />
            <p className="text-sm text-[#7d2418]">{error}</p>
            <button
              onClick={clearError}
              className="ml-auto font-mono text-[10px] uppercase tracking-wide text-[#8b4a36] hover:text-[#241d18]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Status count cards */}
        {meta?.status_counts && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {STATUS_OPTIONS.map((option) => {
              const count = meta.status_counts?.[option.value] || 0;
              const active = statusFilter === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() =>
                    setStatusFilter(active ? "all" : option.value)
                  }
                  className={`border p-3 text-left transition-colors ${
                    active
                      ? `border-[#241d18] bg-[#241d18] text-[#fffaf1]`
                      : `${option.border} ${option.bg} hover:bg-[#f4efe4]`
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`size-2 ${active ? "bg-[#fffaf1]" : option.dot}`} />
                    <span
                      className={`font-mono text-[10px] uppercase tracking-wide ${
                        active ? "text-[#fffaf1]/70" : "text-[#6f665d]"
                      }`}
                    >
                      {option.label}
                    </span>
                  </div>
                  <p
                    className={`mt-1 font-serif text-2xl ${
                      active ? "text-[#fffaf1]" : option.text
                    }`}
                  >
                    {count}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* Table */}
        <div className="border border-[#241d18]/15 bg-[#fffaf1] shadow-[10px_10px_0_#241d18]">
          <div className="grid grid-cols-[1fr_1fr_140px_120px_100px_140px_120px] items-center border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            <span>Name</span>
            <span>Position</span>
            <span>Email</span>
            <span>Phone</span>
            <span>Status</span>
            <span>Applied</span>
            <span className="text-right">Actions</span>
          </div>

          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16">
              <Inbox className="mb-3 size-10 text-[#6f665d]/50" />
              <p className="font-mono text-xs uppercase text-[#6f665d]">No applications found</p>
            </div>
          ) : (
            applications.map((app) => {
              const careerData = app.relationships?.career?.data?.id;
              const career =
                typeof careerData === "object" ? careerData : null;

              return (
                <div
                  key={app.id}
                  className="grid grid-cols-[1fr_1fr_140px_120px_100px_140px_120px] items-center border-b border-[#241d18]/10 px-5 py-4 transition-colors hover:bg-[#f4efe4]/60"
                >
                  <div className="truncate pr-4">
                    <span className="text-sm font-medium text-[#241d18]">
                      {app.attributes.first_name} {app.attributes.last_name}
                    </span>
                  </div>
                  <div className="truncate pr-4">
                    <span className="text-sm text-[#574d43]">
                      {career?.title || "Unknown"}
                    </span>
                    {career?.department && (
                      <span className="ml-1 text-xs text-[#9d9389]">
                        • {career.department}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 overflow-hidden pr-4">
                    <Mail className="size-3.5 shrink-0 text-[#8b4a36]" />
                    <span className="truncate font-mono text-xs text-[#574d43]">
                      {app.attributes.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 overflow-hidden pr-4">
                    <Phone className="size-3.5 shrink-0 text-[#8b4a36]" />
                    <span className="truncate font-mono text-xs text-[#574d43]">
                      {app.attributes.contact_number}
                    </span>
                  </div>
                  <div className="pr-4">
                    {statusPill(app.attributes.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#6f665d]">
                    <Calendar className="size-3.5 shrink-0" />
                    {formatDateTime(app.attributes.created_at)}
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleView(app)}
                      className="grid size-8 place-items-center border border-[#241d18]/15 bg-white text-[#574d43] transition-colors hover:border-[#8b4a36] hover:text-[#8b4a36]"
                      title="View Details"
                    >
                      <Eye className="size-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(app)}
                      className="grid size-8 place-items-center border border-[#241d18]/15 bg-white text-[#574d43] transition-colors hover:border-[#b73823] hover:bg-[#fff1e8] hover:text-[#b73823]"
                      title="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {meta && meta.pages > 1 && (
            <div className="flex items-center justify-between border-t border-[#241d18]/15 bg-[#f4efe4] px-5 py-3">
              <span className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                Page {meta.page} of {meta.pages} · {meta.total} total
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchApplications(meta.page - 1)}
                  disabled={meta.page <= 1}
                  className="rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] hover:bg-[#fffaf1]"
                >
                  <ArrowLeft className="size-3.5 mr-1" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchApplications(meta.page + 1)}
                  disabled={meta.page >= meta.pages}
                  className="rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] hover:bg-[#fffaf1]"
                >
                  Next
                  <ArrowRight className="size-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ApplicationDetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        application={selectedApp}
      />

      {/* Delete Modal */}
      <div className={`fixed inset-0 z-50 ${deleteOpen ? "flex" : "hidden"} items-center justify-center bg-black/50`}>
        <div className="w-full max-w-sm rounded-none border border-[#b73823]/30 bg-[#fffaf1] p-0 shadow-[14px_14px_0_#b73823]">
          <div className="border-b border-[#b73823]/15 bg-[#fff1e8] px-6 py-5">
            <h2 className="flex items-center gap-2 font-serif text-xl text-[#7d2418]">
              <Trash2 className="size-5 text-[#b73823]" />
              Delete Application
            </h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm leading-6 text-[#574d43]">
              Are you sure you want to delete the application from “
              {appToDelete?.attributes.first_name}{" "}
              {appToDelete?.attributes.last_name}”? This cannot be undone.
            </p>
            <div className="mt-5 flex gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteOpen(false)}
                disabled={isDeleting}
                className="h-11 flex-1 rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] shadow-none hover:bg-[#f4efe4]"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="h-11 flex-1 rounded-none border border-[#b73823] bg-[#b73823] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none transition-transform hover:-translate-y-0.5 hover:bg-[#7d2418] disabled:translate-y-0"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
