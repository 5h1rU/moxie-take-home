import type { Business } from "@/lib/types";
import { onlyDigits } from "./card";

export function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    // "$200", but "$49.50" when there are cents.
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export const formatDuration = (minutes: number) => `${minutes} mins`;

/** "+16195550142" → "(619) 555-0142". Other countries keep the E.164 form. */
export function formatPhone(e164: string): string {
  const match = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : e164;
}

/** Formats what the user types in the phone field: "6195550142" → "(619) 555-0142". */
export function formatPhoneInput(value: string): string {
  let digits = onlyDigits(value);
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  // Up to three digits stay bare, so backspace never gets stuck on a ")".
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** Formats an uncontrolled input as the user types. Leaves it alone when nothing changes, to keep the caret. */
export function reformat(input: HTMLInputElement, format: (value: string) => string) {
  const next = format(input.value);
  if (next !== input.value) input.value = next;
}

/** The appointment time in the business's timezone, which is where the client shows up. */
export function formatAppointmentTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(new Date(iso));
}

export function addressLines(address: Business["address"]): string[] {
  return [
    address.line1,
    address.line2,
    `${address.city}, ${address.region} ${address.postalCode}`,
  ].filter((line): line is string => Boolean(line));
}
