export const CURRENCIES = {
  USD: { symbol: "$", name: "US Dollar", locale: "en-US" },
  PHP: { symbol: "₱", name: "Philippine Peso", locale: "en-PH" },
  EUR: { symbol: "€", name: "Euro", locale: "de-DE" },
  GBP: { symbol: "£", name: "British Pound", locale: "en-GB" },
  JPY: { symbol: "¥", name: "Japanese Yen", locale: "ja-JP" },
  CAD: { symbol: "C$", name: "Canadian Dollar", locale: "en-CA" },
  AUD: { symbol: "A$", name: "Australian Dollar", locale: "en-AU" },
  CHF: { symbol: "Fr", name: "Swiss Franc", locale: "de-CH" },

  INR: { symbol: "₹", name: "Indian Rupee", locale: "en-IN" },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export function formatCurrency(
  amount: number,
  currencyCode: string = "USD"
): string {
  const currency = CURRENCIES[currencyCode as CurrencyCode] || CURRENCIES.USD;

  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrencyForPDF(
  amount: number,
  currencyCode: string = "USD"
): string {
  // For PDF compatibility, use currency code with amount
  return `${currencyCode} ${amount.toFixed(2)}`;
}

export function getCurrencySymbol(currencyCode: string): string {
  const currency = CURRENCIES[currencyCode as CurrencyCode];
  return currency ? currency.symbol : "$";
}

export function getCurrencyOptions() {
  return Object.entries(CURRENCIES).map(([code, { name, symbol }]) => ({
    value: code,
    label: `${code} - ${name} (${symbol})`,
    symbol,
  }));
}
