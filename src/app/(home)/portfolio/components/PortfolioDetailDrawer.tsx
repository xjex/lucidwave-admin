"use client";

import { X, ExternalLink, Calendar, Tag, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Portfolio, PortfolioStatus, ProjectStatus } from "@/types/portfolio";
import { formatDateTime } from "@/lib/date-utils";

interface PortfolioDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolio: Portfolio | null;
  onEdit: (portfolio: Portfolio) => void;
  onDelete: (portfolio: Portfolio) => void;
}

const STATUS_STYLES: Record<PortfolioStatus, { border: string; bg: string; text: string }> = {
  Public: { border: "border-[#3d7a5c]/30", bg: "bg-[#3d7a5c]/8", text: "text-[#3d7a5c]" },
  Private: { border: "border-[#8b4a36]/30", bg: "bg-[#8b4a36]/8", text: "text-[#8b4a36]" },
  Draft: { border: "border-[#9d9389]/30", bg: "bg-[#9d9389]/8", text: "text-[#9d9389]" },
};

const PROJECT_STYLES: Record<ProjectStatus, { border: string; bg: string; text: string }> = {
  Public: { border: "border-[#3d7a5c]/30", bg: "bg-[#3d7a5c]/8", text: "text-[#3d7a5c]" },
  "On Progress": { border: "border-[#e0b84f]/30", bg: "bg-[#e0b84f]/8", text: "text-[#8a6d1f]" },
  NDA: { border: "border-[#b73823]/30", bg: "bg-[#b73823]/8", text: "text-[#7d2418]" },
  Local: { border: "border-[#6b4c9a]/30", bg: "bg-[#6b4c9a]/8", text: "text-[#6b4c9a]" },
};

const statusPill = (status: PortfolioStatus) => {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[10px] uppercase tracking-wide ${s.border} ${s.bg} ${s.text}`}>
      {status}
    </span>
  );
};

const projectPill = (status: ProjectStatus) => {
  const s = PROJECT_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[10px] uppercase tracking-wide ${s.border} ${s.bg} ${s.text}`}>
      {status}
    </span>
  );
};

export default function PortfolioDetailDrawer({
  open,
  onOpenChange,
  portfolio,
  onEdit,
  onDelete,
}: PortfolioDetailDrawerProps) {
  if (!portfolio) return null;

  const { attributes } = portfolio;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg border-l border-[#241d18]/15 bg-[#fffaf1] p-0 [&>button]:hidden overflow-y-auto"
      >
        <SheetHeader className="border-b border-[#241d18]/15 bg-[#f4efe4] px-6 py-5 text-left">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="font-serif text-xl text-[#241d18]">{attributes.title}</SheetTitle>
              <SheetDescription className="mt-1 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                Portfolio project details
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

        <div className="px-6 py-6 space-y-6">
          {/* Image */}
          <div className="overflow-hidden border border-[#241d18]/10 bg-[#f4efe4]">
            {attributes.imageURL ? (
              <img
                src={attributes.imageURL}
                alt={attributes.title}
                className="h-64 w-full object-cover"
              />
            ) : (
              <div className="flex h-64 items-center justify-center">
                <ImageIcon className="size-10 text-[#9d9389]" />
              </div>
            )}
          </div>

          {/* Status row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Tag className="size-3.5 text-[#8b4a36]" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">Visibility:</span>
              {statusPill(attributes.status)}
            </div>
            <div className="flex items-center gap-2">
              <Tag className="size-3.5 text-[#8b4a36]" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">Project:</span>
              {projectPill(attributes.project_status)}
            </div>
            <div className="flex items-center gap-2">
              <Tag className="size-3.5 text-[#8b4a36]" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">Category:</span>
              <span className="border border-[#241d18]/10 bg-[#f4efe4] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[#574d43]">
                {attributes.category}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-[#241d18]/10 pt-5 space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">Description</span>
            <div className="border border-[#241d18]/10 bg-[#f4efe4] p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#574d43]">{attributes.description}</p>
            </div>
          </div>

          {/* Link */}
          {attributes.link && (
            <div className="border-t border-[#241d18]/10 pt-5 space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">Project Link</span>
              <a
                href={attributes.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#8b4a36] transition-colors hover:text-[#241d18] hover:underline"
              >
                <ExternalLink className="size-3.5" />
                <span className="break-all">{attributes.link}</span>
              </a>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 border-t border-[#241d18]/10 pt-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="size-3 text-[#8b4a36]" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">Created</span>
              </div>
              <p className="font-mono text-sm text-[#574d43]">{formatDateTime(attributes.created_at)}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="size-3 text-[#8b4a36]" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">Updated</span>
              </div>
              <p className="font-mono text-sm text-[#574d43]">{formatDateTime(attributes.updated_at)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t border-[#241d18]/10 pt-5">
            <Button
              variant="outline"
              className="h-11 flex-1 rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] shadow-none hover:bg-[#f4efe4]"
              onClick={() => onEdit(portfolio)}
            >
              <Pencil className="size-4 mr-2" />
              Edit
            </Button>
            <Button
              className="h-11 flex-1 rounded-none border border-[#b73823] bg-[#b73823] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none transition-transform hover:-translate-y-0.5 hover:bg-[#7d2418]"
              onClick={() => onDelete(portfolio)}
            >
              <Trash2 className="size-4 mr-2" />
              Delete
            </Button>
          </div>

          <div className="pt-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#9d9389]">
              Portfolio ID: {portfolio.id}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
