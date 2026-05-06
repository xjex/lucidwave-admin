"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Pencil,
  Trash2,
  Plus,
  ArrowLeft,
  ArrowRight,
  Inbox,
  AlertTriangle,
  CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getCareers,
  deleteCareer,
  toggleCareerStatus,
} from "@/services/careerService";
import { Career, CareersResponse } from "@/types/career";
import { formatDateTime } from "@/lib/date-utils";
import CareerFormDrawer from "./components/CareerFormDrawer";

export default function JobsPage() {
  const router = useRouter();
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<CareersResponse["meta"] | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [careerToDelete, setCareerToDelete] = useState<Career | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCareers(page, 10);
      setCareers(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCareer(null);
    setFormOpen(true);
  };

  const handleEdit = (career: Career) => {
    setSelectedCareer(career);
    setFormOpen(true);
  };

  const handleDeleteClick = (career: Career) => {
    setCareerToDelete(career);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!careerToDelete) return;
    try {
      setIsDeleting(true);
      await deleteCareer(careerToDelete.id);
      setDeleteOpen(false);
      setCareerToDelete(null);
      fetchCareers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete job");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggle = async (career: Career) => {
    try {
      await toggleCareerStatus(career.id, !career.attributes.is_active);
      fetchCareers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setSelectedCareer(null);
    fetchCareers();
  };

  const formatSalary = (career: Career) => {
    const range = career.attributes.salary_range;
    if (!range || (!range.min && !range.max)) return "—";
    const currency = range.currency || "USD";
    if (range.min && range.max) {
      return `${currency} ${range.min.toLocaleString()} – ${range.max.toLocaleString()}`;
    }
    if (range.min) return `${currency} ${range.min.toLocaleString()}+`;
    return `Up to ${currency} ${range.max?.toLocaleString()}`;
  };

  const typePill = (type: string) => (
    <span className="inline-block border border-[#241d18]/10 bg-[#f4efe4] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[#574d43]">
      {type}
    </span>
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4efe4]">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 border-2 border-[#241d18]/15 border-t-[#8b4a36] animate-spin" />
          <p className="font-mono text-xs uppercase text-[#6f665d]">Loading jobs…</p>
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
            Careers
          </div>
          <h1 className="font-serif text-5xl leading-[1.05] text-[#241d18]">
            Job Listings
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#6f665d]">
            Manage job postings, toggle visibility, and track applicants.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
              Open Positions
            </p>
            <p className="mt-1 text-sm text-[#574d43]">
              {meta
                ? `${meta.total} listing${meta.total !== 1 ? "s" : ""}`
                : "Loading…"}
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="h-11 rounded-none border border-[#241d18] bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none transition-transform hover:-translate-y-0.5 hover:bg-[#8b4a36]"
          >
            <Plus className="size-4 mr-2" />
            Add Job
          </Button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 border border-[#b73823] bg-[#fff1e8] px-4 py-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#7d2418]" />
            <p className="text-sm text-[#7d2418]">{error}</p>
          </div>
        )}

        <div className="border border-[#241d18]/15 bg-[#fffaf1] shadow-[10px_10px_0_#241d18]">
          <div className="grid grid-cols-[1fr_140px_140px_100px_1fr_140px_120px_160px] items-center border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            <span>Title</span>
            <span>Department</span>
            <span>Location</span>
            <span>Type</span>
            <span>Salary</span>
            <span>Status</span>
            <span>Created</span>
            <span className="text-right">Actions</span>
          </div>

          {careers.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16">
              <Inbox className="mb-3 size-10 text-[#6f665d]/50" />
              <p className="font-mono text-xs uppercase text-[#6f665d]">No job listings yet</p>
            </div>
          ) : (
            careers.map((career) => (
              <div
                key={career.id}
                className="grid grid-cols-[1fr_140px_140px_100px_1fr_140px_120px_160px] items-center border-b border-[#241d18]/10 px-5 py-4 transition-colors hover:bg-[#f4efe4]/60"
              >
                <button
                  className="truncate pr-4 text-left"
                  onClick={() => router.push(`/careers/applications/${career.id}`)}
                >
                  <span className="text-sm font-medium text-[#241d18] hover:text-[#8b4a36]">
                    {career.attributes.title}
                  </span>
                </button>
                <div className="flex items-center gap-2 overflow-hidden pr-4">
                  <Briefcase className="size-3.5 shrink-0 text-[#8b4a36]" />
                  <span className="truncate text-sm text-[#574d43]">{career.attributes.department}</span>
                </div>
                <div className="flex items-center gap-2 overflow-hidden pr-4">
                  <MapPin className="size-3.5 shrink-0 text-[#8b4a36]" />
                  <span className="truncate text-sm text-[#574d43]">{career.attributes.location}</span>
                </div>
                <div className="pr-4">{typePill(career.attributes.type)}</div>
                <div className="flex items-center gap-2 overflow-hidden pr-4">
                  <DollarSign className="size-3.5 shrink-0 text-[#8b4a36]" />
                  <span className="truncate font-mono text-sm text-[#574d43]">{formatSalary(career)}</span>
                </div>
                <div className="pr-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(career);
                    }}
                    className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors ${
                      career.attributes.is_active
                        ? "border-[#3d7a5c]/30 bg-[#3d7a5c]/8 text-[#3d7a5c] hover:bg-[#3d7a5c]/15"
                        : "border-[#9d9389]/30 bg-[#9d9389]/8 text-[#9d9389] hover:bg-[#9d9389]/15"
                    }`}
                  >
                    <CircleDot className="size-3" />
                    {career.attributes.is_active ? "Active" : "Inactive"}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#6f665d]">
                  <Calendar className="size-3.5 shrink-0" />
                  {formatDateTime(career.attributes.created_at)}
                </div>
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/careers/applications/${career.id}`);
                    }}
                    className="grid size-8 place-items-center border border-[#241d18]/15 bg-white text-[#574d43] transition-colors hover:border-[#8b4a36] hover:text-[#8b4a36]"
                    title="View Applications"
                  >
                    <Users className="size-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(career);
                    }}
                    className="grid size-8 place-items-center border border-[#241d18]/15 bg-white text-[#574d43] transition-colors hover:border-[#8b4a36] hover:text-[#8b4a36]"
                    title="Edit"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(career);
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
                  onClick={() => fetchCareers(meta.page - 1)}
                  disabled={meta.page <= 1}
                  className="rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] hover:bg-[#fffaf1]"
                >
                  <ArrowLeft className="size-3.5 mr-1" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchCareers(meta.page + 1)}
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

      <CareerFormDrawer
        open={formOpen}
        onOpenChange={setFormOpen}
        career={selectedCareer}
        onSuccess={handleFormSuccess}
      />

      <div className={`fixed inset-0 z-50 ${deleteOpen ? "flex" : "hidden"} items-center justify-center bg-black/50`}>
        <div className="w-full max-w-sm rounded-none border border-[#b73823]/30 bg-[#fffaf1] p-0 shadow-[14px_14px_0_#b73823]">
          <div className="border-b border-[#b73823]/15 bg-[#fff1e8] px-6 py-5">
            <h2 className="flex items-center gap-2 font-serif text-xl text-[#7d2418]">
              <Trash2 className="size-5 text-[#b73823]" />
              Delete Job
            </h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm leading-6 text-[#574d43]">
              Are you sure you want to delete “{careerToDelete?.attributes.title}”? This action cannot be undone.
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
                {isDeleting ? "Deleting…" : "Delete Job"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
