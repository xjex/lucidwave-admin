import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconTrash } from "@tabler/icons-react";
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconTrash className="h-5 w-5 text-destructive" />
            Delete Contact
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this contact? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        {contact && (
          <div className="py-4">
            <div className="bg-muted p-3 rounded-lg">
              <p className="font-medium">{contact.name}</p>
              <p className="text-sm text-muted-foreground">{contact.email}</p>
              <p className="text-sm text-muted-foreground">{contact.company}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete Contact
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
