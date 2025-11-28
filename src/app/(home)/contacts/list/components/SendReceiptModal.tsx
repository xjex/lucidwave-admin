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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconReceipt,
  IconTrash,
  IconEye,
  IconArrowLeft,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { ContactListItem } from "@/services/contactsService";
import { toast } from "sonner";

interface SendReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (e?: React.FormEvent) => Promise<void>;
  contact: ContactListItem | null;
  files: File[];
  receiverName: string;
  receivedAmount: string;
  receiverEmail: string;
  currency: string;
  receivedVia: string;
  isLoading: boolean;
  message: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReceiverNameChange: (name: string) => void;
  onReceivedAmountChange: (amount: string) => void;
  onReceiverEmailChange: (email: string) => void;
  onCurrencyChange: (currency: string) => void;
  onReceivedViaChange: (receivedVia: string) => void;
  onRemoveFile: (index: number) => void;
  onClearMessage: () => void;
}

export function SendReceiptModal({
  isOpen,
  onClose,
  onSend,
  contact,
  files,
  receiverName,
  receivedAmount,
  receiverEmail,
  currency,
  receivedVia,
  isLoading,
  message,
  onFileChange,
  onReceiverNameChange,
  onReceivedAmountChange,
  onReceiverEmailChange,
  onCurrencyChange,
  onReceivedViaChange,
  onRemoveFile,
  onClearMessage,
}: SendReceiptModalProps) {
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
        toast.success("Receipt sent successfully!");
        onClose();
      } else {
        toast.error(message);
      }
      // Clear the message after showing toast to prevent duplicates
      onClearMessage();
    }
  }, [message, onClose, onClearMessage]);

  // Ensure default values for currency and receivedVia when modal opens
  useEffect(() => {
    if (isOpen) {
      if (!currency) {
        onCurrencyChange("PHP");
      }
      if (!receivedVia) {
        onReceivedViaChange("wise");
      }
    }
  }, [isOpen, currency, receivedVia, onCurrencyChange, onReceivedViaChange]);

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
            <IconReceipt className="h-5 w-5" />
            {currentStep === "select"
              ? "Send Receipt"
              : "Review & Confirm Receipt"}
          </DialogTitle>
          <DialogDescription>
            {currentStep === "select"
              ? `Send a receipt to ${contact?.name}`
              : `Review the receipt details before sending to ${contact?.name}`}
          </DialogDescription>
        </DialogHeader>

        {currentStep === "select" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receipt-files">Receipt Files</Label>
              <Input
                id="receipt-files"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receiver-name">Recipient name</Label>
                <Input
                  id="receiver-name"
                  type="text"
                  value={receiverName}
                  onChange={(e) => onReceiverNameChange(e.target.value)}
                  placeholder="Recipient full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiver-email">Recipient email</Label>
                <Input
                  id="receiver-email"
                  type="email"
                  value={receiverEmail}
                  onChange={(e) => onReceiverEmailChange(e.target.value)}
                  placeholder="recipient@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="received-amount">Amount received</Label>
                <Input
                  id="received-amount"
                  type="number"
                  value={receivedAmount}
                  onChange={(e) => onReceivedAmountChange(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={currency || "PHP"}
                  onValueChange={(value) => onCurrencyChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PHP">PHP</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Received via</Label>
              <Select
                value={receivedVia || "wise"}
                onValueChange={(value) => onReceivedViaChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wise">Wise</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank-transfer">Bank transfer</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleReview}
                disabled={
                  files.length === 0 ||
                  !receiverName ||
                  !receiverEmail ||
                  !receivedAmount ||
                  !currency ||
                  !receivedVia
                }
              >
                <IconEye className="h-4 w-4 mr-2" />
                Review & Send
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="space-y-4 overflow-y-auto flex-1 min-h-0 mb-4">
              {/* Receipt Summary at top */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Recipient</Label>
                  <p className="text-sm text-muted-foreground">
                    {receiverName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {receiverEmail}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Details</Label>
                  <p className="text-sm text-muted-foreground">
                    {currency} {receivedAmount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    via {receivedVia}
                  </p>
                </div>
                <div>
                  {/* Files Summary */}
                  <Label className="text-sm font-medium">
                    Files ({files.length})
                  </Label>
                  <ul className="text-xs text-muted-foreground mt-1">
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
                  <IconReceipt className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No PDF file selected for preview
                  </p>
                </div>
              )}
            </div>

            {/* Buttons at bottom */}
            <div className="flex gap-2 pt-4 border-t flex-shrink-0">
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
                {isLoading ? "Sending..." : "Confirm & Send Receipt"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
