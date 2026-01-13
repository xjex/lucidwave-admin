"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Edit3, Send, ArrowLeft } from "lucide-react";
import { InvoicePDF } from "./InvoicePDF";
import { Invoice, InvoiceFormData } from "@/types/invoice";
import { downloadInvoicePDFFromForm, convertFormDataToInvoice } from "@/services/pdfService";
import { getCurrencySymbol } from "@/lib/currency-utils";

interface InvoicePreviewProps {
  invoiceData: InvoiceFormData;
  onEdit: () => void;
  onSend?: (invoice: Invoice, pdfBlob: Blob) => void;
  onBack?: () => void;
}

export function InvoicePreview({ invoiceData, onEdit, onSend, onBack }: InvoicePreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const invoice = convertFormDataToInvoice(invoiceData);

  useEffect(() => {
    let currentUrl: string | null = null;

    // Generate PDF blob when component mounts or invoiceData changes
    const generateBlob = async () => {
      try {
        // Clean up previous URL if it exists
        if (pdfUrl) {
          URL.revokeObjectURL(pdfUrl);
        }

        const blob = await import('@react-pdf/renderer').then(({ pdf }) =>
          pdf(<InvoicePDF invoice={invoice} />).toBlob()
        );
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error('Error generating PDF blob:', error);
      }
    };

    generateBlob();

    // Cleanup blob URL on unmount
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [invoiceData]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadInvoicePDFFromForm(invoiceData);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSend = async () => {
    if (!onSend || !pdfUrl) return;

    setIsSending(true);
    try {
      // Convert blob URL back to blob for sending
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      await onSend(invoice, blob);
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Failed to send invoice. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold">Invoice Preview</h2>
            <p className="text-muted-foreground">
              Review your invoice before downloading or sending
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit
          </Button>

          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </Button>

          {onSend && (
            <Button
              onClick={handleSend}
              disabled={isSending || !pdfUrl}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSending ? 'Sending...' : 'Send Invoice'}
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Invoice #</p>
              <p className="font-medium">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{invoice.date.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="font-medium">{invoice.dueDate.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="font-medium text-lg">{getCurrencySymbol(invoice.currency)}{invoice.total.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">From</p>
              <p className="font-medium">{invoice.from.name}</p>
              <p className="text-sm text-muted-foreground">{invoice.from.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">To</p>
              <p className="font-medium">{invoice.to.name}</p>
              <p className="text-sm text-muted-foreground">{invoice.to.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PDF Preview */}
      <Card>
        <CardHeader>
          <CardTitle>PDF Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {pdfUrl ? (
            <div className="w-full" style={{ height: '600px' }}>
              <iframe
                src={pdfUrl}
                width="100%"
                height="100%"
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  backgroundColor: '#f9fafb'
                }}
                title="Invoice PDF Preview"
              />
            </div>
          ) : (
            <div className="w-full h-64 flex items-center justify-center bg-muted rounded-md">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Generating PDF preview...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
