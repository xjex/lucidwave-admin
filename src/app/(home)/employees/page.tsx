"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Banknote,
  Check,
  Mail,
  Plus,
  Search,
  Send,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createEmployee,
  deleteEmployee,
  Employee,
  EmployeePayload,
  getEmployees,
  sendPayroll,
  updateEmployee,
} from "@/services/employeeService";
import { ContactListItem, getContacts } from "@/services/contactsService";

const emptyEmployeeForm: EmployeePayload = {
  name: "",
  email: "",
  position: "",
  hourly_rate: 0,
  status: "active",
  assigned_contacts: [],
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const parseDateValue = (value: string) =>
  value ? new Date(`${value}T00:00:00`) : undefined;

const formatDateValue = (date: Date | undefined) =>
  date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`
    : "";

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

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [contacts, setContacts] = useState<ContactListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [payrollDialogOpen, setPayrollDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [payrollEmployee, setPayrollEmployee] = useState<Employee | null>(null);
  const [employeeForm, setEmployeeForm] =
    useState<EmployeePayload>(emptyEmployeeForm);
  const [payrollForm, setPayrollForm] = useState({
    payment_type: "client" as "client" | "royalty",
    contact_id: "",
    hours: "",
    rate: "",
    additions: [] as Array<{ label: string; amount: string }>,
    period_start: "",
    period_end: "",
    royalty_contact_id: "",
    description: "",
    notes: "",
  });

  const payrollTotals = useMemo(() => {
    const hours = Number(payrollForm.hours || 0);
    const rate = Number(payrollForm.rate || 0);
    const basePay = Number.isFinite(hours) && Number.isFinite(rate)
      ? hours * rate
      : 0;
    const additionsTotal = payrollForm.additions.reduce((total, addition) => {
      const amount = Number(addition.amount || 0);
      return total + (Number.isFinite(amount) ? amount : 0);
    }, 0);

    return {
      basePay,
      additionsTotal,
      grossPay: basePay + additionsTotal,
    };
  }, [payrollForm.additions, payrollForm.hours, payrollForm.rate]);

  const fetchData = useCallback(async (query = "") => {
    try {
      setLoading(true);
      setError(null);
      const [employeeResponse, contactsResponse] = await Promise.all([
        getEmployees(1, 25, query),
        getContacts(1, 100),
      ]);
      setEmployees(employeeResponse.data);
      setContacts(contactsResponse.data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load employees"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData("");
  }, [fetchData]);

  const openCreateDialog = () => {
    setEditingEmployee(null);
    setEmployeeForm(emptyEmployeeForm);
    setEmployeeDialogOpen(true);
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setEmployeeForm({
      name: employee.name,
      email: employee.email,
      position: employee.position || "",
      hourly_rate: employee.hourly_rate,
      status: employee.status,
      assigned_contacts: employee.assigned_contacts.map((assignment) => ({
        contact_id: assignment.contact.id,
        hourly_rate: assignment.hourly_rate,
      })),
    });
    setEmployeeDialogOpen(true);
  };

  const openPayrollDialog = (employee: Employee) => {
    const firstAssignment = employee.assigned_contacts[0];
    setPayrollEmployee(employee);
    setPayrollForm({
      payment_type: firstAssignment ? "client" : "royalty",
      contact_id: firstAssignment?.contact.id || "",
      hours: "",
      rate: String(firstAssignment?.hourly_rate ?? employee.hourly_rate ?? ""),
      additions: [],
      period_start: "",
      period_end: "",
      royalty_contact_id: "",
      description: "",
      notes: "",
    });
    setPayrollDialogOpen(true);
  };

  const toggleContact = (contactId: string) => {
    setEmployeeForm((current) => ({
      ...current,
      assigned_contacts: current.assigned_contacts.some(
        (assignment) => assignment.contact_id === contactId
      )
        ? current.assigned_contacts.filter(
            (assignment) => assignment.contact_id !== contactId
          )
        : [
            ...current.assigned_contacts,
            {
              contact_id: contactId,
              hourly_rate: current.hourly_rate,
            },
          ],
    }));
  };

  const updateContactRate = (contactId: string, hourlyRate: number) => {
    setEmployeeForm((current) => ({
      ...current,
      assigned_contacts: current.assigned_contacts.map((assignment) =>
        assignment.contact_id === contactId
          ? { ...assignment, hourly_rate: hourlyRate }
          : assignment
      ),
    }));
  };

  const handleEmployeeSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      const payload = {
        ...employeeForm,
        hourly_rate: Number(employeeForm.hourly_rate || 0),
      };

      if (editingEmployee) {
        const updated = await updateEmployee(editingEmployee.id, payload);
        setEmployees((current) =>
          current.map((employee) =>
            employee.id === updated.id ? updated : employee
          )
        );
        setMessage("Employee updated");
      } else {
        const created = await createEmployee(payload);
        setEmployees((current) => [created, ...current]);
        setMessage("Employee created");
      }
      setEmployeeDialogOpen(false);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save employee"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (employee: Employee) => {
    if (!window.confirm(`Delete ${employee.name}?`)) return;

    try {
      setError(null);
      await deleteEmployee(employee.id);
      setEmployees((current) =>
        current.filter((item) => item.id !== employee.id)
      );
      setMessage("Employee deleted");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete employee"));
    }
  };

  const handlePayrollSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!payrollEmployee) return;

    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      const royaltyContact = contacts.find(
        (contact) => contact.id === payrollForm.royalty_contact_id
      );
      await sendPayroll(payrollEmployee.id, {
        payment_type: payrollForm.payment_type,
        contact_id:
          payrollForm.payment_type === "client"
            ? payrollForm.contact_id || undefined
            : undefined,
        hours: Number(payrollForm.hours),
        rate: Number(payrollForm.rate),
        additions: payrollForm.additions
          .map((addition) => ({
            label: addition.label.trim(),
            amount: Number(addition.amount || 0),
          }))
          .filter((addition) => addition.label && addition.amount > 0),
        period_start: payrollForm.period_start || undefined,
        period_end: payrollForm.period_end || undefined,
        description:
          payrollForm.payment_type === "royalty"
            ? royaltyContact
              ? royaltyContact.company || royaltyContact.name
              : undefined
            : payrollForm.description || undefined,
        notes: payrollForm.notes || undefined,
      });
      setPayrollDialogOpen(false);
      setMessage(`Payroll sent to ${payrollEmployee.email}`);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to send payroll"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4efe4] text-[#241d18]">
      <div className="border-b border-[#241d18]/15 bg-[#fffaf1]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-2 flex w-fit items-center gap-2 border border-[#241d18]/15 bg-[#f4efe4] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            <span className="size-2 bg-[#d95c3f]" />
            Employees
          </div>
          <h1 className="font-serif text-5xl leading-[1.05]">
            Employee Ledger
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f665d]">
            Assign employees to client contacts and send payroll statements from
            their client-specific rates.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 grid gap-4 border border-[#241d18]/15 bg-[#fffaf1] p-5 shadow-[8px_8px_0_#241d18] md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">
              Search employees
            </Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8b4a36]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") fetchData(search);
                }}
                placeholder="Name, email, or position"
                className="h-11 rounded-none border-[#241d18]/20 bg-white pl-10 shadow-none focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => fetchData(search)}
              className="h-11 rounded-none bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none hover:bg-[#8b4a36]"
            >
              <Search className="size-4" />
              Apply
            </Button>
            <Button
              onClick={openCreateDialog}
              className="h-11 rounded-none bg-[#d95c3f] font-mono text-[11px] uppercase tracking-wide text-white shadow-none hover:bg-[#8b4a36]"
            >
              <Plus className="size-4" />
              New Employee
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 border border-[#b73823] bg-[#fff1e8] px-4 py-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#7d2418]" />
            <p className="text-sm text-[#7d2418]">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-6 flex items-start gap-3 border border-[#3d7a5c]/30 bg-[#edf7ef] px-4 py-3">
            <Check className="mt-0.5 size-4 shrink-0 text-[#3d7a5c]" />
            <p className="text-sm text-[#2f6048]">{message}</p>
          </div>
        )}

        <div className="border border-[#241d18]/15 bg-[#fffaf1] shadow-[10px_10px_0_#241d18]">
          <div className="grid grid-cols-[1.2fr_1fr_1.6fr_220px] items-center border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            <span>Employee</span>
            <span>Position</span>
            <span>Assigned Clients</span>
            <span className="text-right">Actions</span>
          </div>

          {loading ? (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto mb-4 size-8 animate-spin border-2 border-[#241d18]/15 border-t-[#8b4a36]" />
              <p className="font-mono text-xs uppercase text-[#6f665d]">
                Loading employees
              </p>
            </div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16">
              <Users className="mb-3 size-10 text-[#6f665d]/50" />
              <p className="font-mono text-xs uppercase text-[#6f665d]">
                No employees found
              </p>
            </div>
          ) : (
            employees.map((employee) => (
              <div
                key={employee.id}
                onClick={() => router.push(`/employees/${employee.id}`)}
                className="grid cursor-pointer grid-cols-[1.2fr_1fr_1.6fr_220px] items-center border-b border-[#241d18]/10 px-5 py-4 transition-colors hover:bg-[#f4efe4]/60"
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    router.push(`/employees/${employee.id}`);
                  }
                }}
              >
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <UserRound className="size-4 text-[#8b4a36]" />
                    {employee.name}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-[#6f665d]">
                    <Mail className="size-3.5" />
                    {employee.email}
                  </div>
                </div>
                <div className="text-sm text-[#574d43]">
                  {employee.position || "Unassigned"}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {employee.assigned_contacts.length === 0 ? (
                    <span className="text-sm text-[#6f665d]">No clients</span>
                  ) : (
                    employee.assigned_contacts.slice(0, 3).map((assignment) => (
                      <span
                        key={assignment.contact.id}
                        className="border border-[#241d18]/15 bg-white px-2 py-1 text-xs text-[#574d43]"
                      >
                        {assignment.contact.name} ·{" "}
                        {money.format(assignment.hourly_rate)}
                      </span>
                    ))
                  )}
                  {employee.assigned_contacts.length > 3 && (
                    <span className="border border-[#241d18]/15 bg-white px-2 py-1 text-xs text-[#574d43]">
                      +{employee.assigned_contacts.length - 3}
                    </span>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={(event) => {
                      event.stopPropagation();
                      openPayrollDialog(employee);
                    }}
                    className="h-9 rounded-none bg-[#241d18] font-mono text-[11px] uppercase text-[#fffaf1] shadow-none hover:bg-[#8b4a36]"
                  >
                    <Send className="size-4" />
                    Payroll
                  </Button>
                  <Button
                    variant="outline"
                    onClick={(event) => {
                      event.stopPropagation();
                      openEditDialog(employee);
                    }}
                    className="h-9 rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase shadow-none hover:bg-[#f4efe4]"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(employee);
                    }}
                    className="h-9 rounded-none border-[#b73823]/30 bg-white text-[#7d2418] shadow-none hover:bg-[#fff1e8]"
                    aria-label={`Delete ${employee.name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={employeeDialogOpen} onOpenChange={setEmployeeDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-none border-[#241d18]/15 bg-[#fffaf1] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl">
              {editingEmployee ? "Edit Employee" : "New Employee"}
            </DialogTitle>
            <DialogDescription>
              Assign client contacts and set their payroll rates.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmployeeSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={employeeForm.name}
                  onChange={(event) =>
                    setEmployeeForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={employeeForm.email}
                  onChange={(event) =>
                    setEmployeeForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Input
                  value={employeeForm.position}
                  onChange={(event) =>
                    setEmployeeForm((current) => ({
                      ...current,
                      position: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Default Hourly Rate</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={employeeForm.hourly_rate}
                  onChange={(event) =>
                    setEmployeeForm((current) => ({
                      ...current,
                      hourly_rate: Number(event.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assigned Clients and Rates</Label>
              <div className="grid max-h-72 gap-2 overflow-y-auto border border-[#241d18]/15 bg-white p-3">
                {contacts.map((contact) => {
                  const assignment = employeeForm.assigned_contacts.find(
                    (item) => item.contact_id === contact.id
                  );
                  const selected = !!assignment;
                  return (
                    <div
                      key={contact.id}
                      className={`grid gap-3 border px-3 py-2 text-sm transition-colors sm:grid-cols-[1fr_150px] sm:items-center ${
                        selected
                          ? "border-[#8b4a36] bg-[#fff1e8]"
                          : "border-[#241d18]/15 bg-white hover:bg-[#f4efe4]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleContact(contact.id)}
                        className="flex items-start gap-2 text-left"
                      >
                        <span
                          className={`mt-0.5 grid size-4 shrink-0 place-items-center border ${
                            selected
                              ? "border-[#8b4a36] bg-[#8b4a36] text-white"
                              : "border-[#241d18]/25"
                          }`}
                        >
                          {selected && <Check className="size-3" />}
                        </span>
                        <span>
                          <span className="block font-medium">
                            {contact.name}
                          </span>
                          <span className="block text-xs text-[#6f665d]">
                            {contact.company || contact.email}
                          </span>
                        </span>
                      </button>
                      {selected && (
                        <div className="space-y-1">
                          <Label className="font-mono text-[10px] uppercase text-[#6f665d]">
                            Client Rate
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={assignment.hourly_rate}
                            onChange={(event) =>
                              updateContactRate(
                                contact.id,
                                Number(event.target.value)
                              )
                            }
                            className="h-9 rounded-none border-[#241d18]/20 bg-white"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEmployeeDialogOpen(false)}
                className="rounded-none"
              >
                Cancel
              </Button>
              <Button
                disabled={saving}
                className="rounded-none bg-[#241d18] text-[#fffaf1] hover:bg-[#8b4a36]"
              >
                {saving ? "Saving" : "Save Employee"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={payrollDialogOpen} onOpenChange={setPayrollDialogOpen}>
        <DialogContent className="rounded-none border-[#241d18]/15 bg-[#fffaf1] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl">
              Payroll Generator
            </DialogTitle>
            <DialogDescription>
              Send a payroll statement to {payrollEmployee?.email}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePayrollSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Payment Type</Label>
              <Select
                value={payrollForm.payment_type}
                onValueChange={(value: "client" | "royalty") => {
                  const firstAssignment = payrollEmployee?.assigned_contacts[0];
                  setPayrollForm((current) => ({
                    ...current,
                    payment_type: value,
                    contact_id:
                      value === "client" ? firstAssignment?.contact.id || "" : "",
                    royalty_contact_id: "",
                    description: "",
                    rate: String(
                      value === "client"
                        ? firstAssignment?.hourly_rate ??
                            payrollEmployee?.hourly_rate ??
                            ""
                        : current.rate || payrollEmployee?.hourly_rate || ""
                    ),
                  }));
                }}
              >
                <SelectTrigger className="h-11 w-full rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none border-[#241d18]/15 bg-[#fffaf1] shadow-[8px_8px_0_#241d18]">
                  <SelectItem value="client">Client Payroll</SelectItem>
                  <SelectItem value="royalty">Royalty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {payrollForm.payment_type === "client" &&
            payrollEmployee?.assigned_contacts.length ? (
              <div className="space-y-2">
                <Label>Client</Label>
                <Select
                  value={payrollForm.contact_id}
                  onValueChange={(value) => {
                    const assignment = payrollEmployee.assigned_contacts.find(
                      (item) => item.contact.id === value
                    );
                    setPayrollForm((current) => ({
                      ...current,
                      contact_id: value,
                      rate: String(
                        assignment?.hourly_rate ?? payrollEmployee.hourly_rate
                      ),
                    }));
                  }}
                  required
                >
                  <SelectTrigger className="h-11 w-full rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20">
                    <SelectValue placeholder="Choose assigned client" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-[#241d18]/15 bg-[#fffaf1] shadow-[8px_8px_0_#241d18]">
                    {payrollEmployee.assigned_contacts.map((assignment) => (
                      <SelectItem
                        key={assignment.contact.id}
                        value={assignment.contact.id}
                        className="rounded-none focus:bg-[#f4efe4] focus:text-[#241d18]"
                      >
                        {assignment.contact.name} ·{" "}
                        {money.format(assignment.hourly_rate)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : payrollForm.payment_type === "client" ? (
              <div className="border border-[#b73823] bg-[#fff1e8] px-4 py-3 text-sm text-[#7d2418]">
                Assign at least one client or switch payment type to Royalty.
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Royalty Company</Label>
                <Select
                  value={payrollForm.royalty_contact_id}
                  onValueChange={(value) => {
                    const contact = contacts.find((item) => item.id === value);
                    setPayrollForm((current) => ({
                      ...current,
                      royalty_contact_id: value,
                      description: contact
                        ? contact.company || contact.name
                        : "",
                    }));
                  }}
                  required={payrollForm.payment_type === "royalty"}
                >
                  <SelectTrigger className="h-11 w-full rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20">
                    <SelectValue placeholder="Choose client company" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-[#241d18]/15 bg-[#fffaf1] shadow-[8px_8px_0_#241d18]">
                    {contacts.map((contact) => (
                      <SelectItem
                        key={contact.id}
                        value={contact.id}
                        className="rounded-none focus:bg-[#f4efe4] focus:text-[#241d18]"
                      >
                        {contact.company || contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Hours</Label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={payrollForm.hours}
                  onChange={(event) =>
                    setPayrollForm((current) => ({
                      ...current,
                      hours: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {payrollForm.payment_type === "royalty"
                    ? "Royalty Rate"
                    : "Rate"}
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={payrollForm.rate}
                  onChange={(event) =>
                    setPayrollForm((current) => ({
                      ...current,
                      rate: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Period Start</Label>
                <DatePicker
                  date={parseDateValue(payrollForm.period_start)}
                  onDateChange={(date) =>
                    setPayrollForm((current) => ({
                      ...current,
                      period_start: formatDateValue(date),
                    }))
                  }
                  placeholder="Select start date"
                  className="h-11 rounded-none border-[#241d18]/20 bg-white font-normal text-[#241d18] shadow-none hover:bg-[#f4efe4] focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20"
                  popoverClassName="rounded-none border-[#241d18]/15 bg-[#fffaf1] p-2 shadow-[8px_8px_0_#241d18]"
                  calendarClassName="[--cell-size:--spacing(9)] rounded-none bg-[#fffaf1] text-[#241d18]"
                />
              </div>
              <div className="space-y-2">
                <Label>Period End</Label>
                <DatePicker
                  date={parseDateValue(payrollForm.period_end)}
                  onDateChange={(date) =>
                    setPayrollForm((current) => ({
                      ...current,
                      period_end: formatDateValue(date),
                    }))
                  }
                  placeholder="Select end date"
                  className="h-11 rounded-none border-[#241d18]/20 bg-white font-normal text-[#241d18] shadow-none hover:bg-[#f4efe4] focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20"
                  popoverClassName="rounded-none border-[#241d18]/15 bg-[#fffaf1] p-2 shadow-[8px_8px_0_#241d18]"
                  calendarClassName="[--cell-size:--spacing(9)] rounded-none bg-[#fffaf1] text-[#241d18]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label>Additional Payments</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setPayrollForm((current) => ({
                      ...current,
                      additions: [
                        ...current.additions,
                        { label: "", amount: "" },
                      ],
                    }))
                  }
                  className="h-8 rounded-none border-[#241d18]/20 bg-white font-mono text-[10px] uppercase shadow-none hover:bg-[#f4efe4]"
                >
                  <Plus className="size-3.5" />
                  Add Line
                </Button>
              </div>
              {payrollForm.additions.length === 0 ? (
                <div className="border border-dashed border-[#241d18]/20 bg-white px-3 py-3 text-sm text-[#6f665d]">
                  No additional payments.
                </div>
              ) : (
                <div className="space-y-2">
                  {payrollForm.additions.map((addition, index) => (
                    <div
                      key={index}
                      className="grid gap-2 sm:grid-cols-[1fr_130px_36px]"
                    >
                      <Input
                        value={addition.label}
                        onChange={(event) =>
                          setPayrollForm((current) => ({
                            ...current,
                            additions: current.additions.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, label: event.target.value }
                                : item
                            ),
                          }))
                        }
                        placeholder="Bonus, reimbursement, allowance"
                        className="h-10 rounded-none border-[#241d18]/20 bg-white"
                      />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={addition.amount}
                        onChange={(event) =>
                          setPayrollForm((current) => ({
                            ...current,
                            additions: current.additions.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, amount: event.target.value }
                                : item
                            ),
                          }))
                        }
                        placeholder="0.00"
                        className="h-10 rounded-none border-[#241d18]/20 bg-white"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setPayrollForm((current) => ({
                            ...current,
                            additions: current.additions.filter(
                              (_item, itemIndex) => itemIndex !== index
                            ),
                          }))
                        }
                        className="h-10 rounded-none border-[#b73823]/30 bg-white text-[#7d2418] shadow-none hover:bg-[#fff1e8]"
                        aria-label="Remove additional payment"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={payrollForm.notes}
                onChange={(event) =>
                  setPayrollForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                placeholder="Optional payroll note"
              />
            </div>
            <div className="grid grid-cols-2 border border-[#241d18]/15 bg-white sm:grid-cols-4">
              <div className="border-r border-[#241d18]/15 p-4">
                <p className="font-mono text-[11px] uppercase text-[#6f665d]">
                  Hours
                </p>
                <p className="mt-1 font-serif text-2xl">
                  {Number(payrollForm.hours || 0).toFixed(2)}
                </p>
              </div>
              <div className="border-r border-[#241d18]/15 p-4">
                <p className="font-mono text-[11px] uppercase text-[#6f665d]">
                  {payrollForm.payment_type === "royalty"
                    ? "Royalty Rate"
                    : "Rate"}
                </p>
                <p className="mt-1 font-serif text-2xl">
                  {money.format(Number(payrollForm.rate || 0))}
                </p>
              </div>
              <div className="border-r border-[#241d18]/15 p-4">
                <p className="font-mono text-[11px] uppercase text-[#6f665d]">
                  Additions
                </p>
                <p className="mt-1 font-serif text-2xl">
                  {money.format(payrollTotals.additionsTotal)}
                </p>
              </div>
              <div className="p-4">
                <p className="font-mono text-[11px] uppercase text-[#6f665d]">
                  Gross Pay
                </p>
                <p className="mt-1 font-serif text-2xl">
                  {money.format(payrollTotals.grossPay)}
                </p>
              </div>
            </div>
            <Button
              disabled={
                saving ||
                (payrollForm.payment_type === "client" &&
                  !payrollEmployee?.assigned_contacts.length)
              }
              className="h-11 w-full rounded-none bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none hover:bg-[#8b4a36]"
            >
              <Banknote className="size-4" />
              {saving ? "Sending" : "Send Payroll Email"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
