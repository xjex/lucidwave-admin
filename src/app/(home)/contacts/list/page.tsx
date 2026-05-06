"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  ContactListItem,
  ContactsListResponse,
} from "@/services/contactsService";
import { useInvoiceStore } from "@/stores/invoiceStore";
import { useReceiptStore } from "@/stores/receiptStore";
import {
  ContactListHeader,
  ContactTable,
  CreateContactModal,
  EditContactModal,
  DeleteContactModal,
  SendInvoiceModal,
  SendReceiptModal,
} from "./components";

export default function ContactListPage() {
  const [contacts, setContacts] = useState<ContactListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<ContactsListResponse["meta"] | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [contactToDelete, setContactToDelete] =
    useState<ContactListItem | null>(null);
  const [sendInvoiceModalOpen, setSendInvoiceModalOpen] = useState(false);
  const [sendReceiptModalOpen, setSendReceiptModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [actionContact, setActionContact] = useState<ContactListItem | null>(
    null
  );

  // Invoice store
  const {
    files: invoiceFiles,
    email: invoiceEmail,
    isLoading: invoiceLoading,
    message: invoiceMessage,
    addFiles: addInvoiceFiles,
    removeFile: removeInvoiceFile,
    setEmail: setInvoiceEmail,
    sendInvoices,
    clearMessage: clearInvoiceMessage,
    resetForm: resetInvoiceForm,
  } = useInvoiceStore();

  // Receipt store
  const {
    files: receiptFiles,
    receiverName,
    receivedAmount,
    receiverEmail,
    currency,
    receivedVia,
    isLoading: receiptLoading,
    message: receiptMessage,
    addFiles: addReceiptFiles,
    removeFile: removeReceiptFile,
    setReceiverName,
    setReceivedAmount,
    setReceiverEmail,
    setCurrency,
    setReceivedVia,
    sendReceipts,
    clearMessage: clearReceiptMessage,
    resetForm: resetReceiptForm,
  } = useReceiptStore();

  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
  });

  const [editContact, setEditContact] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
  });

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

  const handleCreateContact = async (e: React.FormEvent) => {
    e?.preventDefault();
    const optimisticContact: ContactListItem = {
      id: `temp-${Date.now()}`,
      name: newContact.name,
      email: newContact.email,
      company: newContact.company,
      phone: newContact.phone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setContacts((prev) => [optimisticContact, ...prev]);
    setCreateModalOpen(false);
    const contactData = { ...newContact };
    setNewContact({ name: "", email: "", company: "", phone: "" });
    try {
      const createdContact = await createContact(contactData);
      setContacts((prev) =>
        prev.map((c) => (c.id === optimisticContact.id ? createdContact : c))
      );
    } catch (err: any) {
      setContacts((prev) =>
        prev.filter((c) => c.id !== optimisticContact.id)
      );
      setError(err.response?.data?.message || "Failed to create contact");
      setCreateModalOpen(true);
    }
  };

  const handleDeleteContact = (contact: ContactListItem) => {
    setContactToDelete(contact);
    setDeleteConfirmOpen(true);
  };

  const handleSendInvoice = (contact: ContactListItem) => {
    setActionContact(contact);
    setInvoiceEmail(contact.email);
    resetInvoiceForm();
    setInvoiceEmail(contact.email);
    setSendInvoiceModalOpen(true);
  };

  const handleSendReceipt = (contact: ContactListItem) => {
    setActionContact(contact);
    setReceiverEmail(contact.email);
    resetReceiptForm();
    setReceiverEmail(contact.email);
    setSendReceiptModalOpen(true);
  };

  const handleEditContact = (contact: ContactListItem) => {
    setActionContact(contact);
    setEditContact({
      name: contact.name,
      email: contact.email,
      company: contact.company || "",
      phone: contact.phone || "",
    });
    setEditModalOpen(true);
  };

  const handleEditContactSubmit = async (e: React.FormEvent) => {
    e?.preventDefault();
    if (!actionContact) return;
    const previousContact = actionContact;
    setContacts((prev) =>
      prev.map((c) =>
        c.id === actionContact.id
          ? { ...c, ...editContact, updated_at: new Date().toISOString() }
          : c
      )
    );
    setEditModalOpen(false);
    try {
      await updateContact(actionContact.id, editContact);
    } catch (err: any) {
      setContacts((prev) =>
        prev.map((c) => (c.id === previousContact.id ? previousContact : c))
      );
      setError(err.response?.data?.message || "Failed to update contact");
      setEditModalOpen(true);
    }
  };

  const handleSendInvoiceSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await sendInvoices();
  };

  const handleSendReceiptSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await sendReceipts();
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;
    const contactToRemove = contactToDelete;
    setDeleteConfirmOpen(false);
    setContacts((prev) =>
      prev.filter((c) => c.id !== contactToRemove.id)
    );
    setContactToDelete(null);
    try {
      await deleteContact(contactToRemove.id);
    } catch (err: any) {
      setContacts((prev) =>
        [...prev, contactToRemove].sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        )
      );
      setError(err.response?.data?.message || "Failed to delete contact");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4efe4]">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 border-2 border-[#241d18]/15 border-t-[#8b4a36] animate-spin" />
          <p className="font-mono text-xs uppercase text-[#6f665d]">
            Loading contacts…
          </p>
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
            Contacts
          </div>
          <h1 className="font-serif text-5xl leading-[1.05] text-[#241d18]">
            Contact List
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#6f665d]">
            Manage your business contacts. Send invoices, receipts, or update
            details from one place.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <ContactListHeader
          onAddContact={() => setCreateModalOpen(true)}
          totalContacts={meta?.total}
        />

        {error && (
          <div className="mb-6 mt-6 flex items-start gap-3 border border-[#b73823] bg-[#fff1e8] px-4 py-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#7d2418]" />
            <p className="text-sm text-[#7d2418]">{error}</p>
          </div>
        )}

        <div className="mt-6">
          <ContactTable
            contacts={contacts}
            loading={loading}
            onSendInvoice={handleSendInvoice}
            onSendReceipt={handleSendReceipt}
            onEditContact={handleEditContact}
            onDeleteContact={handleDeleteContact}
          />
        </div>

        {meta && meta.pages > 1 && (
          <div className="mt-6 flex items-center justify-between border border-[#241d18]/15 bg-[#fffaf1] px-5 py-3 shadow-[6px_6px_0_#241d18]">
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

      <CreateContactModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateContact}
        formData={newContact}
        onChange={(field, value) =>
          setNewContact({ ...newContact, [field]: value })
        }
      />

      <EditContactModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditContactSubmit}
        contact={actionContact}
        formData={editContact}
        onChange={(field, value) =>
          setEditContact({ ...editContact, [field]: value })
        }
      />

      <DeleteContactModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        contact={contactToDelete}
      />

      <SendInvoiceModal
        isOpen={sendInvoiceModalOpen}
        onClose={() => setSendInvoiceModalOpen(false)}
        onSend={handleSendInvoiceSubmit}
        contact={actionContact}
        files={invoiceFiles}
        email={invoiceEmail}
        isLoading={invoiceLoading}
        message={invoiceMessage}
        onFileChange={(e) => {
          const selectedFiles = Array.from(e.target.files || []);
          addInvoiceFiles(selectedFiles);
          e.target.value = "";
        }}
        onEmailChange={setInvoiceEmail}
        onRemoveFile={removeInvoiceFile}
        onClearMessage={clearInvoiceMessage}
      />

      <SendReceiptModal
        isOpen={sendReceiptModalOpen}
        onClose={() => setSendReceiptModalOpen(false)}
        onSend={handleSendReceiptSubmit}
        contact={actionContact}
        files={receiptFiles}
        receiverName={receiverName}
        receivedAmount={receivedAmount}
        receiverEmail={receiverEmail}
        currency={currency}
        receivedVia={receivedVia}
        isLoading={receiptLoading}
        message={receiptMessage}
        onFileChange={(e) => {
          const selectedFiles = Array.from(e.target.files || []);
          addReceiptFiles(selectedFiles);
          e.target.value = "";
        }}
        onReceiverNameChange={setReceiverName}
        onReceivedAmountChange={setReceivedAmount}
        onReceiverEmailChange={setReceiverEmail}
        onCurrencyChange={setCurrency}
        onReceivedViaChange={setReceivedVia}
        onRemoveFile={removeReceiptFile}
        onClearMessage={clearReceiptMessage}
      />
    </div>
  );
}
