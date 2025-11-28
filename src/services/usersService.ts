import axios, { AxiosResponse } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export type UsersResponse = User[];

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: "user" | "admin";
  password?: string;
}

const API_URL = `${API_BASE_URL}/api/users`;

export async function getUsers(): Promise<UsersResponse> {
  try {
    const response: AxiosResponse<UsersResponse> = await axios.get(API_URL, {
      headers: {
        ...(axios.defaults.headers.common["Authorization"] && {
          Authorization: axios.defaults.headers.common["Authorization"],
        }),
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function getUserById(id: string): Promise<User> {
  try {
    const response: AxiosResponse<User> = await axios.get(`${API_URL}/${id}`, {
      headers: {
        ...(axios.defaults.headers.common["Authorization"] && {
          Authorization: axios.defaults.headers.common["Authorization"],
        }),
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

export async function createUser(userData: CreateUserRequest): Promise<User> {
  try {
    const response: AxiosResponse<User> = await axios.post(API_URL, userData, {
      headers: {
        ...(axios.defaults.headers.common["Authorization"] && {
          Authorization: axios.defaults.headers.common["Authorization"],
        }),
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function updateUser(
  id: string,
  userData: UpdateUserRequest
): Promise<User> {
  try {
    const response: AxiosResponse<User> = await axios.put(
      `${API_URL}/${id}`,
      userData,
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
    console.error("Error updating user:", error);
    throw error;
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        ...(axios.defaults.headers.common["Authorization"] && {
          Authorization: axios.defaults.headers.common["Authorization"],
        }),
      },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
