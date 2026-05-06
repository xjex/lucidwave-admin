"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BriefcaseBusiness,
  Check,
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClientBillingType,
  ClientListItem,
  ClientMaxHoursPeriod,
  ClientMilestoneStatus,
  ClientProject,
  ClientProjectPaymentStatus,
  ClientProjectPayload,
  ClientProjectStatus,
  getClients,
  updateClientProject,
} from "@/services/clientService";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const statusOptions: Array<{
  value: ClientProjectStatus | "all";
  label: string;
}> = [
  { value: "all", label: "All statuses" },
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
];

const billingOptions: Array<{ value: ClientBillingType; label: string }> = [
  { value: "hourly", label: "Hourly" },
  { value: "project", label: "Project Based" },
  { value: "milestone", label: "Milestone Based" },
];

const milestoneStatusOptions: Array<{
  value: ClientMilestoneStatus;
  label: string;
}> = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "paid", label: "Paid" },
];

const maxHoursPeriodOptions: Array<{
  value: ClientMaxHoursPeriod;
  label: string;
}> = [
  { value: "none", label: "No max hours" },
  { value: "week", label: "Per week" },
  { value: "month", label: "Per month" },
];

const emptyProjectForm: ClientProjectPayload = {
  project_name: "",
  project_status: "planning",
  billing_type: "hourly",
  hourly_rate: 0,
  max_hours: 0,
  max_hours_period: "none",
  project_price: 0,
  project_payments: [],
  milestones: [],
  project_budget: 0,
  expenses_used: 0,
  projects: [],
};

const emptyClientProject = (): ClientProject => ({
  name: "",
  role: "",
  status: "planning",
  billing_type: "hourly",
  hourly_rate: 0,
  max_hours: 0,
  max_hours_period: "none",
  project_price: 0,
  assigned_employee_ids: [],
  project_payments: [],
  milestones: [],
  budget: 0,
  expenses_used: 0,
});

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

function EmployeeChips({ client }: { client: ClientListItem }) {
  if (client.employees_working.length === 0) {
    return <span className="text-sm text-[#6f665d]">No employees assigned</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {client.employees_working.slice(0, 3).map((employee) => (
        <span
          key={employee.id}
          className="border border-[#241d18]/15 bg-white px-2 py-1 text-xs text-[#574d43]"
        >
          {employee.name} · {money.format(employee.hourly_rate)}
        </span>
      ))}
      {client.employees_working.length > 3 && (
        <span className="border border-[#241d18]/15 bg-white px-2 py-1 text-xs text-[#574d43]">
          +{client.employees_working.length - 3}
        </span>
      )}
    </div>
  );
}

const maxHoursLabel = (
  maxHours: number,
  period: ClientMaxHoursPeriod
) => {
  if (period === "none" || !maxHours) return "No max hours";
  return `${maxHours} hrs / ${period}`;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [editingClient, setEditingClient] = useState<ClientListItem | null>(
    null
  );
  const [projectForm, setProjectForm] =
    useState<ClientProjectPayload>(emptyProjectForm);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);

  const totals = useMemo(
    () =>
      clients.reduce(
        (summary, client) => {
          const hourlyRoles = client.projects.filter(
            (project) => project.billing_type === "hourly"
          );
          return {
            clients: summary.clients + 1,
            projects: summary.projects + client.projects.length,
            hourlyCapacity:
              summary.hourlyCapacity +
              hourlyRoles.reduce(
                (sum, project) =>
                  project.max_hours_period === "none"
                    ? sum
                    : sum + Number(project.max_hours || 0),
                0
              ),
          };
        },
        { clients: 0, projects: 0, hourlyCapacity: 0 }
      ),
    [clients]
  );

  const fetchClients = useCallback(
    async (query = search, projectStatus = status) => {
      try {
        setLoading(true);
        setError(null);
        const response = await getClients(1, 25, query, projectStatus);
        setClients(response.data);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load clients"));
      } finally {
        setLoading(false);
      }
    },
    [search, status]
  );

  useEffect(() => {
    fetchClients("", "all");
  }, [fetchClients]);

  const openEditDialog = (client: ClientListItem) => {
    setEditingClient(client);
    setActiveProjectIndex(0);
    setProjectForm({
      project_name: client.project_name || "",
      project_status: client.project_status || "planning",
      billing_type: client.billing_type || "hourly",
      hourly_rate: client.hourly_rate || 0,
      max_hours: client.max_hours || 0,
      max_hours_period: client.max_hours_period || "none",
      project_price: client.project_price || 0,
      project_payments: client.project_payments || [],
      milestones: client.milestones || [],
      project_budget: client.project_budget || 0,
      expenses_used: client.expenses_used || 0,
      projects: client.projects || [],
    });
  };

  const addProject = () => {
    setProjectForm((current) => ({
      ...current,
      projects: [...current.projects, emptyClientProject()],
    }));
    setActiveProjectIndex(projectForm.projects.length);
  };

  const removeProject = (index: number) => {
    setProjectForm((current) => ({
      ...current,
      projects: current.projects.filter((_project, i) => i !== index),
    }));
    setActiveProjectIndex((current) => Math.max(0, current - 1));
  };

  const handleProjectSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingClient) return;

    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      const updatedClient = await updateClientProject(editingClient.id, {
        ...projectForm,
        hourly_rate: Number(projectForm.hourly_rate || 0),
        max_hours: Number(projectForm.max_hours || 0),
        max_hours_period:
          projectForm.max_hours_period === "none"
            ? "none"
            : projectForm.max_hours_period,
        project_price: Number(projectForm.project_price || 0),
        project_payments: projectForm.project_payments
          .map((payment) => ({
            ...payment,
            label: payment.label.trim(),
            amount: Number(payment.amount || 0),
          }))
          .filter((payment) => payment.label),
        milestones: projectForm.milestones
          .map((milestone) => ({
            ...milestone,
            name: milestone.name.trim(),
            amount: Number(milestone.amount || 0),
          }))
          .filter((milestone) => milestone.name),
        project_budget: Number(projectForm.project_budget || 0),
        expenses_used: Number(projectForm.expenses_used || 0),
        projects: projectForm.projects
          .map((project) => ({
            ...project,
            name: project.name.trim(),
            role: project.role.trim(),
            hourly_rate: Number(project.hourly_rate || 0),
            max_hours: Number(project.max_hours || 0),
            max_hours_period: project.max_hours_period,
            project_price: Number(project.project_price || 0),
            assigned_employee_ids: project.assigned_employee_ids || [],
            budget: 0,
            expenses_used: 0,
            project_payments: project.project_payments || [],
            milestones: project.milestones || [],
          }))
          .filter((project) => project.name),
      });
      setClients((current) =>
        current.map((client) =>
          client.id === updatedClient.id ? updatedClient : client
        )
      );
      setEditingClient(null);
      setMessage("Client project updated");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update client project"));
    } finally {
      setSaving(false);
    }
  };

  const billingSummary = (client: ClientListItem) => {
    if (client.projects.length > 1) {
      return `${client.projects.length} project roles`;
    }
    const primaryProject = client.projects[0];
    if (primaryProject) {
      if (primaryProject.billing_type === "project") {
        const splitTotal = primaryProject.project_payments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        );
        return `Project · ${money.format(
          splitTotal || primaryProject.project_price
        )}`;
      }
      if (primaryProject.billing_type === "milestone") {
        const total = primaryProject.milestones.reduce(
          (sum, milestone) => sum + milestone.amount,
          0
        );
        return `Milestones · ${money.format(total)}`;
      }
      return `Hourly · ${money.format(primaryProject.hourly_rate)} · ${
        maxHoursLabel(primaryProject.max_hours, primaryProject.max_hours_period)
      }`;
    }
    if (client.billing_type === "project") {
      const splitTotal = client.project_payments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );
      return `Project · ${money.format(splitTotal || client.project_price)}`;
    }
    if (client.billing_type === "milestone") {
      const total = client.milestones.reduce(
        (sum, milestone) => sum + milestone.amount,
        0
      );
      return `Milestones · ${money.format(total)}`;
    }
    return `Hourly · ${money.format(client.hourly_rate)} · ${
      maxHoursLabel(client.max_hours, client.max_hours_period)
    }`;
  };

  const statusPill = (projectStatus: ClientProjectStatus) => {
    const styles = {
      planning: "border-[#8b4a36]/30 bg-[#fff1e8] text-[#8b4a36]",
      active: "border-[#3d7a5c]/30 bg-[#edf7ef] text-[#2f6048]",
      paused: "border-[#b98b2f]/30 bg-[#fff8df] text-[#7a5b14]",
      completed: "border-[#241d18]/20 bg-white text-[#574d43]",
    };

    return (
      <span
        className={`border px-2.5 py-1 font-mono text-[11px] uppercase ${styles[projectStatus]}`}
      >
        {projectStatus}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f4efe4] text-[#241d18]">
      <div className="border-b border-[#241d18]/15 bg-[#fffaf1]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-2 flex w-fit items-center gap-2 border border-[#241d18]/15 bg-[#f4efe4] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            <span className="size-2 bg-[#d95c3f]" />
            Contacts
          </div>
          <h1 className="font-serif text-5xl leading-[1.05]">Client List</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f665d]">
            Track each contact as a client: project roles, billing setup,
            hourly caps, and the employees assigned to their work.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="border border-[#241d18]/15 bg-[#fffaf1] p-5 shadow-[6px_6px_0_#241d18]">
            <p className="font-mono text-[11px] uppercase text-[#6f665d]">
              Clients
            </p>
            <p className="mt-2 font-serif text-3xl">{totals.clients}</p>
          </div>
          <div className="border border-[#241d18]/15 bg-[#fffaf1] p-5 shadow-[6px_6px_0_#241d18]">
            <p className="font-mono text-[11px] uppercase text-[#6f665d]">
              Project Roles
            </p>
            <p className="mt-2 font-serif text-3xl">{totals.projects}</p>
          </div>
          <div className="border border-[#241d18]/15 bg-[#fffaf1] p-5 shadow-[6px_6px_0_#241d18]">
            <p className="font-mono text-[11px] uppercase text-[#6f665d]">
              Max Hourly Hours
            </p>
            <p className="mt-2 font-serif text-3xl">{totals.hourlyCapacity}</p>
          </div>
        </div>

        <div className="mb-8 grid gap-4 border border-[#241d18]/15 bg-[#fffaf1] p-5 shadow-[8px_8px_0_#241d18] md:grid-cols-[1fr_220px_auto] md:items-end">
          <div className="space-y-2">
            <Label className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">
              Search clients
            </Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8b4a36]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") fetchClients(search, status);
                }}
                placeholder="Client, company, email, or project"
                className="h-11 rounded-none border-[#241d18]/20 bg-white pl-10 shadow-none focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">
              Status
            </Label>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                fetchClients(search, value);
              }}
            >
              <SelectTrigger className="h-11 w-full rounded-none border-[#241d18]/20 bg-white shadow-none">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-[#241d18]/15 bg-[#fffaf1]">
                {statusOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => fetchClients(search, status)}
            className="h-11 rounded-none bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none hover:bg-[#8b4a36]"
          >
            <Search className="size-4" />
            Apply
          </Button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 border border-[#b73823] bg-[#fff1e8] px-4 py-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#7d2418]" />
            <p className="text-sm text-[#7d2418]">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-6 flex items-start gap-3 border border-[#3d7a5c]/30 bg-[#edf7ef] px-4 py-3">
            <Check className="mt-0.5 size-4 shrink-0 text-[#3d7a5c]" />
            <p className="text-sm text-[#2f6048]">{message}</p>
          </div>
        )}

        <div className="overflow-hidden border border-[#241d18]/15 bg-[#fffaf1] shadow-[10px_10px_0_#241d18]">
          <div className="hidden grid-cols-[minmax(220px,1.15fr)_minmax(260px,1.25fr)_minmax(220px,0.95fr)_minmax(220px,1.1fr)_64px] items-center border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-[#6f665d] xl:grid">
            <span>Client</span>
            <span>Project</span>
            <span>Payment</span>
            <span>Employees</span>
            <span className="text-right">Actions</span>
          </div>

          {loading ? (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto mb-4 size-8 animate-spin border-2 border-[#241d18]/15 border-t-[#8b4a36]" />
              <p className="font-mono text-xs uppercase text-[#6f665d]">
                Loading clients
              </p>
            </div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16">
              <BriefcaseBusiness className="mb-3 size-10 text-[#6f665d]/50" />
              <p className="font-mono text-xs uppercase text-[#6f665d]">
                No clients found
              </p>
            </div>
          ) : (
            clients.map((client) => (
              <div
                key={client.id}
                className="border-b border-[#241d18]/10 px-4 py-4 transition-colors hover:bg-[#f4efe4]/60 sm:px-5 xl:grid xl:grid-cols-[minmax(220px,1.15fr)_minmax(260px,1.25fr)_minmax(220px,0.95fr)_minmax(220px,1.1fr)_64px] xl:items-center xl:gap-4"
              >
                <div className="flex items-start justify-between gap-4 xl:block">
                  <div>
                    <Link
                      href={`/clients/${client.slug}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {client.name}
                    </Link>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-[#6f665d]">
                      <Mail className="size-3.5 shrink-0" />
                      <span className="break-all">{client.email}</span>
                    </p>
                    {client.company && (
                      <p className="mt-1 text-xs text-[#6f665d]">
                        {client.company}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => openEditDialog(client)}
                    className="h-9 rounded-none border-[#241d18]/20 bg-white shadow-none hover:bg-[#f4efe4] xl:hidden"
                    aria-label={`Edit ${client.name}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:mt-0 xl:block">
                  <div>
                    {client.projects.length ? (
                      <div className="space-y-2">
                        {client.projects.slice(0, 2).map((project, index) => (
                          <div key={`${project.name}-${index}`}>
                            <p className="font-medium">{project.name}</p>
                            <p className="text-xs text-[#6f665d]">
                              {project.role || project.billing_type}
                            </p>
                            {project.assigned_employee_ids.length > 0 && (
                              <p className="text-xs text-[#8b4a36]">
                                {project.assigned_employee_ids.length} assigned
                              </p>
                            )}
                          </div>
                        ))}
                        {client.projects.length > 2 && (
                          <p className="font-mono text-[11px] uppercase text-[#6f665d]">
                            +{client.projects.length - 2} more
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <p className="font-medium">
                          {client.project_name || "No project"}
                        </p>
                        <div className="mt-2">
                          {statusPill(client.project_status)}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="xl:hidden">
                    <p className="font-mono text-[11px] uppercase text-[#6f665d]">
                      Payment
                    </p>
                    <p className="mt-1 text-sm text-[#574d43]">
                      {billingSummary(client)}
                    </p>
                  </div>
                </div>

                <div className="hidden text-sm text-[#574d43] xl:block">
                  {billingSummary(client)}
                </div>

                <div className="mt-4 xl:mt-0">
                  <EmployeeChips client={client} />
                </div>

                <div className="hidden justify-end xl:flex">
                  <Button
                    variant="outline"
                    onClick={() => openEditDialog(client)}
                    className="h-9 rounded-none border-[#241d18]/20 bg-white shadow-none hover:bg-[#f4efe4]"
                    aria-label={`Edit ${client.name}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog
        open={!!editingClient}
        onOpenChange={(open) => {
          if (!open) setEditingClient(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-hidden rounded-none border-[#241d18]/15 bg-[#fffaf1] p-0 sm:max-w-5xl">
          <DialogHeader className="border-b border-[#241d18]/15 px-6 py-5">
            <DialogTitle className="font-serif text-3xl">
              Client Project
            </DialogTitle>
            <DialogDescription>
              Track project roles, billing rules, and hourly caps for{" "}
              {editingClient?.name}.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleProjectSubmit}
            className="max-h-[calc(90vh-118px)] overflow-y-auto px-6 py-5"
          >
            <div className="space-y-5 pb-5">
            <div className="space-y-2">
              <Label>Account Label</Label>
              <Input
                value={projectForm.project_name}
                onChange={(event) =>
                  setProjectForm((current) => ({
                    ...current,
                    project_name: event.target.value,
                  }))
                }
                placeholder="Website redesign, monthly retainer, launch campaign"
                className="rounded-none border-[#241d18]/20 bg-white"
              />
            </div>

            <div className="space-y-3 border border-[#241d18]/15 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label>Projects / Roles</Label>
                  <p className="mt-1 text-xs text-[#6f665d]">
                    Add each service the client hired you for.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addProject}
                  className="h-8 rounded-none border-[#241d18]/20 bg-white font-mono text-[10px] uppercase shadow-none hover:bg-[#f4efe4]"
                >
                  <Plus className="size-3.5" />
                  Add Project
                </Button>
              </div>

              {projectForm.projects.length === 0 ? (
                <div className="border border-dashed border-[#241d18]/20 bg-[#fffaf1] px-3 py-3 text-sm text-[#6f665d]">
                  No project roles yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {projectForm.projects.map((project, index) => (
                    <div
                      key={index}
                      className={`border border-[#241d18]/15 ${
                        index === activeProjectIndex
                          ? "space-y-3 bg-[#fffaf1] p-3"
                          : "bg-white p-2"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveProjectIndex(index)}
                        className={`flex w-full items-center justify-between gap-3 border px-3 py-2 text-left transition-colors ${
                          index === activeProjectIndex
                            ? "border-[#241d18]/15 bg-white"
                            : "border-transparent bg-[#fffaf1] hover:border-[#241d18]/15"
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium">
                            {project.name || `Project ${index + 1}`}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-[#6f665d]">
                            {project.role || "No role yet"} ·{" "}
                            {project.billing_type} · {project.status}
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-[10px] uppercase text-[#8b4a36]">
                          {index === activeProjectIndex ? "Editing" : "Open"}
                        </span>
                      </button>

                      {index === activeProjectIndex && (
                        <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label>Project / Service</Label>
                          <Input
                            value={project.name}
                            onChange={(event) =>
                              setProjectForm((current) => ({
                                ...current,
                                projects: current.projects.map((item, i) =>
                                  i === index
                                    ? { ...item, name: event.target.value }
                                    : item
                                ),
                              }))
                            }
                            placeholder="Software Dev"
                            className="rounded-none border-[#241d18]/20 bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Role</Label>
                          <Input
                            value={project.role}
                            onChange={(event) =>
                              setProjectForm((current) => ({
                                ...current,
                                projects: current.projects.map((item, i) =>
                                  i === index
                                    ? { ...item, role: event.target.value }
                                    : item
                                ),
                              }))
                            }
                            placeholder="Frontend, Social Media Manager"
                            className="rounded-none border-[#241d18]/20 bg-white"
                          />
                        </div>
                      </div>

                      <div
                        className={`grid gap-3 ${
                          project.billing_type === "milestone"
                            ? "sm:grid-cols-2"
                            : "sm:grid-cols-3"
                        }`}
                      >
                        <div className="space-y-1">
                          <Label>Billing</Label>
                          <Select
                            value={project.billing_type}
                            onValueChange={(value: ClientBillingType) =>
                              setProjectForm((current) => ({
                                ...current,
                                projects: current.projects.map((item, i) =>
                                  i === index
                                    ? { ...item, billing_type: value }
                                    : item
                                ),
                              }))
                            }
                          >
                            <SelectTrigger className="h-10 w-full rounded-none border-[#241d18]/20 bg-white shadow-none">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-none border-[#241d18]/15 bg-[#fffaf1]">
                              {billingOptions.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {project.billing_type !== "milestone" && (
                          <div className="space-y-1">
                            <Label>
                              {project.billing_type === "hourly"
                                ? "Hourly Rate"
                                : "Project Price"}
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                project.billing_type === "hourly"
                                  ? project.hourly_rate
                                  : project.project_price
                              }
                              onChange={(event) =>
                                setProjectForm((current) => ({
                                  ...current,
                                  projects: current.projects.map((item, i) =>
                                    i === index
                                      ? {
                                          ...item,
                                          [project.billing_type === "hourly"
                                            ? "hourly_rate"
                                            : "project_price"]: Number(
                                            event.target.value
                                          ),
                                        }
                                      : item
                                  ),
                                }))
                              }
                              className="rounded-none border-[#241d18]/20 bg-white"
                            />
                          </div>
                        )}
                        <div className="space-y-1">
                          <Label>Status</Label>
                          <Select
                            value={project.status}
                            onValueChange={(value: ClientProjectStatus) =>
                              setProjectForm((current) => ({
                                ...current,
                                projects: current.projects.map((item, i) =>
                                  i === index ? { ...item, status: value } : item
                                ),
                              }))
                            }
                          >
                            <SelectTrigger className="h-10 w-full rounded-none border-[#241d18]/20 bg-white shadow-none">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-none border-[#241d18]/15 bg-[#fffaf1]">
                              {statusOptions
                                .filter((item) => item.value !== "all")
                                .map((item) => (
                                  <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {project.billing_type === "hourly" && (
                          <div className="space-y-1">
                            <Label>Max Hours</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.25"
                              value={project.max_hours}
                              onChange={(event) =>
                                setProjectForm((current) => ({
                                  ...current,
                                  projects: current.projects.map((item, i) =>
                                    i === index
                                      ? {
                                          ...item,
                                          max_hours: Number(event.target.value),
                                        }
                                      : item
                                  ),
                                }))
                              }
                              className="rounded-none border-[#241d18]/20 bg-white"
                            />
                          </div>
                        )}
                        {project.billing_type === "hourly" && (
                          <div className="space-y-1">
                            <Label>Max Period</Label>
                            <Select
                              value={project.max_hours_period}
                              onValueChange={(value: ClientMaxHoursPeriod) =>
                                setProjectForm((current) => ({
                                  ...current,
                                  projects: current.projects.map((item, i) =>
                                    i === index
                                      ? {
                                          ...item,
                                          max_hours_period: value,
                                          max_hours:
                                            value === "none"
                                              ? 0
                                              : item.max_hours,
                                        }
                                      : item
                                  ),
                                }))
                              }
                            >
                              <SelectTrigger className="h-10 w-full rounded-none border-[#241d18]/20 bg-white shadow-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-none border-[#241d18]/15 bg-[#fffaf1]">
                                {maxHoursPeriodOptions.map((item) => (
                                  <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeProject(index)}
                          className="rounded-none border-[#b73823]/30 bg-white text-[#7d2418] shadow-none hover:bg-[#fff1e8]"
                        >
                          <Trash2 className="size-4" />
                          Remove
                        </Button>
                      </div>

                      <div className="space-y-2 border border-[#241d18]/15 bg-white p-3">
                        <div className="flex items-center gap-2">
                          <Users className="size-4 text-[#8b4a36]" />
                          <Label>Project Employees</Label>
                        </div>
                        {editingClient?.employees_working.length ? (
                          <div className="flex flex-wrap gap-2">
                            {editingClient.employees_working.map((employee) => {
                              const checked =
                                project.assigned_employee_ids.includes(
                                  employee.id
                                );
                              return (
                                <button
                                  key={employee.id}
                                  type="button"
                                  onClick={() =>
                                    setProjectForm((current) => ({
                                      ...current,
                                      projects: current.projects.map(
                                        (item, i) =>
                                          i === index
                                            ? {
                                                ...item,
                                                assigned_employee_ids: checked
                                                  ? item.assigned_employee_ids.filter(
                                                      (id) => id !== employee.id
                                                    )
                                                  : [
                                                      ...item.assigned_employee_ids,
                                                      employee.id,
                                                    ],
                                              }
                                            : item
                                      ),
                                    }))
                                  }
                                  className={`border px-2.5 py-1.5 text-xs transition-colors ${
                                    checked
                                      ? "border-[#3d7a5c]/40 bg-[#edf7ef] text-[#2f6048]"
                                      : "border-[#241d18]/15 bg-[#fffaf1] text-[#574d43] hover:border-[#8b4a36]/40"
                                  }`}
                                >
                                  {employee.name}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-[#6f665d]">
                            Assign employees to this client first from the
                            Employees page.
                          </p>
                        )}
                      </div>

                      {project.billing_type === "project" && (
                        <div className="space-y-3 border border-[#241d18]/15 bg-white p-3">
                          <div className="flex items-center justify-between gap-3">
                            <Label>Payment Split</Label>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                setProjectForm((current) => ({
                                  ...current,
                                  projects: current.projects.map((item, i) =>
                                    i === index
                                      ? {
                                          ...item,
                                          project_payments: [
                                            ...item.project_payments,
                                            {
                                              label: "",
                                              amount: 0,
                                              status: "pending",
                                            },
                                          ],
                                        }
                                      : item
                                  ),
                                }))
                              }
                              className="h-8 rounded-none border-[#241d18]/20 bg-white font-mono text-[10px] uppercase shadow-none hover:bg-[#f4efe4]"
                            >
                              Add Payment
                            </Button>
                          </div>
                          {project.project_payments.length === 0 ? (
                            <div className="border border-dashed border-[#241d18]/20 bg-[#fffaf1] px-3 py-3 text-sm text-[#6f665d]">
                              No split payments yet.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {project.project_payments.map(
                                (payment, paymentIndex) => (
                                  <div
                                    key={paymentIndex}
                                    className="grid gap-2 sm:grid-cols-[1fr_120px_120px_70px]"
                                  >
                                    <Input
                                      value={payment.label}
                                      onChange={(event) =>
                                        setProjectForm((current) => ({
                                          ...current,
                                          projects: current.projects.map(
                                            (item, i) =>
                                              i === index
                                                ? {
                                                    ...item,
                                                    project_payments:
                                                      item.project_payments.map(
                                                        (entry, entryIndex) =>
                                                          entryIndex ===
                                                          paymentIndex
                                                            ? {
                                                                ...entry,
                                                                label:
                                                                  event.target
                                                                    .value,
                                                              }
                                                            : entry
                                                      ),
                                                  }
                                                : item
                                          ),
                                        }))
                                      }
                                      placeholder="Deposit, build, launch"
                                      className="rounded-none border-[#241d18]/20 bg-white"
                                    />
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={payment.amount}
                                      onChange={(event) =>
                                        setProjectForm((current) => ({
                                          ...current,
                                          projects: current.projects.map(
                                            (item, i) =>
                                              i === index
                                                ? {
                                                    ...item,
                                                    project_payments:
                                                      item.project_payments.map(
                                                        (entry, entryIndex) =>
                                                          entryIndex ===
                                                          paymentIndex
                                                            ? {
                                                                ...entry,
                                                                amount: Number(
                                                                  event.target
                                                                    .value
                                                                ),
                                                              }
                                                            : entry
                                                      ),
                                                  }
                                                : item
                                          ),
                                        }))
                                      }
                                      className="rounded-none border-[#241d18]/20 bg-white"
                                    />
                                    <Select
                                      value={payment.status}
                                      onValueChange={(
                                        value: ClientProjectPaymentStatus
                                      ) =>
                                        setProjectForm((current) => ({
                                          ...current,
                                          projects: current.projects.map(
                                            (item, i) =>
                                              i === index
                                                ? {
                                                    ...item,
                                                    project_payments:
                                                      item.project_payments.map(
                                                        (entry, entryIndex) =>
                                                          entryIndex ===
                                                          paymentIndex
                                                            ? {
                                                                ...entry,
                                                                status: value,
                                                              }
                                                            : entry
                                                      ),
                                                  }
                                                : item
                                          ),
                                        }))
                                      }
                                    >
                                      <SelectTrigger className="h-9 w-full rounded-none border-[#241d18]/20 bg-white shadow-none">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="rounded-none border-[#241d18]/15 bg-[#fffaf1]">
                                        <SelectItem value="pending">
                                          Pending
                                        </SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() =>
                                        setProjectForm((current) => ({
                                          ...current,
                                          projects: current.projects.map(
                                            (item, i) =>
                                              i === index
                                                ? {
                                                    ...item,
                                                    project_payments:
                                                      item.project_payments.filter(
                                                        (_entry, entryIndex) =>
                                                          entryIndex !==
                                                          paymentIndex
                                                      ),
                                                  }
                                                : item
                                          ),
                                        }))
                                      }
                                      className="h-9 rounded-none border-[#b73823]/30 bg-white text-[#7d2418] shadow-none hover:bg-[#fff1e8]"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                          <div className="border border-[#241d18]/15 bg-[#fffaf1] px-3 py-2 font-mono text-xs uppercase text-[#6f665d]">
                            Split total:{" "}
                            {money.format(
                              project.project_payments.reduce(
                                (sum, payment) =>
                                  sum + Number(payment.amount || 0),
                                0
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {project.billing_type === "milestone" && (
                        <div className="space-y-3 border border-[#241d18]/15 bg-white p-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <Label>Milestone Phases</Label>
                              <p className="mt-1 text-xs text-[#6f665d]">
                                Split this role into billable delivery phases.
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                setProjectForm((current) => ({
                                  ...current,
                                  projects: current.projects.map((item, i) =>
                                    i === index
                                      ? {
                                          ...item,
                                          milestones: [
                                            ...item.milestones,
                                            {
                                              name: "",
                                              amount: 0,
                                              status: "pending",
                                            },
                                          ],
                                        }
                                      : item
                                  ),
                                }))
                              }
                              className="h-8 rounded-none border-[#241d18]/20 bg-white font-mono text-[10px] uppercase shadow-none hover:bg-[#f4efe4]"
                            >
                              Add Phase
                            </Button>
                          </div>
                          {project.milestones.length === 0 ? (
                            <div className="border border-dashed border-[#241d18]/20 bg-[#fffaf1] px-3 py-3 text-sm text-[#6f665d]">
                              No phases yet.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {project.milestones.map(
                                (milestone, milestoneIndex) => (
                                  <div
                                    key={milestoneIndex}
                                    className="grid gap-2 border border-[#241d18]/10 bg-[#fffaf1] p-2 sm:grid-cols-[32px_minmax(0,1fr)_130px_150px_auto] sm:items-end"
                                  >
                                    <div className="flex size-8 items-center justify-center border border-[#241d18]/15 bg-white font-mono text-[11px] text-[#6f665d]">
                                      {milestoneIndex + 1}
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="font-mono text-[10px] uppercase text-[#6f665d]">
                                        Phase
                                      </Label>
                                    <Input
                                      value={milestone.name}
                                      onChange={(event) =>
                                        setProjectForm((current) => ({
                                          ...current,
                                          projects: current.projects.map(
                                            (item, i) =>
                                              i === index
                                                ? {
                                                    ...item,
                                                    milestones:
                                                      item.milestones.map(
                                                        (entry, entryIndex) =>
                                                          entryIndex ===
                                                          milestoneIndex
                                                            ? {
                                                                ...entry,
                                                                name:
                                                                  event.target
                                                                    .value,
                                                              }
                                                            : entry
                                                      ),
                                                  }
                                                : item
                                          ),
                                        }))
                                      }
                                      placeholder="Design, development, launch"
                                      className="rounded-none border-[#241d18]/20 bg-white"
                                    />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="font-mono text-[10px] uppercase text-[#6f665d]">
                                        Amount
                                      </Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={milestone.amount}
                                      onChange={(event) =>
                                        setProjectForm((current) => ({
                                          ...current,
                                          projects: current.projects.map(
                                            (item, i) =>
                                              i === index
                                                ? {
                                                    ...item,
                                                    milestones:
                                                      item.milestones.map(
                                                        (entry, entryIndex) =>
                                                          entryIndex ===
                                                          milestoneIndex
                                                            ? {
                                                                ...entry,
                                                                amount: Number(
                                                                  event.target
                                                                    .value
                                                                ),
                                                              }
                                                            : entry
                                                      ),
                                                  }
                                                : item
                                          ),
                                        }))
                                      }
                                      className="rounded-none border-[#241d18]/20 bg-white"
                                    />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="font-mono text-[10px] uppercase text-[#6f665d]">
                                        Status
                                      </Label>
                                    <Select
                                      value={milestone.status}
                                      onValueChange={(
                                        value: ClientMilestoneStatus
                                      ) =>
                                        setProjectForm((current) => ({
                                          ...current,
                                          projects: current.projects.map(
                                            (item, i) =>
                                              i === index
                                                ? {
                                                    ...item,
                                                    milestones:
                                                      item.milestones.map(
                                                        (entry, entryIndex) =>
                                                          entryIndex ===
                                                          milestoneIndex
                                                            ? {
                                                                ...entry,
                                                                status: value,
                                                              }
                                                            : entry
                                                      ),
                                                  }
                                                : item
                                          ),
                                        }))
                                      }
                                    >
                                      <SelectTrigger className="h-9 w-full rounded-none border-[#241d18]/20 bg-white shadow-none">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="rounded-none border-[#241d18]/15 bg-[#fffaf1]">
                                        {milestoneStatusOptions.map((item) => (
                                          <SelectItem
                                            key={item.value}
                                            value={item.value}
                                          >
                                            {item.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() =>
                                        setProjectForm((current) => ({
                                          ...current,
                                          projects: current.projects.map(
                                            (item, i) =>
                                              i === index
                                                ? {
                                                    ...item,
                                                    milestones:
                                                      item.milestones.filter(
                                                        (_entry, entryIndex) =>
                                                          entryIndex !==
                                                          milestoneIndex
                                                      ),
                                                  }
                                                : item
                                          ),
                                        }))
                                      }
                                      className="h-9 rounded-none border-[#b73823]/30 bg-white text-[#7d2418] shadow-none hover:bg-[#fff1e8]"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {projectForm.projects.length === 0 && (
              <div className="space-y-5 border border-[#241d18]/15 bg-white p-4">
                <div>
                  <Label>Single Project Tracking</Label>
                  <p className="mt-1 text-xs text-[#6f665d]">
                    Use this only when the client has one billing track.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={projectForm.project_status}
                      onValueChange={(value: ClientProjectStatus) =>
                        setProjectForm((current) => ({
                          ...current,
                          project_status: value,
                        }))
                      }
                    >
                      <SelectTrigger className="h-10 w-full rounded-none border-[#241d18]/20 bg-white shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-[#241d18]/15 bg-[#fffaf1]">
                        {statusOptions
                          .filter((item) => item.value !== "all")
                          .map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Type</Label>
                    <Select
                      value={projectForm.billing_type}
                      onValueChange={(value: ClientBillingType) =>
                        setProjectForm((current) => ({
                          ...current,
                          billing_type: value,
                        }))
                      }
                    >
                      <SelectTrigger className="h-10 w-full rounded-none border-[#241d18]/20 bg-white shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-[#241d18]/15 bg-[#fffaf1]">
                        {billingOptions.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {projectForm.billing_type === "hourly" && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Client Hourly Rate</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={projectForm.hourly_rate}
                        onChange={(event) =>
                          setProjectForm((current) => ({
                            ...current,
                            hourly_rate: Number(event.target.value),
                          }))
                        }
                        className="rounded-none border-[#241d18]/20 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Hours</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.25"
                        value={projectForm.max_hours}
                        onChange={(event) =>
                          setProjectForm((current) => ({
                            ...current,
                            max_hours: Number(event.target.value),
                          }))
                        }
                        className="rounded-none border-[#241d18]/20 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Period</Label>
                      <Select
                        value={projectForm.max_hours_period}
                        onValueChange={(value: ClientMaxHoursPeriod) =>
                          setProjectForm((current) => ({
                            ...current,
                            max_hours_period: value,
                            max_hours:
                              value === "none" ? 0 : current.max_hours,
                          }))
                        }
                      >
                        <SelectTrigger className="h-10 w-full rounded-none border-[#241d18]/20 bg-white shadow-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-none border-[#241d18]/15 bg-[#fffaf1]">
                          {maxHoursPeriodOptions.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {projectForm.billing_type === "project" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Project Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={projectForm.project_price}
                        onChange={(event) =>
                          setProjectForm((current) => ({
                            ...current,
                            project_price: Number(event.target.value),
                          }))
                        }
                        className="rounded-none border-[#241d18]/20 bg-white"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <Label>Payment Split</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setProjectForm((current) => ({
                            ...current,
                            project_payments: [
                              ...current.project_payments,
                              { label: "", amount: 0, status: "pending" },
                            ],
                          }))
                        }
                        className="h-8 rounded-none border-[#241d18]/20 bg-white font-mono text-[10px] uppercase shadow-none hover:bg-[#f4efe4]"
                      >
                        Add Payment
                      </Button>
                    </div>
                    {projectForm.project_payments.length === 0 ? (
                      <div className="border border-dashed border-[#241d18]/20 bg-white px-3 py-3 text-sm text-[#6f665d]">
                        No split payments yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {projectForm.project_payments.map((payment, index) => (
                          <div
                            key={index}
                            className="grid gap-2 sm:grid-cols-[1fr_120px_120px_70px]"
                          >
                            <Input
                              value={payment.label}
                              onChange={(event) =>
                                setProjectForm((current) => ({
                                  ...current,
                                  project_payments:
                                    current.project_payments.map((item, i) =>
                                      i === index
                                        ? { ...item, label: event.target.value }
                                        : item
                                    ),
                                }))
                              }
                              placeholder="Deposit, second payment, final balance"
                              className="rounded-none border-[#241d18]/20 bg-white"
                            />
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={payment.amount}
                              onChange={(event) =>
                                setProjectForm((current) => ({
                                  ...current,
                                  project_payments:
                                    current.project_payments.map((item, i) =>
                                      i === index
                                        ? {
                                            ...item,
                                            amount: Number(event.target.value),
                                          }
                                        : item
                                    ),
                                }))
                              }
                              className="rounded-none border-[#241d18]/20 bg-white"
                            />
                            <Select
                              value={payment.status}
                              onValueChange={(
                                value: ClientProjectPaymentStatus
                              ) =>
                                setProjectForm((current) => ({
                                  ...current,
                                  project_payments:
                                    current.project_payments.map((item, i) =>
                                      i === index
                                        ? { ...item, status: value }
                                        : item
                                    ),
                                }))
                              }
                            >
                              <SelectTrigger className="h-9 w-full rounded-none border-[#241d18]/20 bg-white shadow-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-none border-[#241d18]/15 bg-[#fffaf1]">
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                setProjectForm((current) => ({
                                  ...current,
                                  project_payments:
                                    current.project_payments.filter(
                                      (_item, i) => i !== index
                                    ),
                                }))
                              }
                              className="h-9 rounded-none border-[#b73823]/30 bg-white text-[#7d2418] shadow-none hover:bg-[#fff1e8]"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="border border-[#241d18]/15 bg-white px-3 py-2 font-mono text-xs uppercase text-[#6f665d]">
                      Split total:{" "}
                      {money.format(
                        projectForm.project_payments.reduce(
                          (sum, payment) => sum + Number(payment.amount || 0),
                          0
                        )
                      )}
                    </div>
                  </div>
                )}

                {projectForm.billing_type === "milestone" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label>Milestone Phases</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setProjectForm((current) => ({
                            ...current,
                            milestones: [
                              ...current.milestones,
                              { name: "", amount: 0, status: "pending" },
                            ],
                          }))
                        }
                        className="h-8 rounded-none border-[#241d18]/20 bg-white font-mono text-[10px] uppercase shadow-none hover:bg-[#f4efe4]"
                      >
                        Add Phase
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {projectForm.milestones.length === 0 ? (
                        <div className="border border-dashed border-[#241d18]/20 bg-white px-3 py-3 text-sm text-[#6f665d]">
                          No phases yet.
                        </div>
                      ) : (
                        projectForm.milestones.map((milestone, index) => (
                          <div
                            key={index}
                            className="grid gap-2 sm:grid-cols-[1fr_120px_150px_70px]"
                          >
                            <Input
                              value={milestone.name}
                              onChange={(event) =>
                                setProjectForm((current) => ({
                                  ...current,
                                  milestones: current.milestones.map(
                                    (item, i) =>
                                      i === index
                                        ? { ...item, name: event.target.value }
                                        : item
                                  ),
                                }))
                              }
                              placeholder="Design, development, launch"
                              className="rounded-none border-[#241d18]/20 bg-white"
                            />
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={milestone.amount}
                              onChange={(event) =>
                                setProjectForm((current) => ({
                                  ...current,
                                  milestones: current.milestones.map(
                                    (item, i) =>
                                      i === index
                                        ? {
                                            ...item,
                                            amount: Number(event.target.value),
                                          }
                                        : item
                                  ),
                                }))
                              }
                              className="rounded-none border-[#241d18]/20 bg-white"
                            />
                            <Select
                              value={milestone.status}
                              onValueChange={(value: ClientMilestoneStatus) =>
                                setProjectForm((current) => ({
                                  ...current,
                                  milestones: current.milestones.map(
                                    (item, i) =>
                                      i === index
                                        ? { ...item, status: value }
                                        : item
                                  ),
                                }))
                              }
                            >
                              <SelectTrigger className="h-9 w-full rounded-none border-[#241d18]/20 bg-white shadow-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-none border-[#241d18]/15 bg-[#fffaf1]">
                                {milestoneStatusOptions.map((item) => (
                                  <SelectItem
                                    key={item.value}
                                    value={item.value}
                                  >
                                    {item.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                setProjectForm((current) => ({
                                  ...current,
                                  milestones: current.milestones.filter(
                                    (_item, i) => i !== index
                                  ),
                                }))
                              }
                              className="h-9 rounded-none border-[#b73823]/30 bg-white text-[#7d2418] shadow-none hover:bg-[#fff1e8]"
                            >
                              Remove
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}
            <div className="border border-[#241d18]/15 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <Users className="size-4 text-[#8b4a36]" />
                <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                  Employees working on this client
                </p>
              </div>
              {editingClient?.employees_working.length ? (
                <div className="flex flex-wrap gap-2">
                  {editingClient.employees_working.map((employee) => (
                    <span
                      key={employee.id}
                      className="border border-[#241d18]/15 bg-[#f4efe4] px-2.5 py-1.5 text-xs text-[#574d43]"
                    >
                      {employee.name} · {money.format(employee.hourly_rate)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#6f665d]">
                  No employees assigned from the Employees page yet.
                </p>
              )}
            </div>
            </div>
            <Button
              disabled={saving}
              className="sticky bottom-0 h-11 w-full rounded-none bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none hover:bg-[#8b4a36]"
            >
              <WalletCards className="size-4" />
              {saving ? "Saving" : "Save Client Project"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
