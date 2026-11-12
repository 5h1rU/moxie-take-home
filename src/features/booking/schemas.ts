import { z } from "zod";
import { detectBrand, isExpired, onlyDigits, parseExpiry, passesLuhn } from "./card";

/**
 * Form schemas. They parse raw FormData strings into the values the booking
 * request needs. The request itself is validated again on the server with
 * createBookingRequestSchema (src/lib/types.ts).
 */

export const contactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(100, "Keep your name under 100 characters."),
  email: z.string().trim().pipe(z.email("Enter a valid email address.")),
  phone: z
    .string()
    .transform((value) => {
      const digits = onlyDigits(value);
      return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
    })
    // US numbers: 10 digits, and area codes never start with 0 or 1.
    .refine((digits) => /^[2-9]\d{9}$/.test(digits), "Enter a 10-digit US phone number.")
    .transform((digits) => `+1${digits}`),
  visitReason: z
    .string()
    .trim()
    .max(500, "Keep the visit reason under 500 characters.")
    .transform((value) => value || undefined),
});

export const paymentSchema = z
  .object({
    cardNumber: z
      .string()
      .transform(onlyDigits)
      .refine(
        (digits) => digits.length >= 13 && digits.length <= 19 && passesLuhn(digits),
        "Enter a valid card number.",
      ),
    expiry: z
      .string()
      .transform((value, ctx) => {
        const expiry = parseExpiry(value);
        if (!expiry) {
          ctx.addIssue({ code: "custom", message: "Enter the expiry date as MM / YY." });
          return z.NEVER;
        }
        if (isExpired(expiry)) {
          ctx.addIssue({ code: "custom", message: "This card has expired." });
          return z.NEVER;
        }
        return expiry;
      }),
    cvv: z.string().regex(/^\d{3,4}$/, "Enter the 3-digit security code."),
    postalCode: z.string().trim().regex(/^\d{5}$/, "Enter a 5-digit zip code."),
    // An unchecked checkbox is missing from FormData; a checked one sends "on".
    acceptPolicy: z.literal("on", "Please accept the cancellation policy to continue."),
  })
  .superRefine((data, ctx) => {
    const amex = detectBrand(data.cardNumber) === "amex";
    if (data.cvv.length !== (amex ? 4 : 3)) {
      ctx.addIssue({
        code: "custom",
        path: ["cvv"],
        message: amex ? "Enter the 4-digit security code." : "Enter the 3-digit security code.",
      });
    }
  });

export type ContactData = z.output<typeof contactSchema>;
export type PaymentData = z.output<typeof paymentSchema>;

/** Form values as strings, keyed by input name. Errors return them so inputs keep what was typed. */
export type FormValues = Record<string, string>;
export type FieldErrors = Record<string, string>;

export function readForm(formData: FormData): FormValues {
  const values: FormValues = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") values[key] = value;
  });
  return values;
}

/** The first message for each field, keyed by input name. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const name = String(issue.path[0] ?? "");
    if (name && !errors[name]) errors[name] = issue.message;
  }
  return errors;
}
