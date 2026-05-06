"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Plus,
  ArrowRight,
  MapPin,
  Clock,
  Inbox,
  AlertTriangle,
  TrendingUp,
  CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCareers } from "@/services/careerService";
import { Career, CareersResponse } from "@/types/career";
import { getApplications } from "@/services/applicationService";
import { JobApplication, ApplicationsResponse } from "@/types/application";
import { formatDateTime } from "@/lib/date-utils";

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
}

export default function CareersDashboardPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const [careersRes, appsRes] = await Promise.all([
        getCareers(1, 10),
        getApplications(1, 10),
      ]);

      setCareers(careersRes.data);
      setApplications(appsRes.data);
      setStats({
        totalJobs: careersRes.meta.total,
        activeJobs: careersRes.data.filter((c) => c.attributes.is_active).length,
        totalApplications: appsRes.meta.total,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const activePercentage =
    stats.totalJobs > 0
      ? Math.round((stats.activeJobs / stats.totalJobs) * 100)
      : 0;

  const statCards = [
    {
      label: "Total Jobs",
      value: stats.totalJobs,
      icon: Briefcase,
      color: "text-[#8b4a36]",
      bg: "bg-[#8b4a36]/8",
      border: "border-[#8b4a36]/20",
    },
    {
      label: "Active Listings",
      value: stats.activeJobs,
      sub: `${activePercentage}% of total`,
      icon: CircleDot,
      color: "text-[#3d7a5c]",
      bg: "bg-[#3d7a5c]/8",
      border: "border-[#3d7a5c]/20",
    },
    {
      label: "Total Applicants",
      value: stats.totalApplications,
      icon: Users,
      color: "text-[#d95c3f]",
      bg: "bg-[#d95c3f]/8",
      border: "border-[#d95c3f]/20",
    },
    {
      label: "Avg. per Job",
      value:
        stats.totalJobs > 0
          ? Math.round(stats.totalApplications / stats.totalJobs)
          : 0,
      icon: TrendingUp,
      color: "text-[#e0b84f]",
      bg: "bg-[#e0b84f]/8",
      border: "border-[#e0b84f]/20",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4efe4]">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 border-2 border-[#241d18]/15 border-t-[#8b4a36] animate-spin" />
          <p className="font-mono text-xs uppercase text-[#6f665d]">Loading dashboard…</p>
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
            Hiring Dashboard
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#6f665d]">
            Overview of job listings, applications, and pipeline health.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-6 flex items-start gap-3 border border-[#b73823] bg-[#fff1e8] px-4 py-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#7d2418]" />
            <p className="text-sm text-[#7d2418]">{error}</p>
          </div>
        )}

        {/* Stat Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`flex items-center gap-4 border ${card.border} ${card.bg} p-5`}
            >
              <div className="grid size-10 place-items-center border border-[#241d18]/10 bg-white">
                <card.icon className={`size-5 ${card.color}`} />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">
                  {card.label}
                </p>
                <p className="font-serif text-3xl text-[#241d18]">{card.value}</p>
                {card.sub && (
                  <p className="font-mono text-[10px] text-[#6f665d]">{card.sub}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Link href="/careers/jobs">
            <Button className="h-11 rounded-none border border-[#241d18] bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none transition-transform hover:-translate-y-0.5 hover:bg-[#8b4a36]">
              <Briefcase className="size-4 mr-2" />
              Manage Job Listings
              <ArrowRight className="size-3.5 ml-2" />
            </Button>
          </Link>
          <Link href="/careers/applications">
            <Button className="h-11 rounded-none border border-[#241d18] bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none transition-transform hover:-translate-y-0.5 hover:bg-[#8b4a36]">
              <Users className="size-4 mr-2" />
              View Applications
              <ArrowRight className="size-3.5 ml-2" />
            </Button>
          </Link>
          <Link href="/careers/jobs">
            <Button
              variant="outline"
              className="h-11 rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] shadow-none hover:bg-[#f4efe4]"
            >
              <Plus className="size-4 mr-2" />
              Add Job Listing
            </Button>
          </Link>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Jobs */}
          <div className="border border-[#241d18]/15 bg-[#fffaf1] shadow-[10px_10px_0_#241d18]">
            <div className="flex items-center justify-between border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                  Recent Listings
                </p>
                <p className="mt-1 text-sm text-[#574d43]">Latest job postings</p>
              </div>
              <Link
                href="/careers/jobs"
                className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-[#8b4a36] transition-colors hover:text-[#241d18]"
              >
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#241d18]/10">
              {careers.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-5 py-12">
                  <Inbox className="mb-3 size-10 text-[#6f665d]/50" />
                  <p className="font-mono text-xs uppercase text-[#6f665d]">
                    No job listings yet
                  </p>
                </div>
              ) : (
                careers.slice(0, 6).map((career) => (
                  <div
                    key={career.id}
                    className="flex items-start justify-between px-5 py-4 transition-colors hover:bg-[#f4efe4]/60"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-[#241d18]">
                          {career.attributes.title}
                        </span>
                        {career.attributes.is_active ? (
                          <span className="inline-block size-2 bg-[#3d7a5c]" title="Active" />
                        ) : (
                          <span className="inline-block size-2 bg-[#9d9389]" title="Inactive" />
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-[#6f665d]">
                        <span className="flex items-center gap-1">
                          <Briefcase className="size-3" />
                          {career.attributes.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {career.attributes.location}
                        </span>
                        <span className="border border-[#241d18]/10 px-1.5 py-0.5 font-mono text-[10px] uppercase">
                          {career.attributes.type}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 shrink-0 text-right">
                      <span className="block font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">
                        Posted
                      </span>
                      <span className="block text-xs text-[#574d43]">
                        {formatDateTime(career.attributes.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="border border-[#241d18]/15 bg-[#fffaf1] shadow-[10px_10px_0_#241d18]">
            <div className="flex items-center justify-between border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                  Recent Applicants
                </p>
                <p className="mt-1 text-sm text-[#574d43]">Latest submissions</p>
              </div>
              <Link
                href="/careers/applications"
                className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-[#8b4a36] transition-colors hover:text-[#241d18]"
              >
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#241d18]/10">
              {applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-5 py-12">
                  <Inbox className="mb-3 size-10 text-[#6f665d]/50" />
                  <p className="font-mono text-xs uppercase text-[#6f665d]">
                    No applications yet
                  </p>
                </div>
              ) : (
                applications.slice(0, 6).map((app) => (
                  <div
                    key={app.id}
                    className="flex items-start justify-between px-5 py-4 transition-colors hover:bg-[#f4efe4]/60"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-[#241d18]">
                        {app.attributes.first_name} {app.attributes.last_name}
                      </span>
                      <div className="mt-1 flex items-center gap-3 text-xs text-[#6f665d]">
                        <span className="font-mono text-[#574d43]">
                          {app.attributes.email}
                        </span>
                        <span
                          className={`inline-block border px-1.5 py-0.5 font-mono text-[10px] uppercase ${
                            app.attributes.status === "new"
                              ? "border-[#e0b84f]/30 bg-[#e0b84f]/8 text-[#8a6d1f]"
                              : app.attributes.status === "accepted"
                              ? "border-[#3d7a5c]/30 bg-[#3d7a5c]/8 text-[#3d7a5c]"
                              : app.attributes.status === "rejected"
                              ? "border-[#b73823]/30 bg-[#b73823]/8 text-[#7d2418]"
                              : "border-[#241d18]/10 bg-[#f4efe4] text-[#574d43]"
                          }`}
                        >
                          {app.attributes.status}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 shrink-0 text-right">
                      <span className="block font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">
                        Applied
                      </span>
                      <span className="flex items-center justify-end gap-1 text-xs text-[#574d43]">
                        <Clock className="size-3" />
                        {formatDateTime(app.attributes.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
