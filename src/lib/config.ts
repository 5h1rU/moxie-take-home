/**
 * Base URL of the booking API. The default is a fake domain on purpose: if
 * mocking is off, requests fail loudly instead of reaching anything real.
 */
export const API_URL = process.env.API_URL ?? "https://api.moxie-booking.test";
