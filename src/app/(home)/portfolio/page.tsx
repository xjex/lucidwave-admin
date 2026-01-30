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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, TableColumn } from "@/components/ui/data-table";
import {
  getPortfolios,
  deletePortfolio,
  updatePortfolio,
} from "@/services/portfolioService";
import { Portfolio, PortfoliosResponse, PortfolioStatus, ProjectStatus } from "@/types/portfolio";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconExternalLink,
  IconCalendar,
  IconEye,
} from "@tabler/icons-react";
import { formatDateTime } from "@/lib/date-utils";
import PortfolioFormDrawer from "./components/PortfolioFormDrawer";
import PortfolioDetailDrawer from "./components/PortfolioDetailDrawer";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PortfoliosResponse["meta"] | null>(null);
  const [statusFilter, setStatusFilter] = useState<PortfolioStatus | "all">("all");
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [portfolioToDelete, setPortfolioToDelete] = useState<Portfolio | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPortfolios();
  }, [statusFilter]);

  const fetchPortfolios = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPortfolios(
        page,
        10,
        undefined,
        statusFilter === "all" ? undefined : statusFilter
      );
      setPortfolios(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load portfolios");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedPortfolio(null);
    setFormDrawerOpen(true);
  };

  const handleEditClick = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setFormDrawerOpen(true);
  };

  const handleViewClick = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setDetailDrawerOpen(true);
  };

  const handleDeleteClick = (portfolio: Portfolio) => {
    setPortfolioToDelete(portfolio);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!portfolioToDelete) return;
    try {
      setIsDeleting(true);
      await deletePortfolio(portfolioToDelete.id);
      setDeleteModalOpen(false);
      setPortfolioToDelete(null);
      fetchPortfolios();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete portfolio");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (portfolio: Portfolio, newStatus: PortfolioStatus) => {
    try {
      await updatePortfolio(portfolio.id, { status: newStatus });
      fetchPortfolios();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleFormSuccess = () => {
    setFormDrawerOpen(false);
    setSelectedPortfolio(null);
    fetchPortfolios();
  };

  const getStatusBadge = (status: PortfolioStatus) => {
    const variants: Record<PortfolioStatus, string> = {
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

  const columns: TableColumn<Portfolio>[] = [
    {
      key: "attributes.imageURL",
      header: "Image",
      render: (_, portfolio) => {
        // Handle imageURL - check if it's just an ID or a full path
        let imageUrl = portfolio.attributes.imageURL;
        if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
          imageUrl = `/api/images/preview/${imageUrl}`;
        }
        
        return (
          <div className="relative w-16 h-16 rounded overflow-hidden bg-muted">
            <img
              src={`${API_BASE_URL}${imageUrl}`}
              alt={portfolio.attributes.title}
              className="w-full h-full object-cover"
            />
          </div>
        );
      },
    },
    {
      key: "attributes.title",
      header: "Title",
      render: (_, portfolio) => (
        <div className="font-medium">{portfolio.attributes.title}</div>
      ),
    },
    {
      key: "attributes.category",
      header: "Category",
      render: (value) => <Badge variant="outline">{value}</Badge>,
    },
    {
      key: "attributes.project_status",
      header: "Project Status",
      render: (_, portfolio) => getProjectStatusBadge(portfolio.attributes.project_status),
    },
    {
      key: "attributes.status",
      header: "Status",
      render: (_, portfolio) => (
        <Select
          value={portfolio.attributes.status}
          onValueChange={(value) =>
            handleStatusChange(portfolio, value as PortfolioStatus)
          }
        >
          <SelectTrigger className="w-[120px]" onClick={(e) => e.stopPropagation()}>
            <SelectValue>{getStatusBadge(portfolio.attributes.status)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Public">Public</SelectItem>
            <SelectItem value="Private">Private</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "attributes.link",
      header: "Link",
      render: (value) =>
        value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-primary hover:underline"
          >
            <IconExternalLink className="h-4 w-4" />
            <span className="max-w-[150px] truncate">Link</span>
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
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
      render: (_, portfolio) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            title="View"
            onClick={(e) => {
              e.stopPropagation();
              handleViewClick(portfolio);
            }}
          >
            <IconEye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Edit"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(portfolio);
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
              handleDeleteClick(portfolio);
            }}
          >
            <IconTrash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading && portfolios.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading portfolios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">
            Manage your portfolio projects and showcase work
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as PortfolioStatus | "all")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Public">Public</SelectItem>
              <SelectItem value="Private">Private</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCreateClick}>
            <IconPlus className="h-4 w-4 mr-2" />
            Add Portfolio
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Items</CardTitle>
          <CardDescription>
            {meta ? `${meta.total} total items` : "View and manage all portfolio projects"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={portfolios}
            columns={columns}
            loading={false}
            emptyMessage="No portfolio items found. Create your first project!"
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
                  onClick={() => fetchPortfolios(meta.page - 1)}
                  disabled={meta.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPortfolios(meta.page + 1)}
                  disabled={meta.page >= meta.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <PortfolioFormDrawer
        open={formDrawerOpen}
        onOpenChange={setFormDrawerOpen}
        portfolio={selectedPortfolio}
        onSuccess={handleFormSuccess}
      />

      <PortfolioDetailDrawer
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        portfolio={selectedPortfolio}
        onEdit={(portfolio: Portfolio) => {
          setDetailDrawerOpen(false);
          setSelectedPortfolio(portfolio);
          setFormDrawerOpen(true);
        }}
        onDelete={(portfolio: Portfolio) => {
          setDetailDrawerOpen(false);
          handleDeleteClick(portfolio);
        }}
      />

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Portfolio</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{portfolioToDelete?.attributes.title}"?
              This will also delete the associated image. This action cannot be undone.
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
