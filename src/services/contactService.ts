import axios, { AxiosResponse } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export interface Contact {
  id: string;
  type: string;
  attributes: {
    firstname: string;
    lastname: string;
    email: string;
    company: string;
    phonenumber: string;
    message: string;
    inquiry_type: string;
    created_at: string;
    updated_at: string;
  };
}

export interface ContactsResponse {
  data: Contact[];
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

const API_URL = `${API_BASE_URL}/api/contactus/`;

export async function getContacts(
  page: number = 1,
  limit: number = 10
): Promise<ContactsResponse> {
  try {
    const url = `${API_URL}?page=${page}&limit=${limit}`;
    console.log("Fetching contacts from:", url);

    const response: AxiosResponse<ContactsResponse> = await axios.get(url, {
      headers: {
        ...(axios.defaults.headers.common["Authorization"] && {
          Authorization: axios.defaults.headers.common["Authorization"],
        }),
      },
    });

    console.log("Contacts response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching contacts:", error);
    console.error("Error response:", error.response);
    throw error;
  }
}

export async function getContactById(id: string): Promise<Contact> {
  try {
    const response: AxiosResponse<{ data: Contact }> = await axios.get(
      `${API_URL}/${id}`,
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
    console.error("Error fetching contact:", error);
    throw error;
  }
}
