"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  Calendar,
  Download,
  Mail,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Employee,
  downloadPayrollRecord,
  getEmployees,
  getPayrollHistory,
  PayrollRecord,
  PayrollHistoryResponse,
} from "@/services/employeeService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime } from "@/lib/date-utils";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const data = error.response.data as { message?: string; error?: string };
    return data.message || data.error || fallback;
  }

  return error instanceof Error ? error.message : fallback;
};

export default function PayrollHistoryPage() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [meta, setMeta] = useState<PayrollHistoryResponse["meta"] | null>(null);
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (page = 1, employeeId = "all") => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPayrollHistory(
        page,
        10,
        employeeId === "all" ? undefined : employeeId
      );
      setRecords(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load payroll history"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const employeeResponse = await getEmployees(1, 100);
        setEmployees(employeeResponse.data);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load employee filter"));
      }
      await fetchHistory(1, "all");
    };

    loadInitialData();
  }, [fetchHistory]);

  const handleDownload = async (record: PayrollRecord) => {
    try {
      setDownloadingId(record.id);
      setError(null);
      await downloadPayrollRecord(record.id);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to download payroll PDF"));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4efe4] text-[#241d18]">
      <div className="border-b border-[#241d18]/15 bg-[#fffaf1]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-2 flex w-fit items-center gap-2 border border-[#241d18]/15 bg-[#f4efe4] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            <span className="size-2 bg-[#d95c3f]" />
            Payroll
          </div>
          <h1 className="font-serif text-5xl leading-[1.05]">
            Payroll History
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#6f665d]">
            Track every payroll email generated for employees.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 grid gap-4 border border-[#241d18]/15 bg-[#fffaf1] p-5 shadow-[8px_8px_0_#241d18] sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-2">
            <Label className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">
              Employee
            </Label>
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="h-11 w-full rounded-none border-[#241d18]/20 bg-white shadow-none">
                <SelectValue placeholder="All employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All employees</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => fetchHistory(1, employeeFilter)}
            className="h-11 rounded-none bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none hover:bg-[#8b4a36]"
          >
            <Search className="size-4" />
            Apply
          </Button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 border border-[#b73823] bg-[#fff1e8] px-4 py-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#7d2418]" />
            <p className="text-sm text-[#7d2418]">{error}</p>
          </div>
        )}

        <div className="border border-[#241d18]/15 bg-[#fffaf1] shadow-[10px_10px_0_#241d18]">
          <div className="grid grid-cols-[1.1fr_1fr_100px_110px_130px_120px_1fr_110px] items-center border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            <span>Employee</span>
            <span>Client</span>
            <span>Hours</span>
            <span>Rate</span>
            <span>Gross Pay</span>
            <span>Status</span>
            <span>Sent At</span>
            <span>File</span>
          </div>

          {loading ? (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto mb-4 size-8 animate-spin border-2 border-[#241d18]/15 border-t-[#8b4a36]" />
              <p className="font-mono text-xs uppercase text-[#6f665d]">
                Loading payroll
              </p>
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16">
              <Banknote className="mb-3 size-10 text-[#6f665d]/50" />
              <p className="font-mono text-xs uppercase text-[#6f665d]">
                No payroll records found
              </p>
            </div>
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                className="grid grid-cols-[1.1fr_1fr_100px_110px_130px_120px_1fr_110px] items-center border-b border-[#241d18]/10 px-5 py-4 transition-colors hover:bg-[#f4efe4]/60"
              >
                <div>
                  <p className="font-medium">{record.employee.name}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-[#6f665d]">
                    <Mail className="size-3.5" />
                    {record.employee.email}
                  </p>
                </div>
                <div className="text-sm text-[#574d43]">
                  {record.contact ? (
                    <>
                      <p className="font-medium text-[#241d18]">
                        {record.contact.name}
                      </p>
                      <p className="text-xs text-[#6f665d]">
                        {record.contact.company || record.contact.email}
                      </p>
                    </>
                  ) : record.payment_type === "royalty" ? (
                    <>
                      <p className="font-medium text-[#241d18]">Royalty</p>
                      <p className="text-xs text-[#6f665d]">
                        {record.description || "No description"}
                      </p>
                    </>
                  ) : (
                    "No client"
                  )}
                </div>
                <div className="font-mono text-sm">
                  {record.hours.toFixed(2)}
                </div>
                <div className="font-mono text-sm">
                  {money.format(record.rate)}
                </div>
                <div className="font-mono text-sm font-semibold">
                  {money.format(record.gross_pay)}
                  {!!record.additions?.length && (
                    <p className="mt-1 font-sans text-xs font-normal text-[#6f665d]">
                      +
                      {money.format(
                        record.additions.reduce(
                          (total, addition) => total + addition.amount,
                          0
                        )
                      )}{" "}
                      additions
                    </p>
                  )}
                </div>
                <div>
                  <span
                    className={`border px-2.5 py-1 font-mono text-[11px] uppercase ${
                      record.email_status === "sent"
                        ? "border-[#3d7a5c]/30 bg-[#edf7ef] text-[#2f6048]"
                        : "border-[#b73823]/30 bg-[#fff1e8] text-[#7d2418]"
                    }`}
                  >
                    {record.email_status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#574d43]">
                  <Calendar className="size-4 text-[#8b4a36]" />
                  {formatDateTime(record.sent_at)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!record.pdf_url || downloadingId === record.id}
                  onClick={() => handleDownload(record)}
                  className="w-fit rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase text-[#574d43] shadow-none hover:border-[#8b4a36]"
                >
                  <Download className="size-3.5" />
                  {downloadingId === record.id ? "Saving" : "PDF"}
                </Button>
              </div>
            ))
          )}
        </div>

        {meta && meta.pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-[#6f665d]">
              Page {meta.page} of {meta.pages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={meta.page <= 1 || loading}
                onClick={() => fetchHistory(meta.page - 1, employeeFilter)}
                className="rounded-none border-[#241d18]/20 bg-white"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={meta.page >= meta.pages || loading}
                onClick={() => fetchHistory(meta.page + 1, employeeFilter)}
                className="rounded-none border-[#241d18]/20 bg-white"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
