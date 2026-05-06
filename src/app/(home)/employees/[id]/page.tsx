"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Calendar,
  Mail,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Employee,
  getEmployee,
  getPayrollHistory,
  PayrollHistoryResponse,
  PayrollRecord,
} from "@/services/employeeService";
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

export default function EmployeeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [meta, setMeta] = useState<PayrollHistoryResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(
    async (page = 1) => {
      if (!id) return;
      try {
        setHistoryLoading(true);
        const response = await getPayrollHistory(page, 10, id);
        setRecords(response.data);
        setMeta(response.meta);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load payroll history"));
      } finally {
        setHistoryLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        setLoading(true);
        setError(null);
        const [employeeData] = await Promise.all([
          getEmployee(id),
          fetchHistory(1),
        ]);
        setEmployee(employeeData);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load employee"));
      } finally {
        setLoading(false);
      }
    };

    if (id) loadEmployee();
  }, [fetchHistory, id]);

  const totals = records.reduce(
    (summary, record) => ({
      hours: summary.hours + record.hours,
      gross: summary.gross + record.gross_pay,
    }),
    { hours: 0, gross: 0 }
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4efe4]">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin border-2 border-[#241d18]/15 border-t-[#8b4a36]" />
          <p className="font-mono text-xs uppercase text-[#6f665d]">
            Loading employee
          </p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-[#f4efe4] px-6 py-8 text-[#241d18]">
        <Link
          href="/employees"
          className="mb-6 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-[#8b4a36]"
        >
          <ArrowLeft className="size-3.5" />
          Back to Employees
        </Link>
        <div className="flex items-start gap-3 border border-[#b73823] bg-[#fff1e8] px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#7d2418]" />
          <p className="text-sm text-[#7d2418]">
            {error || "Employee not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4efe4] text-[#241d18]">
      <div className="border-b border-[#241d18]/15 bg-[#fffaf1]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <Link
            href="/employees"
            className="mb-3 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-[#8b4a36] transition-colors hover:text-[#241d18]"
          >
            <ArrowLeft className="size-3.5" />
            Back to Employees
          </Link>
          <div className="mb-2 flex w-fit items-center gap-2 border border-[#241d18]/15 bg-[#f4efe4] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            <span className="size-2 bg-[#d95c3f]" />
            Employee
          </div>
          <h1 className="font-serif text-5xl leading-[1.05]">
            {employee.name}
          </h1>
          <p className="mt-3 flex max-w-xl items-center gap-2 text-sm leading-6 text-[#6f665d]">
            <Mail className="size-4" />
            {employee.email}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="border border-[#241d18]/15 bg-[#fffaf1] p-5">
            <p className="font-mono text-[11px] uppercase text-[#6f665d]">
              Position
            </p>
            <p className="mt-2 text-lg font-medium">
              {employee.position || "Unassigned"}
            </p>
          </div>
          <div className="border border-[#241d18]/15 bg-[#fffaf1] p-5">
            <p className="font-mono text-[11px] uppercase text-[#6f665d]">
              Assigned Clients
            </p>
            <p className="mt-2 font-serif text-3xl">
              {employee.assigned_contacts.length}
            </p>
          </div>
          <div className="border border-[#241d18]/15 bg-[#fffaf1] p-5">
            <p className="font-mono text-[11px] uppercase text-[#6f665d]">
              Payroll Sent
            </p>
            <p className="mt-2 font-serif text-3xl">{meta?.total || 0}</p>
          </div>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-[0.9fr_1.5fr]">
          <div className="border border-[#241d18]/15 bg-[#fffaf1]">
            <div className="flex items-center gap-2 border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-3">
              <UserRound className="size-4 text-[#8b4a36]" />
              <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                Client Rates
              </p>
            </div>
            {employee.assigned_contacts.length === 0 ? (
              <div className="px-5 py-10 text-sm text-[#6f665d]">
                No clients assigned.
              </div>
            ) : (
              <div className="divide-y divide-[#241d18]/10">
                {employee.assigned_contacts.map((assignment) => (
                  <div
                    key={assignment.contact.id}
                    className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_120px]"
                  >
                    <div>
                      <p className="font-medium">{assignment.contact.name}</p>
                      <p className="text-sm text-[#6f665d]">
                        {assignment.contact.company ||
                          assignment.contact.email}
                      </p>
                    </div>
                    <p className="font-mono text-sm font-semibold sm:text-right">
                      {money.format(assignment.hourly_rate)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-[#241d18]/15 bg-[#fffaf1]">
            <div className="flex items-center justify-between gap-3 border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-3">
              <div className="flex items-center gap-2">
                <Banknote className="size-4 text-[#8b4a36]" />
                <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                  Payroll Sent
                </p>
              </div>
              <div className="font-mono text-[11px] uppercase text-[#6f665d]">
                {totals.hours.toFixed(2)} hrs · {money.format(totals.gross)}
              </div>
            </div>
            {historyLoading ? (
              <div className="px-5 py-12 text-center">
                <div className="mx-auto mb-4 size-8 animate-spin border-2 border-[#241d18]/15 border-t-[#8b4a36]" />
                <p className="font-mono text-xs uppercase text-[#6f665d]">
                  Loading payroll
                </p>
              </div>
            ) : records.length === 0 ? (
              <div className="px-5 py-10 text-sm text-[#6f665d]">
                No payroll has been sent to this employee yet.
              </div>
            ) : (
              <div className="divide-y divide-[#241d18]/10">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_120px_140px]"
                  >
                    <div>
                      <p className="font-medium">
                        {record.contact?.name ||
                          (record.payment_type === "royalty"
                            ? "Royalty"
                            : "No client")}
                      </p>
                      {record.payment_type === "royalty" &&
                        record.description && (
                          <p className="mt-1 text-sm text-[#6f665d]">
                            {record.description}
                          </p>
                        )}
                      <p className="mt-1 flex items-center gap-2 text-sm text-[#6f665d]">
                        <Calendar className="size-4 text-[#8b4a36]" />
                        {formatDateTime(record.sent_at)}
                      </p>
                      {!!record.additions?.length && (
                        <p className="mt-1 text-xs text-[#6f665d]">
                          {record.additions.length} additional payment
                          {record.additions.length === 1 ? "" : "s"}
                        </p>
                      )}
                    </div>
                    <div className="font-mono text-sm text-[#574d43]">
                      {record.hours.toFixed(2)} hrs
                      <p>{money.format(record.rate)}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="font-mono text-sm font-semibold">
                        {money.format(record.gross_pay)}
                      </p>
                      <span
                        className={`mt-2 inline-block border px-2.5 py-1 font-mono text-[11px] uppercase ${
                          record.email_status === "sent"
                            ? "border-[#3d7a5c]/30 bg-[#edf7ef] text-[#2f6048]"
                            : "border-[#b73823]/30 bg-[#fff1e8] text-[#7d2418]"
                        }`}
                      >
                        {record.email_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {meta && meta.pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-[#6f665d]">
              Page {meta.page} of {meta.pages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={meta.page <= 1 || historyLoading}
                onClick={() => fetchHistory(meta.page - 1)}
                className="rounded-none border-[#241d18]/20 bg-white"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={meta.page >= meta.pages || historyLoading}
                onClick={() => fetchHistory(meta.page + 1)}
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
