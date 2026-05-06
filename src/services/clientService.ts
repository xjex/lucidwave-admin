import axios, { AxiosResponse } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
const API_URL = `${API_BASE_URL}/api/clients`;

export type ClientProjectStatus =
  | "planning"
  | "active"
  | "paused"
  | "completed";

export type ClientBillingType = "hourly" | "project" | "milestone";

export type ClientMilestoneStatus = "pending" | "in_progress" | "paid";

export type ClientProjectPaymentStatus = "pending" | "paid";

export type ClientMaxHoursPeriod = "none" | "week" | "month";

export interface ClientMilestone {
  name: string;
  amount: number;
  status: ClientMilestoneStatus;
}

export interface ClientProjectPayment {
  label: string;
  amount: number;
  status: ClientProjectPaymentStatus;
}

export interface ClientProject {
  name: string;
  role: string;
  status: ClientProjectStatus;
  billing_type: ClientBillingType;
  hourly_rate: number;
  max_hours: number;
  max_hours_period: ClientMaxHoursPeriod;
  project_price: number;
  assigned_employee_ids: string[];
  project_payments: ClientProjectPayment[];
  milestones: ClientMilestone[];
  budget: number;
  expenses_used: number;
}

export interface ClientEmployee {
  id: string;
  name: string;
  email: string;
  position?: string;
  hourly_rate: number;
}

export interface ClientListItem {
  id: string;
  slug: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  project_name?: string;
  project_status: ClientProjectStatus;
  billing_type: ClientBillingType;
  hourly_rate: number;
  max_hours: number;
  max_hours_period: ClientMaxHoursPeriod;
  project_price: number;
  project_payments: ClientProjectPayment[];
  milestones: ClientMilestone[];
  project_budget: number;
  expenses_used: number;
  projects: ClientProject[];
  remaining_expenses: number;
  employees_working: ClientEmployee[];
  created_at: string;
  updated_at: string;
}

export interface ClientProjectPayload {
  project_name: string;
  project_status: ClientProjectStatus;
  billing_type: ClientBillingType;
  hourly_rate: number;
  max_hours: number;
  max_hours_period: ClientMaxHoursPeriod;
  project_price: number;
  project_payments: ClientProjectPayment[];
  milestones: ClientMilestone[];
  project_budget: number;
  expenses_used: number;
  projects: ClientProject[];
}

export interface ClientsResponse {
  data: ClientListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ClientMailing {
  id: string;
  sent_to: string;
  type: "invoice" | "receipt";
  timestamp: string;
  files: string[];
  metadata?: {
    subject?: string;
    amount?: string;
    currency?: string;
    [key: string]: unknown;
  };
  sender?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface ClientDetailResponse {
  data: ClientListItem;
  mailings: ClientMailing[];
}

const authHeaders = () => ({
  ...(axios.defaults.headers.common["Authorization"] && {
    Authorization: axios.defaults.headers.common["Authorization"],
  }),
});

const hasLegacyProjectData = (client: ClientListItem) =>
  Boolean(
    client.project_name ||
      client.project_budget ||
      client.expenses_used ||
      client.hourly_rate ||
      client.max_hours ||
      client.project_price ||
      client.project_payments?.length ||
      client.milestones?.length
  );

const normalizeMaxHoursPeriod = (value?: string): ClientMaxHoursPeriod =>
  value === "week" || value === "month" ? value : "none";

const normalizeProjects = (client: ClientListItem): ClientProject[] => {
  if (client.projects?.length) {
    return client.projects.map((project) => {
      const rawProject = project as ClientProject & {
        assigned_employees?: string[];
      };
      return {
        ...project,
        name: project.name || project.role || "Untitled Project",
        role: project.role || "General",
        status: project.status || "planning",
        billing_type: project.billing_type || "hourly",
        hourly_rate: Number(project.hourly_rate || 0),
        max_hours: Number(project.max_hours || 0),
        max_hours_period: normalizeMaxHoursPeriod(project.max_hours_period),
        project_price: Number(project.project_price || 0),
        assigned_employee_ids: (
          rawProject.assigned_employee_ids ||
          rawProject.assigned_employees ||
          []
        ).map(String),
        project_payments: project.project_payments || [],
        milestones: project.milestones || [],
        budget: Number(project.budget || 0),
        expenses_used: Number(project.expenses_used || 0),
      };
    });
  }

  if (!hasLegacyProjectData(client)) return [];

  return [
    {
      name: client.project_name || "Primary Project",
      role: client.project_name || "General",
      status: client.project_status || "planning",
      billing_type: client.billing_type || "hourly",
      hourly_rate: Number(client.hourly_rate || 0),
      max_hours: Number(client.max_hours || 0),
      max_hours_period: normalizeMaxHoursPeriod(client.max_hours_period),
      project_price: Number(client.project_price || 0),
      assigned_employee_ids: [],
      project_payments: client.project_payments || [],
      milestones: client.milestones || [],
      budget: Number(client.project_budget || 0),
      expenses_used: Number(client.expenses_used || 0),
    },
  ];
};

const normalizeClient = (client: ClientListItem): ClientListItem => ({
  ...client,
  slug: client.slug,
  project_status: client.project_status || "planning",
  billing_type: client.billing_type || "hourly",
  hourly_rate: Number(client.hourly_rate || 0),
  max_hours: Number(client.max_hours || 0),
  max_hours_period: normalizeMaxHoursPeriod(client.max_hours_period),
  project_price: Number(client.project_price || 0),
  project_payments: client.project_payments || [],
  milestones: client.milestones || [],
  projects: normalizeProjects(client),
  project_budget: Number(client.project_budget || 0),
  expenses_used: Number(client.expenses_used || 0),
  remaining_expenses: Number(
    client.remaining_expenses ??
      Math.max(
        0,
        Number(client.project_budget || 0) - Number(client.expenses_used || 0)
      )
  ),
  employees_working: client.employees_working || [],
});

export async function getClients(
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string
): Promise<ClientsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search?.trim()) {
    params.set("search", search.trim());
  }
  if (status && status !== "all") {
    params.set("status", status);
  }

  const response: AxiosResponse<ClientsResponse> = await axios.get(
    `${API_URL}?${params.toString()}`,
    { headers: authHeaders() }
  );

  return {
    ...response.data,
    data: response.data.data.map(normalizeClient),
  };
}

export async function updateClientProject(
  id: string,
  payload: ClientProjectPayload
): Promise<ClientListItem> {
  const response: AxiosResponse<{ data: ClientListItem }> = await axios.put(
    `${API_URL}/${id}/project`,
    payload,
    { headers: authHeaders() }
  );

  return normalizeClient(response.data.data);
}

export async function getClientBySlug(
  slug: string
): Promise<ClientDetailResponse> {
  const response: AxiosResponse<ClientDetailResponse> = await axios.get(
    `${API_URL}/${slug}`,
    { headers: authHeaders() }
  );

  return {
    ...response.data,
    data: normalizeClient(response.data.data),
  };
}
