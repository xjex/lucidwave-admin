"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  ArrowLeft,
  FileText,
  Receipt,
  Calendar,
  User,
  Search,
  Download,
  Eye,
  Mail,
  AlertTriangle,
  Inbox,
} from "lucide-react";
import {
  getMailingHistory,
  downloadMailingHistory,
  getMailingHistoryViewUrl,
  MailingHistoryItem,
  MailingHistoryResponse,
  MailingHistoryFilters,
} from "@/services/mailingHistoryService";
import { formatDateTime } from "@/lib/date-utils";

export default function MailingHistoryPage() {
  const [mailingHistory, setMailingHistory] = useState<MailingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<MailingHistoryResponse["meta"] | null>(null);

  // Filter states
  const [filters, setFilters] = useState<MailingHistoryFilters>({});
  const [recipientFilter, setRecipientFilter] = useState("");

  // PDF viewer state
  const [viewingItem, setViewingItem] = useState<MailingHistoryItem | null>(null);
  const [viewingFileIndex, setViewingFileIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (
      typeof err === "object" &&
      err !== null &&
      "response" in err &&
      typeof err.response === "object" &&
      err.response !== null &&
      "data" in err.response
    ) {
      const data = err.response.data as { message?: string; error?: string };
      return data.message || data.error || fallback;
    }

    return err instanceof Error ? err.message : fallback;
  };

  const fetchMailingHistory = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const apiFilters = { ...filters };
      if (recipientFilter.trim()) {
        apiFilters.sent_to = recipientFilter.trim();
      }
      const response = await getMailingHistory(page, 10, apiFilters);
      setMailingHistory(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load mailing history"));
    } finally {
      setLoading(false);
    }
  }, [filters, recipientFilter]);

  useEffect(() => {
    fetchMailingHistory();
  }, [fetchMailingHistory]);

  const handleTypeFilterChange = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      type:
        type === "all"
          ? undefined
          : (type as "receipt" | "invoice" | "payroll"),
    }));
  };

  const handleDownload = async (item: MailingHistoryItem) => {
    try {
      await downloadMailingHistory(item.id);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to download"));
    }
  };

  const handleView = (item: MailingHistoryItem) => {
    if (!item.attributes.files || item.attributes.files.length === 0) {
      setError("No files available for this mailing");
      return;
    }
    setViewingItem(item);
    setViewingFileIndex(0);
    setDialogOpen(true);
  };

  const currentFileUrl =
    viewingItem && viewingItem.attributes.files.length > 0
      ? getMailingHistoryViewUrl(viewingItem.id, viewingFileIndex)
      : null;

  const originalFileUrl =
    viewingItem && viewingItem.attributes.files.length > 0
      ? viewingItem.attributes.files[viewingFileIndex]
      : null;

  const currentFileName = originalFileUrl
    ? decodeURIComponent(originalFileUrl.split("/").pop() || "Document")
    : "";

  const typePill = (type: string) => {
    const isInvoice = type === "invoice";
    const isPayroll = type === "payroll";
    return (
      <span
        className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide ${
          isInvoice
            ? "border-[#8b4a36]/30 bg-[#8b4a36]/8 text-[#8b4a36]"
            : isPayroll
              ? "border-[#241d18]/20 bg-white text-[#574d43]"
            : "border-[#3d7a5c]/30 bg-[#3d7a5c]/8 text-[#3d7a5c]"
        }`}
      >
        {isInvoice || isPayroll ? (
          <FileText className="size-3.5" />
        ) : (
          <Receipt className="size-3.5" />
        )}
        {type}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f4efe4] text-[#241d18]">
      {/* Top header bar */}
      <div className="border-b border-[#241d18]/15 bg-[#fffaf1]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-2 flex w-fit items-center gap-2 border border-[#241d18]/15 bg-[#f4efe4] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            <span className="size-2 bg-[#d95c3f]" />
            Mailing History
          </div>
          <h1 className="font-serif text-5xl leading-[1.05] text-[#241d18]">
            Sent Documents
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#6f665d]">
            History of invoices, receipts, and payroll statements sent via
            email. Preview inline or download the originals when files are
            available.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 gap-4 border border-[#241d18]/15 bg-[#fffaf1] p-5 shadow-[8px_8px_0_#241d18] sm:grid-cols-4 sm:items-end">
          <div className="space-y-2">
            <Label className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">
              Document Type
            </Label>
            <div className="flex gap-2">
              {["all", "invoice", "receipt", "payroll"].map((t) => (
                <button
                  key={t}
                  onClick={() => handleTypeFilterChange(t)}
                  className={`border px-3 py-2 font-mono text-[11px] uppercase tracking-wide transition-colors ${
                    (t === "all" && !filters.type) || filters.type === t
                      ? "border-[#241d18] bg-[#241d18] text-[#fffaf1]"
                      : "border-[#241d18]/20 bg-white text-[#574d43] hover:border-[#241d18]/40"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2 space-y-2">
            <Label className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">
              Recipient Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8b4a36]" />
              <Input
                type="email"
                value={recipientFilter}
                onChange={(e) => setRecipientFilter(e.target.value)}
                placeholder="client@example.com"
                className="h-11 rounded-none border-[#241d18]/20 bg-white pl-10 text-[#241d18] shadow-none placeholder:text-[#9d9389] focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20"
              />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <Button
              onClick={() => fetchMailingHistory(1)}
              disabled={loading}
              className="h-11 rounded-none border border-[#241d18] bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none transition-transform hover:-translate-y-0.5 hover:bg-[#8b4a36] disabled:translate-y-0"
            >
              <Search className="size-4 mr-2" />
              Apply
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({});
                setRecipientFilter("");
                fetchMailingHistory(1);
              }}
              disabled={loading}
              className="h-11 rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] shadow-none hover:bg-[#f4efe4]"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 border border-[#b73823] bg-[#fff1e8] px-4 py-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#7d2418]" />
            <p className="text-sm text-[#7d2418]">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="border border-[#241d18]/15 bg-[#fffaf1] shadow-[10px_10px_0_#241d18]">
          {/* Table header */}
          <div className="grid grid-cols-[120px_1fr_140px_100px_180px_1fr_100px] items-center border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            <span>Type</span>
            <span>Recipient</span>
            <span>Subject</span>
            <span className="text-right">Amount</span>
            <span>Sent By</span>
            <span>Sent At</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Table body */}
          {loading ? (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto mb-4 size-8 border-2 border-[#241d18]/15 border-t-[#8b4a36] animate-spin" />
              <p className="font-mono text-xs uppercase text-[#6f665d]">
                Loading records…
              </p>
            </div>
          ) : mailingHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16">
              <Inbox className="mb-3 size-10 text-[#6f665d]/50" />
              <p className="font-mono text-xs uppercase text-[#6f665d]">
                No mailing history found
              </p>
            </div>
          ) : (
            mailingHistory.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[120px_1fr_140px_100px_180px_1fr_100px] items-center border-b border-[#241d18]/10 px-5 py-4 transition-colors hover:bg-[#f4efe4]/60"
              >
                <div>{typePill(item.attributes.type)}</div>
                <div className="flex items-center gap-2 overflow-hidden">
                  <Mail className="size-3.5 shrink-0 text-[#8b4a36]" />
                  <span className="truncate font-mono text-sm text-[#241d18]">
                    {item.attributes.sent_to}
                  </span>
                </div>
                <div
                  className="truncate text-sm text-[#574d43]"
                  title={item.attributes.metadata.subject}
                >
                  {item.attributes.metadata.subject}
                </div>
                <div className="text-right font-mono text-sm text-[#241d18]">
                  {item.attributes.metadata.amount ? (
                    <span>
                      {item.attributes.metadata.currency || "USD"}{" "}
                      {item.attributes.metadata.amount}
                    </span>
                  ) : (
                    <span className="text-[#9d9389]">—</span>
                  )}
                </div>
                <div className="flex items-center gap-2 overflow-hidden">
                  <User className="size-3.5 shrink-0 text-[#8b4a36]" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#241d18]">
                      {item.attributes.sender.username}
                    </p>
                    <p className="truncate font-mono text-[11px] text-[#6f665d]">
                      {item.attributes.sender.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#6f665d]">
                  <Calendar className="size-3.5 shrink-0" />
                  {formatDateTime(item.attributes.timestamp)}
                </div>
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleView(item)}
                    disabled={!item.attributes.files.length}
                    className="grid size-8 place-items-center border border-[#241d18]/15 bg-white text-[#574d43] transition-colors hover:border-[#8b4a36] hover:text-[#8b4a36]"
                    title="View"
                  >
                    <Eye className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(item)}
                    disabled={!item.attributes.files.length}
                    className="grid size-8 place-items-center border border-[#241d18]/15 bg-white text-[#574d43] transition-colors hover:border-[#8b4a36] hover:text-[#8b4a36]"
                    title="Download"
                  >
                    <Download className="size-4" />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          {meta && meta.pages > 1 && (
            <div className="flex items-center justify-between border-t border-[#241d18]/15 bg-[#f4efe4] px-5 py-3">
              <span className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                Page {meta.page} of {meta.pages} · {meta.total} total
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchMailingHistory(meta.page - 1)}
                  disabled={meta.page <= 1 || loading}
                  className="rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] hover:bg-[#fffaf1]"
                >
                  <ArrowLeft className="size-3.5 mr-1" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchMailingHistory(meta.page + 1)}
                  disabled={meta.page >= meta.pages || loading}
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

      {/* PDF Viewer Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="!max-w-none w-[98vw] h-[96vh] flex flex-col rounded-none border-[#241d18]/20 bg-[#fffaf1] p-0 shadow-[14px_14px_0_#241d18]">
          <DialogHeader className="border-b border-[#241d18]/15 bg-[#f4efe4] px-6 py-5">
            <DialogTitle className="font-serif text-2xl text-[#241d18]">
              {viewingItem?.attributes.metadata.subject || "Document"}
            </DialogTitle>
            <DialogDescription className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
              {viewingItem && (
                <span>
                  {viewingItem.attributes.type === "invoice"
                    ? "Invoice"
                    : "Receipt"}{" "}
                  sent to {viewingItem.attributes.sent_to}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {viewingItem && viewingItem.attributes.files.length > 1 && (
            <div className="border-b border-[#241d18]/15 px-6 py-3">
              <div className="flex gap-2 overflow-x-auto">
                {viewingItem.attributes.files.map((fileUrl, index) => {
                  const name = decodeURIComponent(
                    fileUrl.split("/").pop() || `File ${index + 1}`
                  );
                  return (
                    <button
                      key={index}
                      onClick={() => setViewingFileIndex(index)}
                      className={`inline-flex items-center gap-1.5 border px-3 py-2 font-mono text-[11px] uppercase tracking-wide transition-colors ${
                        index === viewingFileIndex
                          ? "border-[#241d18] bg-[#241d18] text-[#fffaf1]"
                          : "border-[#241d18]/20 bg-white text-[#574d43] hover:border-[#241d18]/40"
                      }`}
                    >
                      <FileText className="size-3.5" />
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex-1 bg-[#f4efe4]/40 p-6 min-h-0">
            {currentFileUrl ? (
              originalFileUrl?.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={currentFileUrl}
                  width="100%"
                  height="100%"
                  style={{
                    border: "1px solid #241d18/20",
                    backgroundColor: "#fffaf1",
                  }}
                  title={currentFileName}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-5 border border-[#241d18]/15 bg-[#fffaf1]">
                  <FileText className="size-14 text-[#6f665d]/50" />
                  <p className="font-mono text-xs uppercase text-[#6f665d]">
                    This file cannot be previewed inline.
                  </p>
                  <Button
                    asChild
                    className="rounded-none border border-[#241d18] bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none transition-transform hover:-translate-y-0.5 hover:bg-[#8b4a36]"
                  >
                    <a
                      href={currentFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="size-4 mr-2" />
                      Open {currentFileName}
                    </a>
                  </Button>
                </div>
              )
            ) : (
              <div className="flex h-full items-center justify-center border border-[#241d18]/15 bg-[#fffaf1]">
                <p className="font-mono text-xs uppercase text-[#6f665d]">
                  No file to display
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
