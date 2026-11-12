import { http, HttpResponse } from "msw/http";
import { describe, expect, it } from "vitest";
import { buildBookingRequest } from "@/features/booking/request";
import { API_URL } from "@/lib/config";
import { bookingPageSchema, appointmentSelectionSchema, type CreateBookingRequest } from "@/lib/types";
import goldSpa from "@/mocks/data/gold-spa.json";
import selection from "@/mocks/data/selection.json";
import { server } from "@/mocks/node";
import { createBooking } from "./actions";

const request = buildBookingRequest({
  page: bookingPageSchema.parse(goldSpa),
  selection: appointmentSelectionSchema.parse(selection),
  contact: { fullName: "Jane Cooper", email: "jane@example.com", phone: "+16195550199", visitReason: undefined },
  card: { paymentMethodId: "pm_test_123", brand: "visa", last4: "4242", expMonth: 12, expYear: 2030 },
  billingPostalCode: "92108",
  acceptedAt: new Date("2026-11-12T20:00:00Z"),
});

const respondWith = (status: number) =>
  server.use(http.post(`${API_URL}/bookings`, () => HttpResponse.json({ error: "x" }, { status })));

describe("createBooking", () => {
  it("forwards the request with its idempotency key and returns the server's booking", async () => {
    let forwarded: { body: unknown; key: string | null } | undefined;
    server.events.on("request:start", async ({ request: req }) => {
      if (req.method === "POST") forwarded = { body: await req.clone().json(), key: req.headers.get("Idempotency-Key") };
    });

    const result = await createBooking(request, "key-1");
    server.events.removeAllListeners();

    // The mock backend prices the services itself: Botox $200 + HydraFacial $150.
    expect(result).toMatchObject({ ok: true, booking: { status: "confirmed", totalCents: 35000 } });
    expect(forwarded).toEqual({ body: request, key: "key-1" });
  });

  it("rejects a request that carries card details instead of a token, without calling the API", async () => {
    server.use(http.post(`${API_URL}/bookings`, () => HttpResponse.error()));
    const withCard = {
      ...request,
      payment: { ...request.payment, cardNumber: "4242424242424242", cvv: "123" },
    } as CreateBookingRequest;

    expect(await createBooking(withCard, "key-2")).toMatchObject({ ok: false, code: "invalid" });
  });

  it.each([
    [402, { code: "card_declined", fieldErrors: { cardNumber: expect.stringContaining("declined") } }],
    [409, { code: "slot_taken" }],
    [500, { code: "unknown" }],
  ])("maps a %i response to an error result", async (status, expected) => {
    respondWith(status);
    expect(await createBooking(request, "key-3")).toMatchObject({ ok: false, ...expected });
  });

  it("returns an error result when the API can't be reached", async () => {
    server.use(http.post(`${API_URL}/bookings`, () => HttpResponse.error()));
    expect(await createBooking(request, "key-4")).toMatchObject({ ok: false, code: "unknown" });
  });
});
