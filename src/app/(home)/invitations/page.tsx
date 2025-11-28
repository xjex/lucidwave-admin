"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, TableColumn } from "@/components/ui/data-table";
import {
  IconMail,
  IconCalendar,
  IconRefresh,
  IconPlus,
} from "@tabler/icons-react";
import {
  sendInvitation,
  getInvitations,
  CreateInvitationRequest,
  InvitationListItem,
  InvitationsListResponse,
} from "@/services/invitationsService";
import { formatDateTime } from "@/lib/date-utils";
import { toast } from "sonner";

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<InvitationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<InvitationsListResponse["meta"] | null>(
    null
  );

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState<CreateInvitationRequest>({
    email: "",
    role: "user",
  });

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getInvitations(page, 20);
      setInvitations(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await sendInvitation(createForm);
      toast.success(
        response.message ||
          "Invitation sent successfully! The user will receive an email to complete their registration."
      );
      setCreateModalOpen(false);
      setCreateForm({ email: "", role: "user" });
      fetchInvitations();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to send invitation"
      );
    }
  };

  // Define invitation table columns
  const columns: TableColumn<InvitationListItem>[] = [
    {
      key: "email",
      header: "Email",
      render: (_, invitation) => (
        <div className="flex items-center gap-2">
          <IconMail className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">
            {invitation.attributes.email}
          </span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (_, invitation) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            invitation.attributes.role === "admin"
              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
          }`}
        >
          {invitation.attributes.role}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_, invitation) => {
        const status = invitation.attributes.status;
        const statusColors = {
          pending:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
          accepted:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          expired:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
          sent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
              statusColors[status] || statusColors.pending
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "expires_at",
      header: "Expires",
      render: (_, invitation) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconCalendar className="h-4 w-4" />
          {formatDateTime(invitation.attributes.expires_at)}
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (_, invitation) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconCalendar className="h-4 w-4" />
          {formatDateTime(invitation.attributes.created_at)}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Invitations</h1>
          <p className="text-muted-foreground">
            Manage user invitations and their status
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCreateModalOpen(true)}>
            <IconPlus className="h-4 w-4 mr-2" />
            Send Invitation
          </Button>
          <Button
            variant="outline"
            onClick={() => fetchInvitations()}
            disabled={loading}
          >
            <IconRefresh className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Invitations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
          <CardDescription>
            All sent invitations and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={invitations}
            columns={columns}
            loading={loading}
            emptyMessage="No invitations found"
          />
        </CardContent>
      </Card>

      {/* Create Invitation Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send User Invitation</DialogTitle>
            <DialogDescription>
              Send an invitation email to a new user. They will receive an
              email with a link to complete their registration and set their
              password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateInvitation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
                placeholder="user@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-role">Role</Label>
              <Select
                value={createForm.role}
                onValueChange={(value: "user" | "admin") =>
                  setCreateForm({ ...createForm, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Send Invitation</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

