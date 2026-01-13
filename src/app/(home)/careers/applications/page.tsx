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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, TableColumn } from "@/components/ui/data-table";
import { useApplicationStore } from "@/stores/applicationStore";
import { JobApplication, ApplicationStatus } from "@/types/application";
import {
  IconMail,
  IconPhone,
  IconBrandLinkedin,
  IconWorld,
  IconCalendar,
  IconTrash,
  IconEye,
} from "@tabler/icons-react";
import { formatDateTime } from "@/lib/date-utils";
import ApplicationDetailDrawer from "./components/ApplicationDetailDrawer";

const STATUS_OPTIONS: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: "new", label: "New", color: "bg-blue-500" },
  { value: "interested", label: "Interested", color: "bg-yellow-500" },
  { value: "interviewed", label: "Interviewed", color: "bg-purple-500" },
  { value: "pooling", label: "Pooling", color: "bg-cyan-500" },
  { value: "offered", label: "Offered", color: "bg-orange-500" },
  { value: "accepted", label: "Accepted", color: "bg-green-500" },
  { value: "rejected", label: "Rejected", color: "bg-red-500" },
];

export default function ApplicationsPage() {
  const {
    applications,
    meta,
    loading,
    error,
    statusFilter,
    fetchApplications,
    setStatusFilter,
    updateApplicationStatus,
    deleteApplication,
    clearError,
  } = useApplicationStore();

  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<JobApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (application: JobApplication, newStatus: ApplicationStatus) => {
    await updateApplicationStatus(application.id, newStatus);
  };

  const handleViewClick = (application: JobApplication) => {
    setSelectedApplication(application);
    setDetailModalOpen(true);
  };

  const handleDeleteClick = (application: JobApplication) => {
    setApplicationToDelete(application);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!applicationToDelete) return;
    setIsDeleting(true);
    await deleteApplication(applicationToDelete.id);
    setDeleteModalOpen(false);
    setApplicationToDelete(null);
    setIsDeleting(false);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const option = STATUS_OPTIONS.find((s) => s.value === status);
    return (
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full shrink-0 ${option?.color || "bg-gray-500"}`} />
        <span className="capitalize">{option?.label || status}</span>
      </div>
    );
  };

  const columns: TableColumn<JobApplication>[] = [
    {
      key: "attributes.first_name",
      header: "Name",
      render: (_, app) => (
        <div className="font-medium">
          {app.attributes.first_name} {app.attributes.last_name}
        </div>
      ),
    },
    {
      key: "attributes.career",
      header: "Position",
      render: (_, app) => {
        const careerData = app.relationships?.career?.data?.id;
        const career = typeof careerData === 'object' ? careerData : null;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {career?.title || "Unknown Position"}
            </span>
            {career?.department && (
              <span className="text-xs text-muted-foreground">
                {career.department}
              </span>
            )}
          </div>
        );
      },
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
      key: "attributes.contact_number",
      header: "Phone",
      render: (value) => (
        <div className="flex items-center gap-2">
          <IconPhone className="h-4 w-4 text-muted-foreground" />
          {value}
        </div>
      ),
    },
    {
      key: "attributes.linkedin_profile",
      header: "Links",
      render: (_, app) => (
        <div className="flex items-center gap-2">
          {app.attributes.linkedin_profile && (
            <a
              href={app.attributes.linkedin_profile}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <IconBrandLinkedin className="h-4 w-4 text-blue-600 hover:text-blue-800" />
            </a>
          )}
          {app.attributes.portfolio_url && (
            <a
              href={app.attributes.portfolio_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <IconWorld className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </a>
          )}
        </div>
      ),
    },
    {
      key: "attributes.status",
      header: "Status",
      render: (_, app) => (
        <Select
          value={app.attributes.status}
          onValueChange={(value) => handleStatusChange(app, value as ApplicationStatus)}
        >
          <SelectTrigger className="w-[160px]" onClick={(e) => e.stopPropagation()}>
            <SelectValue>{getStatusBadge(app.attributes.status)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${option.color}`} />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "attributes.created_at",
      header: "Applied",
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
      render: (_, app) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleViewClick(app);
            }}
          >
            <IconEye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(app);
            }}
          >
            <IconTrash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading && applications.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Applications</h1>
          <p className="text-muted-foreground">
            Manage and track all job applications
          </p>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as ApplicationStatus | "all")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${option.color}`} />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
            <Button variant="ghost" size="sm" onClick={clearError} className="ml-2">
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {meta?.status_counts && (
        <div className="grid grid-cols-7 gap-2">
          {STATUS_OPTIONS.map((option) => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                statusFilter === option.value ? "ring-2 ring-primary" : ""
              }`}
              onClick={() =>
                setStatusFilter(statusFilter === option.value ? "all" : option.value)
              }
            >
              <CardContent className="p-3 text-center">
                <div className={`w-3 h-3 rounded-full ${option.color} mx-auto mb-1`} />
                <div className="text-2xl font-bold">
                  {meta.status_counts?.[option.value] || 0}
                </div>
                <div className="text-xs text-muted-foreground">{option.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>
            {meta ? `${meta.total} total applications` : "View and manage all applications"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={applications}
            columns={columns}
            loading={false}
            emptyMessage="No applications found"
            onRowClick={handleViewClick}
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
                  onClick={() => fetchApplications(meta.page - 1)}
                  disabled={meta.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchApplications(meta.page + 1)}
                  disabled={meta.page >= meta.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ApplicationDetailDrawer
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        application={selectedApplication}
      />

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the application from "
              {applicationToDelete?.attributes.first_name}{" "}
              {applicationToDelete?.attributes.last_name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
