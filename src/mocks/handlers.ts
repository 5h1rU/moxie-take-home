import { http, HttpResponse } from "msw/http";
import { delay } from "msw/utils/delay";
import { API_URL } from "@/lib/config";
import {
  appointmentSelectionSchema,
  bookingPageSchema,
  createBookingRequestSchema,
  type Booking,
  type BookingPage,
} from "@/lib/types";
import glowMedSpa from "./data/glow-med-spa.json";
import goldSpa from "./data/gold-spa.json";
import selectionFixture from "./data/selection.json";

/**
 * A fake booking backend. It behaves like the real API would: it validates the
 * body with the shared contract, prices services itself, and honors
 * Idempotency-Key. Test inputs (Stripe-style test cards, a magic email) trigger
 * the failure paths, so they can be shown in the deployed demo.
 */

// Parsing the fixtures proves they match the contract.
const pages: Record<string, BookingPage> = Object.fromEntries(
  [goldSpa, glowMedSpa].map((raw) => {
    const page = bookingPageSchema.parse(raw);
    return [page.business.slug, page];
  }),
);
const selection = appointmentSelectionSchema.parse(selectionFixture);
const serviceCatalog = new Map(selection.services.map((service) => [service.id, service]));

export const TEST_PAYMENT_METHODS = {
  declined: "pm_card_chargeDeclined",
  serverError: "pm_card_chargeDeclinedProcessingError",
} as const;
export const SLOT_TAKEN_EMAIL = "slot-taken@example.com";

const isTest = process.env.NODE_ENV === "test";
const latency = (ms: number) => delay(isTest ? 0 : ms);
const log = (...args: unknown[]) => {
  if (!isTest) console.info("[mock api]", ...args);
};

/** Bookings by Idempotency-Key. A repeated key returns the same booking instead of a second one. */
const bookingsByKey = new Map<string, Booking>();

export const handlers = [
  http.get(`${API_URL}/booking-pages/:slug`, async ({ params }) => {
    await latency(300);
    const page = pages[String(params.slug)];
    log(`GET /booking-pages/${params.slug} → ${page ? 200 : 404}`);
    if (!page) return HttpResponse.json({ error: "not_found" }, { status: 404 });
    return HttpResponse.json(page);
  }),

  http.get(`${API_URL}/booking-pages/:slug/selection`, async ({ params }) => {
    await latency(400);
    if (!pages[String(params.slug)]) return HttpResponse.json({ error: "not_found" }, { status: 404 });
    log(`GET /booking-pages/${params.slug}/selection → 200`);
    return HttpResponse.json(selection);
  }),

  http.post(`${API_URL}/bookings`, async ({ request }) => {
    await latency(800);
    const key = request.headers.get("Idempotency-Key");
    if (!key) return HttpResponse.json({ error: "idempotency_key_required" }, { status: 400 });

    const existing = bookingsByKey.get(key);
    if (existing) {
      log(`POST /bookings → 201 (replayed ${existing.id})`);
      return HttpResponse.json(existing, { status: 201 });
    }

    const parsed = createBookingRequestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      log("POST /bookings → 422");
      return HttpResponse.json({ error: "invalid_request", issues: parsed.error.issues }, { status: 422 });
    }
    const { businessId, appointment, client, payment } = parsed.data;

    const services = appointment.serviceIds.map((id) => serviceCatalog.get(id));
    const knownBusiness = Object.values(pages).some((page) => page.business.id === businessId);
    if (!knownBusiness || services.some((service) => !service)) {
      return HttpResponse.json({ error: "invalid_request" }, { status: 422 });
    }
    if (payment.paymentMethodId === TEST_PAYMENT_METHODS.declined) {
      log("POST /bookings → 402 card_declined");
      return HttpResponse.json({ error: "card_declined" }, { status: 402 });
    }
    if (payment.paymentMethodId === TEST_PAYMENT_METHODS.serverError) {
      log("POST /bookings → 500");
      return HttpResponse.json({ error: "internal_error" }, { status: 500 });
    }
    if (client.email.toLowerCase() === SLOT_TAKEN_EMAIL) {
      log("POST /bookings → 409 slot_taken");
      return HttpResponse.json({ error: "slot_taken" }, { status: 409 });
    }

    const booked = services.filter((service) => service !== undefined);
    const booking: Booking = {
      id: `bk_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`,
      status: "confirmed",
      startsAt: appointment.startsAt,
      provider: selection.provider,
      services: booked,
      // Priced from the catalog, never from anything the client sent.
      totalCents: booked.reduce((sum, service) => sum + service.priceCents, 0),
    };
    bookingsByKey.set(key, booking);
    log(`POST /bookings → 201 ${booking.id}`);
    return HttpResponse.json(booking, { status: 201 });
  }),
];
