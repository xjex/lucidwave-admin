"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconMail,
  IconUser,
  IconCalendar,
  IconRefresh,
  IconPlus,
  IconEdit,
  IconTrash,
  IconShield,
  IconUsers,
  IconCrown,
  IconLoader,
  IconAlertTriangle,
} from "@tabler/icons-react";
import {
  getUsers,
  updateUser,
  deleteUser,
  User,
  UpdateUserRequest,
} from "@/services/usersService";
import {
  sendInvitation,
  CreateInvitationRequest,
} from "@/services/invitationsService";
import { formatDateTime } from "@/lib/date-utils";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

const ROLE_STYLES = {
  admin: {
    border: "border-[#8b4a36]/40",
    bg: "bg-[#8b4a36]/10",
    text: "text-[#8b4a36]",
    icon: IconCrown,
  },
  user: {
    border: "border-[#3d7a5c]/40",
    bg: "bg-[#3d7a5c]/10",
    text: "text-[#3d7a5c]",
    icon: IconUser,
  },
};

function RolePill({ role }: { role: "admin" | "user" }) {
  const style = ROLE_STYLES[role];
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${style.border} ${style.bg} ${style.text}`}
    >
      <Icon className="h-3 w-3" />
      {role}
    </span>
  );
}

function UserAvatar({ user }: { user: User }) {
  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((n) => n?.[0])
    .join("")
    .toUpperCase() || user.username?.[0]?.toUpperCase() || "?";

  const hue =
    ((user.username?.charCodeAt(0) || 0) + (user.email?.charCodeAt(0) || 0)) %
    360;

  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center border font-mono text-sm font-bold text-white"
      style={{
        backgroundColor: `hsl(${hue} 45% 35%)`,
        borderColor: `hsl(${hue} 45% 25%)`,
      }}
    >
      {initials}
    </div>
  );
}

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#241d18]/8 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 bg-[#241d18]/8 animate-pulse" />
            <div className="h-3 w-20 bg-[#241d18]/6 animate-pulse" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="h-4 w-24 bg-[#241d18]/8 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-6 w-16 bg-[#241d18]/8 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-28 bg-[#241d18]/8 animate-pulse" />
      </TableCell>
      <TableCell className="text-right">
        <div className="h-8 w-20 bg-[#241d18]/8 animate-pulse ml-auto" />
      </TableCell>
    </TableRow>
  );
}

function getErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null) {
    const e = err as Record<string, unknown>;
    if (e.response && typeof e.response === "object") {
      const r = e.response as Record<string, unknown>;
      if (typeof r.data === "object" && r.data !== null) {
        const d = r.data as Record<string, string>;
        return d.message || d.error || "An error occurred";
      }
    }
  }
  return "An error occurred";
}

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [createForm, setCreateForm] = useState<CreateInvitationRequest>({
    email: "",
    role: "user",
  });
  const [editForm, setEditForm] = useState<UpdateUserRequest>({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "user",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers();
      setUsers(response);
    } catch (err) {
      setError(getErrorMessage(err) || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await sendInvitation(createForm);
      toast.success(
        response.message ||
          "Invitation sent successfully! The user will receive an email to complete their registration."
      );
      setCreateModalOpen(false);
      setCreateForm({ email: "", role: "user" });
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await updateUser(selectedUser.id, editForm);
      toast.success("User updated successfully!");
      setEditModalOpen(false);
      setSelectedUser(null);
      setEditForm({
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        role: "user",
      });
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    if (currentUser && selectedUser.email === currentUser.email) {
      toast.error("You cannot delete your own account");
      setDeleteModalOpen(false);
      setSelectedUser(null);
      return;
    }
    try {
      await deleteUser(selectedUser.id);
      toast.success("User deleted successfully!");
      setDeleteModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to delete user");
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      role: user.role,
    });
    setEditModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const adminCount = users.filter((u) => u.role === "admin").length;
  const regularCount = users.filter((u) => u.role === "user").length;

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 pt-0">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            Team Directory
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#241d18]">
            Users
          </h1>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="h-11 rounded-none border border-[#241d18] bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none transition-transform hover:-translate-y-0.5 hover:bg-[#8b4a36]"
        >
          <IconPlus className="h-4 w-4 mr-2" />
          Send Invitation
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="group relative border border-[#241d18]/10 bg-[#fffaf1] p-5 transition-all hover:border-[#8b4a36]/30 hover:shadow-[4px_4px_0px_0px_rgba(36,29,24,0.08)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-[#241d18]/15 bg-[#f4efe4]">
              <IconUsers className="h-4 w-4 text-[#8b4a36]" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                Total Members
              </p>
              <p className="text-2xl font-bold text-[#241d18]">
                {users.length}
              </p>
            </div>
          </div>
        </div>
        <div className="group relative border border-[#241d18]/10 bg-[#fffaf1] p-5 transition-all hover:border-[#8b4a36]/30 hover:shadow-[4px_4px_0px_0px_rgba(36,29,24,0.08)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-[#8b4a36]/20 bg-[#8b4a36]/10">
              <IconCrown className="h-4 w-4 text-[#8b4a36]" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                Admins
              </p>
              <p className="text-2xl font-bold text-[#241d18]">
                {adminCount}
              </p>
            </div>
          </div>
        </div>
        <div className="group relative border border-[#241d18]/10 bg-[#fffaf1] p-5 transition-all hover:border-[#3d7a5c]/30 hover:shadow-[4px_4px_0px_0px_rgba(36,29,24,0.08)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-[#3d7a5c]/20 bg-[#3d7a5c]/10">
              <IconShield className="h-4 w-4 text-[#3d7a5c]" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                Regular Users
              </p>
              <p className="text-2xl font-bold text-[#241d18]">
                {regularCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 border border-[#b73823]/30 bg-[#b73823]/8 px-4 py-3 text-[#7d2418]">
          <IconAlertTriangle className="h-4 w-4 shrink-0" />
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchUsers}
            className="ml-auto font-mono text-[10px] uppercase tracking-wide underline underline-offset-2 hover:text-[#b73823]"
          >
            Retry
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="border border-[#241d18]/10 bg-[#fffaf1]">
        <div className="flex items-center justify-between border-b border-[#241d18]/10 px-5 py-3">
          <p className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
            All registered users
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
            className="h-8 rounded-none font-mono text-[10px] uppercase tracking-wide text-[#6f665d] hover:bg-[#f4efe4] hover:text-[#241d18]"
          >
            <IconRefresh className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-[#241d18]/10 hover:bg-transparent">
              <TableHead className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                Member
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                Email
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                Role
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                Joined
              </TableHead>
              <TableHead className="w-[100px] text-right font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-40 text-center text-[#9d9389]"
                >
                  <div className="flex flex-col items-center gap-3">
                    <IconUsers className="h-8 w-8 text-[#9d9389]/40" />
                    <p className="text-sm">No users found</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCreateModalOpen(true)}
                      className="rounded-none border-[#241d18]/15 text-[#574d43] hover:bg-[#f4efe4]"
                    >
                      <IconPlus className="h-3.5 w-3.5 mr-1.5" />
                      Invite your first member
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => {
                const fullName =
                  [user.firstName, user.lastName]
                    .filter(Boolean)
                    .join(" ") || user.username;
                return (
                  <TableRow
                    key={user.id}
                    className="group border-[#241d18]/5 transition-colors hover:bg-[#f4efe4]/60"
                    style={{
                      animationDelay: `${index * 40}ms`,
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} />
                        <div>
                          <p className="text-sm font-medium text-[#241d18]">
                            {fullName}
                          </p>
                          <p className="font-mono text-[11px] text-[#9d9389]">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconMail className="h-3.5 w-3.5 text-[#9d9389]" />
                        <span className="font-mono text-xs text-[#574d43]">
                          {user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RolePill role={user.role} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-[#9d9389]">
                        <IconCalendar className="h-3.5 w-3.5" />
                        {formatDateTime(user.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(user)}
                          className="h-8 w-8 rounded-none p-0 text-[#574d43] hover:bg-[#f4efe4] hover:text-[#241d18]"
                        >
                          <IconEdit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(user)}
                          disabled={
                            currentUser?.email === user.email
                          }
                          className="h-8 w-8 rounded-none p-0 text-[#574d43] hover:bg-[#b73823]/10 hover:text-[#b73823] disabled:opacity-30"
                        >
                          <IconTrash className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Invitation Dialog */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md rounded-none border-[#241d18]/15 bg-[#fffaf1] p-0 shadow-[8px_8px_0px_0px_rgba(36,29,24,0.06)]">
          <DialogHeader className="border-b border-[#241d18]/10 px-6 py-5">
            <DialogTitle className="text-lg font-bold text-[#241d18]">
              Send Invitation
            </DialogTitle>
            <DialogDescription className="text-sm text-[#6f665d]">
              Invite a new member to join the team. They will receive an email
              with a secure registration link.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-5 px-6 py-5">
            <div className="space-y-2">
              <Label
                htmlFor="create-email"
                className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]"
              >
                Email Address
              </Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
                placeholder="colleague@company.com"
                required
                className="rounded-none border-[#241d18]/15 bg-[#f4efe4] text-[#241d18] placeholder:text-[#9d9389] focus:border-[#8b4a36] focus:ring-[#8b4a36]/20"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="create-role"
                className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]"
              >
                Role
              </Label>
              <Select
                value={createForm.role}
                onValueChange={(value: "user" | "admin") =>
                  setCreateForm({ ...createForm, role: value })
                }
              >
                <SelectTrigger className="rounded-none border-[#241d18]/15 bg-[#f4efe4] text-[#241d18] focus:ring-[#8b4a36]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none border-[#241d18]/15 bg-[#fffaf1]">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 border-t border-[#241d18]/10 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                disabled={isSubmitting}
                className="rounded-none border-[#241d18]/15 text-[#574d43] hover:bg-[#f4efe4]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-none border border-[#241d18] bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] hover:bg-[#8b4a36]"
              >
                {isSubmitting ? (
                  <>
                    <IconLoader className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <IconMail className="mr-2 h-3.5 w-3.5" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md rounded-none border-[#241d18]/15 bg-[#fffaf1] p-0 shadow-[8px_8px_0px_0px_rgba(36,29,24,0.06)]">
          <DialogHeader className="border-b border-[#241d18]/10 px-6 py-5">
            <DialogTitle className="text-lg font-bold text-[#241d18]">
              Edit Member
            </DialogTitle>
            <DialogDescription className="text-sm text-[#6f665d]">
              Update account details for{" "}
              <strong className="text-[#241d18]">
                {selectedUser?.username}
              </strong>
              .
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4 px-6 py-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="edit-firstName"
                  className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]"
                >
                  First Name
                </Label>
                <Input
                  id="edit-firstName"
                  value={editForm.firstName || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, firstName: e.target.value })
                  }
                  placeholder="First name"
                  className="rounded-none border-[#241d18]/15 bg-[#f4efe4] text-[#241d18] placeholder:text-[#9d9389] focus:border-[#8b4a36] focus:ring-[#8b4a36]/20"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-lastName"
                  className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]"
                >
                  Last Name
                </Label>
                <Input
                  id="edit-lastName"
                  value={editForm.lastName || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lastName: e.target.value })
                  }
                  placeholder="Last name"
                  className="rounded-none border-[#241d18]/15 bg-[#f4efe4] text-[#241d18] placeholder:text-[#9d9389] focus:border-[#8b4a36] focus:ring-[#8b4a36]/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="edit-username"
                className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]"
              >
                Username
              </Label>
              <Input
                id="edit-username"
                value={editForm.username || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, username: e.target.value })
                }
                className="rounded-none border-[#241d18]/15 bg-[#f4efe4] text-[#241d18] placeholder:text-[#9d9389] focus:border-[#8b4a36] focus:ring-[#8b4a36]/20"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="edit-email"
                className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]"
              >
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                className="rounded-none border-[#241d18]/15 bg-[#f4efe4] text-[#241d18] placeholder:text-[#9d9389] focus:border-[#8b4a36] focus:ring-[#8b4a36]/20"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="edit-password"
                className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]"
              >
                New Password{" "}
                <span className="font-sans normal-case text-[#9d9389]">
                  (optional)
                </span>
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={editForm.password || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, password: e.target.value })
                }
                placeholder="Leave empty to keep current"
                className="rounded-none border-[#241d18]/15 bg-[#f4efe4] text-[#241d18] placeholder:text-[#9d9389] focus:border-[#8b4a36] focus:ring-[#8b4a36]/20"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="edit-role"
                className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]"
              >
                Role
              </Label>
              <Select
                value={editForm.role || "user"}
                onValueChange={(value: "user" | "admin") =>
                  setEditForm({ ...editForm, role: value })
                }
              >
                <SelectTrigger className="rounded-none border-[#241d18]/15 bg-[#f4efe4] text-[#241d18] focus:ring-[#8b4a36]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none border-[#241d18]/15 bg-[#fffaf1]">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 border-t border-[#241d18]/10 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                disabled={isSubmitting}
                className="rounded-none border-[#241d18]/15 text-[#574d43] hover:bg-[#f4efe4]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-none border border-[#241d18] bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] hover:bg-[#8b4a36]"
              >
                {isSubmitting ? (
                  <>
                    <IconLoader className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <IconEdit className="mr-2 h-3.5 w-3.5" />
                    Update Member
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent className="rounded-none border-[#b73823]/20 bg-[#fffaf1] shadow-[8px_8px_0px_0px_rgba(183,56,35,0.08)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-lg font-bold text-[#241d18]">
              <IconTrash className="h-5 w-5 text-[#b73823]" />
              Remove Member
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#574d43]">
              This will permanently delete the account for{" "}
              <strong className="text-[#241d18]">
                {selectedUser?.username}
              </strong>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-none border-[#241d18]/15 text-[#574d43] hover:bg-[#f4efe4]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="rounded-none border border-[#b73823] bg-[#b73823] font-mono text-[11px] uppercase tracking-wide text-white hover:bg-[#7d2418]"
            >
              <IconTrash className="mr-2 h-3.5 w-3.5" />
              Delete Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
