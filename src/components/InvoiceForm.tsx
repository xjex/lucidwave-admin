"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { InvoiceFormData, InvoiceItem } from "@/types/invoice";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { getCurrencyOptions, getCurrencySymbol } from "@/lib/currency-utils";

interface InvoiceFormProps {
  onGenerate: (invoiceData: InvoiceFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<InvoiceFormData>;
}

export function InvoiceForm({ onGenerate, onCancel, initialData }: InvoiceFormProps) {
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: initialData?.invoiceNumber || `INV-${Date.now()}`,
    date: initialData?.date || format(new Date(), 'yyyy-MM-dd'),
    dueDate: initialData?.dueDate || format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    fromName: initialData?.fromName || "",
    fromAddress: initialData?.fromAddress || "",
    fromEmail: initialData?.fromEmail || "",
    fromPhone: initialData?.fromPhone || "",
    toName: initialData?.toName || "",
    toAddress: initialData?.toAddress || "",
    toEmail: initialData?.toEmail || "",
    toPhone: initialData?.toPhone || "",
    items: initialData?.items || [{ id: "1", description: "", quantity: 1, rate: 0 }],
    taxRate: initialData?.taxRate || 0,
    currency: initialData?.currency || "USD",
    notes: initialData?.notes || "",
  });

  // Helper functions to convert between Date objects and string dates
  const parseDateString = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    return new Date(dateString);
  };

  const formatDateToString = (date: Date | undefined): string => {
    if (!date) return "";
    return format(date, 'yyyy-MM-dd');
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const calculateTaxAmount = () => {
    return (calculateSubtotal() * formData.taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount();
  };

  const addItem = () => {
    const newItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const updateItem = (id: string, field: keyof Omit<InvoiceItem, 'id' | 'amount'>, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.fromName || !formData.fromEmail || !formData.toName || !formData.toEmail) {
      alert("Please fill in all required fields (From and To information)");
      return;
    }

    if (formData.items.length === 0 || formData.items.every(item => !item.description || item.quantity <= 0 || item.rate <= 0)) {
      alert("Please add at least one valid item");
      return;
    }

    onGenerate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number *</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <DatePicker
                date={parseDateString(formData.date)}
                onDateChange={(date) => setFormData(prev => ({ ...prev, date: formatDateToString(date) }))}
                placeholder="Select invoice date"
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <DatePicker
                date={parseDateString(formData.dueDate)}
                onDateChange={(date) => setFormData(prev => ({ ...prev, dueDate: formatDateToString(date) }))}
                placeholder="Select due date"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* From Section */}
      <Card>
        <CardHeader>
          <CardTitle>From (Your Information)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromName">Name *</Label>
              <Input
                id="fromName"
                value={formData.fromName}
                onChange={(e) => setFormData(prev => ({ ...prev, fromName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromEmail">Email *</Label>
              <Input
                id="fromEmail"
                type="email"
                value={formData.fromEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, fromEmail: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromPhone">Phone</Label>
              <Input
                id="fromPhone"
                value={formData.fromPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, fromPhone: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromAddress">Address *</Label>
            <Textarea
              id="fromAddress"
              value={formData.fromAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, fromAddress: e.target.value }))}
              placeholder="Your full address"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* To Section */}
      <Card>
        <CardHeader>
          <CardTitle>To (Client Information)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="toName">Name *</Label>
              <Input
                id="toName"
                value={formData.toName}
                onChange={(e) => setFormData(prev => ({ ...prev, toName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toEmail">Email *</Label>
              <Input
                id="toEmail"
                type="email"
                value={formData.toEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, toEmail: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toPhone">Phone</Label>
              <Input
                id="toPhone"
                value={formData.toPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, toPhone: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="toAddress">Address *</Label>
            <Textarea
              id="toAddress"
              value={formData.toAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, toAddress: e.target.value }))}
              placeholder="Client's full address"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Items Section */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.items.map((item, index) => (
            <div key={item.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Item {index + 1}</Label>
                {formData.items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Qty"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Rate"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                Amount: {getCurrencySymbol(formData.currency)}{(item.quantity * item.rate).toFixed(2)}
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addItem} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </CardContent>
      </Card>

      {/* Tax and Totals */}
      <Card>
        <CardHeader>
          <CardTitle>Tax & Totals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.taxRate}
              onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
            >
              <SelectTrigger>
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

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{getCurrencySymbol(formData.currency)}{calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({formData.taxRate}%):</span>
              <span>{getCurrencySymbol(formData.currency)}{calculateTaxAmount().toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>{getCurrencySymbol(formData.currency)}{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Payment terms, notes, or additional information..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={calculateTotal() === 0}>
          Generate Invoice PDF
        </Button>
      </div>
    </form>
  );
}
