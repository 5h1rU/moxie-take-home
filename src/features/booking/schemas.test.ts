import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { contactSchema, fieldErrors, paymentSchema } from "./schemas";

const validPayment = {
  cardNumber: "4242 4242 4242 4242",
  expiry: "12 / 30",
  cvv: "123",
  postalCode: "92108",
  acceptPolicy: "on",
};

function paymentErrors(values: Record<string, string | undefined>) {
  const result = paymentSchema.safeParse(values);
  return result.success ? {} : fieldErrors(result.error);
}

describe("paymentSchema", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 12)); // November 12, 2026
  });
  afterEach(() => vi.useRealTimers());

  it("accepts a card through the end of its expiry month", () => {
    expect(paymentErrors({ ...validPayment, expiry: "11 / 26" })).toEqual({});
    expect(paymentErrors({ ...validPayment, expiry: "10 / 26" })).toEqual({ expiry: "This card has expired." });
    expect(paymentErrors({ ...validPayment, expiry: "13 / 27" })).toEqual({
      expiry: "Enter the expiry date as MM / YY.",
    });
  });

  it("rejects a mistyped card number with the right length", () => {
    // Same length, one digit changed: only the Luhn check tells them apart.
    expect(paymentErrors({ ...validPayment, cardNumber: "4242 4242 4242 4241" })).toEqual({
      cardNumber: "Enter a valid card number.",
    });
  });

  it("asks for a 4-digit CVV on Amex and a 3-digit one on other cards", () => {
    const amex = { ...validPayment, cardNumber: "3782 822463 10005" };
    expect(paymentErrors({ ...amex, cvv: "1234" })).toEqual({});
    expect(paymentErrors({ ...amex, cvv: "123" })).toEqual({ cvv: "Enter the 4-digit security code." });
    expect(paymentErrors({ ...validPayment, cvv: "1234" })).toEqual({ cvv: "Enter the 3-digit security code." });
  });

  it("requires the cancellation policy to be accepted", () => {
    // An unchecked checkbox is absent from FormData.
    expect(paymentErrors({ ...validPayment, acceptPolicy: undefined })).toEqual({
      acceptPolicy: "Please accept the cancellation policy to continue.",
    });
  });
});

describe("contactSchema", () => {
  const valid = { fullName: "Jane Cooper", email: "jane@example.com", phone: "(619) 555-0199", visitReason: "" };

  it("normalizes the phone to E.164 and drops an empty visit reason", () => {
    expect(contactSchema.parse({ ...valid, phone: "1 619 555 0199" })).toEqual({
      fullName: "Jane Cooper",
      email: "jane@example.com",
      phone: "+16195550199",
      visitReason: undefined,
    });
  });

  it("rejects numbers that aren't 10-digit US numbers", () => {
    for (const phone of ["619 555 019", "(119) 555-0199"]) {
      const result = contactSchema.safeParse({ ...valid, phone });
      expect(result.success, phone).toBe(false);
    }
  });
});
