import { create } from "zustand";
import { invoiceService } from "@/services/invoiceService";

interface InvoiceState {
  files: File[];
  email: string;
  isLoading: boolean;
  message: string;
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  setEmail: (email: string) => void;
  sendInvoices: () => Promise<void>;
  clearMessage: () => void;
  resetForm: () => void;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  files: [],
  email: "",
  isLoading: false,
  message: "",

  addFiles: (newFiles: File[]) => {
    set((state) => {
      const existingNames = new Set(state.files.map((f) => f.name));
      const filteredNewFiles = newFiles.filter(
        (file) => !existingNames.has(file.name)
      );
      return {
        files: [...state.files, ...filteredNewFiles],
      };
    });
  },

  removeFile: (index: number) => {
    set((state) => ({
      files: state.files.filter((_, i) => i !== index),
    }));
  },

  setEmail: (email: string) => {
    set({ email });
  },

  clearMessage: () => {
    set({ message: "" });
  },

  resetForm: () => {
    set({ files: [], email: "" });
  },

  sendInvoices: async () => {
    const { files, email } = get();

    if (files.length === 0 || !email) {
      set({
        message: "Please select at least one file and enter an email address.",
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true, message: "" });

    try {
      const result = await invoiceService.sendInvoices(files, email);

      if (result.success) {
        set({
          message: result.message,
          files: [],
          email: "",
          isLoading: false,
        });
      } else {
        set({
          message: result.message,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        message: "An unexpected error occurred.",
        isLoading: false,
      });
      console.error("Unexpected error:", error);
    }
  },
}));
