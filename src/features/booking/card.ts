import type { CardBrand } from "@/lib/types";

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

export function detectBrand(digits: string): CardBrand {
  if (/^4/.test(digits)) return "visa";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^(6011|65|64[4-9])/.test(digits)) return "discover";
  return "unknown";
}

/** The Luhn checksum every card number satisfies. Catches typos and swapped digits. */
export function passesLuhn(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let digit = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return digits.length > 0 && sum % 10 === 0;
}

/** "4242424242424242" → "4242 4242 4242 4242"; Amex uses 4-6-5. */
export function formatCardNumber(value: string): string {
  const digits = onlyDigits(value).slice(0, 19);
  const groups = detectBrand(digits) === "amex" ? [4, 6, 5] : [4, 4, 4, 4, 3];
  const parts: string[] = [];
  let start = 0;
  for (const size of groups) {
    if (start >= digits.length) break;
    parts.push(digits.slice(start, start + size));
    start += size;
  }
  return parts.join(" ");
}

/** "0428" → "04 / 28". A leading 2–9 is a month on its own, so "4" → "04". */
export function formatExpiry(value: string): string {
  let digits = onlyDigits(value).slice(0, 4);
  if (/^[2-9]/.test(digits)) digits = `0${digits}`.slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

export function parseExpiry(value: string): { month: number; year: number } | null {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const month = Number(match[1]);
  if (month < 1 || month > 12) return null;
  return { month, year: 2000 + Number(match[2]) };
}

/** A card is valid through the last day of its expiry month. */
export function isExpired({ month, year }: { month: number; year: number }, now = new Date()): boolean {
  return year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);
}
