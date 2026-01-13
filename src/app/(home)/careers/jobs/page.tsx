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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DataTable,
  TableColumn,
} from "@/components/ui/data-table";
import {
  getCareers,
  deleteCareer,
  toggleCareerStatus,
} from "@/services/careerService";
import { Career, CareersResponse } from "@/types/career";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconMapPin,
  IconBriefcase,
  IconCalendar,
  IconCurrencyDollar,
  IconUsers,
} from "@tabler/icons-react";
import { formatDateTime } from "@/lib/date-utils";
import { useRouter } from "next/navigation";
import CareerFormDrawer from "./components/CareerFormDrawer";

export default function CareersPage() {
  const router = useRouter();
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<CareersResponse["meta"] | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [careerToDelete, setCareerToDelete] = useState<Career | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCareers(page, 10);
      setCareers(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load careers");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedCareer(null);
    setFormModalOpen(true);
  };

  const handleEditClick = (career: Career) => {
    setSelectedCareer(career);
    setFormModalOpen(true);
  };

  const handleDeleteClick = (career: Career) => {
    setCareerToDelete(career);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!careerToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteCareer(careerToDelete.id);
      setDeleteModalOpen(false);
      setCareerToDelete(null);
      fetchCareers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete career");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (career: Career) => {
    try {
      await toggleCareerStatus(career.id, !career.attributes.is_active);
      fetchCareers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleFormSuccess = () => {
    setFormModalOpen(false);
    setSelectedCareer(null);
    fetchCareers();
  };

  const handleViewApplications = (career: Career) => {
    router.push(`/careers/applications/${career.id}`);
  };

  const formatSalary = (career: Career) => {
    const range = career.attributes.salary_range;
    if (!range || (!range.min && !range.max)) return "Not specified";
    const currency = range.currency || "USD";
    if (range.min && range.max) {
      return `${currency} ${range.min.toLocaleString()} - ${range.max.toLocaleString()}`;
    }
    if (range.min) return `${currency} ${range.min.toLocaleString()}+`;
    return `Up to ${currency} ${range.max?.toLocaleString()}`;
  };

  const columns: TableColumn<Career>[] = [
    {
      key: "attributes.title",
      header: "Title",
      render: (_, career) => (
        <div className="font-medium">{career.attributes.title}</div>
      ),
    },
    {
      key: "attributes.department",
      header: "Department",
      render: (value) => (
        <div className="flex items-center gap-2">
          <IconBriefcase className="h-4 w-4 text-muted-foreground" />
          {value}
        </div>
      ),
    },
    {
      key: "attributes.location",
      header: "Location",
      render: (value) => (
        <div className="flex items-center gap-2">
          <IconMapPin className="h-4 w-4 text-muted-foreground" />
          {value}
        </div>
      ),
    },
    {
      key: "attributes.type",
      header: "Type",
      render: (value) => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: "attributes.salary_range",
      header: "Salary",
      render: (_, career) => (
        <div className="flex items-center gap-2">
          <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
          {formatSalary(career)}
        </div>
      ),
    },
    {
      key: "attributes.is_active",
      header: "Status",
      render: (value, career) => (
        <Badge
          variant={value ? "default" : "secondary"}
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleStatus(career);
          }}
        >
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "attributes.created_at",
      header: "Created",
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
      render: (_, career) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            title="View Applications"
            onClick={(e) => {
              e.stopPropagation();
              handleViewApplications(career);
            }}
          >
            <IconUsers className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Edit"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(career);
            }}
          >
            <IconEdit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(career);
            }}
          >
            <IconTrash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading careers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Careers</h1>
          <p className="text-muted-foreground">
            Manage job listings and career opportunities
          </p>
        </div>
        <Button onClick={handleCreateClick}>
          <IconPlus className="h-4 w-4 mr-2" />
          Add Career
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Job Listings</CardTitle>
          <CardDescription>
            {meta ? `${meta.total} total careers` : "View and manage all job postings"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={careers}
            columns={columns}
            loading={false}
            emptyMessage="No careers found. Create your first job listing!"
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
                  onClick={() => fetchCareers(meta.page - 1)}
                  disabled={meta.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchCareers(meta.page + 1)}
                  disabled={meta.page >= meta.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Career Form Drawer */}
      <CareerFormDrawer
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        career={selectedCareer}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Career</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{careerToDelete?.attributes.title}"? 
              This action cannot be undone.
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
