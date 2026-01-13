"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useApplicationStore } from "@/stores/applicationStore";
import { JobApplication, ApplicationStatus } from "@/types/application";
import {
  IconMail,
  IconPhone,
  IconBrandLinkedin,
  IconWorld,
  IconClock,
  IconUser,
  IconFileText,
  IconHistory,
} from "@tabler/icons-react";
import { formatDateTimeWithSeconds } from "@/lib/date-utils";

interface ApplicationDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: JobApplication | null;
}

const STATUS_OPTIONS: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: "new", label: "New", color: "bg-blue-500" },
  { value: "interested", label: "Interested", color: "bg-yellow-500" },
  { value: "interviewed", label: "Interviewed", color: "bg-purple-500" },
  { value: "pooling", label: "Pooling", color: "bg-cyan-500" },
  { value: "offered", label: "Offered", color: "bg-orange-500" },
  { value: "accepted", label: "Accepted", color: "bg-green-500" },
  { value: "rejected", label: "Rejected", color: "bg-red-500" },
];

export default function ApplicationDetailDrawer({
  open,
  onOpenChange,
  application,
}: ApplicationDetailDrawerProps) {
  const { updateApplicationStatus, updateApplicationNotes, error, clearError } =
    useApplicationStore();

  const [statusNotes, setStatusNotes] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!application) return;
    await updateApplicationStatus(application.id, newStatus, statusNotes);
    setStatusNotes("");
  };

  const handleSaveNotes = async () => {
    if (!application) return;
    setSavingNotes(true);
    await updateApplicationNotes(application.id, adminNotes);
    setSavingNotes(false);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const option = STATUS_OPTIONS.find((s) => s.value === status);
    return (
      <Badge variant="outline" className="capitalize">
        <span className={`w-2 h-2 rounded-full mr-2 ${option?.color || "bg-gray-500"}`} />
        {option?.label || status}
      </Badge>
    );
  };

  if (!application) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <IconUser className="h-5 w-5" />
            {application.attributes.first_name} {application.attributes.last_name}
          </SheetTitle>
          <SheetDescription>
            {(() => {
              const careerData = application.relationships?.career?.data?.id;
              const career = typeof careerData === 'object' ? careerData : null;
              return career ? (
                <span>
                  Applied for <span className="font-medium">{career.title}</span>
                  {career.department && <span> • {career.department}</span>}
                </span>
              ) : (
                "Application details and status management"
              );
            })()}
          </SheetDescription>
        </SheetHeader>

        {error && (
          <Alert variant="destructive" className="mx-4">
            <AlertDescription>
              {error}
              <Button variant="ghost" size="sm" onClick={clearError} className="ml-2">
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6 px-4 pb-6">
          {/* Contact Information */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconMail className="h-4 w-4" />
                Email
              </div>
              <a
                href={`mailto:${application.attributes.email}`}
                className="text-sm text-primary hover:underline"
              >
                {application.attributes.email}
              </a>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconPhone className="h-4 w-4" />
                Phone
              </div>
              <a
                href={`tel:${application.attributes.contact_number}`}
                className="text-sm text-primary hover:underline"
              >
                {application.attributes.contact_number}
              </a>
            </div>
            {application.attributes.linkedin_profile && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconBrandLinkedin className="h-4 w-4" />
                  LinkedIn
                </div>
                <a
                  href={application.attributes.linkedin_profile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate block"
                >
                  {application.attributes.linkedin_profile}
                </a>
              </div>
            )}
            {application.attributes.portfolio_url && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconWorld className="h-4 w-4" />
                  Portfolio
                </div>
                <a
                  href={application.attributes.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate block"
                >
                  {application.attributes.portfolio_url}
                </a>
              </div>
            )}
          </div>

          <Separator />

          {/* Cover Letter */}
          {application.attributes.cover_letter && (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <IconFileText className="h-4 w-4" />
                  Cover Letter
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">
                    {application.attributes.cover_letter}
                  </p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Status Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                Current Status
              </div>
              {getStatusBadge(application.attributes.status)}
            </div>

            <div className="space-y-2">
              <Label>Update Status</Label>
              <Select onValueChange={(v) => handleStatusChange(v as ApplicationStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Change status" />
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
            </div>

            <div className="space-y-2">
              <Label>Status Change Notes (Optional)</Label>
              <Textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Add notes about this status change..."
                rows={2}
              />
            </div>
          </div>

          <Separator />

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label>Admin Notes</Label>
            <Textarea
              value={adminNotes || application.attributes.notes || ""}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes about this applicant..."
              rows={3}
            />
            <Button size="sm" onClick={handleSaveNotes} disabled={savingNotes}>
              {savingNotes ? "Saving..." : "Save Notes"}
            </Button>
          </div>

          <Separator />

          {/* Status History */}
          {application.attributes.status_history &&
            application.attributes.status_history.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <IconHistory className="h-4 w-4" />
                  Status History
                </div>
                <div className="space-y-2">
                  {application.attributes.status_history.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-2 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(entry.status)}
                          <span className="text-xs text-muted-foreground">
                            {formatDateTimeWithSeconds(entry.changed_at)}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <IconClock className="h-3 w-3" />
                Applied
              </div>
              <p className="text-sm">
                {formatDateTimeWithSeconds(application.attributes.created_at)}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <IconClock className="h-3 w-3" />
                Last Updated
              </div>
              <p className="text-sm">
                {formatDateTimeWithSeconds(application.attributes.updated_at)}
              </p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Application ID: {application.id}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
