import { create } from "zustand";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

interface AuthState {
  isAuthenticated: boolean;
  user: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  } | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<string>;
  checkAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      // Handle different possible token field names
      const token =
        response.data.tokens?.access_token ||
        response.data.token ||
        response.data.accessToken ||
        response.data.access_token;
      const { user } = response.data;

      if (!token) {
        throw new Error("No token received from server");
      }

      // Store tokens and user data
      localStorage.setItem("authToken", token);
      localStorage.setItem("userData", JSON.stringify(user));
      if (response.data.tokens?.refresh_token) {
        localStorage.setItem(
          "refreshToken",
          response.data.tokens.refresh_token
        );
      }

      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Format user data
      const formattedUser = {
        name: user.name || user.username || user.email.split("@")[0],
        email: user.email,
        avatar:
          user.avatar || `/avatars/${user.email.charAt(0).toLowerCase()}.jpg`,
        role: user.role || "User",
      };

      set({
        isAuthenticated: true,
        user: formattedUser,
        token,
        refreshToken: response.data.tokens?.refresh_token || null,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Login failed",
      });
      throw error;
    }
  },

  register: async (username: string, email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        username,
        email,
        password,
      });

      set({
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Registration failed",
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    delete axios.defaults.headers.common["Authorization"];
    set({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      error: null,
    });
    window.location.href = "/";
  },

  refresh: async (): Promise<string> => {
    const refreshToken =
      get().refreshToken || localStorage.getItem("refreshToken");

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
        refresh_token: refreshToken,
      });

      // Handle different possible token field names
      const token =
        response.data.tokens?.access_token ||
        response.data.token ||
        response.data.accessToken ||
        response.data.access_token;

      if (!token) {
        throw new Error("No token received from server");
      }

      // Store new tokens
      localStorage.setItem("authToken", token);
      if (response.data.tokens?.refresh_token) {
        localStorage.setItem(
          "refreshToken",
          response.data.tokens.refresh_token
        );
      }

      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      set({
        token,
        refreshToken: response.data.tokens?.refresh_token || refreshToken,
      });

      return token;
    } catch (error: any) {
      // If refresh fails, logout user
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData");
      delete axios.defaults.headers.common["Authorization"];

      set({
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        error: "Session expired. Please login again.",
      });

      throw error;
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem("authToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const storedUser = localStorage.getItem("userData");

    if (token) {
      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        // Try to get user data from stored data or API call
        let userData = null;

        if (storedUser) {
          userData = JSON.parse(storedUser);
        } else {
          // If no stored user data, try to get from API
          try {
            const response = await axios.get(`${API_BASE_URL}/api/auth/me`);
            userData = response.data.user || response.data;
          } catch (apiError) {
            console.warn("Could not fetch user data from API:", apiError);
            // Try to refresh token if API call fails
            try {
              const store = useAuthStore.getState();
              await store.refresh();
              // Retry getting user data after refresh
              const retryResponse = await axios.get(
                `${API_BASE_URL}/api/auth/me`
              );
              userData = retryResponse.data.user || retryResponse.data;
            } catch (refreshError) {
              console.warn("Could not refresh token:", refreshError);
              // Fallback to basic user if both API call and refresh fail
              userData = {
                name: "User",
                email: "user@example.com",
                role: "User",
              };
            }
          }
        }

        // Format user data
        const formattedUser = {
          name:
            userData.name ||
            userData.username ||
            userData.email?.split("@")[0] ||
            "User",
          email: userData.email || "user@example.com",
          avatar:
            userData.avatar ||
            `/avatars/${userData.email?.charAt(0)?.toLowerCase() || "u"}.jpg`,
          role: userData.role || "User",
        };

        set({
          isAuthenticated: true,
          user: formattedUser,
          token: localStorage.getItem("authToken"), // Get updated token
          refreshToken: localStorage.getItem("refreshToken"), // Get updated refresh token
        });
      } catch (error) {
        console.error("Error in checkAuth:", error);
        // Clear invalid tokens
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userData");
        delete axios.defaults.headers.common["Authorization"];
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          refreshToken: null,
        });
      }
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Set the refresh function for axios interceptor after store creation
setTimeout(() => {
  refreshTokenFn = () => useAuthStore.getState().refresh();
}, 0);

// Set up axios interceptors for automatic token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });

  failedQueue = [];
};

// Function to refresh token - will be set after store creation
let refreshTokenFn: (() => Promise<string>) | null = null;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        if (!refreshTokenFn) {
          throw new Error("Refresh function not available");
        }

        const newToken = await refreshTokenFn();

        processQueue(null, newToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
