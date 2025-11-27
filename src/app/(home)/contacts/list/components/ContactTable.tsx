import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DataTable,
  TableColumn,
  TableAction,
} from "@/components/ui/data-table";
import {
  IconMail,
  IconPhone,
  IconBuilding,
  IconCalendar,
  IconTrash,
  IconFileText,
  IconReceipt,
  IconDots,
  IconEdit,
} from "@tabler/icons-react";
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
  // Define table columns
  const columns: TableColumn<ContactListItem>[] = [
    {
      key: "name",
      header: "Name",
    },
    {
      key: "email",
      header: "Email",
      render: (value) => (
        <div className="flex items-center gap-2">
          <IconMail className="h-4 w-4 text-muted-foreground" />
          {value}
        </div>
      ),
    },
    {
      key: "company",
      header: "Company",
      render: (value) => (
        <div className="flex items-center gap-2">
          <IconBuilding className="h-4 w-4 text-muted-foreground" />
          {value}
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (value) => (
        <div className="flex items-center gap-2">
          <IconPhone className="h-4 w-4 text-muted-foreground" />
          {value}
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Added",
      render: (value) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconCalendar className="h-4 w-4" />
          {formatDateTime(value)}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, contact) => renderActions(contact),
    },
  ];

  // Custom actions dropdown
  const renderActions = (contact: ContactListItem) => {
    if (contact.id.startsWith("temp-")) return null; // Don't show actions for optimistic contacts

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <IconDots className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEditContact(contact)}>
            <IconEdit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSendInvoice(contact)}>
            <IconFileText className="h-4 w-4 mr-2" />
            Send Invoice
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSendReceipt(contact)}>
            <IconReceipt className="h-4 w-4 mr-2" />
            Send Receipt
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDeleteContact(contact)}
            className="text-destructive focus:text-destructive"
          >
            <IconTrash className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Contacts</CardTitle>
        <CardDescription>View and manage all business contacts</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          data={contacts}
          columns={columns}
          loading={loading}
          emptyMessage="No contacts found"
        />
      </CardContent>
    </Card>
  );
}
