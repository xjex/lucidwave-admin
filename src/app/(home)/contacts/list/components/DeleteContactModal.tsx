"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContactListItem } from "@/services/contactsService";

interface DeleteContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contact: ContactListItem | null;
}

export function DeleteContactModal({
  isOpen,
  onClose,
  onConfirm,
  contact,
}: DeleteContactModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-none border-[#b73823]/30 bg-[#fffaf1] p-0 shadow-[14px_14px_0_#b73823]">
        <DialogHeader className="border-b border-[#b73823]/15 bg-[#fff1e8] px-6 py-5">
          <DialogTitle className="flex items-center gap-2 font-serif text-xl text-[#7d2418]">
            <Trash2 className="size-5 text-[#b73823]" />
            Delete Contact
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5">
          <p className="text-sm leading-6 text-[#574d43]">
            Are you sure you want to delete this contact? This action cannot be
            undone.
          </p>

          {contact && (
            <div className="mt-4 border border-[#241d18]/10 bg-[#f4efe4] p-4">
              <p className="font-medium text-[#241d18]">{contact.name}</p>
              <p className="font-mono text-sm text-[#6f665d]">{contact.email}</p>
              {contact.company && (
                <p className="text-sm text-[#6f665d]">{contact.company}</p>
              )}
            </div>
          )}

          <div className="mt-5 flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-11 flex-1 rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] shadow-none hover:bg-[#f4efe4]"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="h-11 flex-1 rounded-none border border-[#b73823] bg-[#b73823] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none transition-transform hover:-translate-y-0.5 hover:bg-[#7d2418]"
            >
              Delete Contact
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
