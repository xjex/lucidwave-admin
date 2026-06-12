"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Building2,
  MapPin,
  DollarSign,
  Clock,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  Inbox,
  AlertTriangle,
  RefreshCw,
  Star,
  Search,
  Layers,
  ScanLine,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getScrapedJobs,
  getScrapeRuns,
  deleteScrapedJob,
  deleteScrapeRun,
} from "@/services/scrapeService";
import {
  ScrapedJob,
  ScrapeRun,
  PageMeta,
} from "@/types/scrape";
import { formatDateTime } from "@/lib/date-utils";
import { useAuthStore } from "@/stores/authStore";

type PendingDelete =
  | { kind: "job"; id: string; label: string }
  | { kind: "run"; id: string; label: string; jobsHint: number };

type Tab = "jobs" | "runs";

const FIT_FILTERS = [
  { label: "All", value: 0 },
  { label: "4+", value: 4 },
  { label: "5", value: 5 },
];

export default function ScrapesPage() {
  const [tab, setTab] = useState<Tab>("jobs");

  // Jobs state
  const [jobs, setJobs] = useState<ScrapedJob[]>([]);
  const [jobsMeta, setJobsMeta] = useState<PageMeta | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [minFit, setMinFit] = useState(0);

  // Runs state
  const [runs, setRuns] = useState<ScrapeRun[]>([]);
  const [runsMeta, setRunsMeta] = useState<PageMeta | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin-gated delete
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = (role ?? "").toLowerCase() === "admin";
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchJobs = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        setError(null);
        const res = await getScrapedJobs({
          page,
          limit: 25,
          minFit: minFit || undefined,
          search: search || undefined,
        });
        setJobs(res.data);
        setJobsMeta(res.meta);
      } catch (err: any) {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.error ||
            "Failed to load scraped jobs"
        );
      } finally {
        setLoading(false);
      }
    },
    [minFit, search]
  );

  const fetchRuns = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getScrapeRuns(page, 20);
      setRuns(res.data);
      setRunsMeta(res.meta);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to load scrape runs"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "jobs") fetchJobs(1);
    else fetchRuns(1);
  }, [tab, fetchJobs, fetchRuns]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setIsDeleting(true);
      setError(null);
      if (pendingDelete.kind === "job") {
        await deleteScrapedJob(pendingDelete.id);
        setPendingDelete(null);
        await fetchJobs(jobsMeta?.page ?? 1);
      } else {
        await deleteScrapeRun(pendingDelete.id);
        setPendingDelete(null);
        await fetchRuns(runsMeta?.page ?? 1);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to delete"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const formatSalary = (job: ScrapedJob) => {
    const { salary } = job;
    const min = salary.min_monthly_usd;
    const max = salary.max_monthly_usd;
    if (min || max) {
      const cur = "USD";
      if (min && max)
        return `${cur} ${min.toLocaleString()} – ${max.toLocaleString()}/mo`;
      if (min) return `${cur} ${min.toLocaleString()}+/mo`;
      return `Up to ${cur} ${max?.toLocaleString()}/mo`;
    }
    return salary.raw || "—";
  };

  const fitColor = (score: number) => {
    if (score >= 5) return "border-[#3d7a5c]/30 bg-[#3d7a5c]/8 text-[#3d7a5c]";
    if (score >= 4) return "border-[#8b4a36]/30 bg-[#8b4a36]/8 text-[#8b4a36]";
    if (score >= 3) return "border-[#c2842a]/30 bg-[#c2842a]/10 text-[#9a6516]";
    return "border-[#9d9389]/30 bg-[#9d9389]/8 text-[#9d9389]";
  };

  const pill = (text: string) => (
    <span className="inline-block border border-[#241d18]/10 bg-[#f4efe4] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[#574d43]">
      {text}
    </span>
  );

  return (
    <div className="min-h-screen bg-[#f4efe4] text-[#241d18]">
      {/* Header */}
      <div className="border-b border-[#241d18]/15 bg-[#fffaf1]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-2 flex w-fit items-center gap-2 border border-[#241d18]/15 bg-[#f4efe4] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            <span className="size-2 bg-[#d95c3f]" />
            OnlineJobs.ph
          </div>
          <h1 className="font-serif text-5xl leading-[1.05] text-[#241d18]">
            Job Scrapes
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#6f665d]">
            Hourly-scraped job postings from onlinejobs.ph, deduped by job ID and
            ranked by fit.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Tabs */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex">
            {(["jobs", "runs"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-2 border px-4 py-2.5 font-mono text-[11px] uppercase tracking-wide transition-colors ${
                  tab === t
                    ? "border-[#241d18] bg-[#241d18] text-[#fffaf1]"
                    : "border-[#241d18]/15 bg-white text-[#574d43] hover:bg-[#fffaf1]"
                } ${t === "jobs" ? "border-r-0" : ""}`}
              >
                {t === "jobs" ? (
                  <Layers className="size-3.5" />
                ) : (
                  <ScanLine className="size-3.5" />
                )}
                {t === "jobs" ? "Latest Jobs" : "Scrape Runs"}
              </button>
            ))}
          </div>
          <Button
            onClick={() => (tab === "jobs" ? fetchJobs(jobsMeta?.page ?? 1) : fetchRuns(runsMeta?.page ?? 1))}
            className="h-10 rounded-none border border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] shadow-none hover:bg-[#fffaf1]"
          >
            <RefreshCw className="size-3.5 mr-2" />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 border border-[#b73823] bg-[#fff1e8] px-4 py-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#7d2418]" />
            <p className="text-sm text-[#7d2418]">{error}</p>
          </div>
        )}

        {/* JOBS TAB */}
        {tab === "jobs" && (
          <>
            {/* Filters */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6f665d]" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search title or employer…"
                  className="h-11 w-full rounded-none border border-[#241d18]/15 bg-white pl-10 pr-4 text-sm text-[#241d18] outline-none placeholder:text-[#6f665d]/60 focus:border-[#8b4a36]"
                />
              </form>
              <div className="flex items-center gap-1">
                <span className="mr-1 font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                  Fit
                </span>
                {FIT_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setMinFit(f.value)}
                    className={`border px-3 py-2 font-mono text-[10px] uppercase tracking-wide transition-colors ${
                      minFit === f.value
                        ? "border-[#241d18] bg-[#241d18] text-[#fffaf1]"
                        : "border-[#241d18]/15 bg-white text-[#574d43] hover:bg-[#fffaf1]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-[#241d18]/15 bg-[#fffaf1] shadow-[10px_10px_0_#241d18]">
              <div className="grid grid-cols-[1fr_150px_90px_110px_140px_70px_120px_90px] items-center border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                <span>Title / Employer</span>
                <span>Category</span>
                <span>Location</span>
                <span>Type</span>
                <span>Salary</span>
                <span>Fit</span>
                <span>Seen</span>
                <span className="text-right">Actions</span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center px-5 py-16">
                  <div className="mb-3 size-8 border-2 border-[#241d18]/15 border-t-[#8b4a36] animate-spin" />
                  <p className="font-mono text-xs uppercase text-[#6f665d]">Loading jobs…</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-5 py-16">
                  <Inbox className="mb-3 size-10 text-[#6f665d]/50" />
                  <p className="font-mono text-xs uppercase text-[#6f665d]">No scraped jobs yet</p>
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="grid grid-cols-[1fr_150px_90px_110px_140px_70px_120px_90px] items-center border-b border-[#241d18]/10 px-5 py-4 transition-colors hover:bg-[#f4efe4]/60"
                  >
                    <div className="min-w-0 pr-4">
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-sm font-medium text-[#241d18] hover:text-[#8b4a36]"
                        title={job.title}
                      >
                        {job.title}
                      </a>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[#6f665d]">
                        <Building2 className="size-3 shrink-0" />
                        <span className="truncate text-xs">{job.employer}</span>
                      </div>
                    </div>
                    <div className="pr-4">{pill(job.category)}</div>
                    <div className="flex items-center gap-1.5 overflow-hidden pr-4">
                      <MapPin className="size-3.5 shrink-0 text-[#8b4a36]" />
                      <span className="truncate text-sm text-[#574d43]">{job.location}</span>
                    </div>
                    <div className="pr-4">
                      <span className="truncate text-sm text-[#574d43]">{job.work_type}</span>
                    </div>
                    <div className="flex items-center gap-1.5 overflow-hidden pr-4">
                      <DollarSign className="size-3.5 shrink-0 text-[#8b4a36]" />
                      <span className="truncate font-mono text-xs text-[#574d43]">{formatSalary(job)}</span>
                    </div>
                    <div className="pr-4">
                      <span
                        className={`inline-flex items-center gap-1 border px-2 py-1 font-mono text-[10px] ${fitColor(job.fit.score)}`}
                        title={job.fit.reason}
                      >
                        <Star className="size-3" />
                        {job.fit.score}
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-1.5 text-xs text-[#6f665d]"
                      title={`First seen: ${formatDateTime(job.first_seen_at)}\nIngested: ${formatDateTime(job.created_at)}\nUpdated: ${formatDateTime(job.updated_at)}`}
                    >
                      <Clock className="size-3.5 shrink-0" />
                      {formatDateTime(job.last_seen_at)}
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grid size-8 place-items-center border border-[#241d18]/15 bg-white text-[#574d43] transition-colors hover:border-[#8b4a36] hover:text-[#8b4a36]"
                        title="Open listing"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                      {isAdmin && (
                        <button
                          onClick={() =>
                            setPendingDelete({
                              kind: "job",
                              id: job.id,
                              label: job.title,
                            })
                          }
                          className="grid size-8 place-items-center border border-[#241d18]/15 bg-white text-[#574d43] transition-colors hover:border-[#b73823] hover:bg-[#fff1e8] hover:text-[#b73823]"
                          title="Delete job"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}

              {jobsMeta && jobsMeta.pages > 1 && (
                <Pagination
                  meta={jobsMeta}
                  onPage={(p) => fetchJobs(p)}
                />
              )}
            </div>
          </>
        )}

        {/* RUNS TAB */}
        {tab === "runs" && (
          <div className="border border-[#241d18]/15 bg-[#fffaf1] shadow-[10px_10px_0_#241d18]">
            <div className="grid grid-cols-[1fr_115px_115px_70px_70px_70px_70px_1fr_60px] items-center border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
              <span>Scrape ID</span>
              <span>Scraped At</span>
              <span>Ingested</span>
              <span>Scanned</span>
              <span>Matched</span>
              <span>Inserted</span>
              <span>Updated</span>
              <span>Categories</span>
              <span className="text-right">Actions</span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center px-5 py-16">
                <div className="mb-3 size-8 border-2 border-[#241d18]/15 border-t-[#8b4a36] animate-spin" />
                <p className="font-mono text-xs uppercase text-[#6f665d]">Loading runs…</p>
              </div>
            ) : runs.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-16">
                <Inbox className="mb-3 size-10 text-[#6f665d]/50" />
                <p className="font-mono text-xs uppercase text-[#6f665d]">No scrape runs yet</p>
              </div>
            ) : (
              runs.map((run) => (
                <div
                  key={run.id}
                  className="grid grid-cols-[1fr_115px_115px_70px_70px_70px_70px_1fr_60px] items-center border-b border-[#241d18]/10 px-5 py-4 transition-colors hover:bg-[#f4efe4]/60"
                >
                  <div className="min-w-0 pr-4">
                    <span className="font-mono text-xs text-[#241d18]">{run.scrape_id}</span>
                    <div className="mt-0.5">{pill(run.mode)}</div>
                  </div>
                  <div className="pr-4 text-xs text-[#6f665d]">{formatDateTime(run.scraped_at)}</div>
                  <div
                    className="pr-4 text-xs text-[#6f665d]"
                    title={`Ingested: ${formatDateTime(run.created_at)}\nUpdated: ${formatDateTime(run.updated_at)}`}
                  >
                    {formatDateTime(run.created_at)}
                  </div>
                  <div className="font-mono text-sm text-[#574d43]">{run.total_scanned}</div>
                  <div className="font-mono text-sm text-[#574d43]">{run.matched}</div>
                  <div className="font-mono text-sm text-[#3d7a5c]">{run.inserted}</div>
                  <div className="font-mono text-sm text-[#8b4a36]">{run.updated}</div>
                  <div className="flex flex-wrap gap-1 pr-4">
                    {run.filter_categories.map((c) => (
                      <span key={c}>{pill(c)}</span>
                    ))}
                    {run.skipped.length > 0 && (
                      <span className="inline-flex items-center gap-1 border border-[#c2842a]/30 bg-[#c2842a]/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-[#9a6516]">
                        <AlertTriangle className="size-3" />
                        {run.skipped.length} skipped
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-end">
                    {isAdmin && (
                      <button
                        onClick={() =>
                          setPendingDelete({
                            kind: "run",
                            id: run.id,
                            label: run.scrape_id,
                            jobsHint: run.inserted + run.updated,
                          })
                        }
                        className="grid size-8 place-items-center border border-[#241d18]/15 bg-white text-[#574d43] transition-colors hover:border-[#b73823] hover:bg-[#fff1e8] hover:text-[#b73823]"
                        title="Delete run and its jobs"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

            {runsMeta && runsMeta.pages > 1 && (
              <Pagination meta={runsMeta} onPage={(p) => fetchRuns(p)} />
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <div
        className={`fixed inset-0 z-50 ${pendingDelete ? "flex" : "hidden"} items-center justify-center bg-black/50 px-4`}
      >
        <div className="w-full max-w-sm rounded-none border border-[#b73823]/30 bg-[#fffaf1] p-0 shadow-[14px_14px_0_#b73823]">
          <div className="border-b border-[#b73823]/15 bg-[#fff1e8] px-6 py-5">
            <h2 className="flex items-center gap-2 font-serif text-xl text-[#7d2418]">
              <Trash2 className="size-5 text-[#b73823]" />
              {pendingDelete?.kind === "run" ? "Delete Scrape Run" : "Delete Job"}
            </h2>
          </div>
          <div className="px-6 py-5">
            {pendingDelete?.kind === "run" ? (
              <p className="text-sm leading-6 text-[#574d43]">
                Delete scrape run{" "}
                <span className="font-mono text-[#241d18]">{pendingDelete.label}</span> and{" "}
                <span className="font-medium text-[#7d2418]">
                  all jobs last seen in it
                </span>{" "}
                (~{pendingDelete.jobsHint})? This cannot be undone.
              </p>
            ) : (
              <p className="text-sm leading-6 text-[#574d43]">
                Are you sure you want to delete “{pendingDelete?.label}”? This action
                cannot be undone.
              </p>
            )}
            <div className="mt-5 flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPendingDelete(null)}
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
                {isDeleting
                  ? "Deleting…"
                  : pendingDelete?.kind === "run"
                  ? "Delete Run"
                  : "Delete Job"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pagination({
  meta,
  onPage,
}: {
  meta: PageMeta;
  onPage: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-[#241d18]/15 bg-[#f4efe4] px-5 py-3">
      <span className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
        Page {meta.page} of {meta.pages} · {meta.total} total
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPage(meta.page - 1)}
          disabled={meta.page <= 1}
          className="rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] hover:bg-[#fffaf1]"
        >
          <ArrowLeft className="size-3.5 mr-1" />
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPage(meta.page + 1)}
          disabled={meta.page >= meta.pages}
          className="rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] hover:bg-[#fffaf1]"
        >
          Next
          <ArrowRight className="size-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
