import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/InvoicePDF';
import { Invoice, InvoiceFormData } from '@/types/invoice';

export function convertFormDataToInvoice(formData: InvoiceFormData): Invoice {
  const items = formData.items.map(item => ({
    ...item,
    amount: item.quantity * item.rate,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * formData.taxRate) / 100;
  const total = subtotal + taxAmount;

  return {
    id: `inv-${Date.now()}`,
    invoiceNumber: formData.invoiceNumber,
    date: new Date(formData.date),
    dueDate: new Date(formData.dueDate),
    from: {
      name: formData.fromName,
      address: formData.fromAddress,
      email: formData.fromEmail,
      phone: formData.fromPhone,
    },
    to: {
      name: formData.toName,
      address: formData.toAddress,
      email: formData.toEmail,
      phone: formData.toPhone,
    },
    items,
    subtotal,
    taxRate: formData.taxRate,
    taxAmount,
    total,
    currency: formData.currency,
    notes: formData.notes,
  };
}

export async function generateInvoicePDF(invoice: Invoice): Promise<Blob> {
  try {
    const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob();
    return blob;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}

export async function downloadInvoicePDF(invoice: Invoice) {
  try {
    const blob = await generateInvoicePDF(invoice);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoice.invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
}

export async function generateInvoicePDFFromForm(formData: InvoiceFormData): Promise<Blob> {
  const invoice = convertFormDataToInvoice(formData);
  return generateInvoicePDF(invoice);
}

export async function downloadInvoicePDFFromForm(formData: InvoiceFormData) {
  const invoice = convertFormDataToInvoice(formData);
  return downloadInvoicePDF(invoice);
}
