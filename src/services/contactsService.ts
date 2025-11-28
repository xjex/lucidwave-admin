import axios, { AxiosResponse } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export interface ContactListItem {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface ContactsListResponse {
  data: ContactListItem[];
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
  };
}

const API_URL = `${API_BASE_URL}/api/contacts`;

export async function getContacts(
  page: number = 1,
  limit: number = 10
): Promise<ContactsListResponse> {
  try {
    const response: AxiosResponse<ContactsListResponse> = await axios.get(
      `${API_URL}?page=${page}&limit=${limit}`,
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
    console.error("Error fetching contacts:", error);
    throw error;
  }
}

export async function createContact(
  contactData: Omit<ContactListItem, "id" | "created_at" | "updated_at">
): Promise<ContactListItem> {
  try {
    const response: AxiosResponse<{ data: ContactListItem }> = await axios.post(
      API_URL,
      contactData,
      {
        headers: {
          ...(axios.defaults.headers.common["Authorization"] && {
            Authorization: axios.defaults.headers.common["Authorization"],
          }),
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.error("Error creating contact:", error);
    throw error;
  }
}

export async function updateContact(
  id: string,
  contactData: Omit<ContactListItem, "id" | "created_at" | "updated_at">
): Promise<ContactListItem> {
  try {
    const response: AxiosResponse<{ data: ContactListItem }> = await axios.put(
      `${API_URL}/${id}`,
      contactData,
      {
        headers: {
          ...(axios.defaults.headers.common["Authorization"] && {
            Authorization: axios.defaults.headers.common["Authorization"],
          }),
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
}

export async function deleteContact(id: string): Promise<void> {
  try {
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        ...(axios.defaults.headers.common["Authorization"] && {
          Authorization: axios.defaults.headers.common["Authorization"],
        }),
      },
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
}
