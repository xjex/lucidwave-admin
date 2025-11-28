import axios, { AxiosResponse } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

const API_URL = `${API_BASE_URL}/api/receipts/send`;

export async function sendReceipts(
  files: File[],
  receiverName: string,
  receivedAmount: string,
  receiverEmail: string,
  currency: string,
  receivedVia: string
): Promise<{ success: boolean; message: string }> {
  try {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("receipts", file);
    });

    formData.append("receiverName", receiverName);
    formData.append("receivedAmount", receivedAmount);
    formData.append("receiverEmail", receiverEmail);
    formData.append("currency", currency);
    formData.append("receivedVia", receivedVia);

    const response: AxiosResponse = await axios.post(API_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(axios.defaults.headers.common["Authorization"] && {
          Authorization: axios.defaults.headers.common["Authorization"],
        }),
      },
    });

    if (response.status === 200) {
      return { success: true, message: "Receipts sent successfully!" };
    } else {
      return {
        success: false,
        message: `Failed to send receipts: ${response.statusText}`,
      };
    }
  } catch (error) {
    console.error("Error sending receipts:", error);
    return {
      success: false,
      message: "Error sending receipts. Please check if the server is running.",
    };
  }
}
