import { z } from "zod";

/**
 * The booking API contract. The same schemas validate API responses in the
 * data layer, the request in the Server Action, and the body in the mock backend.
 */

const cents = z.number().int().nonnegative();

export const serviceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  priceCents: cents,
});

// GET {API_URL}/booking-pages/:slug
export const bookingPageSchema = z.object({
  business: z.object({
    id: z.string().min(1),
    slug: z.string().min(1),
    name: z.string().min(1),
    logoUrl: z.string().nullable(),
    address: z.object({
      line1: z.string().min(1),
      line2: z.string().optional(),
      city: z.string().min(1),
      region: z.string().length(2),
      postalCode: z.string().min(1),
      country: z.literal("US"),
    }),
    email: z.email(),
    phone: z.string().regex(/^\+[1-9]\d{6,14}$/, "E.164"),
    timezone: z.string().min(1), // IANA, e.g. "America/Los_Angeles"
    currency: z.literal("USD"),
  }),
  cancellationPolicy: z.object({
    version: z.string().min(1),
    noticeHours: z.number().int().positive(),
    feeCents: cents,
    text: z.string().min(1),
  }),
});

// GET {API_URL}/booking-pages/:slug/selection
// Stands in for the earlier booking steps (services, provider, time), which
// this exercise doesn't build.
export const appointmentSelectionSchema = z.object({
  startsAt: z.iso.datetime({ offset: true }),
  provider: z.object({ id: z.string().min(1), name: z.string().min(1) }),
  services: z.array(serviceSchema).min(1),
});

export const cardBrands = ["visa", "mastercard", "amex", "discover", "unknown"] as const;

// POST {API_URL}/bookings. Refers to ids, not display data: the server owns prices.
export const createBookingRequestSchema = z.object({
  businessId: z.string().min(1),
  appointment: z.object({
    startsAt: z.iso.datetime({ offset: true }),
    providerId: z.string().min(1),
    serviceIds: z.array(z.string().min(1)).min(1),
  }),
  client: z.object({
    fullName: z.string().trim().min(2).max(100),
    email: z.email(),
    phone: z.string().regex(/^\+1[2-9]\d{9}$/, "US number in E.164"),
    visitReason: z.string().max(500).optional(),
  }),
  // Strict: a request that carries a card number or CVV is rejected outright.
  payment: z.strictObject({
    paymentMethodId: z.string().startsWith("pm_"),
    brand: z.enum(cardBrands),
    last4: z.string().regex(/^\d{4}$/),
    expMonth: z.number().int().min(1).max(12),
    expYear: z.number().int().min(2000).max(2100),
    billingPostalCode: z.string().regex(/^\d{5}$/),
  }),
  consents: z.object({
    cancellationPolicy: z.object({
      version: z.string().min(1),
      acceptedAt: z.iso.datetime(),
    }),
  }),
});

export const bookingSchema = z.object({
  id: z.string().min(1),
  status: z.literal("confirmed"),
  startsAt: z.iso.datetime({ offset: true }),
  provider: z.object({ id: z.string(), name: z.string() }),
  services: z.array(serviceSchema),
  totalCents: cents,
});

export type BookingPage = z.infer<typeof bookingPageSchema>;
export type Business = BookingPage["business"];
export type AppointmentSelection = z.infer<typeof appointmentSelectionSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type CardBrand = (typeof cardBrands)[number];
export type CreateBookingRequest = z.infer<typeof createBookingRequestSchema>;
export type Booking = z.infer<typeof bookingSchema>;

/** The booking Server Action's signature. The page passes it down to the flow. */
export type CreateBooking = (request: CreateBookingRequest, idempotencyKey: string) => Promise<CreateBookingResult>;

/** What the Server Action returns. Expected failures are values, not exceptions. */
export type CreateBookingResult =
  | { ok: true; booking: Booking }
  | {
      ok: false;
      code: "card_declined" | "slot_taken" | "invalid" | "unknown";
      message: string;
      /** Keyed by form field name, so errors land under the right input. */
      fieldErrors?: Record<string, string>;
    };
