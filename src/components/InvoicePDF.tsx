import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import { Invoice } from "@/types/invoice";
import { format } from "date-fns";
import { formatCurrencyForPDF } from "@/lib/currency-utils";

// Register fonts (optional - you can add custom fonts later)
// Font.register({
//   family: 'Inter',
//   fonts: [
//     { src: '/fonts/Inter-Regular.ttf' },
//     { src: '/fonts/Inter-Bold.ttf', fontWeight: 'bold' },
//   ],
// });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: "#2563eb",
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  clientInfo: {
    flex: 1,
  },
  invoiceTitle: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 5,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2563eb",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  clientEmail: {
    fontSize: 12,
    color: "#6b7280",
  },
  dateInfo: {
    alignItems: "flex-end",
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  dueDateLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  invoiceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  invoiceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  infoBlock: {
    flex: 1,
    marginHorizontal: 10,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#374151",
  },
  infoText: {
    marginBottom: 3,
    lineHeight: 1.4,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderBottom: 1,
    borderBottomColor: "#d1d5db",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 4,
  },
  tableCellDescription: {
    flex: 2,
  },
  tableCellQuantity: {
    flex: 1,
    textAlign: "center",
  },
  tableCellRate: {
    flex: 1,
    textAlign: "right",
  },
  tableCellAmount: {
    flex: 1,
    textAlign: "right",
    fontWeight: "bold",
  },
  totals: {
    marginTop: 20,
    marginLeft: "auto",
    width: "40%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  subtotalRow: {
    borderTop: 1,
    borderTopColor: "#d1d5db",
    marginTop: 8,
    paddingTop: 8,
  },
  totalRowFinal: {
    borderTop: 2,
    borderTopColor: "#2563eb",
    marginTop: 4,
    paddingTop: 8,
    fontSize: 14,
    fontWeight: "bold",
    backgroundColor: "#f0f9ff",
  },
  notes: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#f9fafb",
    borderLeft: 4,
    borderLeftColor: "#2563eb",
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#374151",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#6b7280",
    borderTop: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  backgroundImage: {
    width: 595, // A4 width in points (210mm at 72 DPI)
    height: 742, // A4 height in points (297mm at 72 DPI)
    opacity: 0.1, // Subtle watermark
  },
});

interface InvoicePDFProps {
  invoice: Invoice;
}

export function InvoicePDF({ invoice }: InvoicePDFProps) {
  const formatDate = (date: Date) => {
    return format(date, "MMMM dd, yyyy");
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Background Watermark */}
        <View style={styles.backgroundContainer}>
          <Image src="/pdf-bg.png" style={styles.backgroundImage} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.topRow}>
            <View style={styles.clientInfo}>
              <Text style={styles.infoTitle}>CLIENT INFORMATION</Text>
            </View>
            <View style={styles.invoiceTitle}>
              <Text style={styles.title}>INVOICE</Text>
              <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
            </View>
          </View>
          <View style={styles.bottomRow}>
            <View style={styles.clientDetails}>
              <Text style={styles.clientName}>{invoice.to.name}</Text>
              <Text style={styles.clientEmail}>{invoice.to.email}</Text>
            </View>
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>Date: {formatDate(invoice.date)}</Text>
              <Text style={styles.dueDateLabel}>Due Date: {formatDate(invoice.dueDate)}</Text>
            </View>
          </View>
        </View>

        {/* From/To Information */}
        <View style={styles.invoiceInfo}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>FROM:</Text>
            <Text style={styles.infoText}>{invoice.from.name}</Text>
            <Text style={styles.infoText}>
              {invoice.from.address.split("\n").map((line, index) => (
                <Text key={index}>
                  {line}
                  {"\n"}
                </Text>
              ))}
            </Text>
            <Text style={styles.infoText}>{invoice.from.email}</Text>
            {invoice.from.phone && (
              <Text style={styles.infoText}>{invoice.from.phone}</Text>
            )}
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>TO:</Text>
            <Text style={styles.infoText}>{invoice.to.name}</Text>
            <Text style={styles.infoText}>
              {invoice.to.address.split("\n").map((line, index) => (
                <Text key={index}>
                  {line}
                  {"\n"}
                </Text>
              ))}
            </Text>
            <Text style={styles.infoText}>{invoice.to.email}</Text>
            {invoice.to.phone && (
              <Text style={styles.infoText}>{invoice.to.phone}</Text>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableCellDescription]}>
              Description
            </Text>
            <Text style={[styles.tableCell, styles.tableCellQuantity]}>
              Qty
            </Text>
            <Text style={[styles.tableCell, styles.tableCellRate]}>Rate</Text>
            <Text style={[styles.tableCell, styles.tableCellAmount]}>
              Amount
            </Text>
          </View>

          {invoice.items.map((item, index) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellDescription]}>
                {item.description}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellQuantity]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellRate]}>
                {formatCurrencyForPDF(item.rate, invoice.currency)}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellAmount]}>
                {formatCurrencyForPDF(item.amount, invoice.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>
              {formatCurrencyForPDF(invoice.subtotal, invoice.currency)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Tax ({invoice.taxRate}%):</Text>
            <Text>
              {formatCurrencyForPDF(invoice.taxAmount, invoice.currency)}
            </Text>
          </View>
          <View style={[styles.totalRow, styles.totalRowFinal]}>
            <Text>TOTAL:</Text>
            <Text>{formatCurrencyForPDF(invoice.total, invoice.currency)}</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Notes:</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Thank you for your business!</Text>
          <Text>
            Generated on {format(new Date(), "MMMM dd, yyyy 'at' HH:mm")}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
