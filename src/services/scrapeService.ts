import axios from "axios";
import {
  ScrapedJobsResponse,
  ScrapeRunsResponse,
} from "@/types/scrape";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

const API_URL = `${API_BASE_URL}/api/scrapes`;

function authHeaders() {
  const auth = axios.defaults.headers.common["Authorization"];
  return auth ? { Authorization: auth as string } : {};
}

export interface ScrapedJobsParams {
  page?: number;
  limit?: number;
  category?: string;
  minFit?: number;
  search?: string;
}

export async function getScrapedJobs(
  params: ScrapedJobsParams = {}
): Promise<ScrapedJobsResponse> {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 25));
  if (params.category) query.set("category", params.category);
  if (params.minFit) query.set("min_fit", String(params.minFit));
  if (params.search) query.set("search", params.search);

  const response = await axios.get<ScrapedJobsResponse>(
    `${API_URL}/jobs?${query.toString()}`,
    { headers: authHeaders() }
  );
  return response.data;
}

export async function getScrapeRuns(
  page: number = 1,
  limit: number = 20
): Promise<ScrapeRunsResponse> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const response = await axios.get<ScrapeRunsResponse>(
    `${API_URL}/runs?${query.toString()}`,
    { headers: authHeaders() }
  );
  return response.data;
}

export async function deleteScrapedJob(
  id: string
): Promise<{ status: string; deleted_job_id: string }> {
  const response = await axios.delete(`${API_URL}/jobs/${id}`, {
    headers: authHeaders(),
  });
  return response.data;
}

export async function deleteScrapeRun(
  id: string
): Promise<{ status: string; deleted_scrape_id: string; deleted_jobs: number }> {
  const response = await axios.delete(`${API_URL}/runs/${id}`, {
    headers: authHeaders(),
  });
  return response.data;
}
