"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  Linkedin,
  Globe,
  Clock,
  FileText,
  History,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApplicationStore } from "@/stores/applicationStore";
import { JobApplication, ApplicationStatus } from "@/types/application";
import { formatDateTimeWithSeconds } from "@/lib/date-utils";

interface ApplicationDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: JobApplication | null;
}

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
    <span className={`inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[10px] uppercase tracking-wide ${option.border} ${option.bg} ${option.text}`}>
      <span className={`size-1.5 ${option.dot}`} />
      {option.label}
    </span>
  );
};

export default function ApplicationDetailDrawer({
  open,
  onOpenChange,
  application,
}: ApplicationDetailDrawerProps) {
  const { updateApplicationStatus, updateApplicationNotes, error, clearError } =
    useApplicationStore();

  const [statusNotes, setStatusNotes] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!application) return;
    await updateApplicationStatus(application.id, newStatus, statusNotes);
    setStatusNotes("");
  };

  const handleSaveNotes = async () => {
    if (!application) return;
    setSavingNotes(true);
    await updateApplicationNotes(application.id, adminNotes);
    setSavingNotes(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg border-l border-[#241d18]/15 bg-[#fffaf1] p-0 [&>button]:hidden overflow-y-auto"
      >
        <SheetHeader className="border-b border-[#241d18]/15 bg-[#f4efe4] px-6 py-5 text-left">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="font-serif text-xl text-[#241d18]">
                {application ? `${application.attributes.first_name} ${application.attributes.last_name}` : "Applicant"}
              </SheetTitle>
              <SheetDescription className="mt-1 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                {(() => {
                  const careerData = application?.relationships?.career?.data?.id;
                  const career = typeof careerData === "object" ? careerData : null;
                  return career ? (
                    <span>
                      Applied for{" "}
                      <span className="text-[#8b4a36]">{career.title}</span>
                      {career.department && <span> • {career.department}</span>}
                    </span>
                  ) : (
                    "Application details"
                  );
                })()}
              </SheetDescription>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="grid size-8 place-items-center border border-[#241d18]/15 bg-white text-[#574d43] transition-colors hover:border-[#8b4a36] hover:text-[#8b4a36]"
            >
              <X className="size-4" />
            </button>
          </div>
        </SheetHeader>

        {application && (
          <div className="px-6 py-6 space-y-6">
            {error && (
              <div className="flex items-start gap-3 border border-[#b73823] bg-[#fff1e8] px-4 py-3">
                <X className="mt-0.5 size-4 shrink-0 text-[#7d2418]" />
                <p className="text-sm text-[#7d2418]">{error}</p>
                <button
                  onClick={clearError}
                  className="ml-auto font-mono text-[10px] uppercase tracking-wide text-[#8b4a36] hover:text-[#241d18]"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Contact info */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                {
                  icon: Mail,
                  label: "Email",
                  value: application.attributes.email,
                  href: `mailto:${application.attributes.email}`,
                },
                {
                  icon: Phone,
                  label: "Phone",
                  value: application.attributes.contact_number,
                  href: `tel:${application.attributes.contact_number}`,
                },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon className="size-3.5 text-[#8b4a36]" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">{label}</span>
                  </div>
                  <a href={href} className="block pl-5 text-sm text-[#8b4a36] transition-colors hover:text-[#241d18] hover:underline">{value}</a>
                </div>
              ))}

              {application.attributes.linkedin_profile && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Linkedin className="size-3.5 text-[#8b4a36]" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">LinkedIn</span>
                  </div>
                  <a href={application.attributes.linkedin_profile} target="_blank" rel="noopener noreferrer"
                    className="block pl-5 text-sm text-[#8b4a36] transition-colors hover:text-[#241d18] hover:underline"
                  >View Profile</a>
                </div>
              )}
              {application.attributes.portfolio_url && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Globe className="size-3.5 text-[#8b4a36]" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">Portfolio</span>
                  </div>
                  <a href={application.attributes.portfolio_url} target="_blank" rel="noopener noreferrer"
                    className="block pl-5 text-sm text-[#8b4a36] transition-colors hover:text-[#241d18] hover:underline"
                  >View Portfolio</a>
                </div>
              )}
            </div>

            {/* Cover letter */}
            {application.attributes.cover_letter && (
              <div className="border-t border-[#241d18]/10 pt-5 space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="size-3.5 text-[#8b4a36]" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">Cover Letter</span>
                </div>
                <div className="border border-[#241d18]/10 bg-[#f4efe4] p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#574d43]">{application.attributes.cover_letter}</p>
                </div>
              </div>
            )}

            {/* Status management */}
            <div className="border-t border-[#241d18]/10 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">Current Status</span>
                {statusPill(application.attributes.status)}
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">Update Status</Label>
                <Select onValueChange={(v) => handleStatusChange(v as ApplicationStatus)}>
                  <SelectTrigger className="h-11 rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none focus:ring-[#8b4a36]/20">
                    <SelectValue placeholder="Change status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-[#241d18]/20">
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-[#241d18] focus:bg-[#f4efe4]">
                        <span className={`inline-block size-2 mr-2 ${option.dot}`} />{option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">Status Change Notes (Optional)</Label>
                <Textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add notes about this status change..."
                  rows={2}
                  className="rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none placeholder:text-[#9d9389] focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20"
                />
              </div>
            </div>

            {/* Admin notes */}
            <div className="border-t border-[#241d18]/10 pt-5 space-y-2">
              <Label className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">Admin Notes</Label>
              <Textarea
                value={adminNotes || application.attributes.notes || ""}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this applicant..."
                rows={3}
                className="rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none placeholder:text-[#9d9389] focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20"
              />
              <Button size="sm" onClick={handleSaveNotes} disabled={savingNotes}
                className="h-9 rounded-none border border-[#241d18] bg-[#241d18] font-mono text-[10px] uppercase tracking-wide text-[#fffaf1] shadow-none transition-transform hover:-translate-y-0.5 hover:bg-[#8b4a36] disabled:translate-y-0"
              >
                {savingNotes ? "Saving…" : "Save Notes"}
              </Button>
            </div>

            {/* Status history */}
            {application.attributes.status_history &&
              application.attributes.status_history.length > 0 && (
                <div className="border-t border-[#241d18]/10 pt-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <History className="size-3.5 text-[#8b4a36]" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">Status History</span>
                  </div>
                  <div className="space-y-2">
                    {application.attributes.status_history.map((entry, index) => (
                      <div key={index} className="flex items-start gap-3 border border-[#241d18]/10 bg-[#f4efe4] p-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {statusPill(entry.status)}
                            <span className="font-mono text-[10px] uppercase tracking-wide text-[#9d9389]">
                              {formatDateTimeWithSeconds(entry.changed_at)}
                            </span>
                          </div>
                          {entry.notes && (
                            <p className="mt-1 text-sm text-[#574d43]">{entry.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 border-t border-[#241d18]/10 pt-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="size-3 text-[#8b4a36]" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">Applied</span>
                </div>
                <p className="font-mono text-sm text-[#574d43]">{formatDateTimeWithSeconds(application.attributes.created_at)}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="size-3 text-[#8b4a36]" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">Last Updated</span>
                </div>
                <p className="font-mono text-sm text-[#574d43]">{formatDateTimeWithSeconds(application.attributes.updated_at)}</p>
              </div>
            </div>

            <div className="pt-2">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#9d9389]">
                Application ID: {application.id}
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
