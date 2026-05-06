"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
      <DialogContent className="max-w-md rounded-none border-[#241d18]/20 bg-[#fffaf1] p-0 shadow-[14px_14px_0_#241d18]">
        <DialogHeader className="border-b border-[#241d18]/15 bg-[#f4efe4] px-6 py-5">
          <DialogTitle className="flex items-center gap-2 font-serif text-xl text-[#241d18]">
            <Plus className="size-5 text-[#8b4a36]" />
            Add New Contact
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5 px-6 py-6">
          {[
            { id: "contact-name", label: "Full Name", type: "text", field: "name", placeholder: "John Doe" },
            { id: "contact-email", label: "Email Address", type: "email", field: "email", placeholder: "john@company.com" },
            { id: "contact-company", label: "Company", type: "text", field: "company", placeholder: "Acme Inc." },
            { id: "contact-phone", label: "Phone Number", type: "text", field: "phone", placeholder: "+1-555-0123" },
          ].map(({ id, label, type, field, placeholder }) => (
            <div key={id} className="space-y-2">
              <Label
                htmlFor={id}
                className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]"
              >
                {label}
              </Label>
              <Input
                id={id}
                type={type}
                value={formData[field as keyof typeof formData]}
                onChange={(e) => onChange(field, e.target.value)}
                placeholder={placeholder}
                required
                className="h-11 rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none placeholder:text-[#9d9389] focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20"
              />
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 flex-1 rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] shadow-none hover:bg-[#f4efe4]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 flex-1 rounded-none border border-[#241d18] bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none transition-transform hover:-translate-y-0.5 hover:bg-[#8b4a36]"
            >
              Create Contact
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
