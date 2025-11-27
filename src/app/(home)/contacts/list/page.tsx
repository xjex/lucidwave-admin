"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  contactsService,
  ContactListItem,
  ContactsListResponse,
} from "@/services/contactsService";
import { useInvoiceStore } from "@/stores/invoiceStore";
import { useReceiptStore } from "@/stores/receiptStore";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/date-utils";
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

  // Invoice and Receipt store hooks
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

  // Form state for creating contacts
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
  });

  // Form state for editing contacts
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
      const response = await contactsService.getContacts(page, 10);
      setContacts(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();

    // Optimistic update - add contact immediately to UI
    const optimisticContact: ContactListItem = {
      id: `temp-${Date.now()}`, // Temporary ID
      name: newContact.name,
      email: newContact.email,
      company: newContact.company,
      phone: newContact.phone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add to contacts list immediately
    setContacts((prev) => [optimisticContact, ...prev]);
    setCreateModalOpen(false);
    const contactData = { ...newContact };
    setNewContact({ name: "", email: "", company: "", phone: "" });

    try {
      // Make API call
      const createdContact = await contactsService.createContact(contactData);

      // Replace optimistic contact with real one
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === optimisticContact.id ? createdContact : contact
        )
      );
    } catch (err: any) {
      // Remove optimistic contact on error
      setContacts((prev) =>
        prev.filter((contact) => contact.id !== optimisticContact.id)
      );
      setError(err.response?.data?.message || "Failed to create contact");
      setCreateModalOpen(true); // Re-open modal so user can try again
    }
  };

  const handleDeleteContact = async (contact: ContactListItem) => {
    setContactToDelete(contact);
    setDeleteConfirmOpen(true);
  };

  const handleSendInvoice = (contact: ContactListItem) => {
    setActionContact(contact);
    setInvoiceEmail(contact.email); // Pre-populate email from contact
    resetInvoiceForm(); // Reset form but keep the email we just set
    setInvoiceEmail(contact.email);
    setSendInvoiceModalOpen(true);
  };

  const handleSendReceipt = (contact: ContactListItem) => {
    setActionContact(contact);
    setReceiverEmail(contact.email); // Pre-populate email from contact
    setReceiverName(contact.name); // Pre-populate name from contact
    resetReceiptForm(); // Reset form but keep the data we just set
    setReceiverEmail(contact.email);
    setReceiverName(contact.name);
    setSendReceiptModalOpen(true);
  };

  const handleEditContact = (contact: ContactListItem) => {
    setActionContact(contact);
    setEditContact({
      name: contact.name,
      email: contact.email,
      company: contact.company,
      phone: contact.phone,
    });
    setEditModalOpen(true);
  };

  const handleSendInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendInvoices();
  };

  const handleSendReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendReceipts();
  };

  const handleEditContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionContact) return;

    try {
      // Make API call to update contact
      const response = await contactsService.updateContact(
        actionContact.id,
        editContact
      );

      // Update contact in local state
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === actionContact.id
            ? {
                ...contact,
                ...editContact,
                updated_at: new Date().toISOString(),
              }
            : contact
        )
      );

      setEditModalOpen(false);
      setActionContact(null);
      toast.success("Contact updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update contact");
    }
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;

    const contactToRemove = contactToDelete;
    setDeleteConfirmOpen(false);

    // Optimistic update - remove contact immediately from UI
    setContacts((prev) =>
      prev.filter((contact) => contact.id !== contactToRemove.id)
    );
    setContactToDelete(null);

    try {
      // Make API call
      await contactsService.deleteContact(contactToRemove.id);
    } catch (err: any) {
      // Add contact back on error
      setContacts((prev) =>
        [...prev, contactToRemove].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
      setError(err.response?.data?.message || "Failed to delete contact");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading contacts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <ContactListHeader
        onAddContact={() => setCreateModalOpen(true)}
        totalContacts={meta?.total}
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ContactTable
        contacts={contacts}
        loading={loading}
        onSendInvoice={handleSendInvoice}
        onSendReceipt={handleSendReceipt}
        onEditContact={handleEditContact}
        onDeleteContact={handleDeleteContact}
      />

      {meta && meta.pages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.pages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchContacts(meta.page - 1)}
              disabled={meta.page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchContacts(meta.page + 1)}
              disabled={meta.page >= meta.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

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
        onFileChange={(e) => {
          const selectedFiles = Array.from(e.target.files || []);
          addInvoiceFiles(selectedFiles);
          e.target.value = "";
        }}
        onEmailChange={setInvoiceEmail}
        onRemoveFile={removeInvoiceFile}
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
      />
    </div>
  );
}
