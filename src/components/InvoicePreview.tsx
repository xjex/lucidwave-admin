"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Edit3, Send } from "lucide-react";
import { InvoicePDF } from "./InvoicePDF";
import { Invoice, InvoiceFormData, InvoicePdfSettings } from "@/types/invoice";
import {
  downloadInvoicePDFFromForm,
  convertFormDataToInvoice,
} from "@/services/pdfService";
import { getCurrencySymbol } from "@/lib/currency-utils";

interface InvoicePreviewProps {
  invoiceData: InvoiceFormData;
  onEdit: () => void;
  onSend?: (invoice: Invoice, pdfBlob: Blob) => void;
  onBack?: () => void;
  settings?: InvoicePdfSettings | null;
}

export function InvoicePreview({
  invoiceData,
  onEdit,
  onSend,
  onBack,
  settings,
}: InvoicePreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const invoice = useMemo(
    () => convertFormDataToInvoice(invoiceData),
    [invoiceData]
  );

  useEffect(() => {
    let activeUrl: string | null = null;
    let isMounted = true;

    const generateBlob = async () => {
      try {
        const { pdf } = await import("@react-pdf/renderer");
        const blob = await pdf(
          <InvoicePDF invoice={invoice} settings={settings} />
        ).toBlob();
        activeUrl = URL.createObjectURL(blob);
        if (isMounted) {
          setPdfUrl(activeUrl);
        }
      } catch (error) {
        console.error("Error generating PDF blob:", error);
      }
    };

    setPdfUrl(null);
    generateBlob();

    return () => {
      isMounted = false;
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [invoice, settings]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadInvoicePDFFromForm(invoiceData, settings);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSend = async () => {
    if (!onSend || !pdfUrl) return;

    setIsSending(true);
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      await onSend(invoice, blob);
    } catch (error) {
      console.error("Error sending invoice:", error);
      alert("Failed to send invoice. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border border-[#241d18]/15 bg-[#fffaf1] shadow-[8px_8px_0_#241d18]">
        <div className="flex flex-col gap-4 border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            {onBack && (
              <Button
                variant="outline"
                size="icon"
                onClick={onBack}
                className="h-10 w-10 rounded-none border-[#241d18]/20 bg-white text-[#574d43] shadow-none hover:bg-[#fffaf1]"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                Review
              </p>
              <h2 className="mt-1 font-serif text-3xl">Invoice Preview</h2>
              <p className="mt-1 text-sm text-[#6f665d]">
                Check the generated PDF before sending it to the client.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={onEdit}
              className="h-10 rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] shadow-none hover:bg-[#fffaf1]"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              variant="outline"
              className="h-10 rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] shadow-none hover:bg-[#fffaf1]"
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? "Downloading" : "Download"}
            </Button>
            {onSend && (
              <Button
                onClick={handleSend}
                disabled={isSending || !pdfUrl}
                className="h-10 rounded-none border border-[#241d18] bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none hover:bg-[#8b4a36]"
              >
                <Send className="mr-2 h-4 w-4" />
                {isSending ? "Sending" : "Send Invoice"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-4">
          <div className="border border-[#241d18]/10 bg-[#f4efe4] p-4">
            <p className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
              Invoice
            </p>
            <p className="mt-1 font-mono text-sm font-semibold">
              #{invoice.invoiceNumber}
            </p>
          </div>
          <div className="border border-[#241d18]/10 bg-[#f4efe4] p-4">
            <p className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
              Client
            </p>
            <p className="mt-1 truncate text-sm font-semibold">
              {invoice.to.name}
            </p>
          </div>
          <div className="border border-[#241d18]/10 bg-[#f4efe4] p-4">
            <p className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
              Due
            </p>
            <p className="mt-1 text-sm font-semibold">
              {invoice.dueDate.toLocaleDateString()}
            </p>
          </div>
          <div className="border border-[#d95c3f]/40 bg-[#d95c3f] p-4 text-[#fffaf1]">
            <p className="font-mono text-[10px] uppercase tracking-wide">
              Total
            </p>
            <p className="mt-1 font-serif text-3xl">
              {getCurrencySymbol(invoice.currency)}
              {invoice.total.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="border border-[#241d18]/15 bg-[#fffaf1] p-4 shadow-[8px_8px_0_#241d18]">
        {pdfUrl ? (
          <div className="h-[78vh] overflow-hidden border border-[#241d18]/15 bg-white">
            <iframe
              src={pdfUrl}
              width="100%"
              height="100%"
              title="Invoice PDF Preview"
            />
          </div>
        ) : (
          <div className="flex h-96 items-center justify-center border border-[#241d18]/15 bg-[#f4efe4]">
            <div className="text-center">
              <div className="mx-auto mb-4 size-8 animate-spin border-2 border-[#241d18]/15 border-t-[#8b4a36]" />
              <p className="font-mono text-xs uppercase text-[#6f665d]">
                Generating PDF
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
