import axios from "axios";
import {
  Career,
  CareerInput,
  CareersResponse,
  CareerResponse,
} from "@/types/career";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

const API_URL = `${API_BASE_URL}/api/careers/`;

export async function getCareers(
  page: number = 1,
  limit: number = 10,
  department?: string,
  type?: string
): Promise<CareersResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (department) params.append("department", department);
  if (type) params.append("type", type);

  const response = await axios.get<CareersResponse>(`${API_URL}/admin?${params}`);
  return response.data;
}

export async function getCareerById(id: string): Promise<CareerResponse> {
  const response = await axios.get<CareerResponse>(`${API_URL}/${id}`);
  return response.data;
}

export async function createCareer(
  careerData: CareerInput
): Promise<CareerResponse> {
  const response = await axios.post<CareerResponse>(API_URL, careerData);
  return response.data;
}

export async function updateCareer(
  id: string,
  updates: Partial<CareerInput> & { is_active?: boolean }
): Promise<CareerResponse> {
  const response = await axios.patch<CareerResponse>(`${API_URL}/${id}`, updates);
  return response.data;
}

export async function deleteCareer(id: string): Promise<{ message: string }> {
  const response = await axios.delete<{ message: string }>(`${API_URL}/${id}`);
  return response.data;
}

export async function toggleCareerStatus(
  id: string,
  isActive: boolean
): Promise<CareerResponse> {
  return updateCareer(id, { is_active: isActive });
}
