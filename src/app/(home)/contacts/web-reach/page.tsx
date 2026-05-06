"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Mail, Phone, Building2, MessageSquare, Calendar, User, Clock, Inbox, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getContacts,
  Contact,
  ContactsResponse,
} from "@/services/contactService";
import { formatDateTime, formatDateTimeWithSeconds } from "@/lib/date-utils";

const inquiryColors: Record<string, string> = {
  general: "border-[#8b4a36]/30 bg-[#8b4a36]/8 text-[#8b4a36]",
  support: "border-[#3d7a5c]/30 bg-[#3d7a5c]/8 text-[#3d7a5c]",
  sales: "border-[#d95c3f]/30 bg-[#d95c3f]/8 text-[#d95c3f]",
  partnership: "border-[#e0b84f]/30 bg-[#e0b84f]/8 text-[#8a6d1f]",
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<ContactsResponse["meta"] | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getContacts(page, 10);
      setContacts(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedContact(null);
  };

  const inquiryPill = (type: string) => {
    const style = inquiryColors[type] || inquiryColors.general;
    return (
      <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide ${style}`}>
        {type}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4efe4]">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 border-2 border-[#241d18]/15 border-t-[#8b4a36] animate-spin" />
          <p className="font-mono text-xs uppercase text-[#6f665d]">Loading contacts…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4efe4] text-[#241d18]">
      {/* Top header */}
      <div className="border-b border-[#241d18]/15 bg-[#fffaf1]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-2 flex w-fit items-center gap-2 border border-[#241d18]/15 bg-[#f4efe4] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            <span className="size-2 bg-[#d95c3f]" />
            Website Reach Out
          </div>
          <h1 className="font-serif text-5xl leading-[1.05] text-[#241d18]">
            Contact Submissions
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#6f665d]">
            Manage contact form submissions from your website. Click any row to
            view the full details.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Count */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
              Submissions
            </p>
            <p className="mt-1 text-sm text-[#574d43]">
              {meta
                ? `${meta.total} submission${meta.total !== 1 ? "s" : ""} total`
                : "Loading count…"}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 border border-[#b73823] bg-[#fff1e8] px-4 py-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#7d2418]" />
            <p className="text-sm text-[#7d2418]">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="border border-[#241d18]/15 bg-[#fffaf1] shadow-[10px_10px_0_#241d18]">
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_140px_120px_120px_1fr_140px] items-center border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            <span>Name</span>
            <span>Email</span>
            <span>Company</span>
            <span>Phone</span>
            <span>Inquiry</span>
            <span>Message</span>
            <span>Submitted</span>
          </div>

          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16">
              <Inbox className="mb-3 size-10 text-[#6f665d]/50" />
              <p className="font-mono text-xs uppercase text-[#6f665d]">No submissions yet</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleContactClick(contact)}
                className="grid w-full grid-cols-[1fr_1fr_140px_120px_120px_1fr_140px] items-center border-b border-[#241d18]/10 px-5 py-4 text-left transition-colors hover:bg-[#f4efe4]/60"
              >
                <div className="flex items-center gap-2 overflow-hidden pr-4">
                  <User className="size-3.5 shrink-0 text-[#8b4a36]" />
                  <span className="truncate text-sm font-medium text-[#241d18]">
                    {contact.attributes.firstname} {contact.attributes.lastname}
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-hidden pr-4">
                  <Mail className="size-3.5 shrink-0 text-[#8b4a36]" />
                  <span className="truncate font-mono text-sm text-[#574d43]">
                    {contact.attributes.email}
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-hidden pr-4">
                  <Building2 className="size-3.5 shrink-0 text-[#8b4a36]" />
                  <span className="truncate text-sm text-[#574d43]">
                    {contact.attributes.company || (<span className="text-[#9d9389]">—</span>)}
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-hidden pr-4">
                  <Phone className="size-3.5 shrink-0 text-[#8b4a36]" />
                  <span className="truncate font-mono text-sm text-[#574d43]">
                    {contact.attributes.phonenumber || (<span className="text-[#9d9389]">—</span>)}
                  </span>
                </div>
                <div className="pr-4">{inquiryPill(contact.attributes.inquiry_type)}</div>
                <div className="flex items-center gap-2 overflow-hidden pr-4">
                  <MessageSquare className="size-3.5 shrink-0 text-[#8b4a36]" />
                  <span
                    className="truncate text-sm text-[#574d43]"
                    title={contact.attributes.message}
                  >
                    {contact.attributes.message}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#6f665d]">
                  <Calendar className="size-3.5 shrink-0" />
                  {formatDateTime(contact.attributes.created_at)}
                </div>
              </button>
            ))
          )}

          {/* Pagination */}
          {meta && meta.pages > 1 && (
            <div className="flex items-center justify-between border-t border-[#241d18]/15 bg-[#f4efe4] px-5 py-3">
              <span className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                Page {meta.page} of {meta.pages} · {meta.total} total
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchContacts(meta.page - 1)}
                  disabled={meta.page <= 1}
                  className="rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] hover:bg-[#fffaf1]"
                >
                  <ArrowLeft className="size-3.5 mr-1" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchContacts(meta.page + 1)}
                  disabled={meta.page >= meta.pages}
                  className="rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] hover:bg-[#fffaf1]"
                >
                  Next
                  <ArrowRight className="size-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Details Modal */}
      <Dialog open={modalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl rounded-none border-[#241d18]/20 bg-[#fffaf1] p-0 shadow-[14px_14px_0_#241d18]">
          <DialogHeader className="border-b border-[#241d18]/15 bg-[#f4efe4] px-6 py-5">
            <DialogTitle className="flex items-center gap-2 font-serif text-xl text-[#241d18]">
              <User className="size-5 text-[#8b4a36]" />
              Contact Details
            </DialogTitle>
          </DialogHeader>

          {selectedContact && (
            <div className="px-6 py-6 space-y-6">
              {/* Info grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  {
                    icon: User,
                    label: "Name",
                    value: `${selectedContact.attributes.firstname} ${selectedContact.attributes.lastname}`,
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    value: selectedContact.attributes.email,
                  },
                  {
                    icon: Building2,
                    label: "Company",
                    value: selectedContact.attributes.company || "—",
                  },
                  {
                    icon: Phone,
                    label: "Phone",
                    value: selectedContact.attributes.phonenumber || "—",
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className="size-3.5 text-[#8b4a36]" />
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">
                        {label}
                      </span>
                    </div>
                    <p className="pl-5 text-sm font-medium text-[#241d18]">{value}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#241d18]/10 pt-5 space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-3.5 text-[#8b4a36]" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">
                    Inquiry Type
                  </span>
                </div>
                <div className="pl-5">
                  {inquiryPill(selectedContact.attributes.inquiry_type)}
                </div>
              </div>

              <div className="border-t border-[#241d18]/10 pt-5 space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-3.5 text-[#8b4a36]" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">
                    Message
                  </span>
                </div>
                <div className="ml-5 border border-[#241d18]/10 bg-[#f4efe4] p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#574d43]">
                    {selectedContact.attributes.message}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 border-t border-[#241d18]/10 pt-5 md:grid-cols-2">
                {[
                  {
                    icon: Clock,
                    label: "Created",
                    value: formatDateTimeWithSeconds(
                      selectedContact.attributes.created_at
                    ),
                  },
                  {
                    icon: Clock,
                    label: "Last Updated",
                    value: formatDateTimeWithSeconds(
                      selectedContact.attributes.updated_at
                    ),
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className="size-3.5 text-[#8b4a36]" />
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#6f665d]">
                        {label}
                      </span>
                    </div>
                    <p className="pl-5 font-mono text-sm text-[#574d43]">{value}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#241d18]/10 pt-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#9d9389]">
                  Contact ID: {selectedContact.id}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
