"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Mail,
  Receipt,
  Users,
} from "lucide-react";
import {
  ClientListItem,
  ClientMailing,
  ClientMaxHoursPeriod,
  getClientBySlug,
} from "@/services/clientService";
import { formatDateTime } from "@/lib/date-utils";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const maxHoursLabel = (
  maxHours: number,
  period: ClientMaxHoursPeriod
) => {
  if (period === "none" || !maxHours) return "No max hours";
  return `${maxHours} hrs / ${period}`;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const data = error.response.data as { message?: string; error?: string };
    return data.message || data.error || fallback;
  }

  return error instanceof Error ? error.message : fallback;
};

function MailingList({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: typeof FileText;
  items: ClientMailing[];
}) {
  return (
    <div className="border border-[#241d18]/15 bg-[#fffaf1]">
      <div className="flex items-center gap-2 border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-3">
        <Icon className="size-4 text-[#8b4a36]" />
        <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
          {title}
        </p>
      </div>
      {items.length === 0 ? (
        <div className="px-5 py-10 text-sm text-[#6f665d]">No records yet.</div>
      ) : (
        <div className="divide-y divide-[#241d18]/10">
          {items.map((item) => (
            <div
              key={item.id}
              className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_130px]"
            >
              <div>
                <p className="font-medium">
                  {item.metadata?.subject || `${item.type} email`}
                </p>
                <p className="mt-1 text-sm text-[#6f665d]">
                  {formatDateTime(item.timestamp)}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-mono text-sm font-semibold">
                  {item.metadata?.amount
                    ? `${item.metadata.currency || "$"}${item.metadata.amount}`
                    : "No amount"}
                </p>
                <p className="mt-1 text-xs text-[#6f665d]">
                  {item.files.length} file{item.files.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ClientDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [client, setClient] = useState<ClientListItem | null>(null);
  const [mailings, setMailings] = useState<ClientMailing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getClientBySlug(slug);
        setClient(response.data);
        setMailings(response.mailings);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load client"));
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchClient();
  }, [slug]);

  const invoices = useMemo(
    () => mailings.filter((item) => item.type === "invoice"),
    [mailings]
  );
  const receipts = useMemo(
    () => mailings.filter((item) => item.type === "receipt"),
    [mailings]
  );
  const completedMilestones = useMemo(
    () =>
      client?.projects.flatMap((project) =>
        project.milestones
          .filter((milestone) => milestone.status === "paid")
          .map((milestone) => ({
            ...milestone,
            projectName: project.name,
          }))
      ) || [],
    [client]
  );
  const maxHourlyHours = useMemo(
    () =>
      client?.projects.reduce(
        (sum, project) =>
          project.billing_type === "hourly" &&
          project.max_hours_period !== "none"
            ? sum + Number(project.max_hours || 0)
            : sum,
        0
      ) || 0,
    [client]
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4efe4]">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin border-2 border-[#241d18]/15 border-t-[#8b4a36]" />
          <p className="font-mono text-xs uppercase text-[#6f665d]">
            Loading client
          </p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-[#f4efe4] px-6 py-8 text-[#241d18]">
        <Link
          href="/clients"
          className="mb-6 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-[#8b4a36]"
        >
          <ArrowLeft className="size-3.5" />
          Back to Clients
        </Link>
        <div className="flex items-start gap-3 border border-[#b73823] bg-[#fff1e8] px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#7d2418]" />
          <p className="text-sm text-[#7d2418]">
            {error || "Client not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4efe4] text-[#241d18]">
      <div className="border-b border-[#241d18]/15 bg-[#fffaf1]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <Link
            href="/clients"
            className="mb-3 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-[#8b4a36] transition-colors hover:text-[#241d18]"
          >
            <ArrowLeft className="size-3.5" />
            Back to Clients
          </Link>
          <div className="mb-2 flex w-fit items-center gap-2 border border-[#241d18]/15 bg-[#f4efe4] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            <span className="size-2 bg-[#d95c3f]" />
            Client Account
          </div>
          <h1 className="font-serif text-5xl leading-[1.05]">
            {client.company || client.name}
          </h1>
          <p className="mt-3 flex max-w-xl items-center gap-2 text-sm leading-6 text-[#6f665d]">
            <Mail className="size-4" />
            {client.email}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 grid gap-4 lg:grid-cols-3">
          <div className="border border-[#241d18]/15 bg-[#fffaf1] p-5">
            <p className="font-mono text-[11px] uppercase text-[#6f665d]">
              Projects / Roles
            </p>
            <p className="mt-2 font-serif text-2xl">
              {client.projects.length}
            </p>
            <p className="mt-2 text-sm uppercase text-[#8b4a36]">
              active account tracks
            </p>
          </div>
          <div className="border border-[#241d18]/15 bg-[#fffaf1] p-5">
            <p className="font-mono text-[11px] uppercase text-[#6f665d]">
              Max Hourly Hours
            </p>
            <p className="mt-2 font-serif text-2xl">{maxHourlyHours}</p>
          </div>
          <div className="border border-[#241d18]/15 bg-[#fffaf1] p-5">
            <p className="font-mono text-[11px] uppercase text-[#6f665d]">
              Employees
            </p>
            <p className="mt-2 font-serif text-2xl">
              {client.employees_working.length}
            </p>
          </div>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="border border-[#241d18]/15 bg-[#fffaf1] lg:col-span-2">
            <div className="flex items-center gap-2 border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-3">
              <FileText className="size-4 text-[#8b4a36]" />
              <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                Projects and Roles
              </p>
            </div>
            {client.projects.length === 0 ? (
              <div className="px-5 py-10 text-sm text-[#6f665d]">
                No projects configured.
              </div>
            ) : (
              <div className="grid gap-0 divide-y divide-[#241d18]/10">
                {client.projects.map((project, index) => (
                  <div
                    key={`${project.name}-${index}`}
                    className="grid gap-4 px-5 py-4 md:grid-cols-[1.2fr_1fr]"
                  >
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="mt-1 text-sm text-[#6f665d]">
                        {project.role || "No role specified"} · {project.status}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {client.employees_working
                          .filter((employee) =>
                            project.assigned_employee_ids.includes(employee.id)
                          )
                          .map((employee) => (
                            <span
                              key={employee.id}
                              className="border border-[#241d18]/15 bg-white px-2 py-1 text-xs text-[#574d43]"
                            >
                              {employee.name}
                            </span>
                          ))}
                        {project.assigned_employee_ids.length === 0 && (
                          <span className="text-xs text-[#6f665d]">
                            No project employees assigned.
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="font-mono text-sm text-[#574d43]">
                      {project.billing_type === "hourly" &&
                        `Hourly · ${money.format(project.hourly_rate)} · ${
                          maxHoursLabel(
                            project.max_hours,
                            project.max_hours_period
                          )
                        }`}
                      {project.billing_type === "project" &&
                        `Project · ${money.format(project.project_price)}`}
                      {project.billing_type === "milestone" &&
                        `Milestone · ${project.milestones.length} phases`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-[#241d18]/15 bg-[#fffaf1]">
            <div className="flex items-center gap-2 border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-3">
              <Users className="size-4 text-[#8b4a36]" />
              <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                Employees Working
              </p>
            </div>
            {client.employees_working.length === 0 ? (
              <div className="px-5 py-10 text-sm text-[#6f665d]">
                No employees assigned.
              </div>
            ) : (
              <div className="divide-y divide-[#241d18]/10">
                {client.employees_working.map((employee) => (
                  <div
                    key={employee.id}
                    className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_120px]"
                  >
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-[#6f665d]">
                        {employee.position || employee.email}
                      </p>
                    </div>
                    <p className="font-mono text-sm font-semibold sm:text-right">
                      {money.format(employee.hourly_rate)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-[#241d18]/15 bg-[#fffaf1]">
            <div className="flex items-center gap-2 border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-3">
              <CheckCircle2 className="size-4 text-[#8b4a36]" />
              <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                Completed Milestones
              </p>
            </div>
            {completedMilestones.length === 0 ? (
              <div className="px-5 py-10 text-sm text-[#6f665d]">
                No completed milestones.
              </div>
            ) : (
              <div className="divide-y divide-[#241d18]/10">
                {completedMilestones.map((milestone, index) => (
                  <div
                    key={`${milestone.name}-${index}`}
                    className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_120px]"
                  >
                    <div>
                      <p className="font-medium">{milestone.name}</p>
                      <p className="text-sm text-[#6f665d]">
                        {milestone.projectName}
                      </p>
                    </div>
                    <p className="font-mono text-sm font-semibold sm:text-right">
                      {money.format(milestone.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <MailingList title="Invoices" icon={FileText} items={invoices} />
          <MailingList title="Receipts" icon={Receipt} items={receipts} />
        </div>
      </div>
    </div>
  );
}
