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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, TableColumn } from "@/components/ui/data-table";
import {
  IconMail,
  IconFileText,
  IconReceipt,
  IconCalendar,
  IconUser,
  IconSearch,
  IconRefresh,
  IconDownload,
  IconDots,
} from "@tabler/icons-react";
import {
  getMailingHistory,
  downloadMailingHistory,
  MailingHistoryItem,
  MailingHistoryResponse,
  MailingHistoryFilters,
} from "@/services/mailingHistoryService";
import { formatDateTime } from "@/lib/date-utils";

export default function MailingHistoryPage() {
  const [mailingHistory, setMailingHistory] = useState<MailingHistoryItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<MailingHistoryResponse["meta"] | null>(null);

  // Filter states
  const [filters, setFilters] = useState<MailingHistoryFilters>({});
  const [recipientFilter, setRecipientFilter] = useState("");

  useEffect(() => {
    fetchMailingHistory();
  }, [filters]);

  const fetchMailingHistory = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Apply recipient filter if set
      const apiFilters = { ...filters };
      if (recipientFilter.trim()) {
        apiFilters.sent_to = recipientFilter.trim();
      }

      const response = await getMailingHistory(page, 10, apiFilters);

      setMailingHistory(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load mailing history");
    } finally {
      setLoading(false);
    }
  };

  const handleTypeFilterChange = (type: string) => {
    if (type === "all") {
      setFilters((prev) => ({ ...prev, type: undefined }));
    } else {
      setFilters((prev) => ({ ...prev, type: type as "receipt" | "invoice" }));
    }
  };

  const handleRecipientFilterChange = (value: string) => {
    setRecipientFilter(value);
  };

  const applyRecipientFilter = () => {
    fetchMailingHistory(1); // Reset to first page when applying filter
  };

  const clearFilters = () => {
    setFilters({});
    setRecipientFilter("");
    fetchMailingHistory(1);
  };

  const handleDownload = async (item: MailingHistoryItem) => {
    try {
      await downloadMailingHistory(item.id);

      // The service should handle the download automatically
      // If it returns a blob, we can trigger the download
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to download mailing history"
      );
    }
  };

  // Define table columns
  const columns: TableColumn<MailingHistoryItem>[] = [
    {
      key: "attributes.type",
      header: "Type",
      render: (value) => (
        <div className="flex items-center gap-2">
          {value === "invoice" ? (
            <IconFileText className="h-4 w-4 text-blue-600" />
          ) : (
            <IconReceipt className="h-4 w-4 text-green-600" />
          )}
          <span className="capitalize font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "attributes.sent_to",
      header: "Recipient",
      render: (value) => (
        <div className="flex items-center gap-2">
          <IconMail className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: "attributes.metadata.subject",
      header: "Subject",
      render: (_, item) => (
        <div
          className="max-w-xs truncate"
          title={item.attributes.metadata.subject}
        >
          {item.attributes.metadata.subject}
        </div>
      ),
    },
    {
      key: "attributes.metadata.amount",
      header: "Amount",
      render: (_, item) => {
        const { amount, currency } = item.attributes.metadata;
        if (!amount) return <span className="text-muted-foreground">-</span>;

        return (
          <div className="font-mono">
            {currency || "USD"} {amount}
          </div>
        );
      },
    },
    {
      key: "attributes.sender.username",
      header: "Sent By",
      render: (_, item) => (
        <div className="flex items-center gap-2">
          <IconUser className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{item.attributes.sender.username}</div>
            <div className="text-xs text-muted-foreground">
              {item.attributes.sender.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "attributes.timestamp",
      header: "Sent At",
      render: (value) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconCalendar className="h-4 w-4" />
          {formatDateTime(value)}
        </div>
      ),
    },
    {
      key: "attributes.files",
      header: "Files",
      render: (value: string[]) => (
        <div className="text-sm text-muted-foreground">
          {value?.length || 0} file{value?.length !== 1 ? "s" : ""}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-[100px] text-right",
      render: (_, item) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <IconDots className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleDownload(item)}>
              <IconDownload className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Mailing History</h1>
          {/* Filters inline with title */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type-filter">Type</Label>
              <Select
                value={filters.type || "all"}
                onValueChange={handleTypeFilterChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="invoice">Invoices</SelectItem>
                  <SelectItem value="receipt">Receipts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient-filter">Recipient Email</Label>
              <Input
                id="recipient-filter"
                type="email"
                value={recipientFilter}
                onChange={(e) => handleRecipientFilterChange(e.target.value)}
                placeholder="client@example.com"
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={applyRecipientFilter} disabled={loading}>
                <IconSearch className="h-4 w-4 mr-2" />
                Apply
              </Button>
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={loading}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchMailingHistory(meta?.page || 1)}
          disabled={loading}
        >
          <IconRefresh className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Mailing History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sent Documents</CardTitle>
          <CardDescription>
            History of all invoices and receipts sent via email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={mailingHistory}
            columns={columns}
            loading={loading}
            emptyMessage="No mailing history found"
          />

          {meta && meta.pages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.pages} ({meta.total} total)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchMailingHistory(meta.page - 1)}
                  disabled={meta.page <= 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchMailingHistory(meta.page + 1)}
                  disabled={meta.page >= meta.pages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
