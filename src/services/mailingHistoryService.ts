import axios, { AxiosResponse } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export interface MailingHistoryItem {
  type: string;
  id: string;
  attributes: {
    sent_to: string;
    type: "receipt" | "invoice";
    timestamp: string;
    files: string[];
    metadata: {
      subject: string;
      amount?: string;
      currency?: string;
      [key: string]: any;
    };
    sender: {
      id: string;
      username: string;
      email: string;
    };
  };
}

export interface MailingHistoryResponse {
  data: MailingHistoryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  links: {
    self: string;
    next?: string;
    last?: string;
    prev?: string;
  };
}

export interface MailingHistoryFilters {
  type?: "receipt" | "invoice";
  sent_to?: string;
}

const API_URL = `${API_BASE_URL}/api/mailing-history`;

export async function getMailingHistory(
  page: number = 1,
  limit: number = 10,
  filters?: MailingHistoryFilters
): Promise<MailingHistoryResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.type) {
      params.append("type", filters.type);
    }

    if (filters?.sent_to) {
      params.append("sent_to", filters.sent_to);
    }

    const url = `${API_URL}?${params.toString()}`;

    const response: AxiosResponse<MailingHistoryResponse> = await axios.get(
      url,
      {
        headers: {
          ...(axios.defaults.headers.common["Authorization"] && {
            Authorization: axios.defaults.headers.common["Authorization"],
          }),
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching mailing history:", error);
    throw error;
  }
}

export async function downloadMailingHistory(id: string): Promise<void> {
  try {
    const response: AxiosResponse<Blob> = await axios.get(
      `${API_URL}/${id}/download`,
      {
        responseType: "blob",
        headers: {
          ...(axios.defaults.headers.common["Authorization"] && {
            Authorization: axios.defaults.headers.common["Authorization"],
          }),
        },
      }
    );

    // Create a download link and trigger the download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `mailing-history-${id}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading mailing history:", error);
    throw error;
  }
}
