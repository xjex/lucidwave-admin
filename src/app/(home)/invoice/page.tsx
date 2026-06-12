"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCircleX,
  IconFileInvoice,
  IconInbox,
  IconMail,
  IconPlus,
  IconUpload,
  IconUser,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InvoiceForm } from "@/components/InvoiceForm";
import { InvoicePreview } from "@/components/InvoicePreview";
import { Invoice, InvoiceFormData } from "@/types/invoice";
import { sendInvoices as sendInvoicesService } from "@/services/invoiceService";
import {
  getContacts,
  ContactListItem,
} from "@/services/contactsService";
import {
  getMailingHistory,
  MailingHistoryItem,
  MailingHistoryResponse,
} from "@/services/mailingHistoryService";
import { useInvoiceStore } from "@/stores/invoiceStore";
import { SendInvoiceModal } from "@/app/(home)/contacts/list/components/SendInvoiceModal";
import { formatDateTime } from "@/lib/date-utils";
import { toast } from "sonner";
import {
  InvoiceSettings,
  getInvoiceLogoViewUrl,
  listInvoiceProfiles,
} from "@/services/settingsService";

type InvoiceMode = "upload" | "generate";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const data = error.response.data as { message?: string; error?: string };
    return data.message || data.error || fallback;
  }

  return error instanceof Error ? error.message : fallback;
};

const buildInitialInvoiceData = (
  contact: ContactListItem | null
): Partial<InvoiceFormData> => ({
  fromName: "Lucid Wave Studios",
  fromEmail: "no-reply@lucidwavestudios.com",
  fromAddress: "Lucid Wave Studios",
  projectName: contact?.company || "",
  toName: contact?.name || "",
  toEmail: contact?.email || "",
  toPhone: contact?.phone || "",
  toAddress: contact?.company || contact?.email || "",
  notes: "Thank you for your business.",
});

export default function InvoicePage() {
  const [mode, setMode] = useState<InvoiceMode>("upload");
  const [contacts, setContacts] = useState<ContactListItem[]>([]);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceFormData | null>(null);
  const [sentInvoices, setSentInvoices] = useState<MailingHistoryItem[]>([]);
  const [invoiceMeta, setInvoiceMeta] =
    useState<MailingHistoryResponse["meta"] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [invoiceSettings, setInvoiceSettings] =
    useState<InvoiceSettings | null>(null);
  const [invoiceProfiles, setInvoiceProfiles] = useState<InvoiceSettings[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState("");

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

  const selectedContact = useMemo(
    () => contacts.find((contact) => contact.id === selectedContactId) || null,
    [contacts, selectedContactId]
  );

  const fetchContacts = useCallback(async () => {
    try {
      setContactsLoading(true);
      setContactsError(null);
      const response = await getContacts(1, 100);
      setContacts(response.data);
    } catch (err) {
      setContactsError(getErrorMessage(err, "Failed to load contacts"));
    } finally {
      setContactsLoading(false);
    }
  }, []);

  const fetchSentInvoices = useCallback(async (page: number = 1) => {
    try {
      setHistoryLoading(true);
      setHistoryError(null);
      const response = await getMailingHistory(page, 8, { type: "invoice" });
      setSentInvoices(response.data);
      setInvoiceMeta(response.meta);
    } catch (err) {
      setHistoryError(getErrorMessage(err, "Failed to load sent invoices"));
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const refreshInvoiceProfiles = useCallback(
    async (preferredProfileId?: string) => {
      const profiles = await listInvoiceProfiles();
      setInvoiceProfiles(profiles);
      const nextProfile =
        profiles.find((profile) => profile.id === preferredProfileId) ||
        profiles.find((profile) => profile.id === selectedProfileId) ||
        profiles.find((profile) => profile.is_default) ||
        profiles[0] ||
        null;

      setInvoiceSettings(nextProfile);
      setSelectedProfileId(nextProfile?.id || "");
      return nextProfile;
    },
    [selectedProfileId]
  );

  useEffect(() => {
    fetchContacts();
    fetchSentInvoices();
    refreshInvoiceProfiles().catch((err) => {
      console.warn("Failed to load invoice profiles:", err);
    });
  }, [fetchContacts, fetchSentInvoices, refreshInvoiceProfiles]);

  const handleProfileChange = (profileId: string) => {
    setSelectedProfileId(profileId);
    setInvoiceSettings(
      invoiceProfiles.find((profile) => profile.id === profileId) || null
    );
  };

  const selectedPdfSettings = useMemo(
    () =>
      invoiceSettings
        ? {
            ...invoiceSettings,
            company_logo_view_url: getInvoiceLogoViewUrl(invoiceSettings.id),
          }
        : null,
    [invoiceSettings]
  );

  useEffect(() => {
    if (!selectedContact) return;
    resetInvoiceForm();
    setInvoiceEmail(selectedContact.email);
    setInvoiceData(null);
    setShowPreview(false);
  }, [resetInvoiceForm, selectedContact, setInvoiceEmail]);

  const openUploadFlow = () => {
    if (!selectedContact) {
      toast.error("Select a client first.");
      return;
    }
    resetInvoiceForm();
    setInvoiceEmail(selectedContact.email);
    setUploadModalOpen(true);
  };

  const handleUploadSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await sendInvoices();
    await fetchSentInvoices(1);
  };

  const handleCreateInvoice = async (formData: InvoiceFormData) => {
    try {
      await refreshInvoiceProfiles(selectedProfileId);
    } catch (err) {
      console.warn("Failed to refresh invoice profile before preview:", err);
    }
    setInvoiceData(formData);
    setShowPreview(true);
  };

  const handleSendCreatedInvoice = async (invoice: Invoice, pdfBlob: Blob) => {
    try {
      const pdfFile = new File(
        [pdfBlob],
        `invoice-${invoice.invoiceNumber}.pdf`,
        { type: "application/pdf" }
      );
      const result = await sendInvoicesService([pdfFile], invoice.to.email);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(`Invoice sent to ${invoice.to.email}.`);
      await fetchSentInvoices(1);
      setShowPreview(false);
      setInvoiceData(null);
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast.error("Failed to send invoice. Please try again.");
    }
  };

  const invoiceFormInitialData = useMemo(
    () => buildInitialInvoiceData(selectedContact),
    [selectedContact]
  );

  const selectedPdfSettingsKey = useMemo(
    () =>
      JSON.stringify({
        id: selectedPdfSettings?.id,
        updated_at: selectedPdfSettings?.updated_at,
        template_layout: selectedPdfSettings?.template_layout,
      }),
    [selectedPdfSettings]
  );

  return (
    <div className="min-h-screen bg-[#f4efe4] text-[#241d18]">
      <div className="border-b border-[#241d18]/15 bg-[#fffaf1]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-2 flex w-fit items-center gap-2 border border-[#241d18]/15 bg-[#f4efe4] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            <span className="size-2 bg-[#d95c3f]" />
            Invoices
          </div>
          <h1 className="font-serif text-5xl leading-[1.05]">
            Send Client Invoices
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#6f665d]">
            Start with a contact, then upload an invoice file or generate a new
            PDF for that client.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {(contactsError || historyError) && (
          <div className="mb-6 flex items-start gap-3 border border-[#b73823] bg-[#fff1e8] px-4 py-3">
            <IconCircleX className="mt-0.5 h-4 w-4 shrink-0 text-[#7d2418]" />
            <p className="text-sm text-[#7d2418]">
              {contactsError || historyError}
            </p>
          </div>
        )}

        <section className="mb-8 border border-[#241d18]/15 bg-[#fffaf1] p-5 shadow-[8px_8px_0_#241d18]">
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr_1fr] lg:items-end">
            <div className="space-y-2">
              <Label className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">
                1. Select Client
              </Label>
              <Select
                value={selectedContactId}
                onValueChange={setSelectedContactId}
                disabled={contactsLoading}
              >
                <SelectTrigger className="h-11 rounded-none border-[#241d18]/20 bg-white shadow-none">
                  <SelectValue
                    placeholder={
                      contactsLoading ? "Loading contacts" : "Choose a contact"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name} · {contact.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">
                2. Select Invoice Profile
              </Label>
              <Select
                value={selectedProfileId}
                onValueChange={handleProfileChange}
                disabled={invoiceProfiles.length === 0}
              >
                <SelectTrigger className="h-11 rounded-none border-[#241d18]/20 bg-white shadow-none">
                  <SelectValue placeholder="Choose a profile" />
                </SelectTrigger>
                <SelectContent>
                  {invoiceProfiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id || ""}>
                      {profile.name}
                      {profile.is_default ? " · default" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                disabled={!selectedContact}
                onClick={() => setMode("upload")}
                className={`h-11 rounded-none border font-mono text-[11px] uppercase tracking-wide shadow-none ${
                  mode === "upload"
                    ? "border-[#241d18] bg-[#241d18] text-[#fffaf1] hover:bg-[#8b4a36]"
                    : "border-[#241d18]/20 bg-white text-[#574d43] hover:bg-[#f4efe4]"
                }`}
              >
                <IconUpload className="mr-2 h-4 w-4" />
                Upload
              </Button>
              <Button
                type="button"
                disabled={!selectedContact}
                onClick={() => setMode("generate")}
                className={`h-11 rounded-none border font-mono text-[11px] uppercase tracking-wide shadow-none ${
                  mode === "generate"
                    ? "border-[#241d18] bg-[#241d18] text-[#fffaf1] hover:bg-[#8b4a36]"
                    : "border-[#241d18]/20 bg-white text-[#574d43] hover:bg-[#f4efe4]"
                }`}
              >
                <IconPlus className="mr-2 h-4 w-4" />
                Generate
              </Button>
            </div>
          </div>

          {selectedContact ? (
            <div className="mt-5 grid gap-3 border border-[#241d18]/10 bg-[#f4efe4] p-4 sm:grid-cols-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                  Client
                </p>
                <p className="mt-1 font-medium">{selectedContact.name}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                  Email
                </p>
                <p className="mt-1 font-mono text-sm">
                  {selectedContact.email}
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                  Company
                </p>
                <p className="mt-1">{selectedContact.company || "None"}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                  Profile
                </p>
                <p className="mt-1">{invoiceSettings?.name || "None"}</p>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex items-center gap-2 border border-[#241d18]/10 bg-[#f4efe4] px-4 py-3 text-sm text-[#6f665d]">
              <IconUser className="h-4 w-4 text-[#8b4a36]" />
              Select a contact to unlock invoice upload and generation.
            </div>
          )}
        </section>

        {showPreview && invoiceData ? (
          <InvoicePreview
            key={`${invoiceData.invoiceNumber}-${selectedPdfSettingsKey}`}
            invoiceData={invoiceData}
            settings={selectedPdfSettings}
            onEdit={() => setShowPreview(false)}
            onSend={handleSendCreatedInvoice}
            onBack={() => {
              setShowPreview(false);
              setInvoiceData(null);
            }}
          />
        ) : (
          selectedContact && (
            <section className="mb-10">
              {mode === "upload" ? (
                <div className="border border-[#241d18]/15 bg-[#fffaf1] p-6 shadow-[8px_8px_0_#241d18]">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                        2. Upload Existing Invoice
                      </p>
                      <h2 className="mt-1 font-serif text-3xl">
                        Review files before sending
                      </h2>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-[#6f665d]">
                        This opens the same upload and PDF review flow used from
                        the Contacts list.
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={openUploadFlow}
                      className="h-11 rounded-none border border-[#241d18] bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none hover:bg-[#8b4a36]"
                    >
                      <IconUpload className="mr-2 h-4 w-4" />
                      Upload Invoice
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-5 border border-[#241d18]/15 bg-[#fffaf1] p-5 shadow-[8px_8px_0_#241d18]">
                    <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                      2. Generate Invoice
                    </p>
                    <h2 className="mt-1 font-serif text-3xl">
                      Build a PDF for {selectedContact.name}
                    </h2>
                  </div>
                  <InvoiceForm
                    key={selectedContact.id}
                    initialData={invoiceFormInitialData}
                    onGenerate={handleCreateInvoice}
                  />
                </div>
              )}
            </section>
          )
        )}

        {!showPreview && (
          <section className="border border-[#241d18]/15 bg-[#fffaf1] shadow-[10px_10px_0_#241d18]">
            <div className="border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                    Sent Invoices
                  </p>
                  <h2 className="mt-1 font-serif text-3xl">Invoice History</h2>
                </div>
                <span className="border border-[#241d18]/15 bg-white px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                  {invoiceMeta?.total || 0} total
                </span>
              </div>
            </div>

            <div className="hidden grid-cols-[1.2fr_1fr_140px_160px_110px] items-center border-b border-[#241d18]/15 bg-[#f4efe4]/70 px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-[#6f665d] md:grid">
              <span>Recipient</span>
              <span>Subject</span>
              <span>Files</span>
              <span>Sent By</span>
              <span className="text-right">Sent At</span>
            </div>

            {historyLoading ? (
              <div className="px-5 py-12 text-center">
                <div className="mx-auto mb-4 size-8 animate-spin border-2 border-[#241d18]/15 border-t-[#8b4a36]" />
                <p className="font-mono text-xs uppercase text-[#6f665d]">
                  Loading invoices
                </p>
              </div>
            ) : sentInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-16">
                <IconInbox className="mb-3 h-10 w-10 text-[#6f665d]/50" />
                <p className="font-mono text-xs uppercase text-[#6f665d]">
                  No sent invoices found
                </p>
              </div>
            ) : (
              sentInvoices.map((item) => (
                <div
                  key={item.id}
                  className="border-b border-[#241d18]/10 px-5 py-4 transition-colors hover:bg-[#f4efe4]/60 md:grid md:grid-cols-[1.2fr_1fr_140px_160px_110px] md:items-center md:gap-4"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <IconMail className="h-4 w-4 shrink-0 text-[#8b4a36]" />
                    <span className="truncate font-mono text-sm">
                      {item.attributes.sent_to}
                    </span>
                  </div>
                  <div
                    className="mt-2 truncate text-sm text-[#574d43] md:mt-0"
                    title={item.attributes.metadata.subject}
                  >
                    {item.attributes.metadata.subject || "Invoice"}
                  </div>
                  <div className="mt-2 flex items-center gap-2 font-mono text-sm text-[#574d43] md:mt-0">
                    <IconFileInvoice className="h-4 w-4 text-[#8b4a36]" />
                    {item.attributes.files.length} file
                    {item.attributes.files.length === 1 ? "" : "s"}
                  </div>
                  <div className="mt-2 flex items-center gap-2 overflow-hidden md:mt-0">
                    <IconUser className="h-4 w-4 shrink-0 text-[#8b4a36]" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.attributes.sender.username}
                      </p>
                      <p className="truncate font-mono text-[11px] text-[#6f665d]">
                        {item.attributes.sender.email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-left text-sm text-[#6f665d] md:mt-0 md:text-right">
                    {formatDateTime(item.attributes.timestamp)}
                  </div>
                </div>
              ))
            )}

            {invoiceMeta && invoiceMeta.pages > 1 && (
              <div className="flex items-center justify-between border-t border-[#241d18]/15 bg-[#f4efe4] px-5 py-3">
                <span className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                  Page {invoiceMeta.page} of {invoiceMeta.pages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchSentInvoices(invoiceMeta.page - 1)}
                    disabled={invoiceMeta.page <= 1 || historyLoading}
                    className="rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] hover:bg-[#fffaf1]"
                  >
                    <IconArrowLeft className="mr-1 h-3.5 w-3.5" />
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchSentInvoices(invoiceMeta.page + 1)}
                    disabled={
                      invoiceMeta.page >= invoiceMeta.pages || historyLoading
                    }
                    className="rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] hover:bg-[#fffaf1]"
                  >
                    Next
                    <IconArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      <SendInvoiceModal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          fetchSentInvoices(1);
        }}
        onSend={handleUploadSend}
        contact={selectedContact}
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
    </div>
  );
}
