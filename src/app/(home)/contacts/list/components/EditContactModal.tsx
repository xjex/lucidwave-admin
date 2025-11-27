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
import { IconEdit } from "@tabler/icons-react";
import { ContactListItem } from "@/services/contactsService";

interface EditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  contact: ContactListItem | null;
  formData: {
    name: string;
    email: string;
    company: string;
    phone: string;
  };
  onChange: (field: string, value: string) => void;
  isLoading?: boolean;
}

export function EditContactModal({
  isOpen,
  onClose,
  onSubmit,
  contact,
  formData,
  onChange,
  isLoading = false,
}: EditContactModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconEdit className="h-5 w-5" />
            Edit Contact
          </DialogTitle>
          <DialogDescription>
            Update contact information for {contact?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-contact-name">Full Name</Label>
            <Input
              id="edit-contact-name"
              value={formData.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-contact-email">Email Address</Label>
            <Input
              id="edit-contact-email"
              type="email"
              value={formData.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="john.doe@company.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-contact-company">Company</Label>
            <Input
              id="edit-contact-company"
              value={formData.company}
              onChange={(e) => onChange("company", e.target.value)}
              placeholder="Company Name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-contact-phone">Phone Number</Label>
            <Input
              id="edit-contact-phone"
              value={formData.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder="+1-555-0123"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Contact"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
