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
import { IconFileText, IconTrash } from "@tabler/icons-react";
import { ContactListItem } from "@/services/contactsService";
import { toast } from "sonner";

interface SendInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (e: React.FormEvent) => Promise<void>;
  contact: ContactListItem | null;
  files: File[];
  email: string;
  isLoading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmailChange: (email: string) => void;
  onRemoveFile: (index: number) => void;
}

export function SendInvoiceModal({
  isOpen,
  onClose,
  onSend,
  contact,
  files,
  email,
  isLoading,
  onFileChange,
  onEmailChange,
  onRemoveFile,
}: SendInvoiceModalProps) {
  const handleClose = () => {
    onClose();
  };

  const handleSend = async () => {
    try {
      await onSend({} as React.FormEvent);
      toast.success("Invoice sent successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to send invoice. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconFileText className="h-5 w-5" />
            Send Invoice
          </DialogTitle>
          <DialogDescription>
            Send an invoice to {contact?.name}
          </DialogDescription>
        </DialogHeader>

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
              onClick={handleSend}
              disabled={isLoading || files.length === 0 || !email}
            >
              {isLoading ? "Sending..." : "Send Invoice"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
