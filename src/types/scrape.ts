export type SalaryFrequency =
  | "hourly"
  | "monthly"
  | "yearly"
  | "unknown"
  | "negotiable";

export interface ScrapedJobSalary {
  raw: string;
  currency: string | null;
  min_monthly_usd: number | null;
  max_monthly_usd: number | null;
  frequency: SalaryFrequency;
}

export interface ScrapedJobFit {
  score: number;
  reason: string;
}

export interface ScrapedJob {
  id: string;
  job_id: string;
  url: string;
  title: string;
  category: string;
  employer: string;
  location: string;
  work_type: string;
  salary: ScrapedJobSalary;
  skills: string[];
  industry: string;
  fit: ScrapedJobFit;
  first_seen_at: string;
  last_seen_at: string;
  source: string;
  scrape_id: string;
  scrape_mode: string;
  filter_categories: string[];
  seen_count: number;
  created_at: string;
  updated_at: string;
}

export interface ScrapeRunSkipped {
  job_id: string | null;
  reason: string;
}

export interface ScrapeRun {
  id: string;
  scrape_id: string;
  ingest_id: string | null;
  source: string;
  version: string;
  scraped_at: string;
  mode: string;
  total_scanned: number;
  matched: number;
  new: number;
  filter_categories: string[];
  received: number;
  inserted: number;
  updated: number;
  skipped: ScrapeRunSkipped[];
  ingest_errors: string[];
  created_at: string;
  updated_at: string;
}

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ScrapedJobsResponse {
  data: ScrapedJob[];
  meta: PageMeta;
}

export interface ScrapeRunsResponse {
  data: ScrapeRun[];
  meta: PageMeta;
}
