"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  DataTable,
  TableColumn,
  TableAction,
} from "@/components/ui/data-table";
import {
  getContacts,
  Contact,
  ContactsResponse,
} from "@/services/contactService";
import {
  IconMail,
  IconPhone,
  IconBuilding,
  IconMessage,
  IconCalendar,
  IconUser,
  IconClock,
} from "@tabler/icons-react";
import { formatDateTime, formatDateTimeWithSeconds } from "@/lib/date-utils";

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

  // Define table columns for website contacts
  const columns: TableColumn<Contact>[] = [
    {
      key: "attributes.firstname",
      header: "Name",
      render: (_, contact) =>
        `${contact.attributes.firstname} ${contact.attributes.lastname}`,
    },
    {
      key: "attributes.email",
      header: "Email",
      render: (value) => (
        <div className="flex items-center gap-2">
          <IconMail className="h-4 w-4 text-muted-foreground" />
          {value}
        </div>
      ),
    },
    {
      key: "attributes.company",
      header: "Company",
      render: (value) => (
        <div className="flex items-center gap-2">
          <IconBuilding className="h-4 w-4 text-muted-foreground" />
          {value}
        </div>
      ),
    },
    {
      key: "attributes.phonenumber",
      header: "Phone",
      render: (value) => (
        <div className="flex items-center gap-2">
          <IconPhone className="h-4 w-4 text-muted-foreground" />
          {value}
        </div>
      ),
    },
    {
      key: "attributes.inquiry_type",
      header: "Inquiry Type",
      render: (value) => <Badge variant="outline">{value}</Badge>,
    },
    {
      key: "attributes.message",
      header: "Message",
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          <div className="flex items-center gap-2">
            <IconMessage className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{value}</span>
          </div>
        </div>
      ),
    },
    {
      key: "attributes.created_at",
      header: "Submitted",
      render: (value) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconCalendar className="h-4 w-4" />
          {formatDateTime(value)}
        </div>
      ),
    },
  ];

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedContact(null);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Website Contacts</h1>
          <p className="text-muted-foreground">
            Manage contact form submissions from your website
          </p>
        </div>
        {meta && (
          <div className="text-sm text-muted-foreground">
            Showing {contacts.length} of {meta.total} contacts
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Contact Submissions</CardTitle>
          <CardDescription>
            View and manage all contact form submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={contacts}
            columns={columns}
            loading={false}
            emptyMessage="No contact submissions found"
            onRowClick={handleContactClick}
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
        </CardContent>
      </Card>

      {/* Contact Details Modal */}
      <Dialog open={modalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconUser className="h-5 w-5" />
              Contact Details
            </DialogTitle>
            <DialogDescription>
              Full information about the contact submission
            </DialogDescription>
          </DialogHeader>

          {selectedContact && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IconUser className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Name</span>
                  </div>
                  <p className="text-sm pl-6">
                    {selectedContact.attributes.firstname}{" "}
                    {selectedContact.attributes.lastname}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IconMail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email</span>
                  </div>
                  <p className="text-sm pl-6">
                    {selectedContact.attributes.email}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IconBuilding className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Company</span>
                  </div>
                  <p className="text-sm pl-6">
                    {selectedContact.attributes.company}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IconPhone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Phone</span>
                  </div>
                  <p className="text-sm pl-6">
                    {selectedContact.attributes.phonenumber}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Inquiry Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <IconMessage className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Inquiry Type</span>
                </div>
                <Badge variant="outline" className="ml-6">
                  {selectedContact.attributes.inquiry_type}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <IconMessage className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Message</span>
                </div>
                <div className="ml-6 p-3 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedContact.attributes.message}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IconClock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Created</span>
                  </div>
                  <p className="text-sm pl-6">
                    {formatDateTimeWithSeconds(
                      selectedContact.attributes.created_at
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IconClock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Last Updated</span>
                  </div>
                  <p className="text-sm pl-6">
                    {formatDateTimeWithSeconds(
                      selectedContact.attributes.updated_at
                    )}
                  </p>
                </div>
              </div>

              {/* Contact ID */}
              <div className="pt-4 border-t">
                <div className="text-xs text-muted-foreground">
                  Contact ID: {selectedContact.id}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
