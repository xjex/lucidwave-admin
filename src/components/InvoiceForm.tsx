"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { InvoiceFormData, InvoiceItem } from "@/types/invoice";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { getCurrencyOptions, getCurrencySymbol } from "@/lib/currency-utils";

interface InvoiceFormProps {
  onGenerate: (invoiceData: InvoiceFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<InvoiceFormData>;
}

const inputClass =
  "h-11 rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none placeholder:text-[#9d9389] focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20";

const labelClass =
  "font-mono text-[11px] uppercase tracking-wide text-[#574d43]";

const sectionClass =
  "border border-[#241d18]/15 bg-[#fffaf1] shadow-[8px_8px_0_#241d18]";

const sectionHeaderClass =
  "border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-3";

const createInitialFormData = (
  initialData?: Partial<InvoiceFormData>
): InvoiceFormData => {
  const issuedAt = new Date();
  const dueAt = new Date(issuedAt.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    invoiceNumber:
      initialData?.invoiceNumber ||
      `INV-${format(issuedAt, "yyyyMMdd-HHmm")}`,
    projectName: initialData?.projectName || "",
    date: initialData?.date || format(issuedAt, "yyyy-MM-dd"),
    dueDate: initialData?.dueDate || format(dueAt, "yyyy-MM-dd"),
    fromName: initialData?.fromName || "",
    fromAddress: initialData?.fromAddress || "",
    fromEmail: initialData?.fromEmail || "",
    fromPhone: initialData?.fromPhone || "",
    toName: initialData?.toName || "",
    toAddress: initialData?.toAddress || "",
    toEmail: initialData?.toEmail || "",
    toPhone: initialData?.toPhone || "",
    items: initialData?.items || [
      { id: "1", description: "", quantity: 1, rate: 0 },
    ],
    taxRate: initialData?.taxRate || 0,
    currency: initialData?.currency || "USD",
    notes: initialData?.notes || "",
  };
};

export function InvoiceForm({
  onGenerate,
  onCancel,
  initialData,
}: InvoiceFormProps) {
  const [formData, setFormData] = useState<InvoiceFormData>(() =>
    createInitialFormData(initialData)
  );

  const parseDateString = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    return new Date(dateString);
  };

  const formatDateToString = (date: Date | undefined): string => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  const calculateSubtotal = () =>
    formData.items.reduce(
      (sum, item) => sum + item.quantity * item.rate,
      0
    );

  const calculateTaxAmount = () => (calculateSubtotal() * formData.taxRate) / 100;

  const calculateTotal = () => calculateSubtotal() + calculateTaxAmount();

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: crypto.randomUUID(),
          description: "",
          quantity: 1,
          rate: 0,
        },
      ],
    }));
  };

  const removeItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const updateItem = (
    id: string,
    field: keyof Omit<InvoiceItem, "id" | "amount">,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.fromName ||
      !formData.fromEmail ||
      !formData.toName ||
      !formData.toEmail
    ) {
      alert("Please fill in all required billing fields.");
      return;
    }

    if (
      formData.items.length === 0 ||
      formData.items.every(
        (item) => !item.description || item.quantity <= 0 || item.rate <= 0
      )
    ) {
      alert("Please add at least one valid invoice item.");
      return;
    }

    onGenerate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <section className={sectionClass}>
          <div className={sectionHeaderClass}>
            <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
              Details
            </p>
            <h3 className="mt-1 font-serif text-2xl">Invoice Settings</h3>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber" className={labelClass}>
                Invoice Number
              </Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    invoiceNumber: e.target.value,
                  }))
                }
                className={inputClass}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectName" className={labelClass}>
                Project
              </Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    projectName: e.target.value,
                  }))
                }
                placeholder="Project name or engagement"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label className={labelClass}>Issue Date</Label>
              <DatePicker
                date={parseDateString(formData.date)}
                onDateChange={(date) =>
                  setFormData((prev) => ({
                    ...prev,
                    date: formatDateToString(date),
                  }))
                }
                placeholder="Select issue date"
              />
            </div>
            <div className="space-y-2">
              <Label className={labelClass}>Due Date</Label>
              <DatePicker
                date={parseDateString(formData.dueDate)}
                onDateChange={(date) =>
                  setFormData((prev) => ({
                    ...prev,
                    dueDate: formatDateToString(date),
                  }))
                }
                placeholder="Select due date"
              />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className={sectionHeaderClass}>
            <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
              Parties
            </p>
            <h3 className="mt-1 font-serif text-2xl">Billing Information</h3>
          </div>
          <div className="grid gap-5 p-5 lg:grid-cols-2">
            <div className="space-y-4 border border-[#241d18]/10 bg-[#f4efe4] p-4">
              <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                From
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fromName" className={labelClass}>
                    Name
                  </Label>
                  <Input
                    id="fromName"
                    value={formData.fromName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        fromName: e.target.value,
                      }))
                    }
                    className={inputClass}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromEmail" className={labelClass}>
                    Email
                  </Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={formData.fromEmail}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        fromEmail: e.target.value,
                      }))
                    }
                    className={inputClass}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromAddress" className={labelClass}>
                  Address
                </Label>
                <Textarea
                  id="fromAddress"
                  value={formData.fromAddress}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fromAddress: e.target.value,
                    }))
                  }
                  className="min-h-24 rounded-none border-[#241d18]/20 bg-white shadow-none focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromPhone" className={labelClass}>
                  Phone
                </Label>
                <Input
                  id="fromPhone"
                  value={formData.fromPhone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fromPhone: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-4 border border-[#241d18]/10 bg-[#f4efe4] p-4">
              <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                Bill To
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="toName" className={labelClass}>
                    Name
                  </Label>
                  <Input
                    id="toName"
                    value={formData.toName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        toName: e.target.value,
                      }))
                    }
                    className={inputClass}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="toEmail" className={labelClass}>
                    Email
                  </Label>
                  <Input
                    id="toEmail"
                    type="email"
                    value={formData.toEmail}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        toEmail: e.target.value,
                      }))
                    }
                    className={inputClass}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="toAddress" className={labelClass}>
                  Address
                </Label>
                <Textarea
                  id="toAddress"
                  value={formData.toAddress}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      toAddress: e.target.value,
                    }))
                  }
                  className="min-h-24 rounded-none border-[#241d18]/20 bg-white shadow-none focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toPhone" className={labelClass}>
                  Phone
                </Label>
                <Input
                  id="toPhone"
                  value={formData.toPhone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      toPhone: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className={sectionHeaderClass}>
            <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
              Line Items
            </p>
            <h3 className="mt-1 font-serif text-2xl">Services & Charges</h3>
          </div>
          <div className="space-y-3 p-5">
            <div className="hidden grid-cols-[1fr_90px_120px_120px_44px] gap-2 px-1 font-mono text-[10px] uppercase tracking-wide text-[#6f665d] md:grid">
              <span>Description</span>
              <span>Qty</span>
              <span>Rate</span>
              <span className="text-right">Amount</span>
              <span />
            </div>
            {formData.items.map((item, index) => (
              <div
                key={item.id}
                className="grid gap-2 border border-[#241d18]/10 bg-[#f4efe4] p-3 md:grid-cols-[1fr_90px_120px_120px_44px] md:items-center"
              >
                <Input
                  aria-label={`Item ${index + 1} description`}
                  placeholder="Describe the service or deliverable"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(item.id, "description", e.target.value)
                  }
                  className={inputClass}
                  required
                />
                <Input
                  aria-label={`Item ${index + 1} quantity`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)
                  }
                  className={inputClass}
                  required
                />
                <Input
                  aria-label={`Item ${index + 1} rate`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.rate}
                  onChange={(e) =>
                    updateItem(item.id, "rate", parseFloat(e.target.value) || 0)
                  }
                  className={inputClass}
                  required
                />
                <div className="flex h-11 items-center justify-end border border-[#241d18]/10 bg-white px-3 font-mono text-sm">
                  {getCurrencySymbol(formData.currency)}
                  {(item.quantity * item.rate).toFixed(2)}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={formData.items.length === 1}
                  onClick={() => removeItem(item.id)}
                  className="h-11 w-11 rounded-none border-[#241d18]/20 bg-white text-[#574d43] hover:text-[#b73823]"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              className="h-11 w-full rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] shadow-none hover:bg-[#f4efe4]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </section>

        <section className={sectionClass}>
          <div className={sectionHeaderClass}>
            <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
              Terms
            </p>
            <h3 className="mt-1 font-serif text-2xl">Notes & Payment Details</h3>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-[160px_1fr]">
            <div className="space-y-2">
              <Label htmlFor="taxRate" className={labelClass}>
                Tax Rate
              </Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.taxRate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    taxRate: parseFloat(e.target.value) || 0,
                  }))
                }
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className={labelClass}>
                Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Payment terms, project notes, or transfer details."
                rows={4}
                className="rounded-none border-[#241d18]/20 bg-white shadow-none focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20"
              />
            </div>
          </div>
        </section>
      </div>

      <aside className="h-fit border border-[#241d18]/15 bg-[#fffaf1] shadow-[8px_8px_0_#241d18] lg:sticky lg:top-6">
        <div className="border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-3">
          <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            Summary
          </p>
          <h3 className="mt-1 font-serif text-2xl">Invoice Total</h3>
        </div>
        <div className="space-y-5 p-5">
          <div className="space-y-2">
            <Label className={labelClass}>Currency</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, currency: value }))
              }
            >
              <SelectTrigger className="h-11 rounded-none border-[#241d18]/20 bg-white shadow-none">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {getCurrencyOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 border border-[#241d18]/10 bg-[#f4efe4] p-4">
            <div className="flex justify-between text-sm">
              <span className="text-[#6f665d]">Subtotal</span>
              <span className="font-mono">
                {getCurrencySymbol(formData.currency)}
                {calculateSubtotal().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6f665d]">Tax</span>
              <span className="font-mono">
                {getCurrencySymbol(formData.currency)}
                {calculateTaxAmount().toFixed(2)}
              </span>
            </div>
            <div className="border-t border-[#241d18]/15 pt-3">
              <p className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                Total Due
              </p>
              <p className="mt-1 font-serif text-4xl">
                {getCurrencySymbol(formData.currency)}
                {calculateTotal().toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="h-11 flex-1 rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] shadow-none hover:bg-[#f4efe4]"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={calculateTotal() === 0}
              className="h-11 flex-1 rounded-none border border-[#241d18] bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none hover:bg-[#8b4a36]"
            >
              Generate PDF
            </Button>
          </div>
        </div>
      </aside>
    </form>
  );
}
