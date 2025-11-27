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
import { IconReceipt, IconTrash } from "@tabler/icons-react";
import { ContactListItem } from "@/services/contactsService";
import { toast } from "sonner";

interface SendReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (e: React.FormEvent) => Promise<void>;
  contact: ContactListItem | null;
  files: File[];
  receiverName: string;
  receivedAmount: string;
  receiverEmail: string;
  currency: string;
  receivedVia: string;
  isLoading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReceiverNameChange: (name: string) => void;
  onReceivedAmountChange: (amount: string) => void;
  onReceiverEmailChange: (email: string) => void;
  onCurrencyChange: (currency: string) => void;
  onReceivedViaChange: (receivedVia: string) => void;
  onRemoveFile: (index: number) => void;
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
  onFileChange,
  onReceiverNameChange,
  onReceivedAmountChange,
  onReceiverEmailChange,
  onCurrencyChange,
  onReceivedViaChange,
  onRemoveFile,
}: SendReceiptModalProps) {
  const handleClose = () => {
    onClose();
  };

  const handleSend = async () => {
    try {
      await onSend({} as React.FormEvent);
      toast.success("Receipt sent successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to send receipt. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconReceipt className="h-5 w-5" />
            Send Receipt
          </DialogTitle>
          <DialogDescription>
            Send a receipt to {contact?.name}
          </DialogDescription>
        </DialogHeader>

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

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="receiverName">Full Name</Label>
              <Input
                id="receiverName"
                type="text"
                value={receiverName}
                onChange={(e) => onReceiverNameChange(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiverEmail">Email Address</Label>
              <Input
                id="receiverEmail"
                type="email"
                value={receiverEmail}
                onChange={(e) => onReceiverEmailChange(e.target.value)}
                placeholder="john.doe@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="receivedAmount">Amount Received</Label>
              <Input
                id="receivedAmount"
                type="number"
                step="0.01"
                value={receivedAmount}
                onChange={(e) => onReceivedAmountChange(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={onCurrencyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PHP">PHP</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receivedVia">Payment Method</Label>
            <Select value={receivedVia} onValueChange={onReceivedViaChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Wise">Wise</SelectItem>
                <SelectItem value="PayPal">PayPal</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={
                isLoading ||
                files.length === 0 ||
                !receiverName ||
                !receivedAmount ||
                !receiverEmail ||
                !receivedVia
              }
            >
              {isLoading ? "Sending..." : "Send Receipt"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
