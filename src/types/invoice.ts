export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceParty {
  name: string;
  address: string;
  email: string;
  phone?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  from: InvoiceParty;
  to: InvoiceParty;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes?: string;
}

export interface InvoiceFormData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  fromName: string;
  fromAddress: string;
  fromEmail: string;
  fromPhone?: string;
  toName: string;
  toAddress: string;
  toEmail: string;
  toPhone?: string;
  items: Omit<InvoiceItem, "amount">[];
  taxRate: number;
  currency: string;
  notes?: string;
}
