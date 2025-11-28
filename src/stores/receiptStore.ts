import { create } from "zustand";
import { sendReceipts } from "@/services/receiptService";

interface ReceiptState {
  files: File[];
  receiverName: string;
  receivedAmount: string;
  receiverEmail: string;
  currency: string;
  receivedVia: string;
  isLoading: boolean;
  message: string;
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  setReceiverName: (name: string) => void;
  setReceivedAmount: (amount: string) => void;
  setReceiverEmail: (email: string) => void;
  setCurrency: (currency: string) => void;
  setReceivedVia: (receivedVia: string) => void;
  sendReceipts: () => Promise<void>;
  clearMessage: () => void;
  resetForm: () => void;
}

export const useReceiptStore = create<ReceiptState>((set, get) => ({
  files: [],
  receiverName: "",
  receivedAmount: "",
  receiverEmail: "",
  currency: "PHP",
  receivedVia: "",
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

  setReceiverName: (receiverName: string) => {
    set({ receiverName });
  },

  setReceivedAmount: (receivedAmount: string) => {
    set({ receivedAmount });
  },

  setReceiverEmail: (receiverEmail: string) => {
    set({ receiverEmail });
  },

  setCurrency: (currency: string) => {
    set({ currency });
  },

  setReceivedVia: (receivedVia: string) => {
    set({ receivedVia });
  },

  clearMessage: () => {
    set({ message: "" });
  },

  resetForm: () => {
    set({
      files: [],
      receiverName: "",
      receivedAmount: "",
      receiverEmail: "",
      currency: "PHP",
      receivedVia: "",
    });
  },

  sendReceipts: async () => {
    const {
      files,
      receiverName,
      receivedAmount,
      receiverEmail,
      currency,
      receivedVia,
    } = get();

    if (
      files.length === 0 ||
      !receiverName ||
      !receivedAmount ||
      !receiverEmail ||
      !receivedVia
    ) {
      set({
        message: "Please fill all fields and select at least one receipt file.",
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true, message: "" });

    try {
      const result = await sendReceipts(
        files,
        receiverName,
        receivedAmount,
        receiverEmail,
        currency,
        receivedVia
      );

      if (result.success) {
        set({
          message: result.message,
          files: [],
          receiverName: "",
          receivedAmount: "",
          receiverEmail: "",
          currency: "PHP",
          receivedVia: "",
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
