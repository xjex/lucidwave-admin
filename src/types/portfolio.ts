export type PortfolioStatus = "Public" | "Private" | "Draft";
export type ProjectStatus = "Public" | "On Progress" | "NDA" | "Local";

export interface PortfolioAttributes {
  title: string;
  category: string;
  description: string;
  status: PortfolioStatus;
  project_status: ProjectStatus;
  link?: string;
  imageURL: string;
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  type: "portfolio";
  id: string;
  attributes: PortfolioAttributes;
}

export interface PortfolioInput {
  title: string;
  category: string;
  description: string;
  status?: PortfolioStatus;
  project_status: ProjectStatus;
  link?: string;
  image: File;
}

export interface PortfolioUpdateInput {
  title?: string;
  category?: string;
  description?: string;
  status?: PortfolioStatus;
  project_status?: ProjectStatus;
  link?: string;
  image?: File;
}

export interface PortfoliosResponse {
  data: Portfolio[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface PortfolioResponse {
  data: Portfolio;
  message?: string;
}
