"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Portfolio, ProjectStatus } from "@/types/portfolio";
import {
  IconEdit,
  IconTrash,
  IconExternalLink,
  IconCalendar,
  IconTag,
  IconFileText,
} from "@tabler/icons-react";
import { formatDateTime } from "@/lib/date-utils";

interface PortfolioDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolio: Portfolio | null;
  onEdit: (portfolio: Portfolio) => void;
  onDelete: (portfolio: Portfolio) => void;
}

export default function PortfolioDetailDrawer({
  open,
  onOpenChange,
  portfolio,
  onEdit,
  onDelete,
}: PortfolioDetailDrawerProps) {
  if (!portfolio) return null;

  const { attributes } = portfolio;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Public: "default",
      Private: "secondary",
      Draft: "outline",
    };
    return <Badge variant={variants[status] as any}>{status}</Badge>;
  };

  const getProjectStatusBadge = (projectStatus: ProjectStatus) => {
    const variants: Record<ProjectStatus, string> = {
      Public: "default",
      "On Progress": "secondary",
      NDA: "destructive",
      Local: "outline",
    };
    return <Badge variant={variants[projectStatus] as any}>{projectStatus}</Badge>;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{attributes.title}</SheetTitle>
          <SheetDescription>Portfolio project details</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Image */}
          <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
            <img
              src={attributes.imageURL}
              alt={attributes.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Status and Category */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <IconTag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Status:</span>
              {getStatusBadge(attributes.status)}
            </div>
            <div className="flex items-center gap-2">
              <IconFileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Category:</span>
              <Badge variant="outline">{attributes.category}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <IconTag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Project:</span>
              {getProjectStatusBadge(attributes.project_status)}
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {attributes.description}
            </p>
          </div>

          {/* Project Link */}
          {attributes.link && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Project Link</h3>
                <a
                  href={attributes.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <IconExternalLink className="h-4 w-4" />
                  <span className="text-sm break-all">{attributes.link}</span>
                </a>
              </div>
            </>
          )}

          <Separator />

          {/* Timestamps */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium">{formatDateTime(attributes.created_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Updated:</span>
              <span className="font-medium">{formatDateTime(attributes.updated_at)}</span>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(portfolio)}
            >
              <IconEdit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => onDelete(portfolio)}
            >
              <IconTrash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
