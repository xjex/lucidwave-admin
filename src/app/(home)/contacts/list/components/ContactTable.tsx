"use client";

import {
  Mail,
  Phone,
  Building2,
  Calendar,
  Trash2,
  FileText,
  Receipt,
  Pencil,
  Inbox,
} from "lucide-react";
import { ContactListItem } from "@/services/contactsService";
import { formatDateTime } from "@/lib/date-utils";

interface ContactTableProps {
  contacts: ContactListItem[];
  loading: boolean;
  onSendInvoice: (contact: ContactListItem) => void;
  onSendReceipt: (contact: ContactListItem) => void;
  onEditContact: (contact: ContactListItem) => void;
  onDeleteContact: (contact: ContactListItem) => void;
}

export function ContactTable({
  contacts,
  loading,
  onSendInvoice,
  onSendReceipt,
  onEditContact,
  onDeleteContact,
}: ContactTableProps) {
  if (loading) {
    return (
      <div className="border border-[#241d18]/15 bg-[#fffaf1] px-5 py-12 text-center shadow-[10px_10px_0_#241d18]">
        <div className="mx-auto mb-4 size-8 border-2 border-[#241d18]/15 border-t-[#8b4a36] animate-spin" />
        <p className="font-mono text-xs uppercase text-[#6f665d]">
          Loading records…
        </p>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-[#241d18]/15 bg-[#fffaf1] px-5 py-16 shadow-[10px_10px_0_#241d18]">
        <Inbox className="mb-3 size-10 text-[#6f665d]/50" />
        <p className="font-mono text-xs uppercase text-[#6f665d]">
          No contacts found
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[#241d18]/15 bg-[#fffaf1] shadow-[10px_10px_0_#241d18]">
      {/* Header */}
      <div className="grid grid-cols-[1fr_1fr_140px_120px_160px_180px] items-center border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
        <span>Name</span>
        <span>Email</span>
        <span>Company</span>
        <span>Phone</span>
        <span>Added</span>
        <span className="text-right">Actions</span>
      </div>

      {/* Rows */}
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="grid grid-cols-[1fr_1fr_140px_120px_160px_180px] items-center border-b border-[#241d18]/10 px-5 py-4 transition-colors hover:bg-[#f4efe4]/60"
        >
          {/* Name */}
          <div className="truncate pr-4">
            <span
              className={`text-sm font-medium ${
                contact.id.startsWith("temp-")
                  ? "text-[#8b4a36]/60 italic"
                  : "text-[#241d18]"
              }`}
            >
              {contact.name}
              {contact.id.startsWith("temp-") && (
                <span className="ml-1 text-[10px] text-[#8b4a36]">(syncing…)</span>
              )}
            </span>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2 overflow-hidden pr-4">
            <Mail className="size-3.5 shrink-0 text-[#8b4a36]" />
            <span className="truncate font-mono text-sm text-[#574d43]">
              {contact.email}
            </span>
          </div>

          {/* Company */}
          <div className="flex items-center gap-2 overflow-hidden pr-4">
            <Building2 className="size-3.5 shrink-0 text-[#8b4a36]" />
            <span className="truncate text-sm text-[#574d43]">
              {contact.company || (
                <span className="text-[#9d9389]">—</span>
              )}
            </span>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-2 overflow-hidden pr-4">
            <Phone className="size-3.5 shrink-0 text-[#8b4a36]" />
            <span className="truncate font-mono text-sm text-[#574d43]">
              {contact.phone || (
                <span className="text-[#9d9389]">—</span>
              )}
            </span>
          </div>

          {/* Added */}
          <div className="flex items-center gap-2 text-sm text-[#6f665d]">
            <Calendar className="size-3.5 shrink-0" />
            {formatDateTime(contact.created_at)}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-1">
            {!contact.id.startsWith("temp-") && (
              <>
                <button
                  onClick={() => onEditContact(contact)}
                  className="grid size-8 place-items-center border border-[#241d18]/15 bg-white text-[#574d43] transition-colors hover:border-[#8b4a36] hover:text-[#8b4a36]"
                  title="Edit"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  onClick={() => onSendInvoice(contact)}
                  className="grid size-8 place-items-center border border-[#241d18]/15 bg-white text-[#574d43] transition-colors hover:border-[#8b4a36] hover:text-[#8b4a36]"
                  title="Send Invoice"
                >
                  <FileText className="size-3.5" />
                </button>
                <button
                  onClick={() => onSendReceipt(contact)}
                  className="grid size-8 place-items-center border border-[#241d18]/15 bg-white text-[#574d43] transition-colors hover:border-[#8b4a36] hover:text-[#8b4a36]"
                  title="Send Receipt"
                >
                  <Receipt className="size-3.5" />
                </button>
                <button
                  onClick={() => onDeleteContact(contact)}
                  className="grid size-8 place-items-center border border-[#241d18]/15 bg-white text-[#574d43] transition-colors hover:border-[#b73823] hover:bg-[#fff1e8] hover:text-[#b73823]"
                  title="Delete"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
