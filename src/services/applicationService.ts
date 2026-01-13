import axios from "axios";
import {
  ApplicationStatus,
  ApplicationsResponse,
  ApplicationResponse,
} from "@/types/application";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

const API_URL = `${API_BASE_URL}/api/applications/admin`;

export async function getApplications(
  page: number = 1,
  limit: number = 20,
  status?: ApplicationStatus,
  careerId?: string
): Promise<ApplicationsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (status) params.append("status", status);
  if (careerId) params.append("career_id", careerId);

  const response = await axios.get<ApplicationsResponse>(`${API_URL}?${params}`);
  return response.data;
}

export async function getApplicationsByCareer(
  careerId: string,
  page: number = 1,
  limit: number = 20,
  status?: ApplicationStatus
): Promise<ApplicationsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (status) params.append("status", status);

  const response = await axios.get<ApplicationsResponse>(
    `${API_URL}/career/${careerId}?${params}`
  );
  return response.data;
}

export async function getApplicationById(id: string): Promise<ApplicationResponse> {
  const response = await axios.get<ApplicationResponse>(`${API_URL}/${id}`);
  return response.data;
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  notes?: string
): Promise<ApplicationResponse> {
  const response = await axios.patch<ApplicationResponse>(
    `${API_URL}/${id}/status`,
    { status, notes }
  );
  return response.data;
}

export async function updateApplicationNotes(
  id: string,
  notes: string
): Promise<ApplicationResponse> {
  const response = await axios.patch<ApplicationResponse>(`${API_URL}/${id}`, {
    notes,
  });
  return response.data;
}

export async function deleteApplication(id: string): Promise<{ message: string }> {
  const response = await axios.delete<{ message: string }>(`${API_URL}/${id}`);
  return response.data;
}
