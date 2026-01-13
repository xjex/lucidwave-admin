export interface SalaryRange {
  min?: number;
  max?: number;
  currency?: string;
}

export type JobType = "full-time" | "part-time" | "contract" | "internship";

export interface CareerAttributes {
  title: string;
  department: string;
  location: string;
  type: JobType;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary_range?: SalaryRange;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Career {
  type: "career";
  id: string;
  attributes: CareerAttributes;
}

export interface CareerInput {
  title: string;
  department: string;
  location: string;
  type?: JobType;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  salary_range?: SalaryRange;
}

export interface CareersResponse {
  data: Career[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  links: {
    self: string;
    first: string;
    last: string;
    next?: string;
    prev?: string;
  };
}

export interface CareerResponse {
  data: Career;
  message?: string;
}
