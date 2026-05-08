import axios, { AxiosResponse } from "axios";
import { ContactListItem } from "./contactsService";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
const API_URL = `${API_BASE_URL}/api/employees`;

export interface Employee {
  id: string;
  name: string;
  email: string;
  position?: string;
  hourly_rate: number;
  status: "active" | "inactive";
  assigned_contacts: EmployeeClientAssignment[];
  created_at: string;
  updated_at: string;
}

export interface EmployeeClientAssignment {
  contact: ContactListItem;
  hourly_rate: number;
}

export interface EmployeeClientAssignmentPayload {
  contact_id: string;
  hourly_rate: number;
}

export interface EmployeePayload {
  name: string;
  email: string;
  position?: string;
  hourly_rate: number;
  status: "active" | "inactive";
  assigned_contacts: EmployeeClientAssignmentPayload[];
}

export interface EmployeesResponse {
  data: Employee[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface PayrollPayload {
  payment_type?: "client" | "royalty";
  contact_id?: string;
  hours: number;
  rate: number;
  additions?: PayrollAddition[];
  period_start?: string;
  period_end?: string;
  description?: string;
  notes?: string;
}

export interface PayrollAddition {
  label: string;
  amount: number;
}

export interface PayrollRecord {
  id: string;
  employee: {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    position?: string;
  };
  contact?: {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    company?: string;
  };
  payment_type?: "client" | "royalty";
  hours: number;
  rate: number;
  additions?: PayrollAddition[];
  gross_pay: number;
  period_start?: string;
  period_end?: string;
  description?: string;
  notes?: string;
  email_status: "sent" | "failed";
  email_error?: string;
  sent_by: {
    id?: string;
    _id?: string;
    username: string;
    email: string;
  };
  sent_at: string;
  created_at: string;
  updated_at: string;
}

export interface PayrollHistoryResponse {
  data: PayrollRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

type RawEmployee = Omit<Employee, "assigned_contacts"> & {
  assigned_contacts?: Array<
    | ContactListItem
    | {
        contact?: ContactListItem;
        hourly_rate?: number;
      }
  >;
};

const authHeaders = () => ({
  ...(axios.defaults.headers.common["Authorization"] && {
    Authorization: axios.defaults.headers.common["Authorization"],
  }),
});

const normalizeEmployee = (employee: RawEmployee): Employee => ({
  ...employee,
  assigned_contacts: (employee.assigned_contacts || [])
    .map((assignment) => {
      if ("contact" in assignment && assignment.contact) {
        return {
          contact: assignment.contact,
          hourly_rate: Number(assignment.hourly_rate ?? employee.hourly_rate ?? 0),
        };
      }

      if ("id" in assignment && assignment.id) {
        return {
          contact: assignment,
          hourly_rate: Number(employee.hourly_rate ?? 0),
        };
      }

      return null;
    })
    .filter(
      (assignment): assignment is EmployeeClientAssignment =>
        assignment !== null
    ),
});

export async function getEmployees(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<EmployeesResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search?.trim()) {
    params.set("search", search.trim());
  }

  const response: AxiosResponse<Omit<EmployeesResponse, "data"> & {
    data: RawEmployee[];
  }> = await axios.get(
    `${API_URL}?${params.toString()}`,
    { headers: authHeaders() }
  );

  return {
    ...response.data,
    data: response.data.data.map(normalizeEmployee),
  };
}

export async function getEmployee(id: string): Promise<Employee> {
  const response: AxiosResponse<{ data: RawEmployee }> = await axios.get(
    `${API_URL}/${id}`,
    { headers: authHeaders() }
  );

  return normalizeEmployee(response.data.data);
}

export async function createEmployee(
  payload: EmployeePayload
): Promise<Employee> {
  const response: AxiosResponse<{ data: RawEmployee }> = await axios.post(
    API_URL,
    payload,
    { headers: authHeaders() }
  );

  return normalizeEmployee(response.data.data);
}

export async function updateEmployee(
  id: string,
  payload: EmployeePayload
): Promise<Employee> {
  const response: AxiosResponse<{ data: RawEmployee }> = await axios.put(
    `${API_URL}/${id}`,
    payload,
    { headers: authHeaders() }
  );

  return normalizeEmployee(response.data.data);
}

export async function deleteEmployee(id: string): Promise<void> {
  await axios.delete(`${API_URL}/${id}`, { headers: authHeaders() });
}

export async function sendPayroll(
  employeeId: string,
  payload: PayrollPayload
): Promise<PayrollRecord> {
  const response: AxiosResponse<{ data: PayrollRecord }> = await axios.post(
    `${API_URL}/${employeeId}/payroll`,
    payload,
    { headers: authHeaders() }
  );

  return response.data.data;
}

export async function previewPayroll(
  employeeId: string,
  payload: PayrollPayload
): Promise<Blob> {
  const response: AxiosResponse<Blob> = await axios.post(
    `${API_URL}/${employeeId}/payroll/preview`,
    payload,
    { headers: authHeaders(), responseType: "blob" }
  );

  return response.data;
}

export async function getPayrollHistory(
  page: number = 1,
  limit: number = 10,
  employeeId?: string
): Promise<PayrollHistoryResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (employeeId) {
    params.set("employee_id", employeeId);
  }

  const response: AxiosResponse<PayrollHistoryResponse> = await axios.get(
    `${API_URL}/payroll/history?${params.toString()}`,
    { headers: authHeaders() }
  );

  return response.data;
}
