"use server";

import { postBooking } from "@/lib/api";
import { bookingSchema, createBookingRequestSchema, type CreateBookingResult } from "@/lib/types";

/**
 * The booking Server Action: our backend-for-frontend. The browser calls it;
 * it calls the booking API. A Server Action is a public endpoint, so it
 * validates its input again with the same contract the browser used.
 *
 * Expected failures are returned as values. Throwing would reach error.tsx and
 * throw away everything the user typed.
 */
export async function createBooking(request: unknown, idempotencyKey: string): Promise<CreateBookingResult> {
  const parsed = createBookingRequestSchema.safeParse(request);
  if (!parsed.success || !idempotencyKey) {
    return { ok: false, code: "invalid", message: "Some booking details are invalid. Please check the form." };
  }

  try {
    const { status, body } = await postBooking(parsed.data, idempotencyKey);
    if (status === 201) return { ok: true, booking: bookingSchema.parse(body) };
    if (status === 402) {
      return {
        ok: false,
        code: "card_declined",
        message: "Your card was declined.",
        fieldErrors: { cardNumber: "Your card was declined. Please use a different card." },
      };
    }
    if (status === 409) {
      return {
        ok: false,
        code: "slot_taken",
        message: "Sorry, this time was just booked by someone else. Please contact us to find another time.",
      };
    }
    if (status === 422) {
      return { ok: false, code: "invalid", message: "Some booking details are invalid. Please check the form." };
    }
    console.error("POST /bookings failed with", status, body);
  } catch (error) {
    console.error("POST /bookings failed", error);
  }
  return { ok: false, code: "unknown", message: "Something went wrong on our end. Please try again." };
}
