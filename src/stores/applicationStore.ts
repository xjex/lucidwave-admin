import { create } from "zustand";
import {
  getApplications,
  updateApplicationStatus as apiUpdateStatus,
  updateApplicationNotes as apiUpdateNotes,
  deleteApplication as apiDeleteApplication,
} from "@/services/applicationService";
import {
  JobApplication,
  ApplicationStatus,
  StatusCounts,
} from "@/types/application";

interface ApplicationState {
  applications: JobApplication[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    status_counts?: StatusCounts;
  } | null;
  loading: boolean;
  error: string | null;
  statusFilter: ApplicationStatus | "all";

  // Actions
  fetchApplications: (page?: number) => Promise<void>;
  setStatusFilter: (status: ApplicationStatus | "all") => void;
  updateApplicationStatus: (
    id: string,
    status: ApplicationStatus,
    notes?: string
  ) => Promise<void>;
  updateApplicationNotes: (id: string, notes: string) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: [],
  meta: null,
  loading: false,
  error: null,
  statusFilter: "all",

  fetchApplications: async (page = 1) => {
    const { statusFilter } = get();
    set({ loading: true, error: null });
    try {
      const response = await getApplications(
        page,
        20,
        statusFilter === "all" ? undefined : statusFilter
      );
      set({
        applications: response.data,
        meta: response.meta,
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to load applications",
        loading: false,
      });
    }
  },

  setStatusFilter: (status) => {
    set({ statusFilter: status });
    get().fetchApplications(1);
  },

  updateApplicationStatus: async (id, status, notes) => {
    const { applications, meta } = get();
    
    // Optimistic update
    const updatedApplications = applications.map((app) =>
      app.id === id
        ? {
            ...app,
            attributes: {
              ...app.attributes,
              status,
              status_history: [
                ...(app.attributes.status_history || []),
                { status, changed_at: new Date().toISOString(), notes },
              ],
            },
          }
        : app
    );

    // Update status counts optimistically
    const oldApp = applications.find((app) => app.id === id);
    let updatedStatusCounts = meta?.status_counts;
    if (oldApp && updatedStatusCounts) {
      const oldStatus = oldApp.attributes.status;
      updatedStatusCounts = {
        ...updatedStatusCounts,
        [oldStatus]: Math.max(0, (updatedStatusCounts[oldStatus] || 0) - 1),
        [status]: (updatedStatusCounts[status] || 0) + 1,
      };
    }

    set({
      applications: updatedApplications,
      meta: meta ? { ...meta, status_counts: updatedStatusCounts } : null,
    });

    try {
      await apiUpdateStatus(id, status, notes);
    } catch (err: any) {
      // Revert on error
      set({
        applications,
        meta,
        error: err.response?.data?.message || "Failed to update status",
      });
    }
  },

  updateApplicationNotes: async (id, notes) => {
    const { applications } = get();

    // Optimistic update
    const updatedApplications = applications.map((app) =>
      app.id === id
        ? {
            ...app,
            attributes: { ...app.attributes, notes },
          }
        : app
    );

    set({ applications: updatedApplications });

    try {
      await apiUpdateNotes(id, notes);
    } catch (err: any) {
      // Revert on error
      set({
        applications,
        error: err.response?.data?.message || "Failed to update notes",
      });
    }
  },

  deleteApplication: async (id) => {
    const { applications, meta } = get();

    // Optimistic update
    const deletedApp = applications.find((app) => app.id === id);
    const updatedApplications = applications.filter((app) => app.id !== id);

    let updatedStatusCounts = meta?.status_counts;
    if (deletedApp && updatedStatusCounts) {
      const status = deletedApp.attributes.status;
      updatedStatusCounts = {
        ...updatedStatusCounts,
        [status]: Math.max(0, (updatedStatusCounts[status] || 0) - 1),
      };
    }

    set({
      applications: updatedApplications,
      meta: meta
        ? {
            ...meta,
            total: meta.total - 1,
            status_counts: updatedStatusCounts,
          }
        : null,
    });

    try {
      await apiDeleteApplication(id);
    } catch (err: any) {
      // Revert on error
      set({
        applications,
        meta,
        error: err.response?.data?.message || "Failed to delete application",
      });
    }
  },

  clearError: () => set({ error: null }),
}));
