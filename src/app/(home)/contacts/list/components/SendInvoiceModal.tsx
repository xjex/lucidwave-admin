import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconFileText,
  IconTrash,
  IconEye,
  IconArrowLeft,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { ContactListItem } from "@/services/contactsService";
import { toast } from "sonner";

interface SendInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (e?: React.FormEvent) => Promise<void>;
  contact: ContactListItem | null;
  files: File[];
  email: string;
  isLoading: boolean;
  message: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmailChange: (email: string) => void;
  onRemoveFile: (index: number) => void;
  onClearMessage: () => void;
}

export function SendInvoiceModal({
  isOpen,
  onClose,
  onSend,
  contact,
  files,
  email,
  isLoading,
  message,
  onFileChange,
  onEmailChange,
  onRemoveFile,
  onClearMessage,
}: SendInvoiceModalProps) {
  const [currentStep, setCurrentStep] = useState<"select" | "review">("select");
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [currentPdfIndex, setCurrentPdfIndex] = useState<number>(0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleClose = () => {
    setCurrentStep("select");
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setPdfFiles([]);
    setCurrentPdfIndex(0);
    onClose();
  };

  const handleReview = () => {
    // Find all PDF files to preview
    const pdfFilesToPreview = files.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
    );

    if (pdfFilesToPreview.length > 0) {
      setPdfFiles(pdfFilesToPreview);
      setCurrentPdfIndex(0);
      // Create blob URL for the first PDF
      const url = URL.createObjectURL(pdfFilesToPreview[0]);
      setPdfUrl(url);
    } else {
      setPdfFiles([]);
      setCurrentPdfIndex(0);
      setPdfUrl(null);
    }

    setCurrentStep("review");
  };

  const handleBackToSelect = () => {
    setCurrentStep("select");
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setPdfFiles([]);
    setCurrentPdfIndex(0);
  };

  const handlePreviousPdf = () => {
    if (currentPdfIndex > 0) {
      const newIndex = currentPdfIndex - 1;
      setCurrentPdfIndex(newIndex);
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      const url = URL.createObjectURL(pdfFiles[newIndex]);
      setPdfUrl(url);
    }
  };

  const handleNextPdf = () => {
    if (currentPdfIndex < pdfFiles.length - 1) {
      const newIndex = currentPdfIndex + 1;
      setCurrentPdfIndex(newIndex);
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      const url = URL.createObjectURL(pdfFiles[newIndex]);
      setPdfUrl(url);
    }
  };

  const handleSend = async () => {
    await onSend();
    setCurrentStep("select");
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setPdfFiles([]);
    setCurrentPdfIndex(0);
  };

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Watch for message changes to show success/error toasts
  useEffect(() => {
    if (message && message.trim() !== "") {
      if (message.includes("successfully")) {
        toast.success("Invoice sent successfully!");
        onClose();
      } else {
        toast.error(message);
      }
      // Clear the message after showing toast to prevent duplicates
      onClearMessage();
    }
  }, [message, onClose, onClearMessage]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={
          currentStep === "review"
            ? "!max-w-[98vw] !w-[98vw] max-h-[98vh] overflow-hidden flex flex-col !p-6"
            : "max-w-md"
        }
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconFileText className="h-5 w-5" />
            {currentStep === "select"
              ? "Send Invoice"
              : "Review & Confirm Invoice"}
          </DialogTitle>
          <DialogDescription>
            {currentStep === "select"
              ? `Send an invoice to ${contact?.name}`
              : `Review the invoice details before sending to ${contact?.name}`}
          </DialogDescription>
        </DialogHeader>

        {currentStep === "select" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invoice-files">Invoice Files</Label>
              <Input
                id="invoice-files"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={onFileChange}
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
                          onClick={() => onRemoveFile(index)}
                          className="text-destructive hover:text-destructive/80 h-auto p-1"
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice-email">Email Address</Label>
              <Input
                id="invoice-email"
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="recipient@example.com"
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleReview}
                disabled={files.length === 0 || !email}
              >
                <IconEye className="h-4 w-4 mr-2" />
                Review & Send
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="space-y-4 overflow-y-auto flex-1 min-h-0 mb-4">
              {/* Invoice Summary at top */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Recipient</Label>
                  <p className="text-sm text-muted-foreground">
                    {contact?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Files</Label>
                  <p className="text-sm text-muted-foreground">
                    {files.length} file{files.length !== 1 ? "s" : ""}
                  </p>
                  <ul className="text-xs text-muted-foreground">
                    {files.map((file, index) => (
                      <li key={index}>• {file.name}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* PDF Preview below */}
              {pdfFiles.length > 0 && pdfUrl ? (
                <div className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">PDF Preview</Label>
                    {pdfFiles.length > 1 && (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handlePreviousPdf}
                          disabled={currentPdfIndex === 0}
                        >
                          <IconChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground min-w-[6rem] text-center">
                          {currentPdfIndex + 1} of {pdfFiles.length}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleNextPdf}
                          disabled={currentPdfIndex === pdfFiles.length - 1}
                        >
                          <IconChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="mb-2">
                    <p className="text-xs text-muted-foreground">
                      {pdfFiles[currentPdfIndex].name}
                    </p>
                  </div>
                  <div className="max-h-[75vh] overflow-hidden border rounded">
                    <iframe
                      src={pdfUrl}
                      className="w-full h-[75vh]"
                      title={`PDF Preview: ${pdfFiles[currentPdfIndex].name}`}
                    />
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-8 text-center bg-muted">
                  <IconFileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No PDF file selected for preview
                  </p>
                </div>
              )}
            </div>

            {/* Buttons at bottom */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToSelect}
              >
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSend}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Sending..." : "Confirm & Send Invoice"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
