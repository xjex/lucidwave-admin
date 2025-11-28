import axios, { AxiosResponse } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export interface InvitationAttributes {
  email: string;
  role: "user" | "admin";
  invitation_token: string;
  expires_at: string;
  sent_at: string;
  status: "sent" | "pending" | "accepted" | "expired";
}

export interface InvitationResponse {
  data: {
    type: "invitation";
    attributes: InvitationAttributes;
  };
  message: string;
}

export interface CreateInvitationRequest {
  email: string;
  role: "user" | "admin";
}

export interface ValidateInvitationResponse {
  data: {
    type: "invitation";
    id: string;
    attributes: {
      token: string;
      email: string;
      role: "user" | "admin";
      expires_at: string;
      created_at: string;
    };
  };
}

export interface AcceptInvitationRequest {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface AcceptInvitationResponse {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: "user" | "admin";
  };
  tokens: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  };
}

export interface InvitationListItem {
  type: "invitation";
  id: string;
  attributes: {
    token: string;
    email: string;
    role: "user" | "admin";
    status: "pending" | "accepted" | "expired" | "sent";
    expires_at: string;
    created_at: string;
  };
  relationships?: {
    invited_by?: {
      data: {
        type: string;
        id: string;
      };
    };
  };
}

export interface InvitationsListResponse {
  data: InvitationListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const API_URL = `${API_BASE_URL}/api/invitations`;

export async function sendInvitation(
  invitationData: CreateInvitationRequest
): Promise<InvitationResponse> {
  try {
    const response: AxiosResponse<InvitationResponse> = await axios.post(
      API_URL,
      invitationData,
      {
        headers: {
          "Content-Type": "application/json",
          ...(axios.defaults.headers.common["Authorization"] && {
            Authorization: axios.defaults.headers.common["Authorization"],
          }),
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error sending invitation:", error);
    throw error;
  }
}

export async function validateToken(
  token: string
): Promise<ValidateInvitationResponse> {
  try {
    const response: AxiosResponse<ValidateInvitationResponse> = await axios.get(
      `${API_URL}/${token}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error validating invitation token:", error);
    throw error;
  }
}

export async function acceptInvitation(
  token: string,
  registrationData: AcceptInvitationRequest
): Promise<AcceptInvitationResponse> {
  try {
    // Transform camelCase to snake_case for backend
    const requestData = {
      first_name: registrationData.firstName,
      last_name: registrationData.lastName,
      username: registrationData.username,
      password: registrationData.password,
      confirmPassword: registrationData.confirmPassword,
    };

    const response: AxiosResponse<AcceptInvitationResponse> = await axios.post(
      `${API_URL}/${token}/accept`,
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error accepting invitation:", error);
    throw error;
  }
}

export interface InvitationListItem {
  type: "invitation";
  id: string;
  attributes: {
    token: string;
    email: string;
    role: "user" | "admin";
    status: "pending" | "accepted" | "expired" | "sent";
    expires_at: string;
    created_at: string;
  };
  relationships?: {
    invited_by?: {
      data: {
        type: string;
        id: string;
      };
    };
  };
}

export interface InvitationsListResponse {
  data: InvitationListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export async function getInvitations(
  page: number = 1,
  limit: number = 20
): Promise<InvitationsListResponse> {
  try {
    const response: AxiosResponse<InvitationsListResponse> = await axios.get(
      `${API_URL}?page=${page}&limit=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(axios.defaults.headers.common["Authorization"] && {
            Authorization: axios.defaults.headers.common["Authorization"],
          }),
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error fetching invitations:", error);
    throw error;
  }
}
