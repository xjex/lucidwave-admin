import axios, { AxiosResponse } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

const API_URL = `${API_BASE_URL}/api/invoices/send`;

export async function sendInvoices(
  files: File[],
  receiverEmail: string
): Promise<{ success: boolean; message: string }> {
  try {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("invoices", file);
    });

    formData.append("receiverEmail", receiverEmail);

    const response: AxiosResponse = await axios.post(API_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(axios.defaults.headers.common["Authorization"] && {
          Authorization: axios.defaults.headers.common["Authorization"],
        }),
      },
    });

    if (response.status === 200) {
      return { success: true, message: "Invoices sent successfully!" };
    } else {
      return {
        success: false,
        message: `Failed to send invoices: ${response.statusText}`,
      };
    }
  } catch (error) {
    console.error("Error sending invoices:", error);
    return {
      success: false,
      message: "Error sending invoices. Please check if the server is running.",
    };
  }
}
