"use client";

import { useState } from "react";
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
  IconCircleCheck,
  IconCircleX,
  IconFileText,
  IconPlus,
} from "@tabler/icons-react";
import { InvoiceForm } from "@/components/InvoiceForm";
import { InvoicePreview } from "@/components/InvoicePreview";
import { InvoiceFormData, Invoice } from "@/types/invoice";
import { convertFormDataToInvoice } from "@/services/pdfService";
import { sendInvoices as sendInvoicesService } from "@/services/invoiceService";

type InvoiceMode = "existing" | "create";

export default function InvoicePage() {
  const [mode, setMode] = useState<InvoiceMode>("existing");
  const [showPreview, setShowPreview] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceFormData | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    e.target.value = "";
  };

  const handleExistingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendInvoices();
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
      </div>
    </div>
  );
}
