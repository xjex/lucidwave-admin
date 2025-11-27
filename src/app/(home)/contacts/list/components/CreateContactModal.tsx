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
import { IconPlus } from "@tabler/icons-react";

interface CreateContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    name: string;
    email: string;
    company: string;
    phone: string;
  };
  onChange: (field: string, value: string) => void;
}

export function CreateContactModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onChange,
}: CreateContactModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconPlus className="h-5 w-5" />
            Add New Contact
          </DialogTitle>
          <DialogDescription>Create a new business contact</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-name">Full Name</Label>
            <Input
              id="contact-name"
              value={formData.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email">Email Address</Label>
            <Input
              id="contact-email"
              type="email"
              value={formData.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="john.doe@company.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-company">Company</Label>
            <Input
              id="contact-company"
              value={formData.company}
              onChange={(e) => onChange("company", e.target.value)}
              placeholder="Company Name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-phone">Phone Number</Label>
            <Input
              id="contact-phone"
              value={formData.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder="+1-555-0123"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Contact</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
