import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";

interface ContactListHeaderProps {
  onAddContact: () => void;
  totalContacts?: number;
}

export function ContactListHeader({
  onAddContact,
  totalContacts,
}: ContactListHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Contact List</h1>
        <p className="text-muted-foreground">
          Manage your business contacts database
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button onClick={onAddContact}>
          <IconPlus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
        {totalContacts !== undefined && (
          <div className="text-sm text-muted-foreground">
            Showing {totalContacts} contacts
          </div>
        )}
      </div>
    </div>
  );
}
