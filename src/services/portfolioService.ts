import axios from "axios";
import {
  Portfolio,
  PortfolioInput,
  PortfolioUpdateInput,
  PortfoliosResponse,
  PortfolioResponse,
  PortfolioStatus,
} from "@/types/portfolio";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

const API_URL = `${API_BASE_URL}/api/portfolios`;

export async function getPortfolios(
  page: number = 1,
  limit: number = 10,
  category?: string,
  status?: PortfolioStatus
): Promise<PortfoliosResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (category) params.append("category", category);
  if (status) params.append("status", status);

  const response = await axios.get<PortfoliosResponse>(`${API_URL}?${params}`);
  return response.data;
}

export async function getPortfolioById(id: string): Promise<PortfolioResponse> {
  const response = await axios.get<PortfolioResponse>(`${API_URL}/${id}`);
  return response.data;
}

export async function createPortfolio(
  portfolioData: PortfolioInput
): Promise<PortfolioResponse> {
  const formData = new FormData();
  formData.append("title", portfolioData.title);
  formData.append("category", portfolioData.category);
  formData.append("description", portfolioData.description);
  if (portfolioData.status) formData.append("status", portfolioData.status);
  formData.append("project_status", portfolioData.project_status);
  if (portfolioData.link) formData.append("link", portfolioData.link);
  formData.append("image", portfolioData.image);

  const response = await axios.post<PortfolioResponse>(API_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function updatePortfolio(
  id: string,
  updates: PortfolioUpdateInput
): Promise<PortfolioResponse> {
  const formData = new FormData();
  if (updates.title) formData.append("title", updates.title);
  if (updates.category) formData.append("category", updates.category);
  if (updates.description) formData.append("description", updates.description);
  if (updates.status) formData.append("status", updates.status);
  if (updates.project_status) formData.append("project_status", updates.project_status);
  if (updates.link !== undefined) formData.append("link", updates.link);
  if (updates.image) formData.append("image", updates.image);

  const response = await axios.patch<PortfolioResponse>(
    `${API_URL}/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

export async function deletePortfolio(id: string): Promise<{ message: string }> {
  const response = await axios.delete<{ message: string }>(`${API_URL}/${id}`);
  return response.data;
}
