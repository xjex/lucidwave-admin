import axios, { AxiosResponse } from "axios";
import {
  InvoiceTemplateBlock,
  InvoiceTemplateLayout,
} from "@/types/invoice";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
const API_URL = `${API_BASE_URL}/api/settings`;

export interface InvoicePaymentLink {
  label: string;
  url: string;
}

export interface InvoiceSettings {
  id?: string;
  name: string;
  is_default: boolean;
  company_logo_url?: string;
  payment_tags: string[];
  direct_payment_links: InvoicePaymentLink[];
  banking_details?: string;
  qr_links: InvoicePaymentLink[];
  template_layout?: InvoiceTemplateLayout;
  updated_at?: string;
}

export interface InvoiceSettingsPayload {
  name: string;
  is_default: boolean;
  payment_tags: string[];
  direct_payment_links: InvoicePaymentLink[];
  banking_details?: string;
  qr_links: InvoicePaymentLink[];
  template_layout?: InvoiceTemplateLayout;
}

export type { InvoiceTemplateBlock, InvoiceTemplateLayout };

const authHeaders = () => ({
  ...(axios.defaults.headers.common["Authorization"] && {
    Authorization: axios.defaults.headers.common["Authorization"],
  }),
});

export async function getInvoiceSettings(): Promise<InvoiceSettings> {
  const response: AxiosResponse<{ data: InvoiceSettings }> = await axios.get(
    `${API_URL}/invoice`,
    { headers: authHeaders() }
  );

  return response.data.data;
}

export async function listInvoiceProfiles(): Promise<InvoiceSettings[]> {
  const response: AxiosResponse<{ data: InvoiceSettings[] }> = await axios.get(
    `${API_URL}/invoice/profiles`,
    { headers: authHeaders() }
  );

  return response.data.data;
}

export async function createInvoiceProfile(
  payload: InvoiceSettingsPayload
): Promise<InvoiceSettings> {
  const response: AxiosResponse<{ data: InvoiceSettings }> = await axios.post(
    `${API_URL}/invoice/profiles`,
    payload,
    { headers: authHeaders() }
  );

  return response.data.data;
}

export async function updateInvoiceSettings(
  payload: InvoiceSettingsPayload,
  profileId?: string
): Promise<InvoiceSettings> {
  const response: AxiosResponse<{ data: InvoiceSettings }> = await axios.put(
    profileId ? `${API_URL}/invoice/profiles/${profileId}` : `${API_URL}/invoice`,
    payload,
    { headers: authHeaders() }
  );

  return response.data.data;
}

export async function uploadInvoiceLogo(
  file: File,
  profileId?: string
): Promise<InvoiceSettings> {
  const formData = new FormData();
  formData.append("logo", file);

  const response: AxiosResponse<{ data: InvoiceSettings }> = await axios.post(
    profileId
      ? `${API_URL}/invoice/profiles/${profileId}/logo`
      : `${API_URL}/invoice/logo`,
    formData,
    {
      headers: {
        ...authHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.data;
}

export function getInvoiceLogoViewUrl(profileId?: string): string | undefined {
  if (!profileId) return undefined;

  const baseUrl = `${API_URL}/invoice/profiles/${profileId}/logo/view`;
  const authHeader = axios.defaults.headers.common["Authorization"] as
    | string
    | undefined;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : authHeader;

  if (!token) {
    return baseUrl;
  }

  const url = new URL(baseUrl);
  url.searchParams.set("token", token);
  return url.toString();
}
