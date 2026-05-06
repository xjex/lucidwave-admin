"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  Inbox,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getPortfolios,
  deletePortfolio,
  updatePortfolio,
} from "@/services/portfolioService";
import { Portfolio, PortfoliosResponse, PortfolioStatus, ProjectStatus } from "@/types/portfolio";
import { formatDateTime } from "@/lib/date-utils";
import PortfolioFormDrawer from "./components/PortfolioFormDrawer";
import PortfolioDetailDrawer from "./components/PortfolioDetailDrawer";

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
    <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${s.border} ${s.bg} ${s.text}`}>
      {status}
    </span>
  );
};

const projectPill = (status: ProjectStatus) => {
  const s = PROJECT_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${s.border} ${s.bg} ${s.text}`}>
      {status}
    </span>
  );
};

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PortfoliosResponse["meta"] | null>(null);
  const [statusFilter, setStatusFilter] = useState<PortfolioStatus | "all">("all");
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [portfolioToDelete, setPortfolioToDelete] = useState<Portfolio | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPortfolios();
  }, [statusFilter]);

  const fetchPortfolios = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPortfolios(
        page,
        10,
        undefined,
        statusFilter === "all" ? undefined : statusFilter
      );
      setPortfolios(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load portfolios");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPortfolio(null);
    setFormOpen(true);
  };

  const handleEdit = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setFormOpen(true);
  };

  const handleView = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setDetailOpen(true);
  };

  const handleDeleteClick = (portfolio: Portfolio) => {
    setPortfolioToDelete(portfolio);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!portfolioToDelete) return;
    try {
      setIsDeleting(true);
      await deletePortfolio(portfolioToDelete.id);
      setDeleteOpen(false);
      setPortfolioToDelete(null);
      fetchPortfolios();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete portfolio");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (
    portfolio: Portfolio,
    newStatus: PortfolioStatus
  ) => {
    try {
      await updatePortfolio(portfolio.id, { status: newStatus });
      fetchPortfolios();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setSelectedPortfolio(null);
    fetchPortfolios();
  };

  if (loading && portfolios.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4efe4]">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 border-2 border-[#241d18]/15 border-t-[#8b4a36] animate-spin" />
          <p className="font-mono text-xs uppercase text-[#6f665d]">Loading portfolios…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4efe4] text-[#241d18]">
      <div className="border-b border-[#241d18]/15 bg-[#fffaf1]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-2 flex w-fit items-center gap-2 border border-[#241d18]/15 bg-[#f4efe4] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            <span className="size-2 bg-[#d95c3f]" />
            Showcase
          </div>
          <h1 className="font-serif text-5xl leading-[1.05] text-[#241d18]">
            Portfolio
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#6f665d]">
            Manage your portfolio projects and showcase work.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
              Projects
            </p>
            <p className="mt-1 text-sm text-[#574d43]">
              {meta ? `${meta.total} item${meta.total !== 1 ? "s" : ""}` : "Loading…"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as PortfolioStatus | "all")}
            >
              <SelectTrigger className="h-11 w-40 rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] shadow-none focus:ring-[#8b4a36]/20">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-[#241d18]/20">
                <SelectItem value="all" className="text-[#241d18] focus:bg-[#f4efe4]">All Status</SelectItem>
                {(["Public", "Private", "Draft"] as PortfolioStatus[]).map((s) => (
                  <SelectItem key={s} value={s} className="text-[#241d18] focus:bg-[#f4efe4]">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleCreate}
              className="h-11 rounded-none border border-[#241d18] bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none transition-transform hover:-translate-y-0.5 hover:bg-[#8b4a36]"
            >
              <Plus className="size-4 mr-2" />
              Add Project
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 border border-[#b73823] bg-[#fff1e8] px-4 py-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#7d2418]" />
            <p className="text-sm text-[#7d2418]">{error}</p>
          </div>
        )}

        <div className="border border-[#241d18]/15 bg-[#fffaf1] shadow-[10px_10px_0_#241d18]">
          <div className="grid grid-cols-[80px_1fr_120px_120px_120px_140px_160px] items-center border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            <span>Preview</span>
            <span>Title</span>
            <span>Category</span>
            <span>Status</span>
            <span>Project</span>
            <span>Created</span>
            <span className="text-right">Actions</span>
          </div>

          {portfolios.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16">
              <Inbox className="mb-3 size-10 text-[#6f665d]/50" />
              <p className="font-mono text-xs uppercase text-[#6f665d]">No portfolio items yet</p>
            </div>
          ) : (
            portfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                className="grid grid-cols-[80px_1fr_120px_120px_120px_140px_160px] items-center border-b border-[#241d18]/10 px-5 py-4 transition-colors hover:bg-[#f4efe4]/60"
              >
                <div className="pr-4">
                  <div className="size-14 overflow-hidden border border-[#241d18]/10 bg-[#f4efe4]">
                    {portfolio.attributes.imageURL ? (
                      <img
                        src={portfolio.attributes.imageURL}
                        alt={portfolio.attributes.title}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="grid size-full place-items-center">
                        <ImageIcon className="size-5 text-[#9d9389]" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="truncate pr-4">
                  <button
                    className="text-left"
                    onClick={() => handleView(portfolio)}
                  >
                    <span className="text-sm font-medium text-[#241d18] hover:text-[#8b4a36]">
                      {portfolio.attributes.title}
                    </span>
                  </button>
                  {portfolio.attributes.link && (
                    <a
                      href={portfolio.attributes.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 inline-flex items-center text-[#8b4a36] hover:text-[#241d18]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
                <div className="pr-4">
                  <span className="font-mono text-xs text-[#574d43]">
                    {portfolio.attributes.category}
                  </span>
                </div>
                <div className="pr-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const next: PortfolioStatus[] = ["Public", "Private", "Draft"];
                      const idx = next.indexOf(portfolio.attributes.status);
                      handleStatusChange(portfolio, next[(idx + 1) % next.length]);
                    }}
                    className="cursor-pointer"
                    title="Click to cycle status"
                  >
                    {statusPill(portfolio.attributes.status)}
                  </button>
                </div>
                <div className="pr-4">{projectPill(portfolio.attributes.project_status)}</div>
                <div className="text-sm text-[#6f665d]">
                  {formatDateTime(portfolio.attributes.created_at)}
                </div>
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(portfolio);
                    }}
                    className="grid size-8 place-items-center border border-[#241d18]/15 bg-white text-[#574d43] transition-colors hover:border-[#8b4a36] hover:text-[#8b4a36]"
                    title="View"
                  >
                    <Eye className="size-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(portfolio);
                    }}
                    className="grid size-8 place-items-center border border-[#241d18]/15 bg-white text-[#574d43] transition-colors hover:border-[#8b4a36] hover:text-[#8b4a36]"
                    title="Edit"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(portfolio);
                    }}
                    className="grid size-8 place-items-center border border-[#241d18]/15 bg-white text-[#574d43] transition-colors hover:border-[#b73823] hover:bg-[#fff1e8] hover:text-[#b73823]"
                    title="Delete"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))
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
                  onClick={() => fetchPortfolios(meta.page - 1)}
                  disabled={meta.page <= 1}
                  className="rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] hover:bg-[#fffaf1]"
                >
                  <ArrowLeft className="size-3.5 mr-1" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPortfolios(meta.page + 1)}
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

      <PortfolioFormDrawer
        open={formOpen}
        onOpenChange={setFormOpen}
        portfolio={selectedPortfolio}
        onSuccess={handleFormSuccess}
      />

      <PortfolioDetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        portfolio={selectedPortfolio}
        onEdit={(portfolio: Portfolio) => {
          setDetailOpen(false);
          setSelectedPortfolio(portfolio);
          setFormOpen(true);
        }}
        onDelete={(portfolio: Portfolio) => {
          setDetailOpen(false);
          handleDeleteClick(portfolio);
        }}
      />

      {/* Delete Modal */}
      <div className={`fixed inset-0 z-50 ${deleteOpen ? "flex" : "hidden"} items-center justify-center bg-black/50`}>
        <div className="w-full max-w-sm rounded-none border border-[#b73823]/30 bg-[#fffaf1] p-0 shadow-[14px_14px_0_#b73823]">
          <div className="border-b border-[#b73823]/15 bg-[#fff1e8] px-6 py-5">
            <h2 className="flex items-center gap-2 font-serif text-xl text-[#7d2418]">
              <Trash2 className="size-5 text-[#b73823]" />
              Delete Portfolio
            </h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm leading-6 text-[#574d43]">
              Are you sure you want to delete “{portfolioToDelete?.attributes.title}”? This will also delete the associated image. This action cannot be undone.
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
