import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { API_URL } from "./config";
import {
  appointmentSelectionSchema,
  bookingPageSchema,
  type AppointmentSelection,
  type BookingPage,
  type CreateBookingRequest,
} from "./types";

/**
 * Public business info. Cached per slug: it's the same for every visitor and
 * rarely changes. A real backend would call revalidateTag("booking-page:<slug>")
 * when the business edits its profile.
 */
export async function getBookingPage(slug: string): Promise<BookingPage | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`booking-page:${slug}`);

  const res = await fetch(`${API_URL}/booking-pages/${encodeURIComponent(slug)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET /booking-pages/${slug} failed with ${res.status}`);
  return bookingPageSchema.parse(await res.json());
}

/** The visitor's picks from the earlier steps. Per visitor, so not cached. */
export async function getSelection(slug: string): Promise<AppointmentSelection | null> {
  const res = await fetch(`${API_URL}/booking-pages/${encodeURIComponent(slug)}/selection`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET /booking-pages/${slug}/selection failed with ${res.status}`);
  return appointmentSelectionSchema.parse(await res.json());
}

export async function postBooking(
  request: CreateBookingRequest,
  idempotencyKey: string,
): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
    body: JSON.stringify(request),
  });
  const body: unknown = await res.json().catch(() => null);
  return { status: res.status, body };
}
