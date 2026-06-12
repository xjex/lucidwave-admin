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
  projectName?: string;
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

export interface InvoicePaymentLink {
  label: string;
  url: string;
}

export interface InvoiceTemplateBlock {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
}

export interface InvoiceTemplateLayout {
  blocks: InvoiceTemplateBlock[];
}

export interface InvoicePdfSettings {
  id?: string;
  name?: string;
  company_logo_url?: string;
  company_logo_view_url?: string;
  payment_tags?: string[];
  direct_payment_links?: InvoicePaymentLink[];
  banking_details?: string;
  qr_links?: InvoicePaymentLink[];
  template_layout?: InvoiceTemplateLayout;
}

export interface InvoiceFormData {
  invoiceNumber: string;
  projectName: string;
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
