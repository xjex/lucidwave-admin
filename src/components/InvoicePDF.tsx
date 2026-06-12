import React from "react";
import { Document, Image, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  Invoice,
  InvoicePdfSettings,
  InvoiceTemplateBlock,
} from "@/types/invoice";
import { format } from "date-fns";
import { formatCurrencyForPDF } from "@/lib/currency-utils";

const ink = "#241d18";
const rust = "#d95c3f";
const clay = "#8b4a36";
const paper = "#fffaf1";
const linen = "#f4efe4";
const muted = "#6f665d";
const designWidth = 794;
const designHeight = 1123;
const pageWidth = 595.28;
const pageHeight = 841.89;
const scaleX = pageWidth / designWidth;
const scaleY = pageHeight / designHeight;

const styles = StyleSheet.create({
  page: {
    backgroundColor: paper,
    color: ink,
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 34,
  },
  topBand: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 0,
    backgroundColor: paper,
  },
  accent: {
    position: "absolute",
    top: 92,
    right: 60,
    width: 156,
    height: 12,
    backgroundColor: rust,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 38,
    paddingTop: 4,
  },
  brand: {
    color: ink,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoWrap: {
    width: 58,
    height: 58,
    padding: 0,
  },
  logo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  brandText: {
    flexDirection: "column",
  },
  brandKicker: {
    color: ink,
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    marginBottom: 4,
  },
  companyLine: {
    color: ink,
    fontSize: 9,
    lineHeight: 1.25,
  },
  title: {
    color: "#3e3a36",
    fontSize: 36,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 5,
  },
  invoiceTitleBlock: {
    alignItems: "flex-end",
    marginTop: 30,
  },
  invoiceMeta: {
    width: 210,
    marginTop: 36,
    padding: 0,
  },
  invoiceMetaLabel: {
    color: clay,
    fontSize: 8,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  invoiceNumber: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginBottom: 8,
  },
  metaRows: {
    gap: 5,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaKey: {
    color: ink,
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    textTransform: "uppercase",
  },
  metaValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  partyGrid: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 28,
  },
  partyBox: {
    flex: 1,
    border: `1 solid ${ink}`,
    backgroundColor: linen,
    padding: 14,
    minHeight: 116,
  },
  partyLabel: {
    color: clay,
    fontSize: 8,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  partyName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    marginBottom: 6,
  },
  partyText: {
    color: "#574d43",
    lineHeight: 1.45,
    marginBottom: 3,
  },
  table: {
    border: `1 solid ${ink}`,
    marginBottom: 22,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: ink,
    color: paper,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableRow: {
    flexDirection: "row",
    minHeight: 38,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTop: `1 solid rgba(36, 29, 24, 0.16)`,
  },
  altRow: {
    backgroundColor: linen,
  },
  description: {
    flex: 3,
    paddingRight: 10,
  },
  qty: {
    flex: 0.7,
    textAlign: "right",
  },
  rate: {
    flex: 1,
    textAlign: "right",
  },
  amount: {
    flex: 1,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
  },
  headerText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  notes: {
    width: "52%",
    borderLeft: `4 solid ${rust}`,
    paddingLeft: 11,
    paddingTop: 2,
  },
  notesTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 7,
  },
  notesText: {
    color: "#574d43",
    lineHeight: 1.45,
  },
  totals: {
    width: 210,
    border: `1 solid ${ink}`,
  },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderBottom: `1 solid rgba(36, 29, 24, 0.16)`,
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 11,
    backgroundColor: rust,
    color: paper,
  },
  grandTotalLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  grandTotalValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 17,
  },
  footer: {
    position: "absolute",
    left: 34,
    right: 34,
    bottom: 25,
    borderTop: `1 solid rgba(36, 29, 24, 0.18)`,
    paddingTop: 9,
    flexDirection: "row",
    justifyContent: "space-between",
    color: muted,
    fontSize: 8,
  },
  paymentSection: {
    marginTop: 20,
    paddingTop: 8,
  },
  paymentTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    textTransform: "uppercase",
    color: ink,
    marginBottom: 9,
  },
  paymentTags: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 9,
  },
  paymentTag: {
    border: `1 solid rgba(36, 29, 24, 0.24)`,
    paddingVertical: 4,
    paddingHorizontal: 7,
    fontSize: 8,
    textTransform: "uppercase",
  },
  paymentGrid: {
    flexDirection: "row",
    gap: 24,
  },
  paymentColumn: {
    flex: 1,
  },
  paymentLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    textTransform: "uppercase",
    marginBottom: 7,
  },
  paymentText: {
    color: ink,
    fontSize: 9,
    lineHeight: 1.25,
    marginBottom: 4,
  },
  paymentStrong: {
    fontFamily: "Helvetica-Bold",
  },
  templatePaymentText: {
    color: ink,
    fontSize: 8,
    lineHeight: 1.12,
    marginBottom: 2,
  },
  templatePaymentLink: {
    marginTop: 4,
  },
  templatePaymentUrl: {
    color: "#083f63",
  },
  qrImage: {
    width: 92,
    height: 92,
    objectFit: "contain",
    marginTop: 5,
  },
  paymentRule: {
    marginTop: 12,
    borderBottom: `2 solid ${ink}`,
  },
  templateBlock: {
    position: "absolute",
  },
  templateCompany: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  templateLogoWrap: {
    width: 44,
    height: 44,
  },
  templateCompanyName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    marginBottom: 3,
  },
  templateSmallText: {
    fontSize: 9,
    lineHeight: 1.22,
    color: ink,
  },
  templateTitleBlock: {
    alignItems: "flex-end",
  },
  templateTitle: {
    color: "#3e3a36",
    fontFamily: "Helvetica-Bold",
    fontSize: 25,
    letterSpacing: 4,
    lineHeight: 1,
  },
  templateTitleBar: {
    width: 120,
    height: 9,
    backgroundColor: "#f59a23",
    marginTop: 4,
  },
  templateSectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  templateProjectLine: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  templateItemsHeader: {
    flexDirection: "row",
    backgroundColor: "#083f63",
    color: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 11,
  },
  templateItemsRow: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 11,
    borderBottom: `4 solid #3f3b37`,
  },
  templateTotals: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f59a23",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  templateThankYou: {
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    lineHeight: 1.2,
  },
  templateQrImage: {
    width: 90,
    height: 90,
    objectFit: "contain",
  },
});

interface InvoicePDFProps {
  invoice: Invoice;
  settings?: InvoicePdfSettings | null;
}

const formatDate = (date: Date) => format(date, "MMM dd, yyyy");

const addressLines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && line !== "-");

const isImageUrl = (value: string) =>
  /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(value);

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getTemplateLineLength = (block: InvoiceTemplateBlock) =>
  clampNumber(Math.floor(block.width / 8), 22, 46);

const breakLongToken = (token: string, maxLength: number) => {
  if (token.length <= maxLength) return token;

  const chunks: string[] = [];
  let remaining = token;

  while (remaining.length > maxLength) {
    const window = remaining.slice(0, maxLength + 1);
    const splitAt = Math.max(
      window.lastIndexOf("/"),
      window.lastIndexOf("."),
      window.lastIndexOf("-"),
      window.lastIndexOf("_"),
      window.lastIndexOf("?"),
      window.lastIndexOf("&"),
      window.lastIndexOf("=")
    );
    const chunkEnd =
      splitAt >= Math.floor(maxLength * 0.55) ? splitAt + 1 : maxLength;

    chunks.push(remaining.slice(0, chunkEnd));
    remaining = remaining.slice(chunkEnd);
  }

  if (remaining) chunks.push(remaining);
  return chunks.join("\n");
};

const wrapLongText = (value: string, maxLength: number) =>
  value
    .split("\n")
    .map((line) =>
      line
        .split(" ")
        .map((token) => breakLongToken(token, maxLength))
        .join(" ")
    )
    .join("\n");

const countTextLines = (value: string) =>
  value.split("\n").reduce((count, line) => {
    if (!line.trim()) return count + 1;
    return count + line.split("\n").length;
  }, 0);

const fittedTemplateTextStyle = (
  block: InvoiceTemplateBlock,
  lineCount: number,
  reservedHeight = 18
) => {
  const availableHeight = block.height * scaleY - reservedHeight;
  const fontSize = clampNumber(
    availableHeight / Math.max(lineCount, 1) / 1.18,
    6,
    8.5
  );

  return {
    fontSize,
    lineHeight: fontSize <= 6.5 ? 1.05 : 1.12,
    marginBottom: fontSize <= 6.5 ? 1 : 2,
  };
};

const fittedTemplateTitleStyle = (bodyFontSize: number) => ({
  fontSize: clampNumber(bodyFontSize + 3.5, 9, 12),
  marginBottom: bodyFontSize <= 6.5 ? 3 : 6,
});

const normalizeTemplateBlocks = (
  settings?: InvoicePdfSettings | null
): InvoiceTemplateBlock[] => {
  const layout =
    settings?.template_layout ||
    (settings as (InvoicePdfSettings & {
      templateLayout?: { blocks?: InvoiceTemplateBlock[] };
    }) | null)?.templateLayout;

  if (!Array.isArray(layout?.blocks)) return [];

  return layout.blocks
    .map((block) => ({
      ...block,
      x: Number(block.x),
      y: Number(block.y),
      width: Number(block.width),
      height: Number(block.height),
      visible: block.visible !== false,
    }))
    .filter(
      (block) =>
        block.id &&
        Number.isFinite(block.x) &&
        Number.isFinite(block.y) &&
        Number.isFinite(block.width) &&
        Number.isFinite(block.height) &&
        block.width > 0 &&
        block.height > 0 &&
        block.visible
    );
};

const blockStyle = (block: InvoiceTemplateBlock) => ({
  ...styles.templateBlock,
  left: block.x * scaleX,
  top: block.y * scaleY,
  width: block.width * scaleX,
  height: block.height * scaleY,
});

const clippedBlockStyle = (block: InvoiceTemplateBlock) => ({
  ...blockStyle(block),
  overflow: "hidden" as const,
});

export function InvoicePDF({ invoice, settings }: InvoicePDFProps) {
  const paymentTags = settings?.payment_tags || [];
  const directPaymentLinks = settings?.direct_payment_links || [];
  const qrLinks = settings?.qr_links || [];
  const hasPaymentSettings =
    paymentTags.length > 0 ||
    directPaymentLinks.length > 0 ||
    !!settings?.banking_details ||
    qrLinks.length > 0;
  const templateBlocks = normalizeTemplateBlocks(settings);
  const hasTemplateLayout = templateBlocks.length > 0;

  const renderTemplateBlock = (block: InvoiceTemplateBlock) => {
    if (block.type === "company") {
      return (
        <View key={block.id} style={blockStyle(block)}>
          <View style={styles.templateCompany}>
            {settings?.company_logo_view_url || settings?.company_logo_url ? (
              <View style={styles.templateLogoWrap}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image
                  src={settings.company_logo_view_url || settings.company_logo_url}
                  style={styles.logo}
                />
              </View>
            ) : null}
            <View>
              <Text style={styles.templateCompanyName}>
                {invoice.from.name || "Lucid Wave Studios"}
              </Text>
              {invoice.from.phone ? (
                <Text style={styles.templateSmallText}>
                  {invoice.from.phone}
                </Text>
              ) : null}
              <Text style={styles.templateSmallText}>{invoice.from.email}</Text>
              {addressLines(invoice.from.address).map((line) => (
                <Text key={`template-company-${line}`} style={styles.templateSmallText}>
                  {line}
                </Text>
              ))}
            </View>
          </View>
        </View>
      );
    }

    if (block.type === "invoice-title") {
      return (
        <View key={block.id} style={blockStyle(block)}>
          <View style={styles.templateTitleBlock}>
            <Text style={styles.templateTitle}>INVOICE</Text>
            <View style={styles.templateTitleBar} />
          </View>
        </View>
      );
    }

    if (block.type === "client") {
      return (
        <View key={block.id} style={blockStyle(block)}>
          <Text style={styles.templateSectionTitle}>Invoice To</Text>
          <Text style={styles.partyText}>{invoice.to.name}</Text>
          <Text style={styles.partyText}>{invoice.to.email}</Text>
          {addressLines(invoice.to.address).map((line) => (
            <Text key={`template-client-${line}`} style={styles.partyText}>
              {line}
            </Text>
          ))}
        </View>
      );
    }

    if (block.type === "invoice-meta") {
      return (
        <View key={block.id} style={blockStyle(block)}>
          <View style={styles.metaRows}>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Invoice</Text>
              <Text style={styles.metaValue}>{invoice.invoiceNumber}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Date</Text>
              <Text style={styles.metaValue}>{formatDate(invoice.date)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Due</Text>
              <Text style={styles.metaValue}>{formatDate(invoice.dueDate)}</Text>
            </View>
          </View>
        </View>
      );
    }

    if (block.type === "project-summary") {
      const projectName =
        invoice.projectName?.trim() ||
        invoice.items[0]?.description ||
        "Invoice Services";

      return (
        <View key={block.id} style={blockStyle(block)}>
          <Text style={styles.templateProjectLine}>
            Project: {projectName}
          </Text>
          <Text style={styles.templateProjectLine}>
            Total Cost: {formatCurrencyForPDF(invoice.total, invoice.currency)}
          </Text>
        </View>
      );
    }

    if (block.type === "line-items") {
      return (
        <View key={block.id} style={blockStyle(block)}>
          <View style={styles.templateItemsHeader}>
            <Text style={[styles.description, styles.headerText]}>
              Description
            </Text>
            <Text style={[styles.qty, styles.headerText]}>Qty</Text>
            <Text style={[styles.amount, styles.headerText]}>Amount</Text>
          </View>
          {invoice.items.slice(0, 4).map((item) => (
            <View key={`template-${item.id}`} style={styles.templateItemsRow}>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.qty}>{item.quantity}</Text>
              <Text style={styles.amount}>
                {formatCurrencyForPDF(item.amount, invoice.currency)}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    if (block.type === "totals") {
      return (
        <View key={block.id} style={blockStyle(block)}>
          <View style={styles.templateTotals}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.amount}>
              {formatCurrencyForPDF(invoice.total, invoice.currency)}
            </Text>
          </View>
        </View>
      );
    }

    if (block.type === "thank-you") {
      return (
        <View key={block.id} style={blockStyle(block)}>
          <Text style={styles.templateThankYou}>
            Thank you for choosing our{"\n"}services!
          </Text>
        </View>
      );
    }

    if (block.type === "payment-details") {
      const maxLineLength = getTemplateLineLength(block);
      const bankingDetails = settings?.banking_details
        ? wrapLongText(settings.banking_details, maxLineLength)
        : "";
      const renderedLinks = directPaymentLinks.map((link) => ({
        ...link,
        label: wrapLongText(
          `${link.label.replace(/:$/, "")}:`,
          maxLineLength
        ),
        url: wrapLongText(link.url, maxLineLength),
      }));
      const bodyLineCount =
        (bankingDetails ? countTextLines(bankingDetails) : paymentTags.length) +
        renderedLinks.reduce(
          (count, link) =>
            count + countTextLines(link.label) + countTextLines(link.url) + 1,
          0
        );
      const bodyStyle = fittedTemplateTextStyle(block, bodyLineCount || 1);
      const titleStyle = fittedTemplateTitleStyle(bodyStyle.fontSize);

      return (
        <View key={block.id} style={clippedBlockStyle(block)}>
          {bankingDetails ? (
            <>
              <Text style={[styles.templateSectionTitle, titleStyle]}>
                Bank Details
              </Text>
              <Text style={[styles.templatePaymentText, bodyStyle]}>
                {bankingDetails}
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.templateSectionTitle, titleStyle]}>
                Payment Methods
              </Text>
              {paymentTags.map((tag) => (
                <Text
                  key={`template-tag-${tag}`}
                  style={[styles.templatePaymentText, bodyStyle]}
                >
                  {tag.toUpperCase()}
                </Text>
              ))}
            </>
          )}
          {renderedLinks.map((link) => (
            <View
              key={`template-link-${link.label}-${link.url}`}
              style={styles.templatePaymentLink}
            >
              <Text
                style={[
                  styles.templatePaymentText,
                  styles.paymentStrong,
                  bodyStyle,
                ]}
              >
                {link.label}
              </Text>
              <Text
                style={[
                  styles.templatePaymentText,
                  styles.templatePaymentUrl,
                  bodyStyle,
                ]}
              >
                {link.url}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    if (block.type === "notes") {
      const noteText = wrapLongText(
        invoice.notes || "Payment is due by the date listed above.",
        getTemplateLineLength(block)
      );
      const bodyStyle = fittedTemplateTextStyle(
        block,
        countTextLines(noteText) || 1
      );
      const titleStyle = fittedTemplateTitleStyle(bodyStyle.fontSize);

      return (
        <View key={block.id} style={clippedBlockStyle(block)}>
          <Text style={[styles.templateSectionTitle, titleStyle]}>Notes</Text>
          <Text style={[styles.templatePaymentText, bodyStyle]}>
            {noteText}
          </Text>
        </View>
      );
    }

    if (block.type === "qr-links") {
      const firstImageQr = qrLinks.find((link) => isImageUrl(link.url));
      return (
        <View key={block.id} style={blockStyle(block)}>
          {firstImageQr ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={firstImageQr.url} style={styles.templateQrImage} />
          ) : (
            qrLinks.map((link) => (
              <Text key={`template-qr-${link.label}-${link.url}`} style={styles.paymentText}>
                <Text style={styles.paymentStrong}>{link.label}: </Text>
                {link.url}
              </Text>
            ))
          )}
        </View>
      );
    }

    return null;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {hasTemplateLayout ? (
          <>
            {templateBlocks.map(renderTemplateBlock)}
            <View style={styles.footer} fixed>
              <Text>Thank you for your business.</Text>
              <Text>Generated {format(new Date(), "MMM dd, yyyy HH:mm")}</Text>
            </View>
          </>
        ) : (
          <>
        <View style={styles.topBand} fixed />
        <View style={styles.accent} fixed />

        <View style={styles.header}>
          <View style={styles.brand}>
            {settings?.company_logo_view_url || settings?.company_logo_url ? (
              <View style={styles.logoWrap}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image
                  src={settings.company_logo_view_url || settings.company_logo_url}
                  style={styles.logo}
                />
              </View>
            ) : null}
            <View style={styles.brandText}>
              <Text style={styles.brandKicker}>Lucid Wave Studios</Text>
              {invoice.from.phone ? (
                <Text style={styles.companyLine}>{invoice.from.phone}</Text>
              ) : null}
              <Text style={styles.companyLine}>{invoice.from.email}</Text>
              {addressLines(invoice.from.address).map((line) => (
                <Text key={`company-${line}`} style={styles.companyLine}>
                  {line}
                </Text>
              ))}
            </View>
          </View>

          <View>
            <View style={styles.invoiceTitleBlock}>
              <Text style={styles.title}>INVOICE</Text>
            </View>
            <View style={styles.invoiceMeta}>
              <View style={styles.metaRows}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaKey}>Invoice</Text>
                  <Text style={styles.metaValue}>{invoice.invoiceNumber}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaKey}>Date</Text>
                  <Text style={styles.metaValue}>
                    {formatDate(invoice.date)}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaKey}>Due</Text>
                  <Text style={styles.metaValue}>
                    {formatDate(invoice.dueDate)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.partyGrid}>
          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>From</Text>
            <Text style={styles.partyName}>{invoice.from.name}</Text>
            {addressLines(invoice.from.address).map((line) => (
              <Text key={line} style={styles.partyText}>
                {line}
              </Text>
            ))}
            <Text style={styles.partyText}>{invoice.from.email}</Text>
            {invoice.from.phone && invoice.from.phone !== "-" ? (
              <Text style={styles.partyText}>{invoice.from.phone}</Text>
            ) : null}
          </View>

          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>Bill To</Text>
            <Text style={styles.partyName}>{invoice.to.name}</Text>
            {addressLines(invoice.to.address).map((line) => (
              <Text key={line} style={styles.partyText}>
                {line}
              </Text>
            ))}
            <Text style={styles.partyText}>{invoice.to.email}</Text>
            {invoice.to.phone && invoice.to.phone !== "-" ? (
              <Text style={styles.partyText}>{invoice.to.phone}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.description, styles.headerText]}>
              Description
            </Text>
            <Text style={[styles.qty, styles.headerText]}>Qty</Text>
            <Text style={[styles.rate, styles.headerText]}>Rate</Text>
            <Text style={[styles.amount, styles.headerText]}>Amount</Text>
          </View>

          {invoice.items.map((item, index) => (
            <View
              key={item.id}
              style={[styles.tableRow, index % 2 === 1 ? styles.altRow : {}]}
            >
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.qty}>{item.quantity}</Text>
              <Text style={styles.rate}>
                {formatCurrencyForPDF(item.rate, invoice.currency)}
              </Text>
              <Text style={styles.amount}>
                {formatCurrencyForPDF(item.amount, invoice.currency)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>
              {invoice.notes || "Payment is due by the date listed above."}
            </Text>
          </View>

          <View style={styles.totals}>
            <View style={styles.totalLine}>
              <Text>Subtotal</Text>
              <Text>
                {formatCurrencyForPDF(invoice.subtotal, invoice.currency)}
              </Text>
            </View>
            <View style={styles.totalLine}>
              <Text>Tax ({invoice.taxRate}%)</Text>
              <Text>
                {formatCurrencyForPDF(invoice.taxAmount, invoice.currency)}
              </Text>
            </View>
            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrencyForPDF(invoice.total, invoice.currency)}
              </Text>
            </View>
          </View>
        </View>

        {hasPaymentSettings ? (
          <View style={styles.paymentSection}>
            <View style={styles.paymentGrid}>
              <View style={styles.paymentColumn}>
                {settings?.banking_details ? (
                  <>
                    <Text style={styles.paymentTitle}>
                      BANK DETAILS
                    </Text>
                    <Text style={styles.paymentText}>
                      {wrapLongText(settings.banking_details, 44)}
                    </Text>
                  </>
                ) : paymentTags.length > 0 ? (
                  <>
                    <Text style={styles.paymentTitle}>Payment Methods</Text>
                    {paymentTags.map((tag) => (
                      <Text key={tag} style={styles.paymentText}>
                        {tag.toUpperCase()}
                      </Text>
                    ))}
                  </>
                ) : null}
              </View>

              <View style={styles.paymentColumn}>
                {directPaymentLinks.length > 0 ? (
                  <>
                    <Text style={styles.paymentTitle}>Direct Payment</Text>
                    {directPaymentLinks.map((link) => (
                      <Text
                        key={`${link.label}-${link.url}`}
                        style={styles.paymentText}
                      >
                        <Text style={styles.paymentStrong}>{link.label}: </Text>
                        {wrapLongText(link.url, 42)}
                      </Text>
                    ))}
                  </>
                ) : null}
                {qrLinks.length > 0 ? (
                  <>
                    <Text style={styles.paymentTitle}>QR Payment</Text>
                    {qrLinks.map((link) => (
                      <View key={`${link.label}-${link.url}`}>
                        <Text style={styles.paymentText}>
                          <Text style={styles.paymentStrong}>{link.label}: </Text>
                          {isImageUrl(link.url) ? "" : wrapLongText(link.url, 42)}
                        </Text>
                        {isImageUrl(link.url) ? (
                          // eslint-disable-next-line jsx-a11y/alt-text
                          <Image src={link.url} style={styles.qrImage} />
                        ) : null}
                      </View>
                    ))}
                  </>
                ) : null}
              </View>
            </View>
            <View style={styles.paymentRule} />
          </View>
        ) : null}

        <View style={styles.footer} fixed>
          <Text>Thank you for your business.</Text>
          <Text>Generated {format(new Date(), "MMM dd, yyyy HH:mm")}</Text>
        </View>
          </>
        )}
      </Page>
    </Document>
  );
}
