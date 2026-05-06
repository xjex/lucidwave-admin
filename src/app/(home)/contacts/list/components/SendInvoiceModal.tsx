"use client";

import { useEffect, useState } from "react";
import { FileText, Trash2, Eye, ArrowLeft, ChevronLeft, ChevronRight, CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    if (pdfUrl) { URL.revokeObjectURL(pdfUrl); setPdfUrl(null); }
    setPdfFiles([]);
    setCurrentPdfIndex(0);
    onClose();
  };

  const handleReview = () => {
    const pdfs = files.filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (pdfs.length > 0) {
      setPdfFiles(pdfs);
      setCurrentPdfIndex(0);
      setPdfUrl(URL.createObjectURL(pdfs[0]));
    } else {
      setPdfFiles([]);
      setCurrentPdfIndex(0);
      setPdfUrl(null);
    }
    setCurrentStep("review");
  };

  const handleBackToSelect = () => {
    setCurrentStep("select");
    if (pdfUrl) { URL.revokeObjectURL(pdfUrl); setPdfUrl(null); }
    setPdfFiles([]);
    setCurrentPdfIndex(0);
  };

  const handlePreviousPdf = () => {
    if (currentPdfIndex > 0) {
      const newIndex = currentPdfIndex - 1;
      setCurrentPdfIndex(newIndex);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(URL.createObjectURL(pdfFiles[newIndex]));
    }
  };

  const handleNextPdf = () => {
    if (currentPdfIndex < pdfFiles.length - 1) {
      const newIndex = currentPdfIndex + 1;
      setCurrentPdfIndex(newIndex);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(URL.createObjectURL(pdfFiles[newIndex]));
    }
  };

  const handleSend = async () => {
    await onSend();
    setCurrentStep("select");
    if (pdfUrl) { URL.revokeObjectURL(pdfUrl); setPdfUrl(null); }
    setPdfFiles([]);
    setCurrentPdfIndex(0);
  };

  useEffect(() => {
    return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
  }, [pdfUrl]);

  useEffect(() => {
    if (message && message.trim() !== "") {
      if (message.includes("successfully")) {
        toast.success("Invoice sent successfully!");
        onClose();
      } else {
        toast.error(message);
      }
      onClearMessage();
    }
  }, [message, onClose, onClearMessage]);

  const isReview = currentStep === "review";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={
          isReview
            ? "!max-w-none w-[98vw] h-[96vh] flex flex-col rounded-none border-[#241d18]/20 bg-[#fffaf1] p-0 shadow-[14px_14px_0_#241d18]"
            : "max-w-md rounded-none border-[#241d18]/20 bg-[#fffaf1] p-0 shadow-[14px_14px_0_#241d18]"
        }
      >
        <DialogHeader className={`${isReview ? "border-b border-[#241d18]/15 bg-[#f4efe4] px-6 py-5" : "border-b border-[#241d18]/15 bg-[#f4efe4] px-6 py-5"}`}>
          <DialogTitle className="flex items-center gap-2 font-serif text-xl text-[#241d18]">
            <FileText className="size-5 text-[#8b4a36]" />
            {isReview ? "Review & Confirm Invoice" : "Send Invoice"}
          </DialogTitle>
        </DialogHeader>

        {currentStep === "select" ? (
          <form
            onSubmit={(e) => { e.preventDefault(); handleReview(); }}
            className="space-y-5 px-6 py-6"
          >
            <div className="space-y-2">
              <Label htmlFor="invoice-files" className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">
                Invoice Files
              </Label>
              <Input
                id="invoice-files"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={onFileChange}
                className="h-11 rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none file:text-[#574d43] focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20"
              />
              {files.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-[#f4efe4] px-3 py-2 text-sm"
                    >
                      <span className="text-[#241d18]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => onRemoveFile(index)}
                        className="text-[#574d43] transition-colors hover:text-[#b73823]"
                      >
                        <CircleX className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice-email" className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">
                Email Address
              </Label>
              <Input
                id="invoice-email"
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="recipient@example.com"
                required
                className="h-11 rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none placeholder:text-[#9d9389] focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="h-11 flex-1 rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] shadow-none hover:bg-[#f4efe4]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={files.length === 0 || !email}
                className="h-11 flex-1 rounded-none border border-[#241d18] bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none transition-transform hover:-translate-y-0.5 hover:bg-[#8b4a36] disabled:translate-y-0 disabled:opacity-50"
              >
                <Eye className="size-4 mr-2" />
                Review & Send
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-1 flex-col min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Summary */}
              <div className="mb-5 grid grid-cols-2 gap-4 border border-[#241d18]/10 bg-[#f4efe4] p-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">
                    Recipient
                  </p>
                  <p className="text-sm font-medium text-[#241d18]">{contact?.name}</p>
                  <p className="font-mono text-sm text-[#574d43]">{email}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">
                    Files ({files.length})
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {files.map((file, index) => (
                      <li key={index} className="text-xs text-[#574d43]">
                        • {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* PDF Preview */}
              {pdfFiles.length > 0 && pdfUrl ? (
                <div className="border border-[#241d18]/15 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                      PDF Preview
                    </span>
                    {pdfFiles.length > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePreviousPdf}
                          disabled={currentPdfIndex === 0}
                          className="grid size-8 place-items-center border border-[#241d18]/15 bg-white text-[#574d43] transition-colors hover:border-[#8b4a36] disabled:opacity-30"
                        >
                          <ChevronLeft className="size-4" />
                        </button>
                        <span className="min-w-[4rem] text-center font-mono text-xs text-[#6f665d]">
                          {currentPdfIndex + 1} / {pdfFiles.length}
                        </span>
                        <button
                          onClick={handleNextPdf}
                          disabled={currentPdfIndex === pdfFiles.length - 1}
                          className="grid size-8 place-items-center border border-[#241d18]/15 bg-white text-[#574d43] transition-colors hover:border-[#8b4a36] disabled:opacity-30"
                        >
                          <ChevronRight className="size-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="mb-3 text-xs text-[#6f665d]">
                    {pdfFiles[currentPdfIndex].name}
                  </p>
                  <div className="overflow-hidden border border-[#241d18]/10">
                    <iframe
                      src={pdfUrl}
                      className="w-full"
                      style={{ height: "70vh" }}
                      title={`PDF Preview: ${pdfFiles[currentPdfIndex].name}`}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center border border-[#241d18]/10 bg-[#f4efe4] p-12">
                  <FileText className="mb-3 size-12 text-[#6f665d]/50" />
                  <p className="font-mono text-xs uppercase text-[#6f665d]">
                    No PDF file selected for preview
                  </p>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2 border-t border-[#241d18]/15 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToSelect}
                className="h-11 rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] shadow-none hover:bg-[#f4efe4]"
              >
                <ArrowLeft className="size-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSend}
                disabled={isLoading}
                className="h-11 flex-1 rounded-none border border-[#241d18] bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none transition-transform hover:-translate-y-0.5 hover:bg-[#8b4a36] disabled:translate-y-0"
              >
                {isLoading ? "Sending…" : "Confirm & Send Invoice"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
