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

class ContactService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = `${API_BASE_URL}/api/contactus/`;
  }

  async getContacts(page: number = 1, limit: number = 10): Promise<ContactsResponse> {
    try {
      const url = `${this.apiUrl}?page=${page}&limit=${limit}`;
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

  async getContactById(id: string): Promise<Contact> {
    try {
      const response: AxiosResponse<{ data: Contact }> = await axios.get(
        `${this.apiUrl}/${id}`,
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
}

export const contactService = new ContactService();
