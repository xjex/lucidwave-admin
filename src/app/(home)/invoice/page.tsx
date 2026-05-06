"use client";

import { useEffect, useState } from "react";
import { useInvoiceStore } from "@/stores/invoiceStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCircleCheck,
  IconCircleX,
  IconFileText,
  IconInbox,
  IconMail,
  IconPlus,
  IconUser,
} from "@tabler/icons-react";
import { InvoiceForm } from "@/components/InvoiceForm";
import { InvoicePreview } from "@/components/InvoicePreview";
import { InvoiceFormData, Invoice } from "@/types/invoice";
import { sendInvoices as sendInvoicesService } from "@/services/invoiceService";
import {
  getMailingHistory,
  MailingHistoryItem,
  MailingHistoryResponse,
} from "@/services/mailingHistoryService";
import { formatDateTime } from "@/lib/date-utils";

type InvoiceMode = "existing" | "create";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const data = error.response.data as { message?: string; error?: string };
    return data.message || data.error || fallback;
  }

  return error instanceof Error ? error.message : fallback;
};

export default function InvoicePage() {
  const [mode, setMode] = useState<InvoiceMode>("existing");
  const [showPreview, setShowPreview] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceFormData | null>(null);
  const [sentInvoices, setSentInvoices] = useState<MailingHistoryItem[]>([]);
  const [invoiceMeta, setInvoiceMeta] =
    useState<MailingHistoryResponse["meta"] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const {
    files,
    email,
    isLoading,
    message,
    addFiles,
    removeFile,
    setEmail,
    sendInvoices,
  } = useInvoiceStore();

  const fetchSentInvoices = async (page: number = 1) => {
    try {
      setHistoryLoading(true);
      setHistoryError(null);
      const response = await getMailingHistory(page, 8, { type: "invoice" });
      setSentInvoices(response.data);
      setInvoiceMeta(response.meta);
    } catch (err) {
      setHistoryError(getErrorMessage(err, "Failed to load sent invoices"));
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchSentInvoices();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    e.target.value = "";
  };

  const handleExistingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendInvoices();
    await fetchSentInvoices(1);
  };

  const handleCreateInvoice = (formData: InvoiceFormData) => {
    setInvoiceData(formData);
    setShowPreview(true);
  };

  const handleEditInvoice = () => {
    setShowPreview(false);
  };

  const handleSendCreatedInvoice = async (invoice: Invoice, pdfBlob: Blob) => {
    try {
      // Convert blob to file
      const pdfFile = new File(
        [pdfBlob],
        `invoice-${invoice.invoiceNumber}.pdf`,
        {
          type: "application/pdf",
        }
      );

      // Send the invoice using the existing service
      const result = await sendInvoicesService([pdfFile], invoice.to.email);

      if (result.success) {
        alert(`Invoice sent successfully to ${invoice.to.email}!`);
        await fetchSentInvoices(1);
        // Reset the form and go back to create mode
        resetToCreateMode();
      } else {
        alert(`Failed to send invoice: ${result.message}`);
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Failed to send invoice. Please try again.');
    }
  };

  const resetToCreateMode = () => {
    setShowPreview(false);
    setInvoiceData(null);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="max-w-6xl mx-auto w-full">
        {showPreview && invoiceData ? (
          <InvoicePreview
            invoiceData={invoiceData}
            onEdit={handleEditInvoice}
            onSend={handleSendCreatedInvoice}
            onBack={resetToCreateMode}
          />
        ) : (
          <Tabs
            value={mode}
            onValueChange={(value: string) => setMode(value as InvoiceMode)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">
                <IconFileText className="h-4 w-4 mr-2" />
                Send Existing Invoice
              </TabsTrigger>
              <TabsTrigger value="create">
                <IconPlus className="h-4 w-4 mr-2" />
                Create New Invoice
              </TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="mt-6">
              <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle className="text-center">
                      Send Invoice via Email
                    </CardTitle>
                    <CardDescription className="text-center">
                      Upload multiple invoice files and send them via email
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <form onSubmit={handleExistingSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="file-input">Invoice Files</Label>
                        <Input
                          id="file-input"
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                        />
                        {files.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground mb-2">
                              Selected files ({files.length}):
                            </p>
                            <ul className="space-y-1">
                              {files.map((file, index) => (
                                <li
                                  key={index}
                                  className="flex items-center justify-between bg-muted p-2 rounded text-sm"
                                >
                                  <div className="flex items-center">
                                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                                    {file.name}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                    className="text-destructive hover:text-destructive/80 h-auto p-1"
                                  >
                                    <IconCircleX className="h-4 w-4" />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="recipient@example.com"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? "Sending..." : "Send Invoice"}
                      </Button>
                    </form>

                    {message && (
                      <Alert
                        className={
                          message.includes("successfully")
                            ? "border-green-200"
                            : "border-red-200"
                        }
                      >
                        <div className="flex items-center">
                          {message.includes("successfully") ? (
                            <IconCircleCheck className="h-4 w-4 text-green-600" />
                          ) : (
                            <IconCircleX className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <AlertDescription>{message}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2 justify-center pt-4">
                      <Button variant="outline" asChild>
                        <Link href="/dashboard">← Back to Dashboard</Link>
                      </Button>
                      <Button variant="ghost" asChild>
                        <Link href="/receipts">Go to Receipt Sender →</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="create" className="mt-6">
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold">Create New Invoice</h1>
                  <p className="text-muted-foreground">
                    Fill out the form below to generate a professional invoice
                    PDF
                  </p>
                </div>
                <InvoiceForm onGenerate={handleCreateInvoice} />
              </div>
            </TabsContent>
          </Tabs>
        )}

        {!showPreview && (
          <section className="mt-10 border border-[#241d18]/15 bg-[#fffaf1] shadow-[10px_10px_0_#241d18]">
            <div className="border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                    Sent Invoices
                  </p>
                  <h2 className="mt-1 font-serif text-3xl text-[#241d18]">
                    Invoice History
                  </h2>
                </div>
                {invoiceMeta && (
                  <span className="border border-[#241d18]/15 bg-white px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                    {invoiceMeta.total} total
                  </span>
                )}
              </div>
            </div>

            <div className="hidden grid-cols-[1.2fr_1fr_140px_160px_110px] items-center border-b border-[#241d18]/15 bg-[#f4efe4]/70 px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-[#6f665d] md:grid">
              <span>Recipient</span>
              <span>Subject</span>
              <span>Files</span>
              <span>Sent By</span>
              <span className="text-right">Sent At</span>
            </div>

            {historyError && (
              <div className="m-5 flex items-start gap-3 border border-[#b73823] bg-[#fff1e8] px-4 py-3">
                <IconCircleX className="mt-0.5 h-4 w-4 shrink-0 text-[#7d2418]" />
                <p className="text-sm text-[#7d2418]">{historyError}</p>
              </div>
            )}

            {historyLoading ? (
              <div className="px-5 py-12 text-center">
                <div className="mx-auto mb-4 size-8 animate-spin border-2 border-[#241d18]/15 border-t-[#8b4a36]" />
                <p className="font-mono text-xs uppercase text-[#6f665d]">
                  Loading invoices
                </p>
              </div>
            ) : sentInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-16">
                <IconInbox className="mb-3 h-10 w-10 text-[#6f665d]/50" />
                <p className="font-mono text-xs uppercase text-[#6f665d]">
                  No sent invoices found
                </p>
              </div>
            ) : (
              sentInvoices.map((item) => (
                <div
                  key={item.id}
                  className="border-b border-[#241d18]/10 px-5 py-4 transition-colors hover:bg-[#f4efe4]/60 md:grid md:grid-cols-[1.2fr_1fr_140px_160px_110px] md:items-center md:gap-4"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <IconMail className="h-4 w-4 shrink-0 text-[#8b4a36]" />
                    <span className="truncate font-mono text-sm text-[#241d18]">
                      {item.attributes.sent_to}
                    </span>
                  </div>
                  <div
                    className="mt-2 truncate text-sm text-[#574d43] md:mt-0"
                    title={item.attributes.metadata.subject}
                  >
                    {item.attributes.metadata.subject || "Invoice"}
                  </div>
                  <div className="mt-2 font-mono text-sm text-[#574d43] md:mt-0">
                    {item.attributes.files.length} file
                    {item.attributes.files.length === 1 ? "" : "s"}
                  </div>
                  <div className="mt-2 flex items-center gap-2 overflow-hidden md:mt-0">
                    <IconUser className="h-4 w-4 shrink-0 text-[#8b4a36]" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#241d18]">
                        {item.attributes.sender.username}
                      </p>
                      <p className="truncate font-mono text-[11px] text-[#6f665d]">
                        {item.attributes.sender.email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-left text-sm text-[#6f665d] md:mt-0 md:text-right">
                    {formatDateTime(item.attributes.timestamp)}
                  </div>
                </div>
              ))
            )}

            {invoiceMeta && invoiceMeta.pages > 1 && (
              <div className="flex items-center justify-between border-t border-[#241d18]/15 bg-[#f4efe4] px-5 py-3">
                <span className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                  Page {invoiceMeta.page} of {invoiceMeta.pages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchSentInvoices(invoiceMeta.page - 1)}
                    disabled={invoiceMeta.page <= 1 || historyLoading}
                    className="rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] hover:bg-[#fffaf1]"
                  >
                    <IconArrowLeft className="mr-1 h-3.5 w-3.5" />
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchSentInvoices(invoiceMeta.page + 1)}
                    disabled={
                      invoiceMeta.page >= invoiceMeta.pages || historyLoading
                    }
                    className="rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] hover:bg-[#fffaf1]"
                  >
                    Next
                    <IconArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
