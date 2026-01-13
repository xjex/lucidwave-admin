export type ApplicationStatus =
  | "new"
  | "interested"
  | "interviewed"
  | "pooling"
  | "offered"
  | "accepted"
  | "rejected";

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  changed_at: string;
  changed_by?: string;
  notes?: string;
}

export interface ApplicationAttributes {
  career_id: string;
  career?: CareerSummary;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  linkedin_profile?: string;
  portfolio_url?: string;
  cover_letter?: string;
  notes?: string;
  status: ApplicationStatus;
  status_history: StatusHistoryEntry[];
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  type: "job_application";
  id: string;
  attributes: ApplicationAttributes;
  relationships?: {
    career?: {
      data?: {
        type: string;
        id: CareerSummary | string;
      };
    };
  };
}

export interface CareerSummary {
  id: string;
  title: string;
  department: string;
  location: string;
}

export interface StatusCounts {
  new: number;
  interested: number;
  interviewed: number;
  pooling: number;
  offered: number;
  accepted: number;
  rejected: number;
}

export interface ApplicationsResponse {
  data: JobApplication[];
  career?: CareerSummary;
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    status_counts?: StatusCounts;
  };
}

export interface ApplicationResponse {
  data: JobApplication;
  message?: string;
}
