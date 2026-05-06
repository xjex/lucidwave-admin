"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactListHeaderProps {
  onAddContact: () => void;
  totalContacts?: number;
}

export function ContactListHeader({
  onAddContact,
  totalContacts,
}: ContactListHeaderProps) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
          Business Contacts
        </p>
        <p className="mt-1 text-sm text-[#574d43]">
          {totalContacts !== undefined
            ? `${totalContacts} contact${totalContacts !== 1 ? "s" : ""} on record`
            : "Loading count…"}
        </p>
      </div>
      <Button
        onClick={onAddContact}
        className="h-11 rounded-none border border-[#241d18] bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none transition-transform hover:-translate-y-0.5 hover:bg-[#8b4a36]"
      >
        <Plus className="size-4 mr-2" />
        Add Contact
      </Button>
    </div>
  );
}
